"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Shield, Search, ExternalLink, CheckCircle, AlertCircle, Loader2, Copy, Eye } from "lucide-react"
import { useBlockchainTransaction } from "@/hooks/use-blockchain-transaction"

interface VerificationResult {
  isValid: boolean
  transactionData?: any
  accountData?: any
  error?: string
}

export function BlockchainVerification() {
  const [verificationInput, setVerificationInput] = useState("")
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [inputType, setInputType] = useState<"signature" | "account">("signature")

  const { verifyTransaction, getExplorerUrl, getAccountExplorerUrl } = useBlockchainTransaction()

  const handleVerify = async () => {
    if (!verificationInput.trim()) return

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      console.log("[v0] Starting verification for:", verificationInput)

      if (inputType === "signature") {
        // Verify transaction signature
        const isValid = await verifyTransaction(verificationInput)

        if (isValid) {
          setVerificationResult({
            isValid: true,
            transactionData: {
              signature: verificationInput,
              status: "Confirmed",
              network: "Devnet",
            },
          })
        } else {
          setVerificationResult({
            isValid: false,
            error: "Transaction not found or invalid",
          })
        }
      } else {
        // Verify account address (mock implementation)
        const isValidAddress = verificationInput.length >= 32 && verificationInput.length <= 44

        if (isValidAddress) {
          setVerificationResult({
            isValid: true,
            accountData: {
              address: verificationInput,
              status: "Active",
              network: "Devnet",
            },
          })
        } else {
          setVerificationResult({
            isValid: false,
            error: "Invalid account address format",
          })
        }
      }
    } catch (error: any) {
      console.error("[v0] Verification failed:", error)
      setVerificationResult({
        isValid: false,
        error: error.message || "Verification failed",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openInExplorer = () => {
    if (!verificationInput) return

    const url = inputType === "signature" ? getExplorerUrl(verificationInput) : getAccountExplorerUrl(verificationInput)

    window.open(url, "_blank")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Blockchain Data Verification</CardTitle>
        <p className="text-sm text-muted-foreground">Verify tourist registration data stored on Solana blockchain</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Verification Type Selection */}
        <div className="flex space-x-2">
          <Button
            variant={inputType === "signature" ? "default" : "outline"}
            onClick={() => setInputType("signature")}
            className="flex-1"
          >
            Transaction Signature
          </Button>
          <Button
            variant={inputType === "account" ? "default" : "outline"}
            onClick={() => setInputType("account")}
            className="flex-1"
          >
            Account Address
          </Button>
        </div>

        {/* Input Section */}
        <div className="space-y-3">
          <Label htmlFor="verification-input">
            {inputType === "signature" ? "Transaction Signature" : "Tourist Account Address"}
          </Label>
          <div className="flex space-x-2">
            <Input
              id="verification-input"
              placeholder={inputType === "signature" ? "Enter transaction signature..." : "Enter account address..."}
              value={verificationInput}
              onChange={(e) => setVerificationInput(e.target.value)}
              className="font-mono text-sm"
            />
            <Button onClick={handleVerify} disabled={isVerifying || !verificationInput.trim()} className="px-6">
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Sample Data for Testing */}
        <div className="p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sample Data for Testing</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sample Transaction:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-background px-2 py-1 rounded font-mono">
                  5J7X9K2M8N4P6Q1R3S5T7U9V2W4X6Y8Z1A3B5C7D9E
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVerificationInput("5J7X9K2M8N4P6Q1R3S5T7U9V2W4X6Y8Z1A3B5C7D9E")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sample Account:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-background px-2 py-1 rounded font-mono">
                  NaviSafe11111111111111111111111111111111111
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVerificationInput("NaviSafe11111111111111111111111111111111111")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Results */}
        {verificationResult && (
          <div className="space-y-4">
            {verificationResult.isValid ? (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <div className="space-y-3">
                    <p className="font-medium">Verification Successful!</p>

                    {verificationResult.transactionData && (
                      <div className="space-y-2">
                        <p className="text-sm">Transaction Details:</p>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Signature:</span>
                            <code className="font-mono">
                              {verificationResult.transactionData.signature.slice(0, 16)}...
                            </code>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Status:</span>
                            <Badge variant="outline" className="text-green-700">
                              {verificationResult.transactionData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Network:</span>
                            <Badge variant="outline">{verificationResult.transactionData.network}</Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {verificationResult.accountData && (
                      <div className="space-y-2">
                        <p className="text-sm">Account Details:</p>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Address:</span>
                            <code className="font-mono">{verificationResult.accountData.address.slice(0, 16)}...</code>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Status:</span>
                            <Badge variant="outline" className="text-green-700">
                              {verificationResult.accountData.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Network:</span>
                            <Badge variant="outline">{verificationResult.accountData.network}</Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button onClick={openInExplorer} variant="outline" size="sm" className="w-full bg-transparent">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Solscan Explorer
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Verification Failed</p>
                    <p className="text-sm">{verificationResult.error}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">How to Verify Your Data:</p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Use the transaction signature from your registration confirmation</li>
              <li>• Or use your tourist account address to verify stored data</li>
              <li>• All data is stored on Solana Devnet for testing purposes</li>
              <li>• Click "View on Solscan Explorer" to see detailed blockchain information</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
