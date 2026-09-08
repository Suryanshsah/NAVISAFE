"use client"

import { FormEvent, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Clock3, ExternalLink, Image as ImageIcon, Loader2, MapPin, Search, Sparkles } from "lucide-react"

type WikiPage = {
  pageid: number
  title: string
  extract?: string
  thumbnail?: { source: string; width: number; height: number }
  content_urls?: { desktop?: { page?: string } }
}

type SearchResult = {
  title: string
  snippet: string
}

function cleanSnippet(snippet: string) {
  return snippet.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
}

function getOpeningSentence(text: string) {
  const clean = text.replace(/\s+/g, " ").trim()
  if (!clean) return "Explore this destination through its history, culture, architecture and local experiences."
  const first = clean.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")
  return first.length > 420 ? `${first.slice(0, 417)}...` : first
}

export function IndiaDestinations() {
  const [query, setQuery] = useState("")
  const [searchedPlace, setSearchedPlace] = useState("")
  const [overview, setOverview] = useState<WikiPage | null>(null)
  const [places, setPlaces] = useState<WikiPage[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [conversation, setConversation] = useState<{ role: "user" | "assistant"; text: string }[]>([])

  const searchIndia = async (event?: FormEvent, requestedPlace?: string) => {
    event?.preventDefault()
    const place = (requestedPlace ?? query).trim()
    if (!place) return

    setLoading(true)
    setError("")
    setOverview(null)
    setConversation((previous) => [...previous, { role: "user", text: `Tell me about ${place}` }])
    setPlaces([])
    setSearchResults([])
    setSearchedPlace(place)

    try {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        `${place} India`
      )}&srlimit=8&format=json&origin=*`
      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) throw new Error("Wikipedia search failed")
      const searchData = await searchResponse.json()
      const results: SearchResult[] = searchData?.query?.search || []
      setSearchResults(results)

      if (!results.length) {
        throw new Error(`I couldn't find reliable information for “${place}”. Try a city, state, monument, beach, hill station or other Indian destination.`)
      }

      const titles = results.map((result) => result.title)
      const detailUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=900&titles=${encodeURIComponent(
        titles.join("|")
      )}&format=json&origin=*`
      const detailResponse = await fetch(detailUrl)
      if (!detailResponse.ok) throw new Error("Could not load destination details")
      const detailData = await detailResponse.json()
      const pages: WikiPage[] = Object.values(detailData?.query?.pages || {}) as WikiPage[]
      const validPages = pages.filter((page) => page.pageid)

      const exact = validPages.find((page) => page.title.toLowerCase() === place.toLowerCase())
      const likelyPlace = exact || validPages[0]
      setOverview(likelyPlace || null)

      const related = validPages
        .filter((page) => page.pageid !== likelyPlace?.pageid)
        .filter((page) => page.extract || page.thumbnail)
        .slice(0, 6)
      setPlaces(related)
      setConversation((previous) => [
        ...previous,
        {
          role: "assistant",
          text: likelyPlace
            ? `Here is what I found for ${place}. I have added an overview, photos and related places below so you can plan what to explore next.`
            : `I found information related to ${place}. Check the results below for places you may want to explore.`,
        },
      ])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load travel information right now."
      setError(message)
      setConversation((previous) => [...previous, { role: "assistant", text: message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen space-y-6">
      <Card className="overflow-hidden border-2 border-primary/15 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl sm:text-3xl">India Travel AI</CardTitle>
                <Badge variant="secondary"><Sparkles className="mr-1 h-3 w-3" /> Smart Travel Guide</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
                Type any place in India — a city, monument, beach, hill station, temple or region — and get a travel overview, photos and related places to explore.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={searchIndia} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask about any Indian place — e.g. Varanasi, Goa, Ladakh..."
                className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()} className="sm:min-w-32">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {loading ? "Searching..." : "Explore"}
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {['Varanasi', 'Goa', 'Ladakh', 'Udaipur', 'Andaman and Nicobar Islands', 'Mysore'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => { setQuery(suggestion); void searchIndia(undefined, suggestion) }}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs hover:bg-muted transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {conversation.length > 0 && (
            <div className="mt-5 space-y-2 rounded-xl border border-border bg-background/70 p-3">
              {conversation.slice(-4).map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!searchedPlace && !loading && !error && (
        <Card>
          <CardContent className="p-10 text-center">
            <MapPin className="mx-auto h-10 w-10 text-primary mb-3" />
            <h2 className="text-xl font-bold">Where do you want to go?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Search any destination in India to start discovering it.</p>
          </CardContent>
        </Card>
      )}

      {searchedPlace && overview && (
        <>
          <Card className="overflow-hidden">
            <CardContent className="p-0 grid lg:grid-cols-[1.05fr_1fr]">
              <div className="min-h-64 bg-muted">
                {overview.thumbnail?.source ? (
                  <img src={overview.thumbnail.source} alt={overview.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full min-h-64 flex items-center justify-center"><ImageIcon className="h-12 w-12 text-muted-foreground" /></div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2"><MapPin className="mr-1 h-3 w-3" /> India</Badge>
                  <h2 className="text-2xl font-bold">{overview.title}</h2>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{getOpeningSentence(overview.extract || "")}</p>
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-sm">
                  <strong>Travel idea:</strong> Use this place as your starting point, then explore the related attractions below. Check official tourism websites for current timings, tickets and travel advisories.
                </div>
                {overview.content_urls?.desktop?.page && (
                  <a href={overview.content_urls.desktop.page} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                    Read more about {overview.title}<ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {places.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-xl font-bold">Places you may also like</h2>
                <p className="text-sm text-muted-foreground">Related Indian destinations and attractions found for your search.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {places.map((place) => (
                  <Card key={place.pageid} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="h-44 bg-muted overflow-hidden">
                      {place.thumbnail?.source ? (
                        <img src={place.thumbnail.source} alt={place.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="h-full flex items-center justify-center"><ImageIcon className="h-10 w-10 text-muted-foreground" /></div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-bold text-lg">{place.title}</h3>
                      <p className="text-sm text-muted-foreground leading-6">{getOpeningSentence(place.extract || cleanSnippet(searchResults.find((r) => r.title === place.title)?.snippet || ""))}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1"><Clock3 className="h-3.5 w-3.5" /> Plan your visit after checking current local information.</div>
                      {place.content_urls?.desktop?.page && (
                        <a href={place.content_urls.desktop.page} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-medium text-primary hover:underline">
                          More details <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {searchedPlace && searchResults.length > 0 && !loading && (
        <Card>
          <CardContent className="p-4 text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Travel information and images are retrieved dynamically from Wikipedia/Wikimedia. NaviSafe does not invent destination facts.
          </CardContent>
        </Card>
      )}
    </div>
  )

}
