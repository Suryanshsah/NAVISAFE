"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  MapPin,
  AlertTriangle,
  Users,
  Clock,
  FileText,
  Filter,
  Bell,
  Eye,
  Download,
  Activity,
  Save,
  Plus,
} from "lucide-react"
import { AuthorityMapComponent } from "@/components/authority-map-component"
import { AIAnomalySystem } from "@/components/ai-anomaly-system"
import { BlockchainSimulator } from "@/components/blockchain-simulator"
import { ThemeToggle } from "@/components/theme-toggle"
import { HeatmapVisualization } from "@/components/heatmap-visualization"
import { RealTimeAnalytics } from "@/components/real-time-analytics"

interface AuthorityDashboardProps {
  onBack: () => void
  onLogout: () => void
}

interface EFIR {
  id: string
  incidentId: string
  firNumber: string
  touristName: string
  touristId: string
  incidentType: string
  priority: string
  location: { lat: number; lng: number }
  address: string
  description: string
  reportedBy: string
  officerInCharge: string
  status: "Draft" | "Filed" | "Under Investigation" | "Closed"
  createdAt: Date
  updatedAt: Date
  additionalDetails?: string
}

export function AuthorityDashboard({ onBack, onLogout }: AuthorityDashboardProps) {
  const [activeIncidents, setActiveIncidents] = useState([
    {
      id: "INC-001",
      touristId: "NVS-12345678",
      touristName: "John Smith",
      type: "Medical Emergency",
      priority: "HIGH",
      location: { lat: 28.6139, lng: 77.209 },
      address: "Connaught Place, New Delhi",
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      status: "Active",
      phone: "+91 98765 43210",
      description: "Tourist reported chest pain and difficulty breathing",
    },
    {
      id: "INC-002",
      touristId: "NVS-87654321",
      touristName: "Sarah Johnson",
      type: "Security Threat",
      priority: "HIGH",
      location: { lat: 28.62, lng: 77.21 },
      address: "Red Fort Area, Chandni Chowk",
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      status: "Responding",
      phone: "+91 87654 32109",
      description: "Tourist reported harassment by local individuals",
    },
    {
      id: "INC-003",
      touristId: "NVS-11223344",
      touristName: "Mike Chen",
      type: "Lost/Stranded",
      priority: "MEDIUM",
      location: { lat: 28.61, lng: 77.23 },
      address: "Lodhi Gardens, New Delhi",
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      status: "Resolved",
      phone: "+91 76543 21098",
      description: "Tourist lost in unfamiliar area, requesting directions",
    },
  ])

  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState([
    {
      id: "LOG-001",
      timestamp: new Date(Date.now() - 180000),
      action: "Incident Created",
      officer: "Officer Sharma",
      details: "New medical emergency reported for tourist John Smith",
      incidentId: "INC-001",
    },
    {
      id: "LOG-002",
      timestamp: new Date(Date.now() - 360000),
      action: "Response Dispatched",
      officer: "Officer Patel",
      details: "Ambulance and police unit dispatched to Connaught Place",
      incidentId: "INC-001",
    },
    {
      id: "LOG-003",
      timestamp: new Date(Date.now() - 540000),
      action: "Case Resolved",
      officer: "Officer Kumar",
      details: "Tourist Mike Chen safely guided to destination",
      incidentId: "INC-003",
    },
  ])

  const [notifications, setNotifications] = useState([
    {
      id: "NOTIF-001",
      type: "SOS Alert",
      message: "New emergency SOS from John Smith at Connaught Place",
      timestamp: new Date(Date.now() - 300000),
      read: false,
    },
    {
      id: "NOTIF-002",
      type: "Anomaly Detection",
      message: "No movement detected for Sarah Johnson for 3+ hours",
      timestamp: new Date(Date.now() - 600000),
      read: false,
    },
  ])

  const [stats, setStats] = useState({
    activeTourists: 247,
    activeIncidents: 3,
    resolvedToday: 12,
    responseTime: "6.2 min",
  })

  const [efirs, setEfirs] = useState<EFIR[]>([
    {
      id: "EFIR-001",
      incidentId: "INC-001",
      firNumber: "FIR/2024/001",
      touristName: "John Smith",
      touristId: "NVS-12345678",
      incidentType: "Medical Emergency",
      priority: "HIGH",
      location: { lat: 28.6139, lng: 77.209 },
      address: "Connaught Place, New Delhi",
      description: "Tourist reported chest pain and difficulty breathing",
      reportedBy: "Tourist Self-Report",
      officerInCharge: "Officer Sharma",
      status: "Filed",
      createdAt: new Date(Date.now() - 300000),
      updatedAt: new Date(Date.now() - 300000),
    },
    {
      id: "EFIR-002",
      incidentId: "INC-002",
      firNumber: "FIR/2024/002",
      touristName: "Sarah Johnson",
      touristId: "NVS-87654321",
      incidentType: "Security Threat",
      priority: "HIGH",
      location: { lat: 28.62, lng: 77.21 },
      address: "Red Fort Area, Chandni Chowk",
      description: "Tourist reported harassment by local individuals",
      reportedBy: "SOS Alert",
      officerInCharge: "Officer Patel",
      status: "Under Investigation",
      createdAt: new Date(Date.now() - 600000),
      updatedAt: new Date(Date.now() - 300000),
    },
  ])

  const [newEfir, setNewEfir] = useState<Partial<EFIR>>({
    status: "Draft",
    officerInCharge: "Officer Sharma",
    reportedBy: "Manual Entry",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const handleAnomalyDetected = (anomaly: any) => {
    // Create incident from anomaly
    const newIncident = {
      id: `INC-${Date.now().toString().slice(-6)}`,
      touristId: anomaly.touristId,
      touristName: anomaly.touristName,
      type: "AI Anomaly Detection",
      priority: anomaly.severity,
      location: anomaly.location,
      address: `Lat: ${anomaly.location.lat.toFixed(4)}, Lng: ${anomaly.location.lng.toFixed(4)}`,
      timestamp: anomaly.timestamp,
      status: "Active",
      phone: "+91 XXXXX XXXXX",
      description: `AI detected: ${anomaly.description} (Confidence: ${anomaly.aiConfidence.toFixed(1)}%)`,
    }

    setActiveIncidents((prev) => [newIncident, ...prev])

    // Add notification
    const newNotification = {
      id: `NOTIF-${Date.now()}`,
      type: "AI Anomaly",
      message: `AI detected ${anomaly.type.replace("_", " ")} for ${anomaly.touristName}`,
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Add audit log
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date(),
      action: "AI Anomaly Detected",
      officer: "AI System",
      details: `${anomaly.description} for tourist ${anomaly.touristName}`,
      incidentId: newIncident.id,
    }

    setAuditLogs((prev) => [newLog, ...prev])

    // Update stats
    setStats((prev) => ({
      ...prev,
      activeIncidents: prev.activeIncidents + 1,
    }))
  }

  const createNewEfir = () => {
    if (!newEfir.touristName || !newEfir.incidentType || !newEfir.description) {
      alert("Please fill in all required fields")
      return
    }

    const efir: EFIR = {
      id: `EFIR-${Date.now().toString().slice(-6)}`,
      incidentId: newEfir.incidentId || `INC-${Date.now().toString().slice(-6)}`,
      firNumber: `FIR/2024/${(efirs.length + 1).toString().padStart(3, "0")}`,
      touristName: newEfir.touristName!,
      touristId: newEfir.touristId || `NVS-${Math.random().toString().slice(-8)}`,
      incidentType: newEfir.incidentType!,
      priority: newEfir.priority || "MEDIUM",
      location: newEfir.location || { lat: 28.6139, lng: 77.209 },
      address: newEfir.address || "Location to be determined",
      description: newEfir.description!,
      reportedBy: newEfir.reportedBy || "Manual Entry",
      officerInCharge: newEfir.officerInCharge || "Officer Sharma",
      status: "Draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      additionalDetails: newEfir.additionalDetails,
    }

    setEfirs((prev) => [efir, ...prev])
    setNewEfir({
      status: "Draft",
      officerInCharge: "Officer Sharma",
      reportedBy: "Manual Entry",
    })

    // Add audit log
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date(),
      action: "e-FIR Created",
      officer: efir.officerInCharge,
      details: `New e-FIR ${efir.firNumber} created for ${efir.touristName}`,
      incidentId: efir.incidentId,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const updateEfirStatus = (efirId: string, newStatus: EFIR["status"]) => {
    setEfirs((prev) =>
      prev.map((efir) => (efir.id === efirId ? { ...efir, status: newStatus, updatedAt: new Date() } : efir)),
    )

    // Add audit log
    const efir = efirs.find((e) => e.id === efirId)
    if (efir) {
      const newLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date(),
        action: "e-FIR Status Updated",
        officer: efir.officerInCharge,
        details: `e-FIR ${efir.firNumber} status changed to ${newStatus}`,
        incidentId: efir.incidentId,
      }
      setAuditLogs((prev) => [newLog, ...prev])
    }
  }

  const generateEFIRFromIncident = (incident: any) => {
    const efir: EFIR = {
      id: `EFIR-${Date.now().toString().slice(-6)}`,
      incidentId: incident.id,
      firNumber: `FIR/2024/${(efirs.length + 1).toString().padStart(3, "0")}`,
      touristName: incident.touristName,
      touristId: incident.touristId,
      incidentType: incident.type,
      priority: incident.priority,
      location: incident.location,
      address: incident.address,
      description: incident.description,
      reportedBy: "SOS Alert",
      officerInCharge: "Officer Sharma",
      status: "Filed",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setEfirs((prev) => [efir, ...prev])

    // Enhanced e-FIR content for download
    const efirContent = `
ELECTRONIC FIRST INFORMATION REPORT (e-FIR)
NaviSafe Tourist Safety System
═══════════════════════════════════════════════════════════════

FIR NUMBER: ${efir.firNumber}
e-FIR ID: ${efir.id}
DATE & TIME: ${new Date().toLocaleString()}
STATUS: ${efir.status}

INCIDENT DETAILS:
═══════════════════════════════════════════════════════════════
Incident ID: ${efir.incidentId}
Type: ${efir.incidentType}
Priority Level: ${efir.priority}
Current Status: ${efir.status}

TOURIST INFORMATION:
═══════════════════════════════════════════════════════════════
Full Name: ${efir.touristName}
Digital Tourist ID: ${efir.touristId}
Contact Number: ${incident.phone || "Not Available"}
Nationality: Foreign National
Emergency Contact: To be updated

LOCATION DETAILS:
═══════════════════════════════════════════════════════════════
GPS Coordinates: ${efir.location.lat.toFixed(6)}, ${efir.location.lng.toFixed(6)}
Address: ${efir.address}
Incident Reported Time: ${incident.timestamp.toLocaleString()}
e-FIR Filed Time: ${efir.createdAt.toLocaleString()}

INCIDENT DESCRIPTION:
═══════════════════════════════════════════════════════════════
${efir.description}

RESPONSE ACTIONS TAKEN:
═══════════════════════════════════════════════════════════════
- Immediate alert sent to local police station
- Tourist helpline notified automatically
- GPS location tracked and monitored in real-time
- Response team dispatched to incident location
- Digital evidence preserved in NaviSafe system
- Blockchain transaction recorded for audit trail

INVESTIGATION DETAILS:
═══════════════════════════════════════════════════════════════
Reported By: ${efir.reportedBy}
Officer In Charge: ${efir.officerInCharge}
Police Station: Connaught Place Police Station
Badge Number: DL-001234
Investigation Status: ${efir.status}

DIGITAL VERIFICATION:
═══════════════════════════════════════════════════════════════
System Generated: Yes
Blockchain Hash: ${Math.random().toString(36).substring(2, 15)}
Digital Signature: Verified
Timestamp Verification: Confirmed

CONTACT INFORMATION:
═══════════════════════════════════════════════════════════════
NaviSafe Support: navisafe-support@gov.in
Emergency Helpline: 112
Tourist Helpline: 1363
Police Control Room: 100

═══════════════════════════════════════════════════════════════
This e-FIR has been automatically generated by the NaviSafe 
Smart Tourist Safety Monitoring & Incident Response System.

Generated on: ${new Date().toLocaleString()}
System Version: NaviSafe v2.0
Authentication: Digital Signature Verified
═══════════════════════════════════════════════════════════════
    `

    // Create downloadable file
    const blob = new Blob([efirContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `eFIR-${efir.firNumber.replace(/\//g, "-")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Add to audit log
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date(),
      action: "e-FIR Generated & Downloaded",
      officer: efir.officerInCharge,
      details: `e-FIR ${efir.firNumber} generated and downloaded for incident ${efir.incidentId}`,
      incidentId: efir.incidentId,
    }
    setAuditLogs((prev) => [newLog, ...prev])

    return efir
  }

  const filteredEfirs = efirs.filter((efir) => {
    const matchesSearch =
      efir.touristName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      efir.firNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      efir.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      efir.touristId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || efir.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const generateEFIR = (incident: any) => {
    const efirContent = `
ELECTRONIC FIRST INFORMATION REPORT (e-FIR)
NaviSafe Tourist Safety System

FIR No: ${incident.id}/2024
Date & Time: ${new Date().toLocaleString()}

INCIDENT DETAILS:
Incident ID: ${incident.id}
Type: ${incident.type}
Priority: ${incident.priority}
Status: ${incident.status}

TOURIST INFORMATION:
Name: ${incident.touristName}
Tourist ID: ${incident.touristId}
Phone: ${incident.phone}
Nationality: Foreign National

LOCATION DETAILS:
Coordinates: ${incident.location.lat.toFixed(6)}, ${incident.location.lng.toFixed(6)}
Address: ${incident.address}
Reported Time: ${incident.timestamp.toLocaleString()}

INCIDENT DESCRIPTION:
${incident.description}

RESPONSE ACTIONS:
- Immediate alert sent to local police station
- Tourist helpline notified
- GPS location tracked and monitored
- Response team dispatched

OFFICER IN CHARGE:
Name: Officer Sharma
Badge No: DL-001234
Station: Connaught Place Police Station

This e-FIR has been automatically generated by the NaviSafe system.
For queries, contact: navisafe-support@gov.in
    `

    // Create downloadable file
    const blob = new Blob([efirContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `eFIR-${incident.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Add to audit log
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date(),
      action: "e-FIR Generated",
      officer: "Officer Sharma",
      details: `e-FIR generated for incident ${incident.id}`,
      incidentId: incident.id,
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notifId ? { ...notif, read: true } : notif)))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-background">
      {/* Authority Header */}
      <div className="bg-foreground text-background p-4 sticky top-0 z-50 animate-in slide-in-from-top-4 duration-500 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 animate-pulse" />
            <h1 className="text-lg font-semibold">NaviSafe Authority Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative hover:scale-110 transition-all duration-200 group">
              <Bell className="h-5 w-5 group-hover:animate-bounce" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-destructive animate-pulse">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={onLogout} 
              className="text-sm hover:scale-105 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
            >
              Logout
            </Button>
            <Button variant="ghost" onClick={onBack} className="text-sm hover:scale-105 transition-all duration-200">
              ← Back to Tourist App
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-100 hover:shadow-primary/20">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <Users className="h-8 w-8 mx-auto text-primary hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-2xl font-bold hover:text-primary transition-colors duration-300">
                    {stats.activeTourists}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Tourists</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-200 hover:shadow-destructive/20">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <AlertTriangle className="h-8 w-8 mx-auto text-destructive hover:scale-110 transition-transform duration-300 animate-pulse" />
                <div>
                  <p className="text-2xl font-bold hover:text-destructive transition-colors duration-300">
                    {stats.activeIncidents}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Incidents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300 hover:shadow-accent/20">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <Activity className="h-8 w-8 mx-auto text-accent hover:scale-110 transition-transform duration-300" />
                <div>
                  <p className="text-2xl font-bold hover:text-accent transition-colors duration-300">
                    {stats.resolvedToday}
                  </p>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-400 hover:shadow-orange-500/20">
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                <Clock
                  className="h-8 w-8 mx-auto text-orange-500 hover:scale-110 transition-transform duration-300 animate-spin"
                  style={{ animationDuration: "8s" }}
                />
                <div>
                  <p className="text-2xl font-bold hover:text-orange-500 transition-colors duration-300">
                    {stats.responseTime}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs
          defaultValue="overview"
          className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500"
        >
          <TabsList className="grid w-full grid-cols-8 hover:shadow-md transition-shadow duration-300">
            <TabsTrigger value="overview" className="hover:scale-105 transition-all duration-200">
              Overview
            </TabsTrigger>
            <TabsTrigger value="incidents" className="hover:scale-105 transition-all duration-200">
              Incidents
            </TabsTrigger>
            <TabsTrigger value="map" className="hover:scale-105 transition-all duration-200">
              Live Map
            </TabsTrigger>
            <TabsTrigger value="analytics" className="hover:scale-105 transition-all duration-200">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai" className="hover:scale-105 transition-all duration-200">
              AI System
            </TabsTrigger>
            <TabsTrigger value="blockchain" className="hover:scale-105 transition-all duration-200">
              Blockchain
            </TabsTrigger>
            <TabsTrigger value="efir" className="hover:scale-105 transition-all duration-200">
              e-FIR
            </TabsTrigger>
            <TabsTrigger value="audit" className="hover:scale-105 transition-all duration-200">
              Audit Log
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Incidents */}
              <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-left-4 duration-500 delay-600">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 hover:text-primary transition-colors duration-300">
                    <AlertTriangle className="h-5 w-5 hover:rotate-12 transition-transform duration-300" />
                    <span>Recent Incidents</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeIncidents.slice(0, 3).map((incident, index) => (
                    <div
                      key={incident.id}
                      className="p-3 border border-border rounded-lg space-y-2 hover:bg-muted/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${700 + index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={incident.priority === "HIGH" ? "destructive" : "secondary"}
                          className={incident.priority === "HIGH" ? "animate-pulse" : ""}
                        >
                          {incident.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{incident.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <p className="font-medium hover:text-primary transition-colors duration-300">{incident.type}</p>
                        <p className="text-sm text-muted-foreground">{incident.touristName}</p>
                        <p className="text-xs text-muted-foreground">{incident.address}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Live Notifications */}
              <Card className="hover:shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-600">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 hover:text-primary transition-colors duration-300">
                    <Bell className="h-5 w-5 hover:animate-bounce" />
                    <span>Live Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-3 border border-border rounded-lg cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${
                        !notification.read ? "bg-primary/5 border-primary/20 animate-pulse" : ""
                      }`}
                      style={{ animationDelay: `${700 + index * 100}ms` }}
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="hover:bg-muted transition-colors duration-300">
                          {notification.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-2">{notification.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-4">
            <div className="flex items-center space-x-4 animate-in fade-in-0 slide-in-from-top-4 duration-500">
              <div className="flex-1">
                <Input
                  placeholder="Search incidents..."
                  className="w-full hover:shadow-md transition-shadow duration-300"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="hover:scale-105 active:scale-95 transition-all duration-200 bg-transparent"
              >
                <Filter className="h-4 w-4 mr-2 hover:rotate-12 transition-transform duration-300" />
                Filter
              </Button>
            </div>

            <div className="grid gap-4">
              {activeIncidents.map((incident, index) => (
                <Card
                  key={incident.id}
                  className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={incident.priority === "HIGH" ? "destructive" : "secondary"}
                            className={
                              incident.priority === "HIGH"
                                ? "animate-pulse"
                                : "hover:scale-105 transition-transform duration-200"
                            }
                          >
                            {incident.priority}
                          </Badge>
                          <Badge variant="outline" className="hover:bg-muted transition-colors duration-300">
                            {incident.status}
                          </Badge>
                          <span className="text-sm font-mono hover:text-primary transition-colors duration-300">
                            {incident.id}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-semibold hover:text-primary transition-colors duration-300">
                            {incident.type}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Tourist: {incident.touristName} ({incident.touristId})
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="hover:bg-muted/30 p-2 rounded transition-colors duration-300">
                            <p className="text-muted-foreground">Location:</p>
                            <p>{incident.address}</p>
                          </div>
                          <div className="hover:bg-muted/30 p-2 rounded transition-colors duration-300">
                            <p className="text-muted-foreground">Contact:</p>
                            <p>{incident.phone}</p>
                          </div>
                        </div>

                        <p className="text-sm hover:bg-muted/30 p-2 rounded transition-colors duration-300">
                          {incident.description}
                        </p>

                        <p className="text-xs text-muted-foreground">Reported: {incident.timestamp.toLocaleString()}</p>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => setSelectedIncident(incident)}
                          className="hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 mr-2 hover:rotate-12 transition-transform duration-300" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateEFIR(incident)}
                          className="hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                          <FileText className="h-4 w-4 mr-2 hover:rotate-12 transition-transform duration-300" />
                          e-FIR
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Map Tab */}
          <TabsContent value="map">
            <Card className="hover:shadow-lg transition-shadow duration-300 animate-in fade-in-0 zoom-in-95 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 hover:text-primary transition-colors duration-300">
                  <MapPin className="h-5 w-5 animate-pulse" />
                  <span>Live Tourist Tracking & Risk Zones</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AuthorityMapComponent incidents={activeIncidents} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <RealTimeAnalytics />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <HeatmapVisualization type="tourist" />
              <HeatmapVisualization type="risk" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <HeatmapVisualization type="crowd" />
            </div>
          </TabsContent>

          {/* AI System Tab */}
          <TabsContent value="ai">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <AIAnomalySystem onAnomalyDetected={handleAnomalyDetected} />
            </div>
          </TabsContent>

          {/* Blockchain Tab */}
          <TabsContent value="blockchain">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <BlockchainSimulator />
            </div>
          </TabsContent>

          <TabsContent value="efir" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* e-FIR List */}
              <Card className="hover:shadow-lg transition-shadow duration-300 animate-in fade-in-0 slide-in-from-left-4 duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 hover:text-primary transition-colors duration-300">
                      <FileText className="h-5 w-5 hover:rotate-12 transition-transform duration-300" />
                      <span>e-FIR Management</span>
                    </div>
                    <Badge variant="outline">{efirs.length} Total</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex space-x-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Search e-FIRs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="hover:shadow-md transition-shadow duration-300"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="filed">Filed</SelectItem>
                        <SelectItem value="under investigation">Under Investigation</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* e-FIR List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredEfirs.map((efir, index) => (
                      <div
                        key={efir.id}
                        className="p-3 border border-border rounded-lg hover:bg-muted/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  efir.status === "Filed"
                                    ? "default"
                                    : efir.status === "Under Investigation"
                                      ? "secondary"
                                      : efir.status === "Closed"
                                        ? "outline"
                                        : "destructive"
                                }
                                className="hover:scale-105 transition-transform duration-200"
                              >
                                {efir.status}
                              </Badge>
                              <Badge variant="outline" className="font-mono text-xs">
                                {efir.firNumber}
                              </Badge>
                            </div>
                            <div>
                              <p className="font-medium hover:text-primary transition-colors duration-300">
                                {efir.touristName}
                              </p>
                              <p className="text-sm text-muted-foreground">{efir.incidentType}</p>
                              <p className="text-xs text-muted-foreground">
                                Created: {efir.createdAt.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Select
                              value={efir.status}
                              onValueChange={(value) => updateEfirStatus(efir.id, value as EFIR["status"])}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Filed">Filed</SelectItem>
                                <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                generateEFIRFromIncident({
                                  id: efir.incidentId,
                                  touristName: efir.touristName,
                                  touristId: efir.touristId,
                                  type: efir.incidentType,
                                  priority: efir.priority,
                                  location: efir.location,
                                  address: efir.address,
                                  description: efir.description,
                                  timestamp: efir.createdAt,
                                  phone: "Contact on file",
                                })
                              }
                              className="hover:scale-105 active:scale-95 transition-all duration-200 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Create New e-FIR */}
              <Card className="hover:shadow-lg transition-shadow duration-300 animate-in fade-in-0 slide-in-from-right-4 duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 hover:text-primary transition-colors duration-300">
                    <Plus className="h-5 w-5 hover:rotate-90 transition-transform duration-300" />
                    <span>Create New e-FIR</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="touristName">Tourist Name *</Label>
                      <Input
                        id="touristName"
                        value={newEfir.touristName || ""}
                        onChange={(e) => setNewEfir((prev) => ({ ...prev, touristName: e.target.value }))}
                        placeholder="Enter tourist name"
                        className="hover:shadow-md transition-shadow duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="touristId">Tourist ID</Label>
                      <Input
                        id="touristId"
                        value={newEfir.touristId || ""}
                        onChange={(e) => setNewEfir((prev) => ({ ...prev, touristId: e.target.value }))}
                        placeholder="NVS-XXXXXXXX"
                        className="hover:shadow-md transition-shadow duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incidentType">Incident Type *</Label>
                      <Select
                        value={newEfir.incidentType || ""}
                        onValueChange={(value) => setNewEfir((prev) => ({ ...prev, incidentType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Medical Emergency">Medical Emergency</SelectItem>
                          <SelectItem value="Security Threat">Security Threat</SelectItem>
                          <SelectItem value="Lost/Stranded">Lost/Stranded</SelectItem>
                          <SelectItem value="Theft/Robbery">Theft/Robbery</SelectItem>
                          <SelectItem value="Harassment">Harassment</SelectItem>
                          <SelectItem value="Accident">Accident</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newEfir.priority || "MEDIUM"}
                        onValueChange={(value) => setNewEfir((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Location/Address</Label>
                    <Input
                      id="address"
                      value={newEfir.address || ""}
                      onChange={(e) => setNewEfir((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter incident location"
                      className="hover:shadow-md transition-shadow duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Incident Description *</Label>
                    <Textarea
                      id="description"
                      value={newEfir.description || ""}
                      onChange={(e) => setNewEfir((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the incident in detail..."
                      className="min-h-20 hover:shadow-md transition-shadow duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportedBy">Reported By</Label>
                      <Select
                        value={newEfir.reportedBy || "Manual Entry"}
                        onValueChange={(value) => setNewEfir((prev) => ({ ...prev, reportedBy: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                          <SelectItem value="SOS Alert">SOS Alert</SelectItem>
                          <SelectItem value="Tourist Self-Report">Tourist Self-Report</SelectItem>
                          <SelectItem value="Third Party">Third Party</SelectItem>
                          <SelectItem value="AI Detection">AI Detection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="officer">Officer In Charge</Label>
                      <Select
                        value={newEfir.officerInCharge || "Officer Sharma"}
                        onValueChange={(value) => setNewEfir((prev) => ({ ...prev, officerInCharge: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Officer Sharma">Officer Sharma</SelectItem>
                          <SelectItem value="Officer Patel">Officer Patel</SelectItem>
                          <SelectItem value="Officer Kumar">Officer Kumar</SelectItem>
                          <SelectItem value="Officer Singh">Officer Singh</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalDetails">Additional Details</Label>
                    <Textarea
                      id="additionalDetails"
                      value={newEfir.additionalDetails || ""}
                      onChange={(e) => setNewEfir((prev) => ({ ...prev, additionalDetails: e.target.value }))}
                      placeholder="Any additional information..."
                      className="min-h-16 hover:shadow-md transition-shadow duration-300"
                    />
                  </div>

                  <Button
                    onClick={createNewEfir}
                    className="w-full hover:scale-105 active:scale-95 transition-all duration-200 group"
                  >
                    <Save className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                    Create e-FIR
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card className="hover:shadow-lg transition-shadow duration-300 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 hover:text-primary transition-colors duration-300">
                  <Activity className="h-5 w-5 hover:scale-110 transition-transform duration-300" />
                  <span>System Audit Log</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className="p-3 border border-border rounded-lg hover:bg-muted/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="hover:bg-muted transition-colors duration-300">
                          {log.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{log.timestamp.toLocaleString()}</span>
                      </div>
                      <p className="text-sm">{log.details}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span className="hover:text-primary transition-colors duration-300">
                          Officer: {log.officer}
                        </span>
                        {log.incidentId && (
                          <span className="hover:text-primary transition-colors duration-300">
                            Incident: {log.incidentId}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
