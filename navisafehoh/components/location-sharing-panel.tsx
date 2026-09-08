"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { MapPin, Shield, Users, Eye, EyeOff, AlertTriangle, CheckCircle, Settings, Lock } from "lucide-react"

interface LocationSharingPanelProps {
  userInfo: any
  emergencyContacts: Array<{ name: string; relationship: string; phone: string }>
  currentLocation: { lat: number; lng: number }
  onBack: () => void
}

export function LocationSharingPanel({
  userInfo,
  emergencyContacts,
  currentLocation,
  onBack,
}: LocationSharingPanelProps) {
  const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState(false)
  const [sharingDuration, setSharingDuration] = useState<string>("1") // hours
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [shareWithAuthorities, setShareWithAuthorities] = useState(false)
  const [emergencyOnlyMode, setEmergencyOnlyMode] = useState(true)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [sharingStartTime, setSharingStartTime] = useState<Date | null>(null)

  // Timer for remaining sharing time
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isLocationSharingEnabled && sharingStartTime && remainingTime > 0) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sharingStartTime.getTime()) / 1000)
        const totalDuration = Number.parseInt(sharingDuration) * 3600 // Convert hours to seconds
        const remaining = Math.max(0, totalDuration - elapsed)

        setRemainingTime(remaining)

        if (remaining === 0) {
          // Auto-disable sharing when time expires
          setIsLocationSharingEnabled(false)
          setSharingStartTime(null)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isLocationSharingEnabled, sharingStartTime, sharingDuration])

  const handleToggleLocationSharing = (enabled: boolean) => {
    setIsLocationSharingEnabled(enabled)

    if (enabled) {
      setSharingStartTime(new Date())
      const totalDuration = Number.parseInt(sharingDuration) * 3600
      setRemainingTime(totalDuration)
    } else {
      setSharingStartTime(null)
      setRemainingTime(0)
    }
  }

  const handleContactToggle = (contactIndex: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactIndex) ? prev.filter((c) => c !== contactIndex) : [...prev, contactIndex],
    )
  }

  const formatRemainingTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const getActiveShareCount = () => {
    let count = selectedContacts.length
    if (shareWithAuthorities) count += 1
    return count
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-foreground text-background p-4 sticky top-0 z-[1000] shadow-md">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-background hover:bg-background/10">
            ← Back to Dashboard
          </Button>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span className="font-semibold">Location Sharing</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Privacy Notice */}
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Privacy-First Location Sharing</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You have complete control over your location data. Sharing is secure, encrypted, and can be revoked at
                  any time. Location data is only shared with your chosen contacts and authorized personnel when
                  enabled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Control Panel */}
        <Card className={`border-2 ${isLocationSharingEnabled ? "border-accent bg-accent/5" : "border-border"}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin
                  className={`h-5 w-5 ${isLocationSharingEnabled ? "text-accent animate-pulse" : "text-muted-foreground"}`}
                />
                <span>Real-Time Location Sharing</span>
              </div>
              <Badge
                variant={isLocationSharingEnabled ? "default" : "secondary"}
                className={isLocationSharingEnabled ? "bg-accent animate-pulse" : ""}
              >
                {isLocationSharingEnabled ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <Label className="text-base font-medium">Enable Location Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share your real-time location with selected contacts and authorities
                </p>
              </div>
              <Switch
                checked={isLocationSharingEnabled}
                onCheckedChange={handleToggleLocationSharing}
                className="data-[state=checked]:bg-accent"
              />
            </div>

            {isLocationSharingEnabled && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                {/* Active Status */}
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-accent" />
                      <span className="font-medium text-accent">Location Sharing Active</span>
                    </div>
                    <Badge variant="outline" className="text-accent border-accent/30">
                      {getActiveShareCount()} Recipients
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Started: {sharingStartTime?.toLocaleString()}</p>
                    <p>
                      Time Remaining:{" "}
                      <span className="font-mono font-medium">{formatRemainingTime(remainingTime)}</span>
                    </p>
                    <p>
                      Current Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Duration Settings */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Sharing Duration</Label>
              <Select value={sharingDuration} onValueChange={setSharingDuration} disabled={isLocationSharingEnabled}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">30 minutes</SelectItem>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="8">8 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Location sharing will automatically stop after the selected duration
              </p>
            </div>

            <Separator />

            {/* Emergency Mode Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Emergency Only Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Only share location during active emergencies or SOS alerts
                  </p>
                </div>
                <Switch
                  checked={emergencyOnlyMode}
                  onCheckedChange={setEmergencyOnlyMode}
                  disabled={isLocationSharingEnabled}
                />
              </div>
              {emergencyOnlyMode && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Location will only be shared during emergencies
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Share with Emergency Contacts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyContacts.length > 0 ? (
              emergencyContacts.map((contact, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {contact.relationship} • {contact.phone}
                    </p>
                  </div>
                  <Switch
                    checked={selectedContacts.includes(index.toString())}
                    onCheckedChange={() => handleContactToggle(index.toString())}
                    disabled={isLocationSharingEnabled}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No emergency contacts available</p>
                <p className="text-sm">Add emergency contacts in your trip details</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Authorities Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Share with Authorities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">Authorized Law Enforcement</p>
                <p className="text-sm text-muted-foreground">
                  NaviSafe authorities and local police for emergency response
                </p>
              </div>
              <Switch
                checked={shareWithAuthorities}
                onCheckedChange={setShareWithAuthorities}
                disabled={isLocationSharingEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Status Summary */}
        <Card className="border-2 border-muted">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Sharing Status Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-muted-foreground">Status:</p>
                <Badge variant={isLocationSharingEnabled ? "default" : "secondary"}>
                  {isLocationSharingEnabled ? "Sharing Active" : "Not Sharing"}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Mode:</p>
                <Badge variant="outline">{emergencyOnlyMode ? "Emergency Only" : "Continuous"}</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Emergency Contacts:</p>
                <Badge variant="outline">{selectedContacts.length} Selected</Badge>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Authorities:</p>
                <Badge variant="outline">{shareWithAuthorities ? "Enabled" : "Disabled"}</Badge>
              </div>
            </div>

            {isLocationSharingEnabled && (
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time Remaining:</span>
                  <span className="font-mono text-sm">{formatRemainingTime(remainingTime)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Stop Button */}
        {isLocationSharingEnabled && (
          <Button
            onClick={() => handleToggleLocationSharing(false)}
            variant="destructive"
            className="w-full h-12 font-semibold"
          >
            <EyeOff className="h-5 w-5 mr-2" />
            Stop Location Sharing Immediately
          </Button>
        )}
      </div>
    </div>
  )
}
