"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { broadcastLocationUpdate, broadcastGeofenceEvent, broadcastSafetyAlert } from "@/lib/socket"

interface GPSPosition {
  lat: number
  lng: number
  accuracy?: number
  timestamp: string
}

interface GeofenceZone {
  id: string
  name: string
  lat: number
  lng: number
  radius: number
  type: "safe" | "caution" | "restricted" | "crowded"
  color: string
}

interface UseGPSTrackingOptions {
  touristId: string
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  trackingInterval?: number
}

const STATIC_GEOFENCE_ZONES: GeofenceZone[] = [
  // Green safe zone in the center around NIT Hamirpur
  {
    id: "green-safe-zone-center",
    name: "Central Safe Zone",
    lat: 31.7086,
    lng: 76.5270,
    radius: 300,
    type: "safe",
    color: "#10b981",
  },
  {
    id: "green-safe-zone-north",
    name: "North Safe Zone",
    lat: 31.7116, // ~300m north
    lng: 76.5270,
    radius: 200,
    type: "safe",
    color: "#10b981",
  },
  {
    id: "green-safe-zone-south",
    name: "South Safe Zone",
    lat: 31.7056, // ~300m south
    lng: 76.5270,
    radius: 200,
    type: "safe",
    color: "#10b981",
  },

  // Orange caution zones
  {
    id: "orange-caution-northeast",
    name: "Northeast Caution Zone",
    lat: 31.7116,
    lng: 76.5320,
    radius: 250,
    type: "caution",
    color: "#f59e0b",
  },
  {
    id: "orange-caution-northwest",
    name: "Northwest Caution Zone",
    lat: 31.7116,
    lng: 76.5220,
    radius: 250,
    type: "caution",
    color: "#f59e0b",
  },
  {
    id: "orange-caution-southeast",
    name: "Southeast Caution Zone",
    lat: 31.7056,
    lng: 76.5320,
    radius: 250,
    type: "caution",
    color: "#f59e0b",
  },
  {
    id: "orange-caution-southwest",
    name: "Southwest Caution Zone",
    lat: 31.7056,
    lng: 76.5220,
    radius: 250,
    type: "caution",
    color: "#f59e0b",
  },

  // Purple crowded zones
  {
    id: "purple-crowded-east",
    name: "East Crowded Area",
    lat: 31.7086,
    lng: 76.5340,
    radius: 180,
    type: "crowded",
    color: "#7c3aed",
  },
  {
    id: "purple-crowded-west",
    name: "West Crowded Area",
    lat: 31.7086,
    lng: 76.5200,
    radius: 180,
    type: "crowded",
    color: "#7c3aed",
  },

  // Red restricted zones (dangerous areas)
  {
    id: "red-restricted-far-north",
    name: "North Restricted Zone",
    lat: 31.7166,
    lng: 76.5270,
    radius: 200,
    type: "restricted",
    color: "#dc2626",
  },
  {
    id: "red-restricted-far-south",
    name: "South Restricted Zone",
    lat: 31.7006,
    lng: 76.5270,
    radius: 200,
    type: "restricted",
    color: "#dc2626",
  },
  {
    id: "red-restricted-far-east",
    name: "East Restricted Zone",
    lat: 31.7086,
    lng: 76.5390,
    radius: 200,
    type: "restricted",
    color: "#dc2626",
  },
  {
    id: "red-restricted-far-west",
    name: "West Restricted Zone",
    lat: 31.7086,
    lng: 76.5150,
    radius: 200,
    type: "restricted",
    color: "#dc2626",
  },
  {
    id: "red-restricted-northeast-corner",
    name: "Northeast Restricted Zone",
    lat: 31.7146,
    lng: 76.5340,
    radius: 150,
    type: "restricted",
    color: "#dc2626",
  },
  {
    id: "red-restricted-northwest-corner",
    name: "Northwest Restricted Zone",
    lat: 31.7146,
    lng: 76.5200,
    radius: 150,
    type: "restricted",
    color: "#dc2626",
  },
]


export const useGPSTracking = (options: UseGPSTrackingOptions) => {
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown")
  const [safetyScore, setSafetyScore] = useState(100)
  const [isManualMode, setIsManualMode] = useState(false)
  const [emergencyAlert, setEmergencyAlert] = useState<{
    isActive: boolean
    zoneName: string
    countdown: number
  }>({ isActive: false, zoneName: "", countdown: 0 })

  const watchIdRef = useRef<number | null>(null)
  const lastPositionRef = useRef<GPSPosition | null>(null)
  const previousZonesRef = useRef<Set<string>>(new Set())
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const emergencyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const emergencyCountdownRef = useRef<NodeJS.Timeout | null>(null)

  const staticZones = useRef<GeofenceZone[]>(STATIC_GEOFENCE_ZONES)

  const touristId = useRef(options.touristId)
  touristId.current = options.touristId

  const getStaticZones = useCallback((): GeofenceZone[] => {
    return staticZones.current
  }, [])

  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }, [])

  const calculateSafetyScore = useCallback(
    (position: GPSPosition, zones: GeofenceZone[]): number => {
      let score = 50 // Start with neutral score
      let inSafeZone = false
      let inRestrictedZone = false
      let inCautionZone = false
      let inCrowdedZone = false

      zones.forEach((zone) => {
        const distance = calculateDistance(position.lat, position.lng, zone.lat, zone.lng)

        if (distance <= zone.radius) {
          switch (zone.type) {
            case "safe":
              inSafeZone = true
              score = Math.max(score, 95) // Very high score for safe zones
              break
            case "caution":
              inCautionZone = true
              score = Math.min(score, 65) // Moderate score for caution zones
              break
            case "restricted":
              inRestrictedZone = true
              score = Math.min(score, 15) // Very low score for restricted zones
              break
            case "crowded":
              inCrowdedZone = true
              score = Math.min(score, 70) // Slightly reduced score for crowded zones
              break
          }
        }
      })

      // Priority-based scoring
      if (inRestrictedZone) {
        score = 15 // Override with very low score for restricted zones
      } else if (inSafeZone && !inCautionZone && !inCrowdedZone) {
        score = 95 // High score for being only in safe zones
      } else if (inSafeZone && (inCautionZone || inCrowdedZone)) {
        score = 75 // Mixed zones
      } else if (!inSafeZone && !inCautionZone && !inRestrictedZone && !inCrowdedZone) {
        score = 60 // Neutral area outside all zones
      }

      return Math.round(Math.max(0, Math.min(100, score)))
    },
    [calculateDistance],
  )

  const triggerEmergencyAlert = useCallback((zoneName: string) => {
    console.log("[v0] Emergency alert triggered for zone:", zoneName)

    setEmergencyAlert({
      isActive: true,
      zoneName,
      countdown: 5,
    })

    // Start countdown
    let countdown = 5
    emergencyCountdownRef.current = setInterval(() => {
      countdown -= 1
      setEmergencyAlert((prev) => ({ ...prev, countdown }))

      if (countdown <= 0) {
        if (emergencyCountdownRef.current) {
          clearInterval(emergencyCountdownRef.current)
        }
        // Auto-initiate police call
        initiatePoliceCall(zoneName)
      }
    }, 1000)

    // Auto-trigger after 5 seconds if not dismissed
    emergencyTimeoutRef.current = setTimeout(() => {
      initiatePoliceCall(zoneName)
    }, 5000)
  }, [])

  const initiatePoliceCall = useCallback(
    (zoneName: string) => {
      console.log("[v0] Initiating police call for emergency in zone:", zoneName)

      // Clear any existing timers
      if (emergencyTimeoutRef.current) {
        clearTimeout(emergencyTimeoutRef.current)
      }
      if (emergencyCountdownRef.current) {
        clearInterval(emergencyCountdownRef.current)
      }

      // Show police call popup
      alert(
        `🚨 EMERGENCY CALL INITIATED 🚨\n\nPolice have been contacted automatically.\nLocation: ${zoneName}\nHelp is on the way!\n\nStay calm and move to a safe area if possible.`,
      )

      // Reset emergency alert
      setEmergencyAlert({ isActive: false, zoneName: "", countdown: 0 })

      // Broadcast emergency to authorities
      broadcastSafetyAlert({
        touristId: touristId.current,
        alertType: "emergency_call_initiated",
        location: currentPosition ? { lat: currentPosition.lat, lng: currentPosition.lng } : { lat: 0, lng: 0 },
        safetyScore: 0,
        message: `EMERGENCY: Police call initiated automatically for tourist in ${zoneName}`,
        timestamp: new Date().toISOString(),
      })
    },
    [currentPosition],
  )

  const dismissEmergencyAlert = useCallback(() => {
    console.log("[v0] Emergency alert dismissed by user")

    if (emergencyTimeoutRef.current) {
      clearTimeout(emergencyTimeoutRef.current)
    }
    if (emergencyCountdownRef.current) {
      clearInterval(emergencyCountdownRef.current)
    }

    setEmergencyAlert({ isActive: false, zoneName: "", countdown: 0 })
  }, [])

  const checkGeofenceEvents = useCallback(
    (position: GPSPosition, zones: GeofenceZone[]) => {
      const currentZoneIds = new Set<string>()
      let enteredRestrictedZone = false

      zones.forEach((zone) => {
        const distance = calculateDistance(position.lat, position.lng, zone.lat, zone.lng)

        if (distance <= zone.radius) {
          currentZoneIds.add(zone.id)

          if (!previousZonesRef.current.has(zone.id)) {
            console.log(`[v0] Entered zone: ${zone.name} (${zone.type})`)

            broadcastGeofenceEvent({
              touristId: touristId.current,
              eventType: "enter",
              zoneName: zone.name,
              zoneType: zone.type,
              location: { lat: position.lat, lng: position.lng },
              timestamp: position.timestamp,
            })

            if (zone.type === "restricted") {
              enteredRestrictedZone = true
              triggerEmergencyAlert(zone.name)

              broadcastSafetyAlert({
                touristId: touristId.current,
                alertType: "restricted_zone",
                location: { lat: position.lat, lng: position.lng },
                safetyScore: calculateSafetyScore(position, zones),
                message: `CRITICAL: Tourist entered restricted zone: ${zone.name}`,
                timestamp: position.timestamp,
              })
            }
          }
        }
      })

      previousZonesRef.current.forEach((zoneId) => {
        if (!currentZoneIds.has(zoneId)) {
          const exitedZone = zones.find((z) => z.id === zoneId)
          if (exitedZone) {
            console.log(`[v0] Exited zone: ${exitedZone.name} (${exitedZone.type})`)

            broadcastGeofenceEvent({
              touristId: touristId.current,
              eventType: "exit",
              zoneName: exitedZone.name,
              zoneType: exitedZone.type,
              location: { lat: position.lat, lng: position.lng },
              timestamp: position.timestamp,
            })
          }
        }
      })

      previousZonesRef.current = currentZoneIds
    },
    [calculateDistance, calculateSafetyScore, triggerEmergencyAlert],
  )

  const simulatePositionUpdate = useCallback(
    (lat: number, lng: number) => {
      setIsManualMode(true)

      if (gpsTimeoutRef.current) {
        clearTimeout(gpsTimeoutRef.current)
        gpsTimeoutRef.current = null
      }

      const simulatedPosition: GPSPosition = {
        lat,
        lng,
        accuracy: 10,
        timestamp: new Date().toISOString(),
      }

      console.log("[v0] Simulated position update:", simulatedPosition)

      const newPosition: GPSPosition = {
        lat: simulatedPosition.lat,
        lng: simulatedPosition.lng,
        accuracy: simulatedPosition.accuracy,
        timestamp: simulatedPosition.timestamp,
      }

      console.log("[v0] GPS position updated:", newPosition)

      const zones = staticZones.current
      const score = calculateSafetyScore(newPosition, zones)
      setSafetyScore(score)

      checkGeofenceEvents(newPosition, zones)

      broadcastLocationUpdate({
        touristId: touristId.current,
        location: { lat: newPosition.lat, lng: newPosition.lng },
        safetyScore: score,
        zoneType:
          zones.find((z) => {
            const distance = calculateDistance(newPosition.lat, newPosition.lng, z.lat, z.lng)
            return distance <= z.radius
          })?.type || "unknown",
        timestamp: newPosition.timestamp,
      })

      if (score < 30 && lastPositionRef.current && calculateSafetyScore(lastPositionRef.current, zones) >= 30) {
        broadcastSafetyAlert({
          touristId: touristId.current,
          alertType: "low_safety_score",
          location: { lat: newPosition.lat, lng: newPosition.lng },
          safetyScore: score,
          message: `Safety score dropped to ${score}% - immediate attention required`,
          timestamp: newPosition.timestamp,
        })
      }

      setCurrentPosition(newPosition)
      lastPositionRef.current = newPosition
      setError(null)
    },
    [calculateSafetyScore, checkGeofenceEvents, calculateDistance],
  )

  const handlePositionUpdate = useCallback(
    (position: GeolocationPosition) => {
      const newPosition: GPSPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString(),
      }

      console.log("[v0] GPS position updated:", newPosition)

      const zones = staticZones.current
      const score = calculateSafetyScore(newPosition, zones)
      setSafetyScore(score)

      checkGeofenceEvents(newPosition, zones)

      broadcastLocationUpdate({
        touristId: touristId.current,
        location: { lat: newPosition.lat, lng: newPosition.lng },
        safetyScore: score,
        zoneType:
          zones.find((z) => {
            const distance = calculateDistance(newPosition.lat, newPosition.lng, z.lat, z.lng)
            return distance <= z.radius
          })?.type || "unknown",
        timestamp: newPosition.timestamp,
      })

      if (score < 30 && lastPositionRef.current && calculateSafetyScore(lastPositionRef.current, zones) >= 30) {
        broadcastSafetyAlert({
          touristId: touristId.current,
          alertType: "low_safety_score",
          location: { lat: newPosition.lat, lng: newPosition.lng },
          safetyScore: score,
          message: `Safety score dropped to ${score}% - immediate attention required`,
          timestamp: newPosition.timestamp,
        })
      }

      setCurrentPosition(newPosition)
      lastPositionRef.current = newPosition
      setError(null)
    },
    [calculateSafetyScore, checkGeofenceEvents, calculateDistance],
  )

  const handlePositionError = useCallback(
    (error: GeolocationPositionError) => {
      let errorMessage = "Unknown GPS error"

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "GPS access denied by user"
          setPermissionStatus("denied")
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = "GPS position unavailable"
          break
        case error.TIMEOUT:
          // A timeout is temporary. Do NOT replace the user's location with
          // demo coordinates. watchPosition() will keep trying for a real fix.
          errorMessage = "GPS request timed out — waiting for a real location fix"
          break
      }

      console.error("[v0] GPS error:", errorMessage, error)

      if (error.code === error.PERMISSION_DENIED || error.code === error.POSITION_UNAVAILABLE) {
        setError(errorMessage)
      } else if (error.code === error.TIMEOUT) {
        setError(null)
      }
    },
    [],
  )

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (gpsTimeoutRef.current) {
      clearTimeout(gpsTimeoutRef.current)
      gpsTimeoutRef.current = null
    }

    if (emergencyTimeoutRef.current) {
      clearTimeout(emergencyTimeoutRef.current)
    }
    if (emergencyCountdownRef.current) {
      clearInterval(emergencyCountdownRef.current)
    }

    setIsTracking(false)
    console.log("[v0] GPS tracking stopped")
  }, [])

  const startTracking = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser")
      return false
    }

    // Never create multiple watchers. This is important because the dashboard
    // re-renders whenever a GPS position changes.
    if (watchIdRef.current !== null) {
      return true
    }

    try {
      if ("permissions" in navigator) {
        const permission = await navigator.permissions.query({ name: "geolocation" })
        setPermissionStatus(permission.state)
      }

      const gpsOptions: PositionOptions = {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 15000,
        // Do not use an old cached position as the initial location.
        maximumAge: options.maximumAge ?? 0,
      }

      // Get one immediate real position, then keep watching for updates.
      navigator.geolocation.getCurrentPosition(handlePositionUpdate, handlePositionError, gpsOptions)
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handlePositionError,
        gpsOptions,
      )

      setIsTracking(true)
      setError(null)
      console.log("[v0] GPS tracking started with real browser geolocation")
      return true
    } catch (err) {
      console.error("[v0] Failed to start GPS tracking:", err)
      setError("Failed to start GPS tracking")
      return false
    }
  }, [
    options.enableHighAccuracy,
    options.timeout,
    options.maximumAge,
    handlePositionUpdate,
    handlePositionError,
  ])

  const enableGPSMode = useCallback(() => {
    setIsManualMode(false)
    if (isTracking) {
      stopTracking()
      setTimeout(() => startTracking(), 100)
    }
  }, [isTracking, startTracking, stopTracking])

  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [stopTracking])

  return {
    currentPosition,
    isTracking,
    error,
    permissionStatus,
    currentZones: staticZones.current,
    safetyScore,
    isManualMode,
    emergencyAlert,
    dismissEmergencyAlert,
    startTracking,
    stopTracking,
    simulatePositionUpdate,
    enableGPSMode,
  }
}
