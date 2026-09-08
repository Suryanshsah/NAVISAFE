"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Terminal, Settings, Rocket, CheckCircle, ExternalLink, Copy, Code } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DeploymentGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span>Solana Smart Contract Deployment Guide</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Step-by-step instructions to deploy the NaviSafe tourist registry smart contract on Solana Devnet
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Prerequisites */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Prerequisites</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">Install Rust</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh")}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium">Install Solana CLI</h4>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard('sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Setup & Configuration</h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Configure Solana for Devnet",
                  command: "solana config set --url devnet",
                  description: "Set Solana CLI to use Devnet cluster",
                },
                {
                  step: 2,
                  title: "Create or Import Wallet",
                  command: "solana-keygen new --outfile ~/.config/solana/id.json",
                  description: "Generate a new keypair for deployment",
                },
                {
                  step: 3,
                  title: "Get Devnet SOL",
                  command: "solana airdrop 2",
                  description: "Request test SOL for deployment fees",
                },
                {
                  step: 4,
                  title: "Install Anchor CLI",
                  command: "npm install -g @coral-xyz/anchor-cli",
                  description: "Install Anchor framework for Solana development",
                },
              ].map((item) => (
                <div key={item.step} className="flex space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {item.step}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center space-x-2">
                      <code className="bg-muted px-3 py-2 rounded font-mono text-sm flex-1">{item.command}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.command)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Steps */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Contract Deployment</h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Navigate to Contract Directory",
                  command: "cd solana-contract",
                  description: "Enter the smart contract directory",
                },
                {
                  step: 2,
                  title: "Install Dependencies",
                  command: "npm install",
                  description: "Install required Node.js packages",
                },
                {
                  step: 3,
                  title: "Build Contract",
                  command: "anchor build",
                  description: "Compile the Rust smart contract",
                },
                {
                  step: 4,
                  title: "Deploy to Devnet",
                  command: "anchor deploy --provider.cluster devnet",
                  description: "Deploy contract to Solana Devnet",
                },
                {
                  step: 5,
                  title: "Run Tests",
                  command: "anchor test --provider.cluster devnet",
                  description: "Execute contract tests to verify functionality",
                },
              ].map((item) => (
                <div key={item.step} className="flex space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {item.step}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center space-x-2">
                      <code className="bg-muted px-3 py-2 rounded font-mono text-sm flex-1">{item.command}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(item.command)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification */}
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="space-y-2">
                <p className="font-medium">Deployment Verification</p>
                <p className="text-sm">After successful deployment, you can verify your contract on:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <a
                    href="https://solscan.io/?cluster=devnet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Solscan Devnet <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <a
                    href="https://explorer.solana.com/?cluster=devnet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Solana Explorer <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Program ID */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Contract Program ID:</p>
              <div className="flex items-center space-x-2">
                <code className="bg-background px-3 py-2 rounded font-mono text-sm flex-1">
                  NaviSafe11111111111111111111111111111111111
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("NaviSafe11111111111111111111111111111111111")}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Use this Program ID to interact with the deployed contract
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
