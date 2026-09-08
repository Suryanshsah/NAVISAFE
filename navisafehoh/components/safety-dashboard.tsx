"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Globe,
  Home,
  User,
  AlertTriangle,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Wifi,
  Share2,
  Trophy,
  FileText,
  MessageCircle,
  Compass,
} from "lucide-react"
import { EnhancedMapComponent } from "@/components/enhanced-map-component"
import { DigitalID } from "@/components/digital-id"
import { EmergencyPanel } from "@/components/emergency-panel"
import { LocationSharingPanel } from "@/components/location-sharing-panel"
import { GamificationPanel } from "@/components/gamification-panel"
import { AnonymousReportingPanel } from "@/components/anonymous-reporting-panel"
import VirtualGuardianChat from "@/components/virtual-guardian-chat"
import { ThemeToggle } from "@/components/theme-toggle"
import { IndiaDestinations } from "@/components/india-destinations"
import { useReverseGeocoding } from "@/hooks/use-reverse-geocoding"

interface SafetyDashboardProps {
  userInfo: any
  tripDetails?: any
  gpsTracking: {
    currentPosition: any
    isTracking: boolean
    error: string | null
    permissionStatus: "granted" | "denied" | "prompt" | "unknown"
    currentZones: any[]
    safetyScore: number
    isManualMode: boolean
    emergencyAlert: any
    dismissEmergencyAlert: () => void
    startTracking: () => Promise<boolean>
    stopTracking: () => void
    simulatePositionUpdate: (lat: number, lng: number) => void
    enableGPSMode: () => void
  }
}

function SOSAlertDialog({
  isOpen,
  onClose,
  onConfirm,
  alertType,
  zoneName,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  alertType: "restricted" | "unsafe"
  zoneName: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full border border-destructive animate-in fade-in-0 zoom-in-95 duration-300 animate-pulse">
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-destructive animate-pulse">
              {alertType === "restricted" ? "🚨 RESTRICTED ZONE ALERT" : "⚠️ UNSAFE ZONE ALERT"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {alertType === "restricted"
                ? `You have entered: ${zoneName}. This area is restricted for tourists.`
                : `You are outside safe zones near: ${zoneName}. Exercise extreme caution.`}
            </p>
          </div>

          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 animate-in slide-in-from-bottom-2 duration-500">
            <p className="text-sm font-medium text-destructive text-center">
              {alertType === "restricted"
                ? "Immediate action required! Leave this area now or contact authorities."
                : "Would you like to send an automatic SOS alert to authorities?"}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent hover:scale-105 transition-transform duration-200"
            >
              Dismiss
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-destructive hover:bg-destructive/90 hover:scale-105 active:scale-95 transition-all duration-200 animate-pulse"
            >
              <Phone className="h-4 w-4 mr-2" />
              Send SOS Alert
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmergencyAlertDialog({ emergencyAlert, dismissEmergencyAlert, setCurrentView }: any) {
  if (!emergencyAlert.isActive) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full border-4 border-destructive animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <AlertTriangle className="h-12 w-12 text-destructive animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-destructive animate-pulse">🚨 EMERGENCY ALERT 🚨</h3>
            <p className="text-sm text-muted-foreground mt-2">
              You have entered: <strong>{emergencyAlert.zoneName}</strong>
            </p>
            <p className="text-sm font-medium text-destructive mt-1">This is a restricted/dangerous area!</p>
          </div>

          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-lg p-4 animate-in slide-in-from-bottom-2 duration-500">
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive mb-2 animate-pulse">{emergencyAlert.countdown}</div>
              <p className="text-sm font-medium text-destructive">
                Police call will be initiated automatically in {emergencyAlert.countdown} seconds
              </p>
              <p className="text-xs text-muted-foreground mt-1">Leave this area immediately or dismiss if safe</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={dismissEmergencyAlert}
              className="flex-1 bg-transparent hover:scale-105 transition-transform duration-200"
            >
              I'm Safe - Dismiss
            </Button>
            <Button
              onClick={() => {
                dismissEmergencyAlert()
                setCurrentView("emergency")
              }}
              className="flex-1 bg-destructive hover:bg-destructive/90 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardBottomNav({ currentView, setCurrentView }: { currentView: string; setCurrentView: (view: any) => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border shadow-lg z-[2000]">
      <div className="mx-auto max-w-7xl grid grid-cols-7">
        <Button
          variant="ghost"
          className={`h-16 flex-col space-y-1 ${currentView === "dashboard" ? "text-primary bg-primary/5" : ""}`}
          onClick={() => setCurrentView("dashboard")}
        >
          <Home className="h-4 w-4" />
          <span className="text-xs">Home</span>
        </Button>
        <Button
          variant="ghost"
          className={`h-16 flex-col space-y-1 ${currentView === "digitalId" ? "text-primary bg-primary/5" : ""}`}
          onClick={() => setCurrentView("digitalId")}
        >
          <User className="h-4 w-4" />
          <span className="text-xs">Digital ID</span>
        </Button>
        <Button
          variant="ghost"
          className={`h-16 flex-col space-y-1 ${currentView === "locationSharing" ? "text-primary bg-primary/5" : ""}`}
          onClick={() => setCurrentView("locationSharing")}
        >
          <Share2 className="h-4 w-4" />
          <span className="text-xs">Location</span>
        </Button>
        <Button
          variant="ghost"
          className={`h-16 flex-col space-y-1 ${currentView === "gamification" ? "text-primary bg-primary/5" : ""}`}
          onClick={() => setCurrentView("gamification")}
        >
          <Trophy className="h-4 w-4" />
          <span className="text-xs">Rewards</span>
        </Button>
        <Button
          variant="ghost"
          className={`h-16 flex-col space-y-1 ${currentView === "reporting" ? "text-primary bg-primary/5" : ""}`}
          onClick={() => setCurrentView("reporting")}
        >
          <FileText className="h-4 w-4" />
          <span className="text-xs">Report</span>
        </Button>
        <Button
          variant="ghost"
          className={`h-16 flex-col space-y-1 ${currentView === "exploreIndia" ? "text-primary bg-primary/5" : ""}`}
          onClick={() => setCurrentView("exploreIndia")}
        >
          <Compass className="h-4 w-4" />
          <span className="text-xs">Explore India</span>
        </Button>
        <Button
          variant="ghost"
          className={`h-16 flex-col space-y-1 ${currentView === "virtualGuardian" ? "text-primary bg-primary/5" : ""}`}
          onClick={() => setCurrentView("virtualGuardian")}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">AI Guardian</span>
        </Button>
      </div>
    </div>
  )
}

export function SafetyDashboard({ userInfo, tripDetails, gpsTracking }: SafetyDashboardProps) {
  const {
    currentPosition,
    isTracking,
    error: gpsError,
    permissionStatus,
    currentZones,
    safetyScore: gpsScore,
    isManualMode,
    emergencyAlert,
    dismissEmergencyAlert,
    startTracking,
    stopTracking,
    simulatePositionUpdate,
    enableGPSMode,
  } = gpsTracking

  const {
    address: dynamicAddress,
    isLoading: addressLoading,
    error: addressError,
    reverseGeocode,
  } = useReverseGeocoding()
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 })
  const [isInSafeZone, setIsInSafeZone] = useState(true)
  const [isInRestrictedZone, setIsInRestrictedZone] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected">("connected")
  const [currentView, setCurrentView] = useState<
    "dashboard" | "digitalId" | "emergency" | "locationSharing" | "gamification" | "reporting" | "virtualGuardian" | "exploreIndia"
  >("dashboard")
  const [safeScore, setSafeScore] = useState(gpsScore || 100)
  const [sosAlert, setSosAlert] = useState<{
    isOpen: boolean
    alertType: "restricted" | "unsafe"
    zoneName: string
  }>({
    isOpen: false,
    alertType: "restricted",
    zoneName: "",
  })
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: "Local Police", number: "100" },
    { name: "Tourist Helpline", number: "1363" },
    { name: "Medical Emergency", number: "108" },
  ])
  const [displayAddress, setDisplayAddress] = useState<string>("")

  useEffect(() => {
    if (currentPosition) {
      console.log("[v0] GPS position received:", currentPosition)
      setCurrentLocation({ lat: currentPosition.lat, lng: currentPosition.lng })
      setLastUpdate(new Date())

      reverseGeocode(currentPosition).then((address) => {
        setDisplayAddress(address)
      })
    }
  }, [currentPosition, reverseGeocode])

  useEffect(() => {
    if (gpsScore !== undefined) {
      setSafeScore(gpsScore)
    }
  }, [gpsScore])

  const handleLocationChange = useCallback(
    (newLocation: { lat: number; lng: number }) => {
      console.log("[v0] Manual location change:", newLocation)
      simulatePositionUpdate(newLocation.lat, newLocation.lng)
      setLastUpdate(new Date())

      reverseGeocode(newLocation).then((address) => {
        setDisplayAddress(address)
      })

      const safeZones = [
        { lat: 28.6139, lng: 77.209, radius: 0.01, name: "Connaught Place Safe Zone" },
        { lat: 28.6129, lng: 77.2295, name: "India Gate Safe Zone", radius: 0.008 },
      ]

      const restrictedZones = [
        { lat: 28.62, lng: 77.21, radius: 0.005, name: "Government Restricted Area" },
        { lat: 28.615, lng: 77.215, radius: 0.003, name: "Military Zone" },
      ]

      const inSafe = safeZones.some((zone) => {
        const distance = Math.sqrt(Math.pow(newLocation.lat - zone.lat, 2) + Math.pow(newLocation.lng - zone.lng, 2))
        return distance <= zone.radius
      })

      const restrictedZone = restrictedZones.find((zone) => {
        const distance = Math.sqrt(Math.pow(newLocation.lat - zone.lat, 2) + Math.pow(newLocation.lng - zone.lng, 2))
        return distance <= zone.radius
      })

      const wasInSafeZone = isInSafeZone
      const wasInRestrictedZone = isInRestrictedZone

      setIsInSafeZone(inSafe)
      setIsInRestrictedZone(!!restrictedZone)

      if (restrictedZone && !wasInRestrictedZone) {
        setSosAlert({
          isOpen: true,
          alertType: "restricted",
          zoneName: restrictedZone.name,
        })
      }
    },
    [simulatePositionUpdate, isInSafeZone, isInRestrictedZone, reverseGeocode],
  )

  const handleSafeScoreChange = useCallback(
    (score: number) => {
      setSafeScore((prevScore) => {
        if (prevScore === score) {
          return prevScore
        }

        console.log("[v0] Safe score changed:", { previousScore: prevScore, newScore: score, isInSafeZone })

        if (!isInSafeZone && score < 20) {
          console.log("[v0] Triggering SOS alert - outside safe zone and score below 20%")
          setSosAlert({
            isOpen: true,
            alertType: "unsafe",
            zoneName: "Critical Safety Zone",
          })
        }

        return score
      })
    },
    [isInSafeZone],
  )

  const handleSOSConfirm = () => {
    setSosAlert({ isOpen: false, alertType: "restricted", zoneName: "" })
    setCurrentView("emergency")
    console.log("[v0] SOS Alert sent automatically due to zone violation")
  }

  const handleSOSClose = () => {
    setSosAlert({ isOpen: false, alertType: "restricted", zoneName: "" })
  }

  const handleEmergency = () => {
    setCurrentView("emergency")
  }

  const getCurrentAddress = () => {
    if (addressLoading) return "Fetching current address…"
    if (displayAddress) return displayAddress
    if (addressError) return "Unable to fetch current address"
    if (currentLocation.lat === 0 && currentLocation.lng === 0) {
      return "Waiting for GPS location…"
    }
    return `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
  }

  if (currentView === "digitalId") {
    return (
      <>
        <div className="pb-16"><DigitalID userInfo={userInfo} onBack={() => setCurrentView("dashboard")} /></div>
        <DashboardBottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </>
    )
  }

  if (currentView === "emergency") {
    return (
      <>
        <div className="pb-16">
          <EmergencyPanel
            userInfo={userInfo}
            currentLocation={currentLocation}
            currentAddress={getCurrentAddress()}
            onBack={() => setCurrentView("dashboard")}
          />
        </div>
        <DashboardBottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </>
    )
  }

  if (currentView === "locationSharing") {
    return (
      <>
        <div className="pb-16">
          <LocationSharingPanel
            userInfo={userInfo}
            emergencyContacts={tripDetails?.emergencyContacts || []}
            currentLocation={currentLocation}
            onBack={() => setCurrentView("dashboard")}
          />
        </div>
        <DashboardBottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </>
    )
  }

  if (currentView === "gamification") {
    return (
      <>
        <div className="pb-16">
          <GamificationPanel
            userInfo={userInfo}
            tripDetails={tripDetails}
            safeScore={safeScore}
            onBack={() => setCurrentView("dashboard")}
          />
        </div>
        <DashboardBottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </>
    )
  }

  if (currentView === "reporting") {
    return (
      <>
        <div className="pb-16"><AnonymousReportingPanel currentLocation={currentLocation} onBack={() => setCurrentView("dashboard")} /></div>
        <DashboardBottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </>
    )
  }

  if (currentView === "exploreIndia") {
    return (
      <>
        <div className="min-h-screen bg-background pb-24">
          <div className="bg-foreground text-background p-4 sticky top-0 z-[1000] shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Compass className="h-6 w-6 animate-pulse" />
                <div>
                  <h1 className="text-lg font-semibold">Explore Incredible India</h1>
                  <p className="text-xs opacity-70">Discover destinations with your AI travel guide</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>
          <div className="p-4 max-w-7xl mx-auto">
            <IndiaDestinations />
          </div>
        </div>
        <DashboardBottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </>
    )
  }

  if (currentView === "virtualGuardian") {
    return (
      <>
        <div className="min-h-screen bg-background">
        <div className="bg-foreground text-background p-4 sticky top-0 z-[1000] shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView("dashboard")}
                className="text-background hover:bg-background/20"
              >
                ← Back
              </Button>
              <Shield className="h-6 w-6 animate-pulse" />
              <h1 className="text-lg font-semibold">Virtual Guardian AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">AI Safety Assistant</span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="p-4 pb-24">
          <VirtualGuardianChat
            userLocation={currentLocation}
            safetyScore={safeScore}
            currentZone={isInRestrictedZone ? "Red Zone" : isInSafeZone ? "Green Zone" : "Orange Zone"}
            userInfo={{
              name: userInfo?.name || "Guest User",
              age: userInfo?.age ? Number.parseInt(userInfo.age) : 25,
              digitalId: userInfo?.digitalId || "guest001",
              tripStartDate: tripDetails?.startDate || new Date().toISOString().split("T")[0],
              tripEndDate:
                tripDetails?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            }}
          />
        </div>
        </div>
        <DashboardBottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <EmergencyAlertDialog
        emergencyAlert={emergencyAlert}
        dismissEmergencyAlert={dismissEmergencyAlert}
        setCurrentView={setCurrentView}
      />

      <SOSAlertDialog
        isOpen={sosAlert.isOpen}
        onClose={handleSOSClose}
        onConfirm={handleSOSConfirm}
        alertType={sosAlert.alertType}
        zoneName={sosAlert.zoneName}
      />

      <div className="bg-foreground text-background p-4 sticky top-0 z-[1000] shadow-md animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield
              className={`h-6 w-6 ${emergencyAlert.isActive ? "animate-bounce text-red-400" : "animate-pulse"}`}
            />
            <h1 className="text-lg font-semibold">
              {emergencyAlert.isActive ? "🚨 EMERGENCY MODE" : "Safety Dashboard"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm animate-in fade-in-0 duration-700 delay-300">
              Welcome, {userInfo?.name || "User"}
            </span>
            <ThemeToggle />
            <Globe
              className="h-5 w-5 cursor-pointer hover:scale-110 hover:rotate-12 transition-all duration-300"
              title="Language Settings"
            />
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          className={`p-3 ${
            emergencyAlert.isActive
              ? "bg-destructive animate-pulse"
              : isInRestrictedZone
                ? "bg-destructive animate-pulse"
                : isInSafeZone
                  ? "bg-accent"
                  : "bg-orange-500"
          } text-white transition-all duration-500`}
        >
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle
              className={`h-4 w-4 ${isInRestrictedZone || emergencyAlert.isActive ? "animate-bounce" : ""}`}
            />
            <span className="text-sm font-medium">
              {emergencyAlert.isActive
                ? `🚨 EMERGENCY: In ${emergencyAlert.zoneName} - Police call in ${emergencyAlert.countdown}s`
                : gpsError
                  ? `⚠️ GPS Error: ${gpsError} - Using manual mode`
                  : !isTracking
                    ? "🔍 Starting GPS tracking..."
                    : permissionStatus === "denied"
                      ? "⚠️ GPS permission denied - Using manual mode"
                      : isManualMode
                        ? "📍 Manual positioning mode - Drag marker to test zones"
                        : isInRestrictedZone
                          ? "⚠️ WARNING: You are in a restricted zone! Leave immediately or contact authorities."
                          : isInSafeZone
                            ? "✅ You're in a safe zone - Continue exploring safely"
                            : "⚠️ You are outside designated safe zones - Exercise caution"}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4 pb-20">
          <div className="grid grid-cols-3 gap-4">
            <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 hover:shadow-accent/20">
              <CardContent className="p-4 text-center">
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div className="p-2 bg-accent/10 rounded-full hover:bg-accent/20 transition-colors duration-300 hover:scale-110">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant="secondary"
                      className="bg-accent/10 text-accent hover:bg-accent/20 transition-colors duration-300"
                    >
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200 hover:shadow-primary/20">
              <CardContent className="p-4 text-center">
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div className="p-2 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors duration-300 hover:scale-110">
                      <MapPin
                        className={`h-5 w-5 text-primary ${isTracking && !isManualMode ? "animate-pulse" : ""}`}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location tracking</p>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-300"
                    >
                      {gpsError
                        ? "GPS Error"
                        : !isTracking
                          ? "Starting..."
                          : isManualMode
                            ? "Manual Mode"
                            : "GPS Active"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300 hover:shadow-emerald-500/20">
              <CardContent className="p-4 text-center">
                <div className="space-y-2">
                  <div className="flex justify-center">
                    <div
                      className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                        safeScore >= 80
                          ? "bg-emerald-500/10 hover:bg-emerald-500/20"
                          : safeScore >= 50
                            ? "bg-yellow-500/10 hover:bg-yellow-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse"
                      }`}
                    >
                      <Shield
                        className={`h-5 w-5 transition-all duration-300 ${
                          safeScore >= 80
                            ? "text-emerald-500"
                            : safeScore >= 50
                              ? "text-yellow-500 animate-pulse"
                              : "text-red-500 animate-bounce"
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Safe Score</p>
                    <Badge
                      variant="secondary"
                      className={`transition-all duration-300 hover:scale-105 ${
                        safeScore >= 80
                          ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          : safeScore >= 50
                            ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse"
                      }`}
                    >
                      {safeScore}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {(gpsError || isManualMode) && (
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">GPS Controls</p>
                    <p className="text-sm text-muted-foreground">
                      {isManualMode ? "Switch back to real GPS tracking" : "Retry GPS location"}
                    </p>
                  </div>
                  <Button
                    onClick={enableGPSMode}
                    variant="outline"
                    size="sm"
                    className="hover:scale-105 transition-all duration-200 bg-transparent"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Enable GPS
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wifi
                    className={`h-4 w-4 transition-all duration-300 ${connectionStatus === "connected" ? "text-accent animate-pulse" : "text-destructive animate-bounce"}`}
                  />
                  <span className="text-sm font-medium">
                    {connectionStatus === "connected" ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin" style={{ animationDuration: "8s" }} />
                  <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400 border-2 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 animate-pulse" />
                  <span>Real-Time GPS Tracking</span>
                </div>
                <Badge variant="outline" className="text-xs hover:bg-muted transition-colors duration-300">
                  <Navigation
                    className={`h-3 w-3 mr-1 ${isTracking && !isManualMode ? "animate-spin" : ""}`}
                    style={{ animationDuration: "3s" }}
                  />
                  {isTracking && !isManualMode ? "Live GPS" : isManualMode ? "Manual Mode" : "GPS Starting"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedMapComponent
                touristId={userInfo?.digitalId || "guest-user"}
                userAge={userInfo?.age ? Number.parseInt(userInfo.age) : undefined}
                onLocationChange={handleLocationChange}
                onSafeScoreChange={handleSafeScoreChange}
                initialZones={currentZones}
              />

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="hover:bg-muted/50 p-2 rounded transition-colors duration-300">
                    <span className="text-muted-foreground">Latitude:</span>
                    <p className="font-mono font-medium text-foreground">{currentLocation.lat.toFixed(6)}</p>
                  </div>
                  <div className="hover:bg-muted/50 p-2 rounded transition-colors duration-300">
                    <span className="text-muted-foreground">Longitude:</span>
                    <p className="font-mono font-medium text-foreground">{currentLocation.lng.toFixed(6)}</p>
                  </div>
                </div>
                <div className="hover:bg-muted/50 p-2 rounded transition-colors duration-300">
                  <span className="text-muted-foreground">Address:</span>
                  <p
                    className={`font-medium text-foreground ${addressLoading ? "animate-pulse" : ""} ${addressError ? "text-destructive" : ""}`}
                  >
                    {getCurrentAddress()}
                  </p>
                  {addressLoading && (
                    <div className="flex items-center mt-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                      <span className="text-xs text-muted-foreground">Fetching location details...</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Zone Status:</span>
                  <Badge
                    variant={isInRestrictedZone ? "destructive" : isInSafeZone ? "default" : "secondary"}
                    className={`transition-all duration-300 hover:scale-105 ${
                      isInRestrictedZone
                        ? "animate-pulse"
                        : isInSafeZone
                          ? "bg-accent hover:bg-accent/80"
                          : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {isInRestrictedZone ? "Restricted" : isInSafeZone ? "Safe Zone" : "Caution Zone"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Emergency Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {emergencyContacts.map((contact, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-all duration-300 hover:scale-[1.02] hover:shadow-sm"
                >
                  <span className="text-sm font-medium">{contact.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-transparent hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    {contact.number}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-600 border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-800 dark:text-yellow-200">Safety Achievements</span>
                </div>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  Level {Math.floor(safeScore / 25) + 1}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Earn points for safe practices and unlock achievements. Your current safety score contributes to your
                level and unlocks new badges.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Safety Points: 850</p>
                  <p className="text-yellow-600 dark:text-yellow-400">Rank: Safety Explorer</p>
                </div>
                <Button
                  onClick={() => setCurrentView("gamification")}
                  variant="outline"
                  size="sm"
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300 hover:scale-105 transition-all duration-200"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  View Achievements
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-700 border-2 border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="text-purple-800 dark:text-purple-200">Anonymous Reporting</span>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  Community Safety
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Help keep the community safe by reporting suspicious activities or safety concerns anonymously. Your
                reports help authorities respond quickly.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium text-purple-800 dark:text-purple-200">Secure & Anonymous</p>
                  <p className="text-purple-600 dark:text-purple-400">24/7 authority monitoring</p>
                </div>
                <Button
                  onClick={() => setCurrentView("reporting")}
                  variant="outline"
                  size="sm"
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-300 hover:scale-105 transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-800 border-2 border-cyan-200 bg-cyan-50 dark:bg-cyan-950 dark:border-cyan-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-cyan-600" />
                  <span className="text-cyan-800 dark:text-cyan-200">Virtual Guardian AI</span>
                </div>
                <Badge variant="outline" className="text-cyan-600 border-cyan-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  AI Assistant
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                Get instant safety assistance from your AI-powered Virtual Guardian. Ask questions about local safety,
                emergency procedures, or get real-time guidance.
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium text-cyan-800 dark:text-cyan-200">24/7 AI Safety Support</p>
                  <p className="text-cyan-600 dark:text-cyan-400">Instant emergency escalation</p>
                </div>
                <Button
                  onClick={() => setCurrentView("virtualGuardian")}
                  variant="outline"
                  size="sm"
                  className="bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border-cyan-300 hover:scale-105 transition-all duration-200"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with AI
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleEmergency}
            className="w-full h-16 text-lg font-bold bg-destructive hover:bg-destructive/90 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-900 hover:shadow-destructive/25 group"
            size="lg"
          >
            <Phone className="h-6 w-6 mr-2 group-hover:animate-bounce" />
            <span className="group-hover:animate-pulse">🚨 EMERGENCY SOS 🚨</span>
          </Button>
        </div>
      </div>

      <DashboardBottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  )
}
