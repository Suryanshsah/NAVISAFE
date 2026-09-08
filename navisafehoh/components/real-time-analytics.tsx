"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, AlertTriangle, Users, Clock, Activity, Zap } from "lucide-react"

interface AnalyticsData {
  timestamp: Date
  touristCount: number
  incidentCount: number
  riskLevel: number
  responseTime: number
}

export function RealTimeAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [currentStats, setCurrentStats] = useState({
    totalTourists: 247,
    activeIncidents: 3,
    avgRiskLevel: 25,
    avgResponseTime: 6.2,
    safeZones: 8,
    riskZones: 5,
    crowdAlerts: 3,
    responseUnits: 12,
  })

  const [trends, setTrends] = useState({
    touristGrowth: 12,
    incidentReduction: -8,
    responseImprovement: -15,
    riskIncrease: 5,
  })

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newDataPoint: AnalyticsData = {
        timestamp: new Date(),
        touristCount: currentStats.totalTourists + Math.floor(Math.random() * 20 - 10),
        incidentCount: Math.max(0, currentStats.activeIncidents + Math.floor(Math.random() * 3 - 1)),
        riskLevel: Math.max(0, Math.min(100, currentStats.avgRiskLevel + Math.floor(Math.random() * 10 - 5))),
        responseTime: Math.max(2, currentStats.avgResponseTime + (Math.random() - 0.5) * 2),
      }

      setAnalyticsData((prev) => [...prev.slice(-19), newDataPoint])

      setCurrentStats((prev) => ({
        ...prev,
        totalTourists: newDataPoint.touristCount,
        activeIncidents: newDataPoint.incidentCount,
        avgRiskLevel: newDataPoint.riskLevel,
        avgResponseTime: newDataPoint.responseTime,
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [currentStats])

  const getRiskLevelColor = (level: number) => {
    if (level < 30) return "text-green-600"
    if (level < 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getRiskLevelBg = (level: number) => {
    if (level < 30) return "bg-green-100 dark:bg-green-900"
    if (level < 60) return "bg-yellow-100 dark:bg-yellow-900"
    return "bg-red-100 dark:bg-red-900"
  }

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? "↗️" : trend < 0 ? "↘️" : "➡️"
  }

  const getTrendColor = (trend: number, isGood: boolean) => {
    if (trend === 0) return "text-muted-foreground"
    const positive = trend > 0
    return positive === isGood ? "text-green-600" : "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Real-time Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tourists</p>
                <p className="text-2xl font-bold text-primary">{currentStats.totalTourists}</p>
                <div className="flex items-center space-x-1 text-xs">
                  <span className={getTrendColor(trends.touristGrowth, true)}>
                    {getTrendIcon(trends.touristGrowth)} {Math.abs(trends.touristGrowth)}%
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold text-destructive">{currentStats.activeIncidents}</p>
                <div className="flex items-center space-x-1 text-xs">
                  <span className={getTrendColor(trends.incidentReduction, false)}>
                    {getTrendIcon(trends.incidentReduction)} {Math.abs(trends.incidentReduction)}%
                  </span>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive animate-bounce" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Risk Level</p>
                <p className={`text-2xl font-bold ${getRiskLevelColor(currentStats.avgRiskLevel)}`}>
                  {currentStats.avgRiskLevel}%
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  <span className={getTrendColor(trends.riskIncrease, false)}>
                    {getTrendIcon(trends.riskIncrease)} {Math.abs(trends.riskIncrease)}%
                  </span>
                </div>
              </div>
              <Zap className="h-8 w-8 text-orange-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold text-blue-600">{currentStats.avgResponseTime.toFixed(1)}m</p>
                <div className="flex items-center space-x-1 text-xs">
                  <span className={getTrendColor(trends.responseImprovement, false)}>
                    {getTrendIcon(trends.responseImprovement)} {Math.abs(trends.responseImprovement)}%
                  </span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-blue-600 animate-spin" style={{ animationDuration: "8s" }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zone Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Zone Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Safe Zones</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{currentStats.safeZones}</Badge>
                    <Progress value={80} className="w-20" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Risk Zones</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive">{currentStats.riskZones}</Badge>
                    <Progress value={25} className="w-20" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Crowd Alerts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{currentStats.crowdAlerts}</Badge>
                    <Progress value={15} className="w-20" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Response Units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{currentStats.responseUnits}</Badge>
                    <Progress value={75} className="w-20" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Risk Assessment Matrix</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center font-medium">Low</div>
                <div className="text-center font-medium">Medium</div>
                <div className="text-center font-medium">High</div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-3 rounded text-center ${getRiskLevelBg(20)}`}>
                    <p className="font-bold text-green-600">65%</p>
                    <p className="text-xs">Safe Areas</p>
                  </div>
                  <div className={`p-3 rounded text-center ${getRiskLevelBg(50)}`}>
                    <p className="font-bold text-yellow-600">25%</p>
                    <p className="text-xs">Moderate Risk</p>
                  </div>
                  <div className={`p-3 rounded text-center ${getRiskLevelBg(80)}`}>
                    <p className="font-bold text-red-600">10%</p>
                    <p className="text-xs">High Risk</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Risk Level</span>
                  <Badge className={getRiskLevelColor(currentStats.avgRiskLevel)}>
                    {currentStats.avgRiskLevel < 30 ? "LOW" : currentStats.avgRiskLevel < 60 ? "MEDIUM" : "HIGH"}
                  </Badge>
                </div>
                <Progress value={currentStats.avgRiskLevel} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart Placeholder */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Real-time Trends (Last 24 Hours)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 dark:from-blue-950 dark:via-purple-950 dark:to-green-950 rounded-lg border border-border flex items-center justify-center relative overflow-hidden">
            <div className="text-center space-y-2">
              <TrendingUp className="h-12 w-12 mx-auto text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">Interactive time-series visualization</p>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Tourists</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-100"></div>
                  <span>Incidents</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-200"></div>
                <span>Response Time</span>
              </div>
            </div>

            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + Math.sin(i) * 20}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: "3s",
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
