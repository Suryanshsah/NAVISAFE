"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Trophy, Star, Shield, MapPin, Users, Clock, Award, Target, Zap, Crown } from "lucide-react"

interface GamificationPanelProps {
  userInfo: any
  tripDetails?: any
  safeScore: number
  onBack: () => void
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  progress: number
  maxProgress: number
  category: "safety" | "exploration" | "community" | "emergency"
}

interface SafetyStats {
  totalPoints: number
  level: number
  rank: string
  safetyStreak: number
  zonesVisited: number
  emergencyContactsAdded: number
  reportsSubmitted: number
}

export function GamificationPanel({ userInfo, tripDetails, safeScore, onBack }: GamificationPanelProps) {
  const [safetyStats, setSafetyStats] = useState<SafetyStats>({
    totalPoints: 850,
    level: 3,
    rank: "Safety Explorer",
    safetyStreak: 5,
    zonesVisited: 8,
    emergencyContactsAdded: tripDetails?.emergencyContacts?.length || 0,
    reportsSubmitted: 2,
  })

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_steps",
      name: "First Steps",
      description: "Complete your tourist registration",
      icon: "🎯",
      points: 100,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      category: "safety",
    },
    {
      id: "safety_conscious",
      name: "Safety Conscious",
      description: "Add emergency contacts to your profile",
      icon: "👥",
      points: 150,
      unlocked: tripDetails?.emergencyContacts?.length > 0,
      progress: tripDetails?.emergencyContacts?.length || 0,
      maxProgress: 3,
      category: "safety",
    },
    {
      id: "zone_explorer",
      name: "Zone Explorer",
      description: "Visit 5 different safety zones",
      icon: "🗺️",
      points: 200,
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      category: "exploration",
    },
    {
      id: "safety_streak",
      name: "Safety Streak",
      description: "Maintain 80%+ safety score for 7 days",
      icon: "🔥",
      points: 300,
      unlocked: false,
      progress: 5,
      maxProgress: 7,
      category: "safety",
    },
    {
      id: "community_guardian",
      name: "Community Guardian",
      description: "Submit 5 anonymous safety reports",
      icon: "🛡️",
      points: 250,
      unlocked: false,
      progress: 2,
      maxProgress: 5,
      category: "community",
    },
    {
      id: "emergency_ready",
      name: "Emergency Ready",
      description: "Complete emergency preparedness checklist",
      icon: "🚨",
      points: 400,
      unlocked: false,
      progress: 3,
      maxProgress: 5,
      category: "emergency",
    },
  ])

  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Calculate points from current activities
  useEffect(() => {
    let points = 100 // Base registration points

    // Points for emergency contacts
    if (tripDetails?.emergencyContacts?.length > 0) {
      points += tripDetails.emergencyContacts.length * 50
    }

    // Points for safety score
    if (safeScore >= 80) {
      points += 200
    } else if (safeScore >= 60) {
      points += 100
    }

    // Points for trip details completion
    if (tripDetails?.itinerary) {
      points += 100
    }

    setSafetyStats((prev) => ({
      ...prev,
      totalPoints: points,
      level: Math.floor(points / 300) + 1,
    }))
  }, [tripDetails, safeScore])

  const getRankTitle = (level: number) => {
    if (level >= 5) return "Safety Guardian"
    if (level >= 4) return "Safety Expert"
    if (level >= 3) return "Safety Explorer"
    if (level >= 2) return "Safety Aware"
    return "Safety Novice"
  }

  const getNextLevelPoints = (currentLevel: number) => {
    return (currentLevel + 1) * 300
  }

  const getProgressToNextLevel = () => {
    const currentLevelPoints = safetyStats.level * 300
    const nextLevelPoints = getNextLevelPoints(safetyStats.level)
    const progress = safetyStats.totalPoints - currentLevelPoints
    const maxProgress = nextLevelPoints - currentLevelPoints
    return { progress, maxProgress }
  }

  const filteredAchievements = achievements.filter((achievement) =>
    selectedCategory === "all" ? true : achievement.category === selectedCategory,
  )

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "safety":
        return <Shield className="h-4 w-4" />
      case "exploration":
        return <MapPin className="h-4 w-4" />
      case "community":
        return <Users className="h-4 w-4" />
      case "emergency":
        return <Zap className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const { progress: levelProgress, maxProgress: levelMaxProgress } = getProgressToNextLevel()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-foreground text-background p-4 sticky top-0 z-[1000] shadow-md">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="text-background hover:bg-background/10">
            ← Back to Dashboard
          </Button>
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">Safety Achievements</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Player Stats Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userInfo?.name || "Tourist"}</h2>
                  <p className="text-sm text-muted-foreground">{getRankTitle(safetyStats.level)}</p>
                </div>
              </div>
              <Badge variant="default" className="bg-primary text-lg px-3 py-1">
                Level {safetyStats.level}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Points and Level Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Safety Points</span>
                <span className="text-lg font-bold text-primary">{safetyStats.totalPoints}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress to Level {safetyStats.level + 1}</span>
                  <span>
                    {levelProgress}/{levelMaxProgress}
                  </span>
                </div>
                <Progress value={(levelProgress / levelMaxProgress) * 100} className="h-2" />
              </div>
            </div>

            <Separator />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Safety Score</span>
                </div>
                <p className="text-xl font-bold text-emerald-500">{safeScore}%</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Target className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Safety Streak</span>
                </div>
                <p className="text-xl font-bold text-orange-500">{safetyStats.safetyStreak} days</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Zones Visited</span>
                </div>
                <p className="text-xl font-bold text-blue-500">{safetyStats.zonesVisited}</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Reports Submitted</span>
                </div>
                <p className="text-xl font-bold text-purple-500">{safetyStats.reportsSubmitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="flex items-center space-x-1"
              >
                <Star className="h-4 w-4" />
                <span>All</span>
              </Button>
              <Button
                variant={selectedCategory === "safety" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("safety")}
                className="flex items-center space-x-1"
              >
                <Shield className="h-4 w-4" />
                <span>Safety</span>
              </Button>
              <Button
                variant={selectedCategory === "exploration" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("exploration")}
                className="flex items-center space-x-1"
              >
                <MapPin className="h-4 w-4" />
                <span>Exploration</span>
              </Button>
              <Button
                variant={selectedCategory === "community" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("community")}
                className="flex items-center space-x-1"
              >
                <Users className="h-4 w-4" />
                <span>Community</span>
              </Button>
              <Button
                variant={selectedCategory === "emergency" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("emergency")}
                className="flex items-center space-x-1"
              >
                <Zap className="h-4 w-4" />
                <span>Emergency</span>
              </Button>
            </div>

            {/* Achievements List */}
            <div className="space-y-3">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg transition-all duration-300 hover:shadow-md ${
                    achievement.unlocked
                      ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div
                        className={`text-2xl p-2 rounded-full ${
                          achievement.unlocked ? "bg-primary/10" : "bg-muted/50 grayscale"
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3
                            className={`font-semibold ${
                              achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {achievement.name}
                          </h3>
                          {achievement.unlocked && (
                            <Badge variant="default" className="bg-primary text-xs">
                              +{achievement.points} pts
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            achievement.unlocked ? "text-muted-foreground" : "text-muted-foreground/70"
                          }`}
                        >
                          {achievement.description}
                        </p>
                        {!achievement.unlocked && achievement.maxProgress > 1 && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Progress</span>
                              <span>
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            </div>
                            <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(achievement.category)}
                      {achievement.unlocked ? (
                        <Badge variant="default" className="bg-emerald-500">
                          ✓ Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Earn More Points</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="justify-between h-auto p-4 bg-transparent hover:bg-muted/50"
                onClick={() => {
                  /* Navigate to trip details */
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Complete Trip Itinerary</p>
                    <p className="text-sm text-muted-foreground">+100 points</p>
                  </div>
                </div>
                <Badge variant="outline">+100</Badge>
              </Button>

              <Button
                variant="outline"
                className="justify-between h-auto p-4 bg-transparent hover:bg-muted/50"
                onClick={() => {
                  /* Navigate to emergency contacts */
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Add Emergency Contact</p>
                    <p className="text-sm text-muted-foreground">+50 points each</p>
                  </div>
                </div>
                <Badge variant="outline">+50</Badge>
              </Button>

              <Button
                variant="outline"
                className="justify-between h-auto p-4 bg-transparent hover:bg-muted/50"
                onClick={() => {
                  /* Navigate to reporting */
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Submit Safety Report</p>
                    <p className="text-sm text-muted-foreground">+25 points each</p>
                  </div>
                </div>
                <Badge variant="outline">+25</Badge>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
