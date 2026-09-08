"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Shield, QrCode, ExternalLink, Clock, User, Copy, CheckCircle, Globe, Database } from "lucide-react"
import { BlockchainSimulator } from "@/components/blockchain-simulator"
import { ThemeToggle } from "@/components/theme-toggle"

interface DigitalIDProps {
  userInfo: any
  onBack: () => void
}

export function DigitalID({ userInfo, onBack }: DigitalIDProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState<"en" | "hi">("en")
  const [showBlockchain, setShowBlockchain] = useState(false)

  const blockchainHash = userInfo?.blockchainData?.transactionSignature || "5J7X9K2M8N4P6Q1R3S5T7U9V2W4X6Y8Z1A3B5C7D9E"
  const blockHash = userInfo?.blockchainData?.slot?.toString() || "200123456"
  const touristId = userInfo?.blockchainData?.digitalId || `NVS-${Date.now().toString().slice(-8)}`
  const issueDate = new Date(
    userInfo?.blockchainData?.blockTime ? userInfo.blockchainData.blockTime * 1000 : Date.now(),
  )
  const expiryDate = new Date(userInfo?.expiryDate || Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const translations = {
    en: {
      title: "Digital Tourist ID",
      subtitle: "Your secure travel identification",
      touristId: "Tourist ID",
      status: "Status",
      active: "Active",
      validUntil: "Valid Until",
      issuedOn: "Issued On",
      blockchainId: "Blockchain ID",
      viewOnBlockchain: "View on Blockchain",
      qrCode: "QR Code",
      scanInstructions: "Scan this QR code for instant verification",
      emergencyInfo: "Emergency Information",
      bloodType: "Blood Type",
      allergies: "Allergies",
      emergencyContact: "Emergency Contact",
      backToDashboard: "Back to Dashboard",
      blockchainDetails: "Blockchain Details",
    },
    hi: {
      title: "डिजिटल पर्यटक पहचान",
      subtitle: "आपकी सुरक्षित यात्रा पहचान",
      touristId: "पर्यटक आईडी",
      status: "स्थिति",
      active: "सक्रिय",
      validUntil: "तक वैध",
      issuedOn: "जारी किया गया",
      blockchainId: "ब्लॉकचेन आईडी",
      viewOnBlockchain: "ब्लॉकचेन पर देखें",
      qrCode: "क्यूआर कोड",
      scanInstructions: "तत्काल सत्यापन के लिए इस QR कोड को स्कैन करें",
      emergencyInfo: "आपातकालीन जानकारी",
      bloodType: "रक्त समूह",
      allergies: "एलर्जी",
      emergencyContact: "आपातकालीन संपर्क",
      backToDashboard: "डैशबोर्ड पर वापस",
      blockchainDetails: "ब्लॉकचेन विवरण",
    },
  }

  const t = translations[language]

  if (showBlockchain) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-foreground text-background p-4 sticky top-0 z-[1000] shadow-md animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setShowBlockchain(false)}
              className="text-background hover:bg-background/10 hover:scale-105 transition-all duration-200"
            >
              ← Back to Digital ID
            </Button>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                className="flex items-center space-x-2 bg-transparent border-background/20 text-background hover:bg-background/10 hover:scale-105 transition-all duration-200"
              >
                <Globe className="h-4 w-4 hover:rotate-12 transition-transform duration-300" />
                <span>{language === "en" ? "हिंदी" : "English"}</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
        <div className="p-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <BlockchainSimulator userInfo={userInfo} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-background p-4 sticky top-0 z-[1000] shadow-md animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-background hover:bg-background/10 hover:scale-105 transition-all duration-200"
          >
            ← {t.backToDashboard}
          </Button>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center space-x-2 bg-transparent border-background/20 text-background hover:bg-background/10 hover:scale-105 transition-all duration-200"
            >
              <Globe className="h-4 w-4 hover:rotate-12 transition-transform duration-300" />
              <span>{language === "en" ? "हिंदी" : "English"}</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="border-2 border-primary/20 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 animate-in fade-in-0 slide-in-from-bottom-8 duration-700 hover:shadow-primary/10">
          <CardHeader className="text-center space-y-2 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 transition-all duration-300">
            <div className="flex justify-center animate-in fade-in-0 zoom-in-50 duration-700 delay-200">
              <div className="p-3 bg-primary/10 rounded-full hover:bg-primary/20 transition-all duration-300 hover:scale-110 hover:rotate-6 group">
                <Shield className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors duration-300" />
              </div>
            </div>
            <CardTitle className="text-xl animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300 hover:text-primary transition-colors duration-300 cursor-default">
              {t.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-400">
              {t.subtitle}
            </p>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-500">
              <div className="flex items-center space-x-4 hover:bg-muted/30 p-3 rounded-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="p-3 bg-muted rounded-full hover:bg-muted/80 transition-all duration-300 hover:scale-110">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors duration-300">
                    {userInfo?.name || "John Doe"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {userInfo?.age || "28"} years • {userInfo?.gender || "Male"}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-accent/10 text-accent hover:bg-accent/20 hover:scale-105 transition-all duration-300 animate-pulse"
                >
                  {t.active}
                </Badge>
              </div>

              <Separator className="animate-in fade-in-0 duration-700 delay-600" />

              <div className="grid grid-cols-2 gap-4 text-sm animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-700">
                <div className="hover:bg-muted/30 p-2 rounded transition-all duration-300 hover:scale-105">
                  <p className="text-muted-foreground">{t.touristId}</p>
                  <p className="font-mono font-semibold">{touristId}</p>
                </div>
                <div className="hover:bg-muted/30 p-2 rounded transition-all duration-300 hover:scale-105">
                  <p className="text-muted-foreground">{t.status}</p>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-300"
                  >
                    {t.active}
                  </Badge>
                </div>
                <div className="hover:bg-muted/30 p-2 rounded transition-all duration-300 hover:scale-105">
                  <p className="text-muted-foreground">{t.issuedOn}</p>
                  <p className="font-medium">{issueDate.toLocaleDateString()}</p>
                </div>
                <div className="hover:bg-muted/30 p-2 rounded transition-all duration-300 hover:scale-105">
                  <p className="text-muted-foreground">{t.validUntil}</p>
                  <p className="font-medium">{expiryDate.toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <Separator className="animate-in fade-in-0 duration-700 delay-800" />

            <div className="text-center space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-900">
              <h4 className="font-semibold flex items-center justify-center space-x-2 hover:text-primary transition-colors duration-300">
                <QrCode className="h-5 w-5 hover:rotate-12 transition-transform duration-300" />
                <span>{t.qrCode}</span>
              </h4>

              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-border rounded-lg shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-primary/30 group">
                  <svg
                    width="200"
                    height="200"
                    className="border group-hover:border-primary/20 transition-colors duration-300"
                  >
                    <defs>
                      <pattern id="qr-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
                        <rect width="5" height="5" fill="#000" />
                        <rect x="5" y="5" width="5" height="5" fill="#000" />
                      </pattern>
                    </defs>
                    <rect width="200" height="200" fill="white" />
                    <rect x="10" y="10" width="180" height="180" fill="url(#qr-pattern)" />
                    <rect x="20" y="20" width="40" height="40" fill="#059669" />
                    <rect x="140" y="20" width="40" height="40" fill="#059669" />
                    <rect x="20" y="140" width="40" height="40" fill="#059669" />
                    <text x="100" y="105" textAnchor="middle" fontSize="8" fill="#059669" fontWeight="bold">
                      NaviSafe
                    </text>
                  </svg>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{t.scanInstructions}</p>
            </div>

            <Separator className="animate-in fade-in-0 duration-700 delay-1000" />

            <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-1100">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold hover:text-primary transition-colors duration-300">{t.blockchainId}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBlockchain(true)}
                  className="flex items-center space-x-2 hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-md"
                >
                  <Database className="h-4 w-4 hover:rotate-12 transition-transform duration-300" />
                  <span>{t.blockchainDetails}</span>
                </Button>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg space-y-2 hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono break-all hover:text-primary transition-colors duration-300">
                    {blockchainHash}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(blockchainHash)}
                    className="h-8 w-8 p-0 hover:scale-110 active:scale-95 transition-all duration-200"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-accent animate-bounce" />
                    ) : (
                      <Copy className="h-4 w-4 hover:text-primary transition-colors duration-300" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Block:</span>
                  <span className="text-xs font-mono">{blockHash}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-md"
                  onClick={() => window.open(`https://solscan.io/tx/${blockchainHash}?cluster=devnet`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2 hover:rotate-12 transition-transform duration-300" />
                  {t.viewOnBlockchain}
                </Button>
              </div>
            </div>

            <Separator className="animate-in fade-in-0 duration-700 delay-1200" />

            <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-1300">
              <h4 className="font-semibold text-destructive hover:text-destructive/80 transition-colors duration-300">
                {t.emergencyInfo}
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between hover:bg-muted/30 p-2 rounded transition-all duration-300 hover:scale-[1.02]">
                  <span className="text-muted-foreground">{t.bloodType}:</span>
                  <span className="font-medium">O+</span>
                </div>
                <div className="flex justify-between hover:bg-muted/30 p-2 rounded transition-all duration-300 hover:scale-[1.02]">
                  <span className="text-muted-foreground">{t.allergies}:</span>
                  <span className="font-medium">None</span>
                </div>
                <div className="flex justify-between hover:bg-muted/30 p-2 rounded transition-all duration-300 hover:scale-[1.02]">
                  <span className="text-muted-foreground">{t.emergencyContact}:</span>
                  <span className="font-medium">{userInfo?.phone || "+91 98765 43210"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground animate-in fade-in-0 duration-700 delay-1400">
              <Clock className="h-4 w-4 animate-spin" style={{ animationDuration: "8s" }} />
              <span>Last updated: {currentTime.toLocaleTimeString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
