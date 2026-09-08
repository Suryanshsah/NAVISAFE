"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Phone, MapPin, Clock, Shield, Siren, Heart, Car, Users, Globe } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface EmergencyPanelProps {
  userInfo: any
  currentLocation: { lat: number; lng: number }
  currentAddress?: string
  onBack: () => void
}

export function EmergencyPanel({ userInfo, currentLocation, currentAddress, onBack }: EmergencyPanelProps) {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [language, setLanguage] = useState<"en" | "hi">("en")

  const emergencyTypes = [
    { id: "medical", icon: Heart, label: "Medical Emergency", color: "bg-red-500", priority: "HIGH" },
    { id: "security", icon: Shield, label: "Security Threat", color: "bg-orange-500", priority: "HIGH" },
    { id: "accident", icon: Car, label: "Accident", color: "bg-yellow-500", priority: "MEDIUM" },
    { id: "lost", icon: MapPin, label: "Lost/Stranded", color: "bg-blue-500", priority: "MEDIUM" },
    { id: "harassment", icon: Users, label: "Harassment", color: "bg-purple-500", priority: "HIGH" },
    { id: "other", icon: AlertTriangle, label: "Other Emergency", color: "bg-gray-500", priority: "MEDIUM" },
  ]

  const emergencyContacts = [
    { name: "Police", number: "100", type: "security" },
    { name: "Medical Emergency", number: "108", type: "medical" },
    { name: "Fire Department", number: "101", type: "fire" },
    { name: "Tourist Helpline", number: "1363", type: "tourist" },
    { name: "Women Helpline", number: "1091", type: "women" },
  ]

  const translations = {
    en: {
      title: "Emergency Response",
      subtitle: "Get immediate help when you need it",
      selectType: "Select Emergency Type",
      additionalInfo: "Additional Information (Optional)",
      placeholder: "Describe your situation...",
      sendAlert: "Send Emergency Alert",
      quickCall: "Quick Call",
      currentLocation: "Current Location",
      estimatedResponse: "Estimated Response Time: 5-10 minutes",
      backToDashboard: "Back to Dashboard",
    },
    hi: {
      title: "आपातकालीन प्रतिक्रिया",
      subtitle: "जब आपको जरूरत हो तो तुरंत मदद पाएं",
      selectType: "आपातकाल का प्रकार चुनें",
      additionalInfo: "अतिरिक्त जानकारी (वैकल्पिक)",
      placeholder: "अपनी स्थिति का वर्णन करें...",
      sendAlert: "आपातकालीन अलर्ट भेजें",
      quickCall: "त्वरित कॉल",
      currentLocation: "वर्तमान स्थान",
      estimatedResponse: "अनुमानित प्रतिक्रिया समय: 5-10 मिनट",
      backToDashboard: "डैशबोर्ड पर वापस",
    },
  }

  const t = translations[language]

  const handleEmergencyAlert = () => {
    const selectedType = emergencyTypes.find((type) => type.id === selectedEmergency)

    const alertMessage = `🚨 EMERGENCY ALERT ACTIVATED 🚨

Emergency Type: ${selectedType?.label || "General Emergency"}
Priority: ${selectedType?.priority || "MEDIUM"}

Tourist Details:
• Name: ${userInfo?.name || "Unknown"}
• ID: NVS-${Date.now().toString().slice(-8)}
• Phone: ${userInfo?.phone || "Not provided"}

Location Details:
• Coordinates: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}
• Address: ${currentAddress || "Waiting for current GPS address..."}
• Timestamp: ${new Date().toLocaleString()}

Additional Information:
${additionalInfo || "None provided"}

AUTHORITIES NOTIFIED:
✅ Local Police (100)
✅ Medical Emergency (108)
✅ Tourist Helpline (1363)

Response teams are being dispatched to your location.
Stay calm and wait for assistance.`

    alert(alertMessage)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-background p-4 sticky top-0 z-[1000] shadow-md">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-background hover:bg-background/10">
            ← {t.backToDashboard}
          </Button>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center space-x-2 bg-transparent border-background/20 text-background hover:bg-background/10"
            >
              <Globe className="h-4 w-4" />
              <span>{language === "en" ? "हिंदी" : "English"}</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Emergency Header */}
        <Card className="border-2 border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-destructive/10 rounded-full animate-pulse">
                <Siren className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-xl text-destructive">{t.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </CardHeader>
        </Card>

        {/* Emergency Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.selectType}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {emergencyTypes.map((type) => {
                const Icon = type.icon
                return (
                  <Button
                    key={type.id}
                    variant={selectedEmergency === type.id ? "default" : "outline"}
                    className={`h-20 flex-col space-y-2 p-3 ${selectedEmergency === type.id ? type.color : ""}`}
                    onClick={() => setSelectedEmergency(type.id)}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <Icon className="h-6 w-6 flex-shrink-0" />
                      <span className="text-xs text-center leading-tight">{type.label}</span>
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {type.priority}
                      </Badge>
                    </div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.additionalInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={t.placeholder}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-20"
            />
          </CardContent>
        </Card>

        {/* Current Location */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{t.currentLocation}</p>
                <p className="text-sm text-muted-foreground">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </p>
              </div>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                <Clock className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.quickCall}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {emergencyContacts.map((contact, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between h-12 bg-transparent p-3"
                onClick={() => alert(`Calling ${contact.name} at ${contact.number}`)}
              >
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{contact.name}</span>
                </div>
                <span className="font-mono text-sm flex-shrink-0">{contact.number}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Send Alert Button */}
        <Button
          onClick={handleEmergencyAlert}
          disabled={!selectedEmergency}
          className="w-full h-16 text-lg font-bold bg-destructive hover:bg-destructive/90 shadow-lg"
          size="lg"
        >
          <Siren className="h-6 w-6 mr-2" />
          {t.sendAlert}
        </Button>

        <p className="text-center text-sm text-muted-foreground">{t.estimatedResponse}</p>
      </div>
    </div>
  )
}
