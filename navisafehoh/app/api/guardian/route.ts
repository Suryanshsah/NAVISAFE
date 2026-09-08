import { NextRequest, NextResponse } from "next/server"

const MODEL = "gemini-3.8-flash"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 },
      )
    }

    const body = await request.json()
    const userQuery = String(body?.userQuery ?? "").trim()

    if (!userQuery) {
      return NextResponse.json({ error: "Please enter a question." }, { status: 400 })
    }

    const location = body?.currentLocation
    const safetyScore = Number.isFinite(Number(body?.safetyScore)) ? Number(body.safetyScore) : null
    const currentZone = body?.currentZone || "Unknown zone"
    const touristName = body?.touristName || "Guest"

    const context = [
      `Tourist name: ${touristName}`,
      `Current safety zone: ${currentZone}`,
      safetyScore === null ? "Safety score: unavailable" : `Safety score: ${safetyScore}%`,
      location?.lat != null && location?.lng != null
        ? `Current GPS coordinates: ${location.lat}, ${location.lng}`
        : "Current GPS coordinates: unavailable",
      Array.isArray(body?.nearbyIncidents) && body.nearbyIncidents.length
        ? `Known local indicators: ${body.nearbyIncidents.join(", ")}`
        : "Known local indicators: none provided",
    ].join("\n")

    const systemInstruction = `You are NaviSafe AI Guardian, a safety assistant for tourists travelling in India.

Your job is to give practical, calm, safety-focused advice using the supplied NaviSafe context.
- Never invent a police station, hospital, road condition, crime incident, emergency number, or exact address.
- Treat the supplied safety score and zone as application-provided indicators, not as absolute truth.
- If the user describes an immediate emergency, tell them to call India's emergency number 112 and move to a safe/public place when possible.
- For medical emergencies, recommend 112 or the nearest emergency department; do not diagnose.
- For lost documents/passport, advise contacting local police and the relevant embassy/consulate, without inventing contact details.
- If the user asks for a route, explain that you can give safety guidance but do not claim live routing unless routing data was supplied.
- If location data is unavailable, say so rather than guessing the user's location.
- Keep normal answers concise and useful (usually 3-6 short paragraphs or bullets).
- You can answer general India travel and safety questions as well.

Current NaviSafe context:
${context}`

    const geminiResponse = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: userQuery }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 700,
        },
      }),
      cache: "no-store",
    })

    const data = await geminiResponse.json()

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", data)
      return NextResponse.json(
        { error: data?.error?.message || "Gemini API request failed." },
        { status: geminiResponse.status >= 400 && geminiResponse.status < 600 ? geminiResponse.status : 502 },
      )
    }

    const content = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim()

    if (!content) {
      return NextResponse.json({ error: "Gemini returned an empty response." }, { status: 502 })
    }

    return NextResponse.json({
      response: content,
      model: MODEL,
      source: "NaviSafe AI Guardian",
    })
  } catch (error) {
    console.error("Guardian route error:", error)
    return NextResponse.json({ error: "Unable to reach the AI Guardian service." }, { status: 500 })
  }
}
