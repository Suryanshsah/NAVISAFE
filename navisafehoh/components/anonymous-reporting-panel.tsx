"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, MapPin, Clock, Users, FileText } from "lucide-react"

interface AnonymousReportingPanelProps {
  currentLocation: { lat: number; lng: number }
  onBack: () => void
}

interface Report {
  id: string
  type: string
  description: string
  location: { lat: number; lng: number }
  timestamp: Date
  status: "submitted" | "under_review" | "resolved"
  priority: "low" | "medium" | "high" | "critical"
}

export function AnonymousReportingPanel({ currentLocation, onBack }: AnonymousReportingPanelProps) {
  const [reportType, setReportType] = useState<string>("")
  const [description, setDescription] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedReports, setSubmittedReports] = useState<Report[]>([
    {
      id: "RPT-001",
      type: "Suspicious Activity",
      description: "Person following tourists near India Gate",
      location: { lat: 28.6129, lng: 77.2295 },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: "under_review",
      priority: "high",
    },
    {
      id: "RPT-002",
      type: "Unsafe Area",
      description: "Poor lighting and broken pavement",
      location: { lat: 28.6145, lng: 77.2085 },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: "resolved",
      priority: "medium",
    },
  ])

  const reportTypes = [
    { value: "suspicious_activity", label: "Suspicious Activity", priority: "high", icon: "👁️" },
    { value: "unsafe_area", label: "Unsafe Area/Condition", priority: "medium", icon: "⚠️" },
    { value: "harassment", label: "Harassment/Inappropriate Behavior", priority: "high", icon: "🚫" },
    { value: "theft_scam", label: "Theft/Scam Attempt", priority: "high", icon: "💰" },
    { value: "poor_lighting", label: "Poor Lighting/Visibility", priority: "medium", icon: "💡" },
    { value: "crowd_safety", label: "Crowd Safety Concern", priority: "medium", icon: "👥" },
    { value: "infrastructure", label: "Infrastructure Issue", priority: "low", icon: "🏗️" },
    { value: "other", label: "Other Safety Concern", priority: "medium", icon: "📝" },
  ]

  const handleSubmitReport = async () => {
    if (!reportType || !description.trim()) {
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const selectedType = reportTypes.find((type) => type.value === reportType)
    const newReport: Report = {
      id: `RPT-${String(submittedReports.length + 3).padStart(3, "0")}`,
      type: selectedType?.label || reportType,
      description: description.trim(),
      location: currentLocation,
      timestamp: new Date(),
      status: "submitted",
      priority: (selectedType?.priority as Report["priority"]) || "medium",
    }

    setSubmittedReports((prev) => [newReport, ...prev])
    setReportType("")
    setDescription("")
    setIsSubmitting(false)

    // Show success message
    alert(
      `Report submitted successfully!\nReport ID: ${newReport.id}\n\nThank you for helping keep our community safe.`,
    )
  }

  const getStatusColor = (status: Report["status"]) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "under_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getPriorityColor = (priority: Report["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? "s" : ""} ago`
    }
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
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Anonymous Reporting</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Privacy Notice */}
        <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-green-800 dark:text-green-200">Anonymous & Secure Reporting</h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your reports are completely anonymous and help keep the community safe. No personal information is
                  stored or shared. All reports are reviewed by authorities within 24 hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Submit Safety Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="font-medium">Anonymous Report</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={isAnonymous ? "bg-green-100 text-green-800 border-green-300" : ""}
              >
                {isAnonymous ? "Anonymous" : "Identified"}
              </Button>
            </div>

            {/* Report Type Selection */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the type of safety concern" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                        <Badge className={getPriorityColor(type.priority as Report["priority"])} variant="secondary">
                          {type.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Please provide detailed information about the safety concern. Include time, location details, and any other relevant information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24"
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Be specific but avoid personal information</span>
                <span>{description.length}/500</span>
              </div>
            </div>

            {/* Current Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Current Location</span>
                  <Badge variant="outline" className="text-xs">
                    Auto-detected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                </p>
                <p className="text-sm text-muted-foreground">Connaught Place, New Delhi, Delhi 110001</p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitReport}
              disabled={!reportType || !description.trim() || isSubmitting}
              className="w-full h-12 font-semibold"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting Report...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Submit Anonymous Report</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Previous Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Your Recent Reports</span>
              </div>
              <Badge variant="outline">{submittedReports.length} Reports</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submittedReports.length > 0 ? (
              submittedReports.map((report) => (
                <div key={report.id} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{report.type}</h3>
                        <Badge className={getPriorityColor(report.priority)} variant="secondary">
                          {report.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(report.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={getStatusColor(report.status)} variant="secondary">
                        {report.status === "submitted"
                          ? "Submitted"
                          : report.status === "under_review"
                            ? "Under Review"
                            : "Resolved"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">ID: {report.id}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No reports submitted yet</p>
                <p className="text-sm">Help keep the community safe by reporting safety concerns</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Community Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">247</p>
                <p className="text-sm text-blue-800 dark:text-blue-200">Reports This Month</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-2xl font-bold text-green-600">89%</p>
                <p className="text-sm text-green-800 dark:text-green-200">Issues Resolved</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">156</p>
                <p className="text-sm text-purple-800 dark:text-purple-200">Active Reporters</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">4.2h</p>
                <p className="text-sm text-orange-800 dark:text-orange-200">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
