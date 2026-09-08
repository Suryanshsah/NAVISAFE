"use client"

import { useState, useCallback } from "react"

interface ReverseGeocodingResult {
  address: string
  isLoading: boolean
  error: string | null
}

interface Location {
  lat: number
  lng: number
}

export const useReverseGeocoding = () => {
  const [result, setResult] = useState<ReverseGeocodingResult>({
    address: "",
    isLoading: false,
    error: null,
  })

  const reverseGeocode = useCallback(async (location: Location): Promise<string> => {
    setResult((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // Primary: Try Google Maps Geocoding API if key exists
      const googleMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY

      if (googleMapsKey) {
        console.log("[v0] Using Google Maps Geocoding API")
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${googleMapsKey}`,
        )

        if (googleResponse.ok) {
          const googleData = await googleResponse.json()

          if (googleData.status === "OK" && googleData.results.length > 0) {
            const address = googleData.results[0].formatted_address
            console.log("[v0] Google Maps geocoding successful:", address)

            setResult({
              address,
              isLoading: false,
              error: null,
            })

            return address
          }
        }

        console.log("[v0] Google Maps geocoding failed, falling back to Nominatim")
      }

      // Fallback: OpenStreetMap Nominatim (free service)
      console.log("[v0] Using OpenStreetMap Nominatim for reverse geocoding")
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "User-Agent": "NaviSafe Tourist Safety App",
          },
        },
      )

      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json()

        if (nominatimData.display_name) {
          const address = nominatimData.display_name
          console.log("[v0] Nominatim geocoding successful:", address)

          setResult({
            address,
            isLoading: false,
            error: null,
          })

          return address
        }
      }

      throw new Error("Both geocoding services failed")
    } catch (error) {
      console.error("[v0] Reverse geocoding error:", error)
      const errorMessage = "Unable to fetch address"

      setResult({
        address: "",
        isLoading: false,
        error: errorMessage,
      })

      return errorMessage
    }
  }, [])

  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          let errorMessage = "Unable to get location"

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "User denied location permission"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable"
              break
            case error.TIMEOUT:
              errorMessage = "Location request timeout"
              break
          }

          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        },
      )
    })
  }, [])

  const fetchAddressForCurrentLocation = useCallback(async (): Promise<string> => {
    try {
      const location = await getCurrentLocation()
      return await reverseGeocode(location)
    } catch (error) {
      console.error("[v0] Failed to get current location:", error)
      const errorMessage = error instanceof Error ? error.message : "Unable to fetch address"

      setResult({
        address: "",
        isLoading: false,
        error: errorMessage,
      })

      return errorMessage
    }
  }, [getCurrentLocation, reverseGeocode])

  return {
    ...result,
    reverseGeocode,
    getCurrentLocation,
    fetchAddressForCurrentLocation,
  }
}
