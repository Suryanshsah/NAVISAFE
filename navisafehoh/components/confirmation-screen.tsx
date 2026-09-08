"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, Calendar, Users, Clock } from "lucide-react"

interface ConfirmationScreenProps {
  onContinue: () => void
  userInfo?: any
  tripDetails?: any
}

export function ConfirmationScreen({ onContinue, userInfo, tripDetails }: ConfirmationScreenProps) {
  const getTripDuration = () => {
    if (tripDetails?.startDate && tripDetails?.endDate) {
      const start = new Date(tripDetails.startDate)
      const end = new Date(tripDetails.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    return 0
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <Card className="w-full max-w-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-6">
            {/* Main Protection Status Card */}
            <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20 animate-in fade-in-0 zoom-in-95 duration-700 delay-200">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="p-6 bg-primary rounded-full animate-pulse">
                    <Shield className="h-20 w-20 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-accent rounded-full animate-bounce">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-primary animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-400">
                  You're Protected
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500">
                  NaviSafe is now actively monitoring your safety throughout your entire trip
                </p>
                <div className="flex justify-center pt-2">
                  <Badge variant="default" className="px-4 py-2 text-sm font-semibold animate-pulse">
                    🛡️ Active Protection Status
                  </Badge>
                </div>
              </div>
            </div>

            {/* Registration Complete Message */}
            <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-600">
              <h2 className="text-xl font-semibold text-foreground">Registration Complete!</h2>
              <p className="text-muted-foreground">
                Our advanced AI system will track your location and alert authorities in case of emergencies.
              </p>
            </div>
          </div>

          {tripDetails && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-200">
              <h3 className="font-semibold flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Trip Summary</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Duration:</span>
                    <Badge variant="outline">{getTripDuration()} days</Badge>
                  </div>

                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Start:</span> {formatDate(tripDetails.startDate)}
                    </p>
                    <p>
                      <span className="font-medium">End:</span> {formatDate(tripDetails.endDate)}
                    </p>
                  </div>

                  <div>
                    <p>
                      <span className="font-medium">Purpose:</span> {tripDetails.purpose}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Emergency Contacts:</span>
                    <Badge variant="outline">{tripDetails.emergencyContacts?.length || 0}</Badge>
                  </div>

                  {tripDetails.emergencyContacts?.slice(0, 2).map((contact: any, index: number) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {contact.name} ({contact.relationship})
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Digital ID Notice */}
          <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Time-Bound Digital Tourist ID Active
              </span>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p>
                • Your Digital ID is valid from {tripDetails?.startDate ? formatDate(tripDetails.startDate) : "today"}{" "}
                to {tripDetails?.endDate ? formatDate(tripDetails.endDate) : "your departure"}
              </p>
              <p>• Safety monitoring will automatically deactivate after your trip ends</p>
              <p>• All data will be securely archived according to privacy regulations</p>
            </div>
          </div>

          {/* Safety Features */}
          <div className="space-y-3 p-4 bg-accent/10 rounded-lg border border-accent/20 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium text-accent">Safety Features Activated</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Real-time location monitoring during trip duration</li>
              <li>• Emergency SOS alerts with automatic authority notification</li>
              <li>• Safe zone notifications and risk area warnings</li>
              <li>• 24/7 authority connection and emergency response</li>
              <li>• AI-powered anomaly detection for your safety</li>
            </ul>
          </div>

          <Button
            onClick={onContinue}
            className="w-full h-12 text-base font-semibold hover:scale-105 transition-all duration-200"
            size="lg"
          >
            Continue to Safety Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
