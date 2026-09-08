"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Connection, type PublicKey, clusterApiUrl } from "@solana/web3.js"

interface SolanaWallet {
  connect: () => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  publicKey: PublicKey | null
  connected: boolean
}

interface WalletState {
  wallet: SolanaWallet | null
  publicKey: string | null
  connected: boolean
  connecting: boolean
  balance: number | null
  error: string | null
}

export function useSolanaWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    wallet: null,
    publicKey: null,
    connected: false,
    connecting: false,
    balance: null,
    error: null,
  })

  const connectionRef = useRef(new Connection(clusterApiUrl("devnet"), "confirmed"))

  const checkWalletAvailability = useCallback(() => {
    if (typeof window !== "undefined") {
      // Check for Phantom wallet
      if (window.solana && window.solana.isPhantom) {
        return window.solana
      }
      // Check for Solflare wallet
      if (window.solflare && window.solflare.isSolflare) {
        return window.solflare
      }
    }
    return null
  }, [])

  const connectWallet = useCallback(async () => {
    const wallet = checkWalletAvailability()

    if (!wallet) {
      setWalletState((prev) => ({
        ...prev,
        error: "No Solana wallet detected. Please install Phantom or Solflare wallet.",
      }))
      return false
    }

    try {
      setWalletState((prev) => ({ ...prev, connecting: true, error: null }))

      const response = await wallet.connect()
      const publicKey = response.publicKey.toString()

      // Get wallet balance
      const balance = await connectionRef.current.getBalance(response.publicKey)
      const balanceInSol = balance / 1000000000 // Convert lamports to SOL

      setWalletState((prev) => ({
        ...prev,
        wallet,
        publicKey,
        connected: true,
        connecting: false,
        balance: balanceInSol,
      }))

      console.log("[v0] Wallet connected:", publicKey)
      console.log("[v0] Wallet balance:", balanceInSol, "SOL")

      return true
    } catch (error: any) {
      console.error("[v0] Wallet connection failed:", error)
      setWalletState((prev) => ({
        ...prev,
        connecting: false,
        error: error.message || "Failed to connect wallet",
      }))
      return false
    }
  }, [checkWalletAvailability])

  const disconnectWallet = useCallback(async () => {
    try {
      if (walletState.wallet) {
        await walletState.wallet.disconnect()
      }
      setWalletState({
        wallet: null,
        publicKey: null,
        connected: false,
        connecting: false,
        balance: null,
        error: null,
      })
      console.log("[v0] Wallet disconnected")
    } catch (error: any) {
      console.error("[v0] Wallet disconnect failed:", error)
      setWalletState((prev) => ({
        ...prev,
        error: error.message || "Failed to disconnect wallet",
      }))
    }
  }, [walletState.wallet])

  useEffect(() => {
    const wallet = checkWalletAvailability()
    if (wallet && wallet.isConnected) {
      connectWallet()
    }
  }, []) // Empty dependency array to run only once

  useEffect(() => {
    const wallet = checkWalletAvailability()
    if (wallet) {
      const handleConnect = () => {
        console.log("[v0] Wallet connected via event")
      }

      const handleDisconnect = () => {
        console.log("[v0] Wallet disconnected via event")
        setWalletState({
          wallet: null,
          publicKey: null,
          connected: false,
          connecting: false,
          balance: null,
          error: null,
        })
      }

      wallet.on("connect", handleConnect)
      wallet.on("disconnect", handleDisconnect)

      return () => {
        wallet.off("connect", handleConnect)
        wallet.off("disconnect", handleDisconnect)
      }
    }
  }, []) // Empty dependency array to run only once

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    connection: connectionRef.current,
    isWalletAvailable: !!checkWalletAvailability(),
  }
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: () => Promise<{ publicKey: PublicKey }>
      disconnect: () => Promise<void>
      signTransaction: (transaction: any) => Promise<any>
      signAllTransactions: (transactions: any[]) => Promise<any[]>
      publicKey: PublicKey | null
      connected: boolean
      isConnected: boolean
      on: (event: string, callback: () => void) => void
      off: (event: string, callback: () => void) => void
    }
    solflare?: {
      isSolflare?: boolean
      connect: () => Promise<{ publicKey: PublicKey }>
      disconnect: () => Promise<void>
      signTransaction: (transaction: any) => Promise<any>
      signAllTransactions: (transactions: any[]) => Promise<any[]>
      publicKey: PublicKey | null
      connected: boolean
      isConnected: boolean
      on: (event: string, callback: () => void) => void
      off: (event: string, callback: () => void) => void
    }
  }
}
