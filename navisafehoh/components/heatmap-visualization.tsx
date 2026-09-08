"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Users, Zap, RefreshCw, MapPin } from "lucide-react"

interface HeatmapData {
  lat: number
  lng: number
  intensity: number
  type: "tourist" | "risk" | "crowd"
  count: number
  area: string
}

interface HeatmapVisualizationProps {
  data?: HeatmapData[]
  type: "tourist" | "risk" | "crowd"
}

export function HeatmapVisualization({ data, type }: HeatmapVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
  const [isLoading, setIsLoading] = useState(false)

  // Simulated heatmap data
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([
    { lat: 28.6139, lng: 77.209, intensity: 0.9, type: "tourist", count: 45, area: "Connaught Place" },
    { lat: 28.6129, lng: 77.2295, intensity: 0.7, type: "tourist", count: 32, area: "India Gate" },
    { lat: 28.6562, lng: 77.241, intensity: 0.8, type: "tourist", count: 38, area: "Red Fort" },
    { lat: 28.6505, lng: 77.2334, intensity: 0.95, type: "crowd", count: 120, area: "Chandni Chowk" },
    { lat: 28.62, lng: 77.21, intensity: 0.85, type: "risk", count: 8, area: "Restricted Zone" },
    { lat: 28.6304, lng: 77.2177, intensity: 0.6, type: "tourist", count: 28, area: "Rajpath" },
    { lat: 28.6127, lng: 77.2773, intensity: 0.75, type: "crowd", count: 85, area: "Humayun Tomb" },
  ])

  const getColorForType = (type: string, intensity: number) => {
    const alpha = intensity
    switch (type) {
      case "tourist":
        return `rgba(59, 130, 246, ${alpha})` // Blue
      case "risk":
        return `rgba(239, 68, 68, ${alpha})` // Red
      case "crowd":
        return `rgba(147, 51, 234, ${alpha})` // Purple
      default:
        return `rgba(107, 114, 128, ${alpha})` // Gray
    }
  }

  const drawHeatmap = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw grid background
    ctx.strokeStyle = "rgba(156, 163, 175, 0.2)"
    ctx.lineWidth = 1

    for (let i = 0; i <= 10; i++) {
      const x = (canvas.width / 10) * i
      const y = (canvas.height / 10) * i

      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Filter data by type if specified
    const filteredData = type === "tourist" ? heatmapData.filter((d) => d.type === type) : heatmapData

    // Draw heatmap points
    filteredData.forEach((point, index) => {
      const x = (point.lng - 77.15) * (canvas.width / 0.15) // Normalize longitude
      const y = (28.7 - point.lat) * (canvas.height / 0.15) // Normalize latitude (inverted)

      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        // Create radial gradient for heat effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 40)
        gradient.addColorStop(0, getColorForType(point.type, point.intensity))
        gradient.addColorStop(1, getColorForType(point.type, 0))

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, 40, 0, 2 * Math.PI)
        ctx.fill()

        // Add point marker
        ctx.fillStyle = getColorForType(point.type, 1)
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()

        // Add count label
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(point.count.toString(), x, y + 3)
      }
    })
  }

  useEffect(() => {
    drawHeatmap()
  }, [heatmapData, type])

  useEffect(() => {
    const handleResize = () => drawHeatmap()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const refreshData = () => {
    setIsLoading(true)
    // Simulate data refresh
    setTimeout(() => {
      setHeatmapData((prev) =>
        prev.map((point) => ({
          ...point,
          intensity: Math.max(0.1, Math.min(1, point.intensity + (Math.random() - 0.5) * 0.3)),
          count: Math.max(1, point.count + Math.floor((Math.random() - 0.5) * 20)),
        })),
      )
      setIsLoading(false)
    }, 1000)
  }

  const getTypeTitle = () => {
    switch (type) {
      case "tourist":
        return "Tourist Distribution Heatmap"
      case "risk":
        return "Risk Zone Intensity Map"
      case "crowd":
        return "Crowd Density Visualization"
      default:
        return "Multi-Layer Heatmap"
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case "tourist":
        return <Users className="h-5 w-5" />
      case "risk":
        return <Zap className="h-5 w-5" />
      case "crowd":
        return <MapPin className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 hover:text-primary transition-colors duration-300">
            {getTypeIcon()}
            <span>{getTypeTitle()}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="6h">6h</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
              className="hover:scale-105 transition-all duration-200 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-64 border border-border rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
              style={{ minHeight: "256px" }}
            />
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
                <div className="text-sm text-muted-foreground">Updating heatmap...</div>
              </div>
            )}
          </div>

          {/* Legend and Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Intensity Legend</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getColorForType(type, 0.3) }}></div>
                  <span>Low (0-30%)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getColorForType(type, 0.6) }}></div>
                  <span>Medium (30-70%)</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: getColorForType(type, 0.9) }}></div>
                  <span>High (70-100%)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Statistics</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded">
                  <p className="font-medium">Total Points</p>
                  <p className="text-lg font-bold">
                    {heatmapData.filter((d) => (type === "tourist" ? d.type === type : true)).length}
                  </p>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <p className="font-medium">Avg Intensity</p>
                  <p className="text-lg font-bold">
                    {Math.round(
                      (heatmapData
                        .filter((d) => (type === "tourist" ? d.type === type : true))
                        .reduce((acc, d) => acc + d.intensity, 0) /
                        heatmapData.length) *
                        100,
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
