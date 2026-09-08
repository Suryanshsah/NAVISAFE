"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RefreshCw, Zap, Users, AlertTriangle } from "lucide-react"

interface AuthorityMapComponentProps {
  incidents: any[]
}

export function AuthorityMapComponent({ incidents }: AuthorityMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [realTimeData, setRealTimeData] = useState({
    activeTourists: 247,
    riskZones: 5,
    crowdAlerts: 3,
    responseUnits: 8,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prev) => ({
        activeTourists: prev.activeTourists + Math.floor(Math.random() * 10 - 5),
        riskZones: Math.max(0, prev.riskZones + Math.floor(Math.random() * 3 - 1)),
        crowdAlerts: Math.max(0, prev.crowdAlerts + Math.floor(Math.random() * 2 - 1)),
        responseUnits: Math.max(5, Math.min(12, prev.responseUnits + Math.floor(Math.random() * 3 - 1))),
      }))
      setLastUpdate(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      // Add Leaflet CSS
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      // Dynamically import Leaflet
      import("leaflet").then((L) => {
        try {
          // Fix default markers
          delete (L.Icon.Default.prototype as any)._getIconUrl
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          })

          // Initialize map with proper container sizing
          const mapInstance = L.map(mapRef.current!, {
            center: [28.6139, 77.209],
            zoom: 12,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            touchZoom: true,
          })

          // Add OpenStreetMap tiles
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 18,
            minZoom: 10,
          }).addTo(mapInstance)

          const safeZones = [
            { lat: 28.6139, lng: 77.209, radius: 1000, name: "Connaught Place Safe Zone", score: 95 },
            { lat: 28.6129, lng: 77.2295, radius: 800, name: "India Gate Safe Zone", score: 92 },
            { lat: 28.6562, lng: 77.241, radius: 600, name: "Red Fort Safe Zone", score: 88 },
            { lat: 28.6304, lng: 77.2177, radius: 700, name: "Rajpath Safe Zone", score: 90 },
          ]

          safeZones.forEach((zone) => {
            L.circle([zone.lat, zone.lng], {
              color: "#10b981",
              fillColor: "#10b981",
              fillOpacity: 0.15,
              weight: 3,
              radius: zone.radius,
            })
              .addTo(mapInstance)
              .bindPopup(`
                <div style="min-width: 200px;">
                  <strong style="color: #10b981;">✅ ${zone.name}</strong><br/>
                  <strong>Status:</strong> <span style="color: #10b981;">Safe Zone</span><br/>
                  <strong>Safety Score:</strong> ${zone.score}%<br/>
                  <strong>Coverage:</strong> ${zone.radius}m radius<br/>
                  <strong>Active Tourists:</strong> ${Math.floor(Math.random() * 50 + 20)}<br/>
                  <strong>Last Updated:</strong> ${new Date().toLocaleTimeString()}
                </div>
              `)
          })

          const restrictedZones = [
            { lat: 28.62, lng: 77.21, radius: 500, name: "Government Restricted Area", risk: "HIGH" },
            { lat: 28.615, lng: 77.215, radius: 300, name: "Military Zone", risk: "CRITICAL" },
            { lat: 28.608, lng: 77.225, radius: 400, name: "Construction Zone", risk: "MEDIUM" },
          ]

          restrictedZones.forEach((zone) => {
            const color = zone.risk === "CRITICAL" ? "#dc2626" : zone.risk === "HIGH" ? "#ea580c" : "#f59e0b"

            L.circle([zone.lat, zone.lng], {
              color: color,
              fillColor: color,
              fillOpacity: 0.25,
              weight: 4,
              radius: zone.radius,
            })
              .addTo(mapInstance)
              .bindPopup(`
                <div style="min-width: 200px;">
                  <strong style="color: ${color};">⚠ ${zone.name}</strong><br/>
                  <strong>Status:</strong> <span style="color: ${color};">RESTRICTED</span><br/>
                  <strong>Risk Level:</strong> <span style="color: ${color};">${zone.risk}</span><br/>
                  <strong>Radius:</strong> ${zone.radius}m<br/>
                  <strong>Tourists Detected:</strong> ${Math.floor(Math.random() * 5)}<br/>
                  <strong>Action Required:</strong> Immediate evacuation
                </div>
              `)
          })

          const crowdZones = [
            { lat: 28.6505, lng: 77.2334, radius: 300, name: "Chandni Chowk Market", density: "HIGH" },
            { lat: 28.6127, lng: 77.2773, radius: 250, name: "Humayun's Tomb", density: "MEDIUM" },
            { lat: 28.5562, lng: 77.1, radius: 400, name: "Qutub Minar", density: "HIGH" },
          ]

          crowdZones.forEach((zone) => {
            L.circle([zone.lat, zone.lng], {
              color: "#7c3aed",
              fillColor: "#7c3aed",
              fillOpacity: 0.2,
              weight: 3,
              radius: zone.radius,
              dashArray: "10, 5",
            })
              .addTo(mapInstance)
              .bindPopup(`
                <div style="min-width: 200px;">
                  <strong style="color: #7c3aed;">🟪 ${zone.name}</strong><br/>
                  <strong>Type:</strong> <span style="color: #7c3aed;">Crowd Density Alert</span><br/>
                  <strong>Density Level:</strong> ${zone.density}<br/>
                  <strong>Estimated Crowd:</strong> ${zone.density === "HIGH" ? "500+" : "200-500"} people<br/>
                  <strong>Advisory:</strong> Be cautious with belongings<br/>
                  <strong>Status:</strong> Safe but crowded
                </div>
              `)
          })

          const touristLocations = [
            {
              lat: 28.6145,
              lng: 77.2085,
              name: "Alice Cooper",
              id: "NVS-11111111",
              status: "Safe",
              safeScore: 95,
              lastSeen: "2 min ago",
            },
            {
              lat: 28.6125,
              lng: 77.2305,
              name: "Bob Wilson",
              id: "NVS-22222222",
              status: "Safe",
              safeScore: 88,
              lastSeen: "1 min ago",
            },
            {
              lat: 28.6155,
              lng: 77.2065,
              name: "Carol Davis",
              id: "NVS-33333333",
              status: "Safe",
              safeScore: 92,
              lastSeen: "30 sec ago",
            },
            {
              lat: 28.6135,
              lng: 77.2095,
              name: "David Brown",
              id: "NVS-44444444",
              status: "Safe",
              safeScore: 85,
              lastSeen: "45 sec ago",
            },
            {
              lat: 28.618,
              lng: 77.212,
              name: "Emma Johnson",
              id: "NVS-55555555",
              status: "Caution",
              safeScore: 65,
              lastSeen: "3 min ago",
            },
            {
              lat: 28.611,
              lng: 77.208,
              name: "Frank Miller",
              id: "NVS-66666666",
              status: "Safe",
              safeScore: 90,
              lastSeen: "1 min ago",
            },
          ]

          touristLocations.forEach((tourist) => {
            const iconColor = tourist.safeScore >= 80 ? "#10b981" : tourist.safeScore >= 60 ? "#f59e0b" : "#dc2626"
            const statusIcon = tourist.safeScore >= 80 ? "👤" : tourist.safeScore >= 60 ? "⚠" : "🚨"

            L.marker([tourist.lat, tourist.lng], {
              icon: L.divIcon({
                className: "custom-div-icon",
                html: `
                  <div style="
                    background-color: ${iconColor}; 
                    color: white; 
                    border-radius: 50%; 
                    width: 28px; 
                    height: 28px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 14px; 
                    font-weight: bold; 
                    border: 3px solid white; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    ${tourist.safeScore < 80 ? "animation: pulse 2s infinite;" : ""}
                  ">
                    ${statusIcon}
                  </div>
                  <style>
                    @keyframes pulse {
                      0% { box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 0 rgba(220, 38, 38, 0.7); }
                      70% { box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 10px rgba(220, 38, 38, 0); }
                      100% { box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 0 rgba(220, 38, 38, 0); }
                    }
                  </style>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              }),
            })
              .addTo(mapInstance)
              .bindPopup(`
                <div style="min-width: 220px;">
                  <strong>${tourist.name}</strong><br/>
                  <strong>Tourist ID:</strong> ${tourist.id}<br/>
                  <strong>Status:</strong> <span style="color: ${iconColor};">${tourist.status}</span><br/>
                  <strong>Safe Score:</strong> <span style="color: ${iconColor};">${tourist.safeScore}%</span><br/>
                  <strong>Last Seen:</strong> ${tourist.lastSeen}<br/>
                  <strong>Location:</strong> Live tracking active<br/>
                  <strong>Emergency Contact:</strong> Available<br/>
                  <hr style="margin: 8px 0;">
                  <small><em>Real-time location monitoring via NaviSafe</em></small>
                </div>
              `)
          })

          incidents.forEach((incident) => {
            const color =
              incident.priority === "HIGH"
                ? "#dc2626"
                : incident.priority === "MEDIUM"
                  ? "#f59e0b"
                  : incident.priority === "CRITICAL"
                    ? "#991b1b"
                    : "#6b7280"

            const size = incident.priority === "CRITICAL" ? 40 : incident.priority === "HIGH" ? 36 : 32
            const icon = incident.priority === "CRITICAL" ? "🆘" : "🚨"

            L.marker([incident.location.lat, incident.location.lng], {
              icon: L.divIcon({
                className: "custom-incident-icon",
                html: `
                  <div style="
                    background-color: ${color}; 
                    color: white; 
                    border-radius: 50%; 
                    width: ${size}px; 
                    height: ${size}px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: ${size / 2}px; 
                    font-weight: bold; 
                    border: 4px solid white; 
                    box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                    ${incident.priority === "HIGH" || incident.priority === "CRITICAL" ? "animation: pulse 1.5s infinite;" : ""}
                  ">
                    ${icon}
                  </div>
                  <style>
                    @keyframes pulse {
                      0% { transform: scale(1); opacity: 1; }
                      50% { transform: scale(1.1); opacity: 0.7; }
                      100% { transform: scale(1); opacity: 1; }
                    }
                  </style>
                `,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
              }),
            })
              .addTo(mapInstance)
              .bindPopup(`
                <div style="min-width: 250px;">
                  <strong style="color: ${color};">${incident.type}</strong><br/>
                  <strong>Incident ID:</strong> ${incident.id}<br/>
                  <strong>Tourist:</strong> ${incident.touristName}<br/>
                  <strong>Tourist ID:</strong> ${incident.touristId}<br/>
                  <strong>Priority:</strong> <span style="color: ${color}; font-weight: bold;">${incident.priority}</span><br/>
                  <strong>Status:</strong> ${incident.status}<br/>
                  <strong>Reported:</strong> ${incident.timestamp.toLocaleTimeString()}<br/>
                  <strong>Contact:</strong> ${incident.phone}<br/>
                  <strong>Response Time:</strong> ${Math.floor(Math.random() * 8 + 2)} minutes<br/>
                  <hr style="margin: 8px 0;">
                  <em>${incident.description}</em><br/>
                  <hr style="margin: 8px 0;">
                  <small><strong>Actions:</strong> Response team dispatched, Real-time monitoring active</small>
                </div>
              `)
          })

          const policeStations = [
            { lat: 28.6145, lng: 77.2105, name: "Connaught Place Police Station", units: 3, responseTime: "3-5 min" },
            { lat: 28.6565, lng: 77.2415, name: "Red Fort Police Station", units: 2, responseTime: "4-6 min" },
            { lat: 28.6135, lng: 77.2315, name: "India Gate Police Station", units: 4, responseTime: "2-4 min" },
            { lat: 28.6304, lng: 77.2177, name: "Central Delhi Police Station", units: 5, responseTime: "3-5 min" },
          ]

          policeStations.forEach((station) => {
            L.marker([station.lat, station.lng], {
              icon: L.divIcon({
                className: "custom-police-icon",
                html: `
                  <div style="
                    background-color: #059669; 
                    color: white; 
                    border-radius: 6px; 
                    padding: 6px 10px; 
                    font-size: 12px; 
                    font-weight: bold; 
                    border: 3px solid white; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3); 
                    min-width: 50px; 
                    text-align: center;
                  ">
                    🚔<br/>${station.units}
                  </div>
                `,
                iconSize: [50, 30],
                iconAnchor: [25, 15],
              }),
            })
              .addTo(mapInstance)
              .bindPopup(`
                <div style="min-width: 200px;">
                  <strong>🚔 ${station.name}</strong><br/>
                  <strong>Status:</strong> <span style="color: #059669;">Active & Ready</span><br/>
                  <strong>Available Units:</strong> ${station.units}<br/>
                  <strong>Response Time:</strong> ${station.responseTime}<br/>
                  <strong>Coverage Area:</strong> 2km radius<br/>
                  <strong>Specialization:</strong> Tourist Safety<br/>
                  <strong>Contact:</strong> Direct dispatch available
                </div>
              `)
          })

          setMap(mapInstance)
          setIsLoading(false)

          // Force map resize after container is ready
          setTimeout(() => {
            mapInstance.invalidateSize()
          }, 100)
        } catch (err) {
          console.error("Map initialization error:", err)
          setIsLoading(false)
        }
      }).catch((err) => {
        console.error("Leaflet import error:", err)
        setIsLoading(false)
      })
    }

    return () => {
      if (map) {
        map.remove()
        setMap(null)
      }
    }
  }, [incidents]) // Add incidents as dependency

  const refreshMap = () => {
    setLastUpdate(new Date())
    // Simulate data refresh
    setRealTimeData((prev) => ({
      ...prev,
      activeTourists: prev.activeTourists + Math.floor(Math.random() * 20 - 10),
    }))

    // Force map resize
    if (map) {
      setTimeout(() => {
        map.invalidateSize()
      }, 100)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Real-time Tourist & Incident Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh every 30s
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshMap}
          className="hover:scale-105 transition-all duration-200 group bg-transparent"
        >
          <RefreshCw className="h-4 w-4 mr-2 group-hover:animate-spin" />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <span>Safe Zones</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
            <span>Restricted Areas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span>Crowd Alerts</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Safe Tourists</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-emerald-600 rounded-full"></div>
            <span>Police Stations</span>
          </div>
        </div>
      </Card>

      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-full rounded-lg border border-border shadow-lg"
          style={{ 
            minHeight: "500px",
            height: "500px"
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <div className="text-sm text-muted-foreground">Loading enhanced authority map...</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="space-y-2">
            <Users className="h-6 w-6 mx-auto text-primary animate-pulse" />
            <div>
              <p className="text-2xl font-bold text-primary">{realTimeData.activeTourists}</p>
              <p className="text-xs text-muted-foreground">Active Tourists</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="space-y-2">
            <AlertTriangle className="h-6 w-6 mx-auto text-destructive animate-bounce" />
            <div>
              <p className="text-2xl font-bold text-destructive">{incidents.length}</p>
              <p className="text-xs text-muted-foreground">Active Incidents</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="space-y-2">
            <Zap className="h-6 w-6 mx-auto text-orange-500 animate-pulse" />
            <div>
              <p className="text-2xl font-bold text-orange-500">{realTimeData.riskZones}</p>
              <p className="text-xs text-muted-foreground">Risk Zones</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="space-y-2">
            <div className="h-6 w-6 mx-auto bg-emerald-600 rounded flex items-center justify-center text-white text-xs font-bold animate-pulse">
              🚔
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{realTimeData.responseUnits}</p>
              <p className="text-xs text-muted-foreground">Response Units</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}