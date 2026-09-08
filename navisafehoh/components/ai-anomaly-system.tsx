"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, MapPin, Clock, TrendingDown, Navigation, Zap } from "lucide-react"

interface AnomalyDetection {
  id: string
  touristId: string
  touristName: string
  type: "no_movement" | "sudden_drop" | "route_deviation" | "speed_anomaly"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  location: { lat: number; lng: number }
  timestamp: Date
  description: string
  aiConfidence: number
  status: "detected" | "investigating" | "resolved" | "false_positive"
}

interface AIAnomalySystemProps {
  onAnomalyDetected: (anomaly: AnomalyDetection) => void
}

export function AIAnomalySystem({ onAnomalyDetected }: AIAnomalySystemProps) {
  const [isActive, setIsActive] = useState(true)
  const [detectedAnomalies, setDetectedAnomalies] = useState<AnomalyDetection[]>([])
  const [processingLoad, setProcessingLoad] = useState(0)
  const [aiStats, setAiStats] = useState({
    totalScanned: 247,
    anomaliesDetected: 8,
    falsePositives: 2,
    accuracy: 94.2,
  })

  // Simulate AI anomaly detection
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      // Simulate processing load
      setProcessingLoad(Math.random() * 100)

      // Randomly generate anomalies for demo
      if (Math.random() < 0.15) {
        // 15% chance every 10 seconds
        const anomalyTypes = [
          {
            type: "no_movement" as const,
            description: "No movement detected for 3+ hours",
            severity: "HIGH" as const,
            confidence: 92 + Math.random() * 8,
          },
          {
            type: "sudden_drop" as const,
            description: "Location jumped 1.2km in 90 seconds",
            severity: "CRITICAL" as const,
            confidence: 88 + Math.random() * 12,
          },
          {
            type: "route_deviation" as const,
            description: "Deviated 6km from planned route",
            severity: "MEDIUM" as const,
            confidence: 85 + Math.random() * 10,
          },
          {
            type: "speed_anomaly" as const,
            description: "Unusual speed pattern detected",
            severity: "LOW" as const,
            confidence: 78 + Math.random() * 15,
          },
        ]

        const tourists = [
          { id: "NVS-12345678", name: "John Smith" },
          { id: "NVS-87654321", name: "Sarah Johnson" },
          { id: "NVS-11223344", name: "Mike Chen" },
          { id: "NVS-55667788", name: "Emma Wilson" },
          { id: "NVS-99887766", name: "David Brown" },
        ]

        const selectedAnomaly = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)]
        const selectedTourist = tourists[Math.floor(Math.random() * tourists.length)]

        const newAnomaly: AnomalyDetection = {
          id: `ANOM-${Date.now()}`,
          touristId: selectedTourist.id,
          touristName: selectedTourist.name,
          type: selectedAnomaly.type,
          severity: selectedAnomaly.severity,
          location: {
            lat: 28.6139 + (Math.random() - 0.5) * 0.1,
            lng: 77.209 + (Math.random() - 0.5) * 0.1,
          },
          timestamp: new Date(),
          description: selectedAnomaly.description,
          aiConfidence: selectedAnomaly.confidence,
          status: "detected",
        }

        setDetectedAnomalies((prev) => [newAnomaly, ...prev.slice(0, 9)]) // Keep last 10
        onAnomalyDetected(newAnomaly)

        // Update stats
        setAiStats((prev) => ({
          ...prev,
          anomaliesDetected: prev.anomaliesDetected + 1,
          totalScanned: prev.totalScanned + Math.floor(Math.random() * 5),
        }))
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [isActive, onAnomalyDetected])

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "no_movement":
        return Clock
      case "sudden_drop":
        return TrendingDown
      case "route_deviation":
        return Navigation
      case "speed_anomaly":
        return Zap
      default:
        return AlertTriangle
    }
  }

  const getAnomalyColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "text-red-600 bg-red-50 border-red-200"
      case "HIGH":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "LOW":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const resolveAnomaly = (anomalyId: string, resolution: "resolved" | "false_positive") => {
    setDetectedAnomalies((prev) =>
      prev.map((anomaly) => (anomaly.id === anomalyId ? { ...anomaly, status: resolution } : anomaly)),
    )

    if (resolution === "false_positive") {
      setAiStats((prev) => ({
        ...prev,
        falsePositives: prev.falsePositives + 1,
        accuracy: ((prev.anomaliesDetected - prev.falsePositives - 1) / prev.anomaliesDetected) * 100,
      }))
    }
  }

  return (
    <div className="space-y-4">
      {/* AI System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>AI Anomaly Detection System</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isActive ? "default" : "secondary"} className="bg-accent">
                {isActive ? "Active" : "Inactive"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setIsActive(!isActive)}>
                {isActive ? "Pause" : "Start"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* AI Processing Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing Load</span>
              <span>{processingLoad.toFixed(1)}%</span>
            </div>
            <Progress value={processingLoad} className="h-2" />
          </div>

          {/* AI Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{aiStats.totalScanned}</p>
              <p className="text-xs text-muted-foreground">Tourists Scanned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{aiStats.anomaliesDetected}</p>
              <p className="text-xs text-muted-foreground">Anomalies Detected</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{aiStats.falsePositives}</p>
              <p className="text-xs text-muted-foreground">False Positives</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{aiStats.accuracy.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Recent AI Detections</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {detectedAnomalies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>AI system is monitoring... No anomalies detected yet.</p>
            </div>
          ) : (
            detectedAnomalies.map((anomaly) => {
              const Icon = getAnomalyIcon(anomaly.type)
              return (
                <div key={anomaly.id} className={`p-4 border rounded-lg ${getAnomalyColor(anomaly.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <Badge variant="outline" className="text-xs">
                          {anomaly.severity}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          AI: {anomaly.aiConfidence.toFixed(1)}%
                        </Badge>
                        <span className="text-xs font-mono">{anomaly.id}</span>
                      </div>

                      <div>
                        <h4 className="font-semibold">{anomaly.description}</h4>
                        <p className="text-sm">
                          Tourist: {anomaly.touristName} ({anomaly.touristId})
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {anomaly.location.lat.toFixed(4)}, {anomaly.location.lng.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{anomaly.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    {anomaly.status === "detected" && (
                      <div className="flex flex-col space-y-1 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveAnomaly(anomaly.id, "resolved")}
                          className="text-xs h-7"
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => resolveAnomaly(anomaly.id, "false_positive")}
                          className="text-xs h-7"
                        >
                          False +
                        </Button>
                      </div>
                    )}

                    {anomaly.status !== "detected" && (
                      <Badge variant="secondary" className="text-xs">
                        {anomaly.status === "resolved" ? "Resolved" : "False Positive"}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
