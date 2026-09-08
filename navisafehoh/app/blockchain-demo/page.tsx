"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlockchainVerification } from "@/components/blockchain-verification"
import { DeploymentGuide } from "@/components/deployment-guide"
import { Shield, Code, Search, Rocket } from "lucide-react"

export default function BlockchainDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">NaviSafe Blockchain Integration</CardTitle>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive Solana blockchain integration for secure tourist registration and data verification. Test
              the system, verify transactions, and deploy your own smart contract.
            </p>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verification" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Data Verification</span>
            </TabsTrigger>
            <TabsTrigger value="deployment" className="flex items-center space-x-2">
              <Rocket className="h-4 w-4" />
              <span>Deployment Guide</span>
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Testing Features</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verification">
            <BlockchainVerification />
          </TabsContent>

          <TabsContent value="deployment">
            <DeploymentGuide />
          </TabsContent>

          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle>Testing Features</CardTitle>
                <p className="text-muted-foreground">
                  Test the blockchain integration with sample data and mock transactions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-medium">Wallet Connection Test</h4>
                    <p className="text-sm text-muted-foreground">
                      Test Phantom/Solflare wallet connection and balance display
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Test Wallet Connection
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-medium">Transaction Simulation</h4>
                    <p className="text-sm text-muted-foreground">
                      Simulate tourist registration and trip details submission
                    </p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Simulate Transaction
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-medium">Data Retrieval Test</h4>
                    <p className="text-sm text-muted-foreground">Test fetching stored tourist data from blockchain</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Test Data Retrieval
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-medium">Error Handling</h4>
                    <p className="text-sm text-muted-foreground">Test error scenarios and recovery mechanisms</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      Test Error Handling
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Main App */}
        <div className="text-center">
          <Button asChild variant="outline">
            <a href="/">← Back to NaviSafe App</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
