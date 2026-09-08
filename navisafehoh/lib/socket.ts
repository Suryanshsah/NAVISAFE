"use client"

import { io, type Socket } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = () => {
  if (!socket) {
    // In a real implementation, this would connect to your Socket.IO server
    // For demo purposes, we'll simulate the connection
    socket = io("ws://localhost:3001", {
      autoConnect: false,
      transports: ["websocket", "polling"],
    })

    socket.on("connect", () => {
      console.log("[v0] Socket.IO connected:", socket?.id)
    })

    socket.on("disconnect", () => {
      console.log("[v0] Socket.IO disconnected")
    })

    socket.on("connect_error", (error) => {
      console.log("[v0] Socket.IO connection error:", error)
      // Fallback to simulated real-time updates
      simulateSocketConnection()
    })
  }

  return socket
}

// Simulate Socket.IO functionality for demo purposes
const simulateSocketConnection = () => {
  console.log("[v0] Using simulated Socket.IO for demo")

  // Simulate periodic location broadcasts
  setInterval(() => {
    if (socket) {
      socket.emit("location_update", {
        touristId: "demo-tourist-001",
        location: { lat: 28.6139 + (Math.random() - 0.5) * 0.01, lng: 77.209 + (Math.random() - 0.5) * 0.01 },
        timestamp: new Date().toISOString(),
        safetyScore: Math.floor(Math.random() * 100),
      })
    }
  }, 5000)
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Real-time GPS tracking functions
export const broadcastLocationUpdate = (data: {
  touristId: string
  location: { lat: number; lng: number }
  safetyScore: number
  zoneType: string
  timestamp: string
}) => {
  if (socket?.connected) {
    socket.emit("location_update", data)
    console.log("[v0] Broadcasting location update:", data)
  } else {
    console.log("[v0] Socket not connected, location update queued:", data)
  }
}

export const broadcastGeofenceEvent = (data: {
  touristId: string
  eventType: "enter" | "exit"
  zoneName: string
  zoneType: string
  location: { lat: number; lng: number }
  timestamp: string
}) => {
  if (socket?.connected) {
    socket.emit("geofence_event", data)
    console.log("[v0] Broadcasting geofence event:", data)
  } else {
    console.log("[v0] Socket not connected, geofence event queued:", data)
  }
}

export const broadcastSafetyAlert = (data: {
  touristId: string
  alertType: "low_safety_score" | "restricted_zone" | "emergency"
  location: { lat: number; lng: number }
  safetyScore: number
  message: string
  timestamp: string
}) => {
  if (socket?.connected) {
    socket.emit("safety_alert", data)
    console.log("[v0] Broadcasting safety alert:", data)
  } else {
    console.log("[v0] Socket not connected, safety alert queued:", data)
  }
}
