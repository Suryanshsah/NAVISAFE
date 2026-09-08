"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Shield, AlertTriangle, MapPin, Phone, Clock, Loader2 } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  type?: "emergency" | "safety" | "info"
  apiResponse?: any // Added to store raw API response
}

interface VirtualGuardianChatProps {
  userLocation?: { lat: number; lng: number }
  safetyScore?: number
  currentZone?: string
  userInfo?: {
    name?: string
    age?: number
    digitalId?: string
    tripStartDate?: string
    tripEndDate?: string
  }
}

export default function VirtualGuardianChat({
  userLocation,
  safetyScore = 85,
  currentZone = "Green Zone",
  userInfo, // Added userInfo prop
}: VirtualGuardianChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your Virtual Guardian AI powered by advanced safety analytics. I'm here to help keep you safe during your visit. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
      type: "info",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickActions = [
    { icon: AlertTriangle, label: "Emergency Help", action: "emergency" },
    { icon: MapPin, label: "Safe Routes", action: "routes" },
    { icon: Shield, label: "Safety Tips", action: "tips" },
    { icon: Phone, label: "Emergency Contacts", action: "contacts" },
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getCurrentAddress = () => {
    if (!userLocation) return "Location not available"
    return `GPS: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`
  }

  const getZoneStatus = () => {
    if (currentZone.includes("Red") || safetyScore < 30) return "Red"
    if (currentZone.includes("Green") && safetyScore >= 70) return "Green"
    return "Orange"
  }

  const getNearbyIncidents = () => {
    const incidents = []
    if (safetyScore < 30) {
      incidents.push("High crime area reported", "Poor lighting conditions", "Limited police presence")
    } else if (safetyScore < 70) {
      incidents.push("Moderate crowd density", "Traffic congestion", "Construction work nearby")
    } else {
      incidents.push("Well-patrolled area", "Good lighting", "Tourist-friendly zone")
    }
    return incidents
  }

  const callGuardianAPI = async (userQuery: string) => {
    const payload = {
      touristName: userInfo?.name || "Guest",
      currentLocation: userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : null,
      currentZone,
      safetyScore,
      nearbyIncidents: getNearbyIncidents(),
      userQuery,
    }

    const response = await fetch("/api/guardian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.error || `Guardian request failed: ${response.status}`)
    }

    return data
  }

  const generateAIResponse = async (
    userMessage: string,
  ): Promise<{ content: string; type: "emergency" | "safety" | "info"; apiResponse?: any }> => {
    try {
      // Call the Next.js server-side AI Guardian API
      const apiResponse = await callGuardianAPI(userMessage)

      // Format the API response for display
      let content = ""
      let type: "emergency" | "safety" | "info" = "info"

      // Check if API response has specific structure
      if (apiResponse.response || apiResponse.message || apiResponse.content) {
        content =
          apiResponse.response || apiResponse.message || apiResponse.content || JSON.stringify(apiResponse, null, 2)
      } else {
        // Display the full JSON response if no specific message field
        content = `🤖 **API Response:**\n\`\`\`json\n${JSON.stringify(apiResponse, null, 2)}\n\`\`\``
      }

      // Determine message type based on content
      const message = userMessage.toLowerCase()
      if (message.includes("emergency") || message.includes("help") || message.includes("danger")) {
        type = "emergency"
      } else if (message.includes("safe") || message.includes("zone") || message.includes("route")) {
        type = "safety"
      }

      return {
        content,
        type,
        apiResponse,
      }
    } catch (error) {
      // Fallback to original mock response if API fails
      console.error("[v0] Using fallback response due to API error:", error)

      return {
        content: `⚠️ **API Connection Error**\n\nUnable to connect to the safety analysis service. Using offline mode.\n\n${getFallbackResponse(userMessage)}`,
        type: "info",
      }
    }
  }

  const getFallbackResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (message.includes("emergency") || message.includes("help") || message.includes("danger")) {
      return "🚨 Emergency detected! Please call local emergency services: 112\nYour location has been noted for immediate assistance."
    }

    if (message.includes("zone") || message.includes("area") || message.includes("safe")) {
      return `You're currently in a ${currentZone} with a safety score of ${safetyScore}%. ${
        safetyScore >= 80
          ? "This is a very safe area."
          : safetyScore >= 70
            ? "This area is generally safe, but stay alert."
            : "⚠️ Exercise caution in this area."
      }`
    }

    return "I'm here to help with safety information, emergency assistance, and local guidance. Please try again or contact support if the issue persists."
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    try {
      // Call the API
      const aiResponse = await generateAIResponse(inputMessage)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: "ai",
        timestamp: new Date(),
        type: aiResponse.type,
        apiResponse: aiResponse.apiResponse, // Store raw API response
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      // Handle any remaining errors
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "❌ **Service Unavailable**\n\nI'm currently unable to process your request. Please try again later or contact emergency services directly if this is urgent.",
        sender: "ai",
        timestamp: new Date(),
        type: "info",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      emergency: "I need emergency help!",
      routes: "Show me the safest route to my destination",
      tips: "Give me safety tips for this area",
      contacts: "Show me emergency contact numbers",
    }

    setInputMessage(actionMessages[action as keyof typeof actionMessages] || "")
  }

  const getMessageBadgeColor = (type?: string) => {
    switch (type) {
      case "emergency":
        return "bg-red-500 text-white"
      case "safety":
        return "bg-orange-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          Virtual Guardian AI
          <Badge variant="outline" className="ml-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            AI Ready
          </Badge>
        </CardTitle>
        {userInfo && (
          <div className="text-xs text-muted-foreground">
            Connected as: {userInfo.name || "Guest"} | Safety Score: {safetyScore}% | Zone: {currentZone}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action.action)}
              className="flex items-center gap-2 h-8 text-xs"
            >
              <action.icon className="w-3 h-3" />
              {action.label}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] ${message.sender === "user" ? "order-first" : ""}`}>
                  <div
                    className={`rounded-lg p-3 ${
                      message.sender === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {message.type && message.sender === "ai" && (
                      <Badge className={`text-xs ${getMessageBadgeColor(message.type)}`}>
                        {message.type === "emergency" && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {message.type === "safety" && <Shield className="w-3 h-3 mr-1" />}
                        {message.type === "info" && <Clock className="w-3 h-3 mr-1" />}
                        {message.type}
                      </Badge>
                    )}
                    {message.apiResponse && (
                      <Badge variant="outline" className="text-xs">
                        API Response
                      </Badge>
                    )}
                  </div>
                </div>

                {message.sender === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">AI Guardian is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me about safety, routes, or emergency help..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
            disabled={isTyping}
          />
          <Button onClick={handleSendMessage} size="sm" disabled={!inputMessage.trim() || isTyping}>
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
