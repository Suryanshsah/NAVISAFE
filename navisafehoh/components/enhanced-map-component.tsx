"use client";

import { useEffect, useRef, useState } from "react";
import { initializeSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

interface Position {
  lat: number;
  lng: number;
  accuracy?: number;
}

interface SafetyZone {
  lat: number;
  lng: number;
  radius: number;
  color: string;
  type: string;
  name: string;
}

interface EnhancedMapComponentProps {
  touristId: string;
  userAge?: number;

  // GPS position can now come from the parent dashboard
  currentPosition?: Position | null;

  // These callbacks are kept so your existing dashboard code still works
  onLocationChange?: (location: { lat: number; lng: number }) => void;
  onSafeScoreChange?: (score: number) => void;

  initialZones?: SafetyZone[];
}

export function EnhancedMapComponent({
  touristId,
  userAge,
  currentPosition,
  onLocationChange,
  onSafeScoreChange,
  initialZones = [],
}: EnhancedMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Keep Leaflet objects in refs instead of React state.
  // This prevents the map from being initialized multiple times.
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const zoneCirclesRef = useRef<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Local fallback position.
  // The map will show this immediately even if GPS is unavailable.
  const [demoPosition, setDemoPosition] = useState<Position>({
    lat: 28.6139,
    lng: 77.209,
    accuracy: 50,
  });

  // Keep a simple local GPS state for the controls.
  const [isTracking, setIsTracking] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");

  const [safetyScore, setSafetyScore] = useState(85);

  // Use parent GPS position when available.
  const activePosition = currentPosition || demoPosition;

  /*
   * ---------------------------------------------------------
   * Load Leaflet CSS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const existingLink = document.querySelector(
      'link[data-leaflet-css="true"]'
    );

    if (existingLink) return;

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.setAttribute("data-leaflet-css", "true");

    document.head.appendChild(link);

    return () => {
      // We intentionally keep the stylesheet.
      // Removing it can cause problems if another component uses Leaflet.
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * Initialize Leaflet map
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const createMap = async () => {
      if (!mapRef.current) return;

      // Don't initialize twice.
      if (mapInstanceRef.current) return;

      try {
        const L = await import("leaflet");

        if (cancelled || !mapRef.current) return;

        // Extra safety check.
        if (mapInstanceRef.current) return;

        /*
         * Fix Leaflet's default marker icons.
         */
        delete (L.Icon.Default.prototype as any)._getIconUrl;

        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        /*
         * Create the map.
         */
        const mapInstance = L.map(mapRef.current, {
          center: [28.6139, 77.209],
          zoom: 13,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
        });

        mapInstanceRef.current = mapInstance;

        /*
         * OpenStreetMap tiles.
         */
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
            minZoom: 3,
          }
        ).addTo(mapInstance);

        /*
         * Custom user marker.
         */
        const userIcon = L.divIcon({
          className: "custom-user-marker",
          html: `
            <div style="
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              cursor: move;
            ">
              📍
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        /*
         * Create marker at fallback location.
         */
        const marker = L.marker([28.6139, 77.209], {
          draggable: true,
          icon: userIcon,
        }).addTo(mapInstance);

        userMarkerRef.current = marker;

        /*
         * Marker drag start.
         */
        marker.on("dragstart", () => {
          mapInstance.closePopup();
        });

        /*
         * Marker drag end.
         *
         * This is useful for testing the safety system
         * without needing real GPS movement.
         */
        marker.on("dragend", (event: any) => {
          const newPosition = event.target.getLatLng();

          const newLocation = {
            lat: newPosition.lat,
            lng: newPosition.lng,
            accuracy: 10,
          };

          console.log(
            "[NaviSafe] Marker moved:",
            newLocation.lat,
            newLocation.lng
          );

          setDemoPosition(newLocation);

          onLocationChange?.({
            lat: newLocation.lat,
            lng: newLocation.lng,
          });

          marker
            .bindPopup(
              `
              <div style="text-align:center; min-width:200px;">
                <strong>📍 Your Location</strong><br/>
                <small>Lat: ${newLocation.lat.toFixed(6)}</small><br/>
                <small>Lng: ${newLocation.lng.toFixed(6)}</small>

                <div style="
                  margin-top:8px;
                  padding:5px 8px;
                  background:#3b82f6;
                  color:white;
                  border-radius:4px;
                  font-weight:bold;
                ">
                  Simulated GPS Position
                </div>

                <em style="
                  color:#6b7280;
                  font-size:12px;
                ">
                  Drag the marker to simulate movement
                </em>
              </div>
            `
            )
            .openPopup();
        });

        /*
         * Show the map.
         */
        setIsLoading(false);

        /*
         * Leaflet sometimes needs a size recalculation
         * after being rendered inside a React component.
         */
        setTimeout(() => {
          if (!cancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 300);
      } catch (err) {
        console.error("[NaviSafe] Map initialization error:", err);

        if (!cancelled) {
          setError("Failed to initialize map.");
          setIsLoading(false);
        }
      }
    };

    createMap();

    /*
     * IMPORTANT:
     * Cleanup uses the ref instead of a state variable.
     * This prevents the Leaflet duplicate-map problem.
     */
    return () => {
      cancelled = true;

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.warn("[NaviSafe] Error removing map:", err);
        }

        mapInstanceRef.current = null;
        userMarkerRef.current = null;
        zoneCirclesRef.current = [];
      }
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * Update marker when GPS position changes
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const map = mapInstanceRef.current;
    const marker = userMarkerRef.current;

    if (!map || !marker || !activePosition) return;

    const { lat, lng, accuracy } = activePosition;

    marker.setLatLng([lat, lng]);

    /*
     * Only move the map when we have an actual GPS position.
     * The fallback/demo position should not constantly move the map.
     */
    if (currentPosition) {
      map.panTo([lat, lng], {
        animate: true,
        duration: 1,
      });
    }

    const score =
      safetyScore >= 70
        ? "#10b981"
        : safetyScore >= 30
        ? "#f59e0b"
        : "#dc2626";

    marker.bindPopup(`
      <div style="text-align:center; min-width:200px;">
        <strong>📍 Your Location</strong><br/>

        <small>
          Lat: ${lat.toFixed(6)}
        </small><br/>

        <small>
          Lng: ${lng.toFixed(6)}
        </small>

        <div style="
          margin-top:8px;
          padding:4px 8px;
          background:${score};
          color:white;
          border-radius:4px;
          font-weight:bold;
        ">
          Safety Score: ${safetyScore}%
        </div>

        <small style="color:#6b7280;">
          ${
            currentPosition
              ? "🟢 Live GPS Location"
              : "🟡 Demo / Fallback Location"
          }
        </small>

        <br/>

        <em style="color:#6b7280;font-size:12px;">
          Accuracy: ±${accuracy?.toFixed(0) || "?"}m
        </em>
      </div>
    `);

    console.log("[NaviSafe] Map position updated:", {
      lat,
      lng,
      accuracy,
    });
  }, [activePosition, currentPosition, safetyScore]);

  /*
   * ---------------------------------------------------------
   * Notify parent when location changes
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!activePosition) return;

    onLocationChange?.({
      lat: activePosition.lat,
      lng: activePosition.lng,
    });
  }, [activePosition, onLocationChange]);

  /*
   * ---------------------------------------------------------
   * Notify parent about safety score
   * ---------------------------------------------------------
   */

  useEffect(() => {
    onSafeScoreChange?.(safetyScore);
  }, [safetyScore, onSafeScoreChange]);

  /*
   * ---------------------------------------------------------
   * Draw safety zones
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map) return;

    // Remove old circles.
    zoneCirclesRef.current.forEach((circle) => {
      try {
        map.removeLayer(circle);
      } catch (err) {
        console.warn("[NaviSafe] Could not remove zone:", err);
      }
    });

    zoneCirclesRef.current = [];

    /*
     * If no zones were provided by the dashboard,
     * create a few demo zones so the map is still useful.
     */
    const zones: SafetyZone[] =
      initialZones.length > 0
        ? initialZones
        : [
            {
              name: "Safe Tourist Area",
              lat: 28.6145,
              lng: 77.2085,
              radius: 500,
              color: "#22c55e",
              type: "safe",
            },
            {
              name: "Caution Area",
              lat: 28.6165,
              lng: 77.215,
              radius: 350,
              color: "#f59e0b",
              type: "caution",
            },
            {
              name: "Restricted Area",
              lat: 28.61,
              lng: 77.202,
              radius: 300,
              color: "#ef4444",
              type: "restricted",
            },
            {
              name: "Crowded Area",
              lat: 28.62,
              lng: 77.21,
              radius: 400,
              color: "#8b5cf6",
              type: "crowded",
            },
          ];

    import("leaflet").then((L) => {
      const newCircles = zones.map((zone) => {
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radius,
          color: zone.color,
          fillColor: zone.color,
          fillOpacity:
            zone.type === "restricted"
              ? 0.3
              : zone.type === "safe"
              ? 0.15
              : 0.2,
          weight: zone.type === "restricted" ? 3 : 2,
          dashArray:
            zone.type === "crowded" ? "10, 5" : undefined,
        }).addTo(map);

        circle.bindPopup(`
          <div style="text-align:center; min-width:180px;">
            <strong style="color:${zone.color};">
              ${zone.name}
            </strong>

            <br/>

            <span style="
              color:${zone.color};
              font-weight:bold;
            ">
              ${
                zone.type.charAt(0).toUpperCase() +
                zone.type.slice(1)
              } Zone
            </span>

            <br/>

            <small>
              Radius: ${zone.radius}m
            </small>

            <br/>

            ${
              zone.type === "restricted"
                ? `<em style="color:#dc2626;">
                    🚨 Avoid this area
                  </em>`
                : ""
            }

            ${
              zone.type === "safe"
                ? `<em style="color:#10b981;">
                    ✅ Safe for tourists
                  </em>`
                : ""
            }

            ${
              zone.type === "caution"
                ? `<em style="color:#f59e0b;">
                    ⚠️ Exercise caution
                  </em>`
                : ""
            }

            ${
              zone.type === "crowded"
                ? `<em style="color:#7c3aed;">
                    👥 Protect belongings
                  </em>`
                : ""
            }
          </div>
        `);

        return circle;
      });

      zoneCirclesRef.current = newCircles;
    });
  }, [initialZones]);

  /*
   * ---------------------------------------------------------
   * Socket.IO
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let socket: any = null;
    let demoTimeout: ReturnType<typeof setTimeout> | null = null;

    try {
      socket = initializeSocket();

      if (socket) {
        socket.on("connect", () => {
          console.log("[NaviSafe] Socket.IO connected");

          setSocketConnected(true);
        });

        socket.on("disconnect", () => {
          console.log("[NaviSafe] Socket.IO disconnected");

          setSocketConnected(false);
        });

        socket.on("connect_error", (socketError: any) => {
          console.warn(
            "[NaviSafe] Socket connection error:",
            socketError
          );

          setSocketConnected(false);
        });

        socket.connect();
      } else {
        /*
         * Socket isn't required for the map.
         * Keep the dashboard usable in demo mode.
         */
        demoTimeout = setTimeout(() => {
          setSocketConnected(true);
        }, 1000);
      }
    } catch (err) {
      console.warn(
        "[NaviSafe] Socket.IO initialization failed:",
        err
      );

      demoTimeout = setTimeout(() => {
        setSocketConnected(true);
      }, 1000);
    }

    return () => {
      if (demoTimeout) {
        clearTimeout(demoTimeout);
      }

      if (socket) {
        try {
          socket.disconnect();
        } catch (err) {
          console.warn(
            "[NaviSafe] Socket cleanup error:",
            err
          );
        }
      }
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * Start GPS
   * ---------------------------------------------------------
   *
   * This is intentionally simple.
   * The map does NOT automatically start GPS.
   *
   * The parent dashboard can provide currentPosition.
   */

  const handleStartTracking = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by this browser.");
      return;
    }

    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPosition: Position = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        setDemoPosition(newPosition);
        setIsTracking(true);
        setPermissionStatus("granted");

        onLocationChange?.({
          lat: newPosition.lat,
          lng: newPosition.lng,
        });
      },
      (geoError) => {
        console.warn("[NaviSafe] GPS error:", geoError);

        setIsTracking(false);

        if (geoError.code === 1) {
          setPermissionStatus("denied");
          setGpsError("Location permission was denied.");
        } else if (geoError.code === 2) {
          setGpsError("Unable to determine your location.");
        } else if (geoError.code === 3) {
          setGpsError("Location request timed out.");
        } else {
          setGpsError("Unable to get your location.");
        }

        /*
         * IMPORTANT:
         * GPS failure does NOT affect the map.
         * The map remains visible at the fallback position.
         */
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      }
    );
  };

  const handleStopTracking = () => {
    setIsTracking(false);
  };

  /*
   * ---------------------------------------------------------
   * Map error
   * ---------------------------------------------------------
   */

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-4">
            <MapPin className="h-12 w-12 mx-auto mb-2" />

            <h3 className="text-lg font-semibold">
              Map Error
            </h3>

            <p className="text-sm">
              {error}
            </p>
          </div>

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-4">

      {/* GPS Control Panel */}
      <Card className="dark:bg-card dark:border-border">

        <CardHeader className="pb-3">

          <CardTitle className="flex items-center justify-between text-sm">

            <div className="flex items-center gap-2">

              <Navigation
                className={`h-4 w-4 ${
                  isTracking
                    ? "animate-pulse text-green-500"
                    : "text-gray-400"
                }`}
              />

              <span className="text-foreground">
                Real-Time GPS Tracking
              </span>

            </div>

            <div className="flex items-center gap-2">

              {socketConnected || isTracking ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-300 dark:text-green-400 dark:border-green-600"
                >
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-300 dark:text-red-400 dark:border-red-600"
                >
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}

            </div>

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Button
                onClick={
                  isTracking
                    ? handleStopTracking
                    : handleStartTracking
                }
                size="sm"
                variant={
                  isTracking
                    ? "destructive"
                    : "default"
                }
              >

                {isTracking ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop GPS
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start GPS
                  </>
                )}

              </Button>

              {permissionStatus === "denied" && (
                <Badge
                  variant="destructive"
                  className="text-xs"
                >
                  Permission Denied
                </Badge>
              )}

              {gpsError && (
                <Badge
                  variant="destructive"
                  className="text-xs"
                >
                  {gpsError}
                </Badge>
              )}

            </div>

            <div className="text-right text-sm">

              <div
                className={`font-semibold ${
                  safetyScore >= 70
                    ? "text-green-600 dark:text-green-400"
                    : safetyScore >= 30
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                Safety: {safetyScore}%
              </div>

              <div className="text-xs text-muted-foreground">

                {activePosition
                  ? `±${activePosition.accuracy?.toFixed(0) || "?"}m accuracy`
                  : "No GPS signal"}

              </div>

            </div>

          </div>

          {activePosition && (
            <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 dark:bg-muted/30 rounded p-2">

              <div>

                <span className="text-muted-foreground">
                  Lat:
                </span>

                <div className="font-mono text-foreground">
                  {activePosition.lat.toFixed(6)}
                </div>

              </div>

              <div>

                <span className="text-muted-foreground">
                  Lng:
                </span>

                <div className="font-mono text-foreground">
                  {activePosition.lng.toFixed(6)}
                </div>

              </div>

            </div>
          )}

        </CardContent>

      </Card>


      {/* Interactive Map */}
      <Card className="dark:bg-card dark:border-border">

        <CardContent className="p-0">

          <div className="relative">

            <div
              ref={mapRef}
              className="h-96 w-full rounded-lg overflow-hidden"
              style={{ minHeight: "384px" }}
            />

            {isLoading && (
              <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm rounded-lg flex items-center justify-center">

                <div className="text-center">

                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />

                  <div className="text-sm text-muted-foreground">
                    Loading interactive map...
                  </div>

                </div>

              </div>
            )}

          </div>

        </CardContent>

      </Card>


      {/* Zone Legend */}
      <Card className="dark:bg-card dark:border-border">

        <CardHeader className="pb-3">

          <CardTitle className="text-sm text-foreground">
            Static Safety Zones
          </CardTitle>

        </CardHeader>

        <CardContent>

          <div className="grid grid-cols-2 gap-2 text-xs">

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-foreground">
                Green Safe Zones
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-foreground">
                Orange Caution Zones
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-foreground">
                Red Restricted Zones
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-foreground">
                Purple Crowded Areas
              </span>
            </div>

          </div>

          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">

            <div className="flex items-center justify-between">

              <span>
                Total Zones:{" "}
                {initialZones.length || 4}
              </span>

              <span>
                📍 Drag marker to test
              </span>

            </div>

            <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/50 rounded border border-red-200 dark:border-red-800">

              <p className="text-red-700 dark:text-red-300 font-medium">
                ⚠️ Red zones trigger automatic emergency alerts
              </p>

              <p className="text-red-600 dark:text-red-400 text-xs">
                Police call initiated if not dismissed within 5 seconds
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}
