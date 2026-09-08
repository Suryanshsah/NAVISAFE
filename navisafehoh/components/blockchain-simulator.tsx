"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Link, Copy, CheckCircle, ExternalLink, Hash, Clock, Shield, Database } from "lucide-react"

interface BlockchainTransaction {
  hash: string
  blockNumber: number
  timestamp: Date
  from: string
  to: string
  type: "ID_ISSUANCE" | "LOCATION_UPDATE" | "INCIDENT_LOG" | "VERIFICATION"
  touristId: string
  gasUsed: number
  status: "confirmed" | "pending" | "failed"
}

interface BlockchainSimulatorProps {
  userInfo?: any
}

export function BlockchainSimulator({ userInfo }: BlockchainSimulatorProps) {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [networkStats, setNetworkStats] = useState({
    blockHeight: 18945672,
    networkHashRate: "245.7 TH/s",
    avgBlockTime: "12.3s",
    totalTransactions: 1847293,
  })
  const [copied, setCopied] = useState("")
  const [searchHash, setSearchHash] = useState("")

  // Generate initial blockchain transactions
  useEffect(() => {
    const initialTransactions: BlockchainTransaction[] = [
      {
        hash: "0x" + Math.random().toString(16).substr(2, 64),
        blockNumber: networkStats.blockHeight,
        timestamp: new Date(),
        from: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        to: "0xNaviSafeContract123456789abcdef",
        type: "ID_ISSUANCE",
        touristId: userInfo?.name ? `NVS-${Date.now().toString().slice(-8)}` : "NVS-12345678",
        gasUsed: 21000,
        status: "confirmed",
      },
      {
        hash: "0x" + Math.random().toString(16).substr(2, 64),
        blockNumber: networkStats.blockHeight - 1,
        timestamp: new Date(Date.now() - 300000),
        from: "0xNaviSafeContract123456789abcdef",
        to: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
        type: "LOCATION_UPDATE",
        touristId: "NVS-87654321",
        gasUsed: 15000,
        status: "confirmed",
      },
      {
        hash: "0x" + Math.random().toString(16).substr(2, 64),
        blockNumber: networkStats.blockHeight - 2,
        timestamp: new Date(Date.now() - 600000),
        from: "0xAuthorityContract987654321fedcba",
        to: "0xNaviSafeContract123456789abcdef",
        type: "INCIDENT_LOG",
        touristId: "NVS-11223344",
        gasUsed: 45000,
        status: "confirmed",
      },
    ]

    setTransactions(initialTransactions)
  }, [userInfo, networkStats.blockHeight])

  // Simulate new blockchain transactions
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        // 30% chance every 15 seconds
        const transactionTypes = ["LOCATION_UPDATE", "VERIFICATION", "INCIDENT_LOG"] as const
        const selectedType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]

        const newTransaction: BlockchainTransaction = {
          hash: "0x" + Math.random().toString(16).substr(2, 64),
          blockNumber: networkStats.blockHeight + Math.floor(Math.random() * 3),
          timestamp: new Date(),
          from:
            selectedType === "INCIDENT_LOG"
              ? "0xAuthorityContract987654321fedcba"
              : "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
          to: "0xNaviSafeContract123456789abcdef",
          type: selectedType,
          touristId: `NVS-${Math.floor(Math.random() * 99999999)
            .toString()
            .padStart(8, "0")}`,
          gasUsed: 15000 + Math.floor(Math.random() * 30000),
          status: Math.random() > 0.95 ? "pending" : "confirmed",
        }

        setTransactions((prev) => [newTransaction, ...prev.slice(0, 9)]) // Keep last 10

        // Update network stats
        setNetworkStats((prev) => ({
          ...prev,
          blockHeight: prev.blockHeight + (Math.random() > 0.7 ? 1 : 0),
          totalTransactions: prev.totalTransactions + 1,
          avgBlockTime: (12 + Math.random() * 2).toFixed(1) + "s",
        }))
      }
    }, 15000) // Check every 15 seconds

    return () => clearInterval(interval)
  }, [networkStats.blockHeight])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(text)
    setTimeout(() => setCopied(""), 2000)
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "ID_ISSUANCE":
        return "bg-primary/10 text-primary"
      case "LOCATION_UPDATE":
        return "bg-blue-500/10 text-blue-600"
      case "INCIDENT_LOG":
        return "bg-destructive/10 text-destructive"
      case "VERIFICATION":
        return "bg-accent/10 text-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const openBlockchainExplorer = (hash: string) => {
    window.open(`https://solscan.io/tx/${hash}?cluster=devnet`, "_blank")
  }

  const filteredTransactions = searchHash
    ? transactions.filter(
        (tx) =>
          tx.hash.toLowerCase().includes(searchHash.toLowerCase()) ||
          tx.touristId.toLowerCase().includes(searchHash.toLowerCase()),
      )
    : transactions

  return (
    <div className="space-y-4">
      {/* Blockchain Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <span>NaviSafe Blockchain Network</span>
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              Live
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-primary">{networkStats.blockHeight.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Block Height</p>
            </div>
            <div>
              <p className="text-lg font-bold text-accent">{networkStats.networkHashRate}</p>
              <p className="text-xs text-muted-foreground">Hash Rate</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-500">{networkStats.avgBlockTime}</p>
              <p className="text-xs text-muted-foreground">Avg Block Time</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">{networkStats.totalTransactions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Transactions</p>
            </div>
          </div>

          <Separator />

          {/* Search */}
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction hash or tourist ID..."
              value={searchHash}
              onChange={(e) => setSearchHash(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Link className="h-5 w-5" />
            <span>Recent Blockchain Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found matching your search.</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.hash} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant={
                          transaction.status === "confirmed"
                            ? "default"
                            : transaction.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {transaction.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Block #{transaction.blockNumber.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Hash:</span>
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {transaction.hash.slice(0, 20)}...{transaction.hash.slice(-8)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(transaction.hash)}
                          className="h-6 w-6 p-0"
                        >
                          {copied === transaction.hash ? (
                            <CheckCircle className="h-3 w-3 text-accent" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">From:</span>
                          <p className="font-mono">
                            {transaction.from.slice(0, 10)}...{transaction.from.slice(-8)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">To:</span>
                          <p className="font-mono">
                            {transaction.to.slice(0, 10)}...{transaction.to.slice(-8)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tourist ID:</span>
                          <p className="font-medium">{transaction.touristId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gas Used:</span>
                          <p>{transaction.gasUsed.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{transaction.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openBlockchainExplorer(transaction.hash)}
                    className="ml-4"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Explorer
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Smart Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>NaviSafe Smart Contracts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tourist ID Contract</p>
                  <p className="text-xs text-muted-foreground font-mono">0xNaviSafeContract123456789abcdef</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Active
                </Badge>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Authority Management</p>
                  <p className="text-xs text-muted-foreground font-mono">0xAuthorityContract987654321fedcba</p>
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
