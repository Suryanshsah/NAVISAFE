"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Wallet, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSolanaWallet } from "@/hooks/use-solana-wallet"

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const { connected, connecting, publicKey, balance, error, connectWallet, disconnectWallet, isWalletAvailable } =
    useSolanaWallet()

  const [showWalletInfo, setShowWalletInfo] = useState(false)

  const handleConnectWallet = async () => {
    const success = await connectWallet()
    if (success) {
      setShowWalletInfo(true)
    }
  }

  const handleGetStarted = () => {
    if (connected) {
      onGetStarted()
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="absolute top-4 right-4 animate-in fade-in-0 slide-in-from-top-2 duration-700 delay-500">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-8 duration-700 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:shadow-primary/10">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center animate-in fade-in-0 zoom-in-50 duration-700 delay-200">
            <div className="p-4 bg-primary/10 rounded-full hover:bg-primary/20 transition-all duration-300 hover:scale-110 hover:rotate-3 group">
              <Shield className="h-12 w-12 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            </div>
          </div>

          <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-300">
            <h1 className="text-3xl font-bold text-foreground hover:text-primary transition-colors duration-300 cursor-default">
              NaviSafe
            </h1>
            <p className="text-lg text-muted-foreground font-medium animate-pulse">Navigate Safely, Travel Freely</p>
          </div>

          <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-400">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your personal safety companion for secure travel experiences. Get real-time protection, emergency
              assistance, and peace of mind wherever you go.
            </p>

            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Blockchain-Secured Registration
                </span>
              </div>
              <p className="text-xs text-purple-800 dark:text-purple-200">
                Your data is securely stored on Solana blockchain for maximum privacy and verification
              </p>
            </div>

            {!connected ? (
              <div className="space-y-3">
                {!isWalletAvailable ? (
                  <Alert className="text-left">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      No Solana wallet detected. Please install{" "}
                      <a
                        href="https://phantom.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary/80 inline-flex items-center"
                      >
                        Phantom <ExternalLink className="h-3 w-3 ml-1" />
                      </a>{" "}
                      or{" "}
                      <a
                        href="https://solflare.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary/80 inline-flex items-center"
                      >
                        Solflare <ExternalLink className="h-3 w-3 ml-1" />
                      </a>{" "}
                      wallet to continue.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Button
                    onClick={handleConnectWallet}
                    disabled={connecting}
                    className="w-full h-12 text-base font-semibold hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                  >
                    <Wallet className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                    <span className="group-hover:animate-pulse">{connecting ? "Connecting..." : "Connect Wallet"}</span>
                  </Button>
                )}

                {error && (
                  <Alert variant="destructive" className="text-left">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Wallet Connected</span>
                  </div>

                  {showWalletInfo && (
                    <div className="space-y-2 text-xs text-green-700 dark:text-green-300">
                      <div className="flex items-center justify-between">
                        <span>Address:</span>
                        <Badge variant="outline" className="font-mono">
                          {formatAddress(publicKey!)}
                        </Badge>
                      </div>
                      {balance !== null && (
                        <div className="flex items-center justify-between">
                          <span>Balance:</span>
                          <Badge variant="outline">{balance.toFixed(4)} SOL</Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-center pt-2">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Devnet Connected
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleGetStarted}
                  className="w-full h-12 text-base font-semibold hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 group"
                  size="lg"
                >
                  <span className="group-hover:animate-pulse">Continue to Registration</span>
                </Button>

                <Button
                  onClick={disconnectWallet}
                  variant="outline"
                  size="sm"
                  className="w-full text-sm bg-transparent"
                >
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border animate-in fade-in-0 duration-700 delay-600">
            <p className="text-xs text-muted-foreground">
              By continuing, I accept and agree to NaviSafe{" "}
              <span className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors duration-200 hover:underline-offset-4">
                Terms of Use
              </span>{" "}
              &{" "}
              <span className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors duration-200 hover:underline-offset-4">
                Privacy Policy
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
