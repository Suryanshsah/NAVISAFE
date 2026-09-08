"use client"

import { useEffect, useRef, useState } from "react"

interface MapComponentProps {
  location: { lat: number; lng: number }
  onLocationChange: (location: { lat: number; lng: number }) => void
  onSafeScoreChange?: (score: number) => void
  userAge?: number // Added user age prop for elderly voice alerts
}

export function MapComponent({ location, onLocationChange, onSafeScoreChange, userAge }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [safeScore, setSafeScore] = useState(100)
  const [currentZone, setCurrentZone] = useState<string>("blue") // Track current zone type
  const [redZoneAlert, setRedZoneAlert] = useState<{ isOpen: boolean; timer?: NodeJS.Timeout }>({ isOpen: false }) // Red zone emergency popup

  const safetyZones = [
    // Blue Zones (80-100%) - Very Safe
    { lat: 28.6139, lng: 77.209, radius: 800, name: "Connaught Place - Very Safe Zone", score: 95, type: "blue" },
    { lat: 28.6129, lng: 77.2295, radius: 600, name: "India Gate - Very Safe Zone", score: 88, type: "blue" },

    // Green Zones (70-80%) - Safe
    { lat: 28.6264, lng: 77.1841, radius: 500, name: "Rajpath - Safe Zone", score: 75, type: "green" },
    { lat: 28.6562, lng: 77.241, radius: 400, name: "Red Fort Area - Safe Zone", score: 72, type: "green" },

    // Orange Zones (30-70%) - Caution Required
    { lat: 28.608, lng: 77.225, radius: 300, name: "Construction Area - Caution Zone", score: 45, type: "orange" },
    { lat: 28.625, lng: 77.195, radius: 350, name: "Busy Market - Caution Zone", score: 55, type: "orange" },

    // Red Zones (0-30%) - High Risk
    { lat: 28.62, lng: 77.21, radius: 200, name: "Government Restricted Area - High Risk", score: 15, type: "red" },
    { lat: 28.615, lng: 77.215, radius: 150, name: "Military Zone - High Risk", score: 10, type: "red" },

    // Purple Zones - Crowd Density Alert
    { lat: 28.6505, lng: 77.2334, radius: 250, name: "Chandni Chowk Market - Crowded", score: 80, type: "purple" },
    { lat: 28.6127, lng: 77.2773, radius: 200, name: "Humayun's Tomb - Tourist Crowd", score: 85, type: "purple" },
  ]

  const getZoneStyle = (type: string) => {
    switch (type) {
      case "blue":
        return { color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 2 }
      case "green":
        return { color: "#10b981", fillColor: "#10b981", fillOpacity: 0.15, weight: 2 }
      case "orange":
        return { color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.2, weight: 2 }
      case "red":
        return { color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.25, weight: 3 }
      case "purple":
        return { color: "#7c3aed", fillColor: "#7c3aed", fillOpacity: 0.2, weight: 2, dashArray: "10, 5" }
      default:
        return { color: "#6b7280", fillColor: "#6b7280", fillOpacity: 0.1, weight: 1 }
    }
  }

  const getZoneDescription = (type: string) => {
    switch (type) {
      case "blue":
        return "Very Safe - Ideal for tourists"
      case "green":
        return "Safe - Good for exploration"
      case "orange":
        return "Caution Required - Stay alert"
      case "red":
        return "High Risk - Avoid this area"
      case "purple":
        return "Safe but Crowded - Protect belongings"
      default:
        return "Unknown zone"
    }
  }

  const triggerVoiceAlert = (zoneName: string, zoneType: string) => {
    if (userAge && userAge >= 60 && (zoneType === "orange" || zoneType === "red")) {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Warning: You are entering ${zoneName}. ${zoneType === "red" ? "This is a high-risk area. Please leave immediately." : "Exercise caution in this area."}`,
        )
        utterance.rate = 0.8
        utterance.volume = 0.8
        speechSynthesis.speak(utterance)
      }
    }
  }

  const handleRedZoneEntry = (zoneName: string) => {
    setRedZoneAlert({ isOpen: true })

    // Auto-send SOS after 5 seconds if not dismissed
    const timer = setTimeout(() => {
      console.log("[v0] Auto-sending SOS alert - Red zone popup not dismissed after 5 seconds")
      setRedZoneAlert({ isOpen: false })
      // Trigger SOS alert to authorities
      if (onSafeScoreChange) {
        onSafeScoreChange(0) // This will trigger the SOS system in parent component
      }
    }, 5000)

    setRedZoneAlert({ isOpen: true, timer })
  }

  const dismissRedZoneAlert = () => {
    if (redZoneAlert.timer) {
      clearTimeout(redZoneAlert.timer)
    }
    setRedZoneAlert({ isOpen: false })
  }

  const calculateSafeScore = (userLat: number, userLng: number) => {
    let currentZoneScore = 0
    let nearestZoneType = "unknown"
    let smallestDistance = Infinity
    let currentZone = null

    // Find the zone the user is currently in (smallest distance within radius)
    safetyZones.forEach((zone) => {
      const R = 6371e3 // Earth's radius in meters
      const φ1 = (zone.lat * Math.PI) / 180
      const φ2 = (userLat * Math.PI) / 180
      const Δφ = ((userLat - zone.lat) * Math.PI) / 180
      const Δλ = ((userLng - zone.lng) * Math.PI) / 180

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      const zoneRadius = zone.radius
      if (distance <= zoneRadius && distance < smallestDistance) {
        // User is in this zone and it's the closest one
        smallestDistance = distance
        currentZoneScore = zone.score
        nearestZoneType = zone.type
        currentZone = zone
      }
    })

    // If not in any specific zone, calculate based on distance to nearest safe zone
    if (currentZoneScore === 0) {
      const centerLat = 28.6139
      const centerLng = 77.209
      const maxSafeRadius = 1000

      const R = 6371e3
      const φ1 = (centerLat * Math.PI) / 180
      const φ2 = (userLat * Math.PI) / 180
      const Δφ = ((userLat - centerLat) * Math.PI) / 180
      const Δλ = ((userLng - centerLng) * Math.PI) / 180

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distance = R * c

      if (distance <= maxSafeRadius) {
        currentZoneScore = 100
        nearestZoneType = "blue"
      } else {
        const excessDistance = distance - maxSafeRadius
        const maxDistance = 5000
        currentZoneScore = Math.max(0, 100 - (excessDistance / maxDistance) * 100)
        nearestZoneType = currentZoneScore >= 70 ? "green" : currentZoneScore >= 30 ? "orange" : "red"
      }
    }

    // Special handling for red zones - ensure scores are properly in 0-20 range
    if (nearestZoneType === "red") {
      // Make sure red zone scores are always between 0-20 and vary slightly for realism
      if (currentZone) {
        // Use the zone's base score with slight random variation for realism
        const baseScore = currentZone.score
        const variation = Math.floor(Math.random() * 5) - 2 // -2 to +3 variation
        currentZoneScore = Math.max(0, Math.min(20, baseScore + variation))
      } else {
        // Fallback for calculated red zones
        currentZoneScore = Math.max(0, Math.min(20, currentZoneScore))
      }
    }

    setCurrentZone(nearestZoneType)
    return Math.round(currentZoneScore)
  }

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      import("leaflet")
        .then((L) => {
          try {
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
              iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
              iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
              shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            })

            const mapInstance = L.map(mapRef.current!, {
              center: [location.lat, location.lng],
              zoom: 14,
              zoomControl: true,
              scrollWheelZoom: true,
              doubleClickZoom: true,
              touchZoom: true,
              attributionControl: true,
            })

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "© OpenStreetMap contributors",
              maxZoom: 19,
              minZoom: 3,
            }).addTo(mapInstance)

            safetyZones.forEach((zone) => {
              const style = getZoneStyle(zone.type)
              const description = getZoneDescription(zone.type)

              L.circle([zone.lat, zone.lng], {
                ...style,
                radius: zone.radius,
                className: zone.type === "red" ? "animate-pulse" : "",
              })
                .addTo(mapInstance)
                .bindPopup(`
                  <div style="text-align: center; min-width: 200px;">
                    <strong style="color: ${style.color};">${zone.name}</strong><br/>
                    <small>Safety Score: ${zone.score}%</small><br/>
                    <span style="color: ${style.color}; font-weight: bold;">${description}</span><br/>
                    <small>Radius: ${zone.radius}m</small>
                    ${zone.type === "purple" ? "<br/><em>⚠️ Protect your belongings</em>" : ""}
                    ${zone.type === "red" ? "<br/><em>🚨 Immediate evacuation recommended</em>" : ""}
                  </div>
                `)
            })

            const attractions = [
              { lat: 28.6129, lng: 77.2295, name: "India Gate", type: "Monument" },
              { lat: 28.6562, lng: 77.241, name: "Red Fort", type: "Historical Site" },
              { lat: 28.6264, lng: 77.1841, name: "Rajpath", type: "Landmark" },
            ]

            attractions.forEach((attraction) => {
              const attractionIcon = L.divIcon({
                className: "custom-attraction-icon",
                html: `
                <div style="
                  background: linear-gradient(135deg, #059669, #10b981);
                  color: white;
                  border-radius: 50%;
                  width: 24px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  font-weight: bold;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">🏛️</div>
              `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })

              L.marker([attraction.lat, attraction.lng], { icon: attractionIcon })
                .addTo(mapInstance)
                .bindPopup(`
                <div style="text-align: center;">
                  <strong>🏛️ ${attraction.name}</strong><br/>
                  <small>${attraction.type}</small>
                </div>
              `)
            })

            const userIcon = L.divIcon({
              className: "custom-user-icon",
              html: `
              <div style="
                background: linear-gradient(135deg, #dc2626, #ef4444);
                color: white;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                border: 3px solid white;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                cursor: move;
              ">📍</div>
            `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })

            const markerInstance = L.marker([location.lat, location.lng], {
              draggable: true,
              icon: userIcon,
            }).addTo(mapInstance)

            markerInstance.bindPopup(`
            <div style="text-align: center;">
              <strong>📍 Your Location</strong><br/>
              <small>Lat: ${location.lat.toFixed(4)}</small><br/>
              <small>Lng: ${location.lng.toFixed(4)}</small><br/>
              <em>Drag to simulate movement</em>
            </div>
          `)

            markerInstance.on("dragstart", () => {
              mapInstance.closePopup()
            })

            markerInstance.on("dragend", (e: any) => {
              const newPos = e.target.getLatLng()
              onLocationChange({ lat: newPos.lat, lng: newPos.lng })

              const newSafeScore = calculateSafeScore(newPos.lat, newPos.lng)
              setSafeScore(newSafeScore)
              if (onSafeScoreChange) {
                onSafeScoreChange(newSafeScore)
              }

              const enteredZone = safetyZones.find((zone) => {
                const R = 6371e3
                const φ1 = (zone.lat * Math.PI) / 180
                const φ2 = (newPos.lat * Math.PI) / 180
                const Δφ = ((newPos.lat - zone.lat) * Math.PI) / 180
                const Δλ = ((newPos.lng - zone.lng) * Math.PI) / 180

                const a =
                  Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                const distance = R * c

                return distance <= zone.radius
              })

              if (enteredZone) {
                if (enteredZone.type === "red") {
                  handleRedZoneEntry(enteredZone.name)
                }
                triggerVoiceAlert(enteredZone.name, enteredZone.type)
              }

              markerInstance
                .bindPopup(`
                <div style="text-align: center;">
                  <strong>📍 Updated Location</strong><br/>
                  <small>Lat: ${newPos.lat.toFixed(4)}</small><br/>
                  <small>Lng: ${newPos.lng.toFixed(4)}</small><br/>
                  <div style="margin-top: 8px; padding: 4px 8px; background: ${newSafeScore >= 80 ? "#3b82f6" : newSafeScore >= 70 ? "#10b981" : newSafeScore >= 30 ? "#f59e0b" : "#dc2626"}; color: white; border-radius: 4px; font-weight: bold;">
                    Safe Score: ${newSafeScore}%
                  </div>
                  <small style="color: ${newSafeScore >= 80 ? "#3b82f6" : newSafeScore >= 70 ? "#10b981" : newSafeScore >= 30 ? "#f59e0b" : "#dc2626"};">
                    ${currentZone === "blue" ? "Very Safe Zone" : currentZone === "green" ? "Safe Zone" : currentZone === "orange" ? "Caution Zone" : currentZone === "red" ? "High Risk Zone" : currentZone === "purple" ? "Crowded Zone" : "Unknown Zone"}
                  </small>
                </div>
              `)
                .openPopup()
            })

            mapInstance.on("click", (e: any) => {
              const { lat, lng } = e.latlng
              L.popup()
                .setLatLng([lat, lng])
                .setContent(`
                <div style="text-align: center;">
                  <strong>Map Coordinates</strong><br/>
                  <small>Lat: ${lat.toFixed(6)}</small><br/>
                  <small>Lng: ${lng.toFixed(6)}</small>
                </div>
              `)
                .openOn(mapInstance)
            })

            const initialSafeScore = calculateSafeScore(location.lat, location.lng)
            setSafeScore(initialSafeScore)
            if (onSafeScoreChange) {
              onSafeScoreChange(initialSafeScore)
            }

            setMap(mapInstance)
            setMarker(markerInstance)
            setIsLoading(false)
          } catch (err) {
            console.error("Map initialization error:", err)
            setError("Failed to initialize map")
            setIsLoading(false)
          }
        })
        .catch((err) => {
          console.error("Leaflet import error:", err)
          setError("Failed to load map library")
          setIsLoading(false)
        })
    }

    return () => {
      if (map) {
        map.remove()
        setMap(null)
        setMarker(null)
      }
    }
  }, [])

  useEffect(() => {
    if (marker && map && !isLoading) {
      marker.setLatLng([location.lat, location.lng])

      const newSafeScore = calculateSafeScore(location.lat, location.lng)
      setSafeScore(newSafeScore)
      if (onSafeScoreChange) {
        onSafeScoreChange(newSafeScore)
      }

      const currentCenter = map.getCenter()
      const distance = map.distance(currentCenter, [location.lat, location.lng])
      if (distance > 100) {
        map.panTo([location.lat, location.lng])
      }
    }
  }, [location, marker, map, isLoading])

  if (error) {
    return (
      <div className="h-80 w-full rounded-lg border border-destructive bg-destructive/10 flex items-center justify-center">
        <div className="text-center text-destructive">
          <div className="text-lg font-semibold">Map Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {redZoneAlert.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full border-2 border-destructive animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <span className="text-2xl animate-bounce">🚨</span>
                </div>
                <h3 className="text-lg font-bold text-destructive animate-pulse">DANGER: RED ZONE ALERT</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  You have entered a high-risk area. Leave immediately for your safety.
                </p>
              </div>

              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm font-medium text-destructive text-center">
                  Auto-SOS will be sent in 5 seconds if not dismissed
                </p>
              </div>

              <button
                onClick={dismissRedZoneAlert}
                className="w-full bg-destructive hover:bg-destructive/90 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105"
              >
                I'm Leaving This Area
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div
          ref={mapRef}
          className="h-80 w-full rounded-lg border border-border shadow-lg overflow-hidden"
          style={{ minHeight: "320px" }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <div className="text-sm text-muted-foreground">Loading interactive map...</div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Safe Score:</span>
            <div
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                safeScore >= 80
                  ? "bg-blue-500 text-white"
                  : safeScore >= 70
                    ? "bg-emerald-500 text-white"
                    : safeScore >= 30
                      ? "bg-yellow-500 text-white"
                      : "bg-red-500 text-white animate-pulse"
              }`}
            >
              {safeScore}%
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {safeScore >= 80
              ? "Very Safe"
              : safeScore >= 70
                ? "Safe"
                : safeScore >= 30
                  ? "Caution Required"
                  : "High Risk"}
          </span>
        </div>

        {/* Safety Zone Legend */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Safety Zone Legend:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Blue Zone (80-100%) - Very Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Green Zone (70-80%) - Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Orange Zone (30-70%) - Caution</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Red Zone (0-30%) - High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span>Purple Zone - Crowded Area</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
              <span>Tourist Attractions</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          Drag 📍 to simulate movement &bull; Click anywhere to view coordinates
          {userAge && userAge >= 60 && (
            <div className="mt-2">
              <span className="text-orange-600 font-medium">🔊 Voice alerts enabled for risk zones</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
