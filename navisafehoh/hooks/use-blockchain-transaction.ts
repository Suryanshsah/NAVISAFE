"use client"

import { useState, useCallback } from "react"
import { solanaService, type TouristData, type TripDetails, type BlockchainResult } from "@/lib/solana-service"
import { useSolanaWallet } from "./use-solana-wallet"

interface TransactionState {
  isLoading: boolean
  error: string | null
  result: BlockchainResult | null
  isSuccess: boolean
}

export function useBlockchainTransaction() {
  const { wallet, connected } = useSolanaWallet()
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    result: null,
    isSuccess: false,
  })

  const resetState = useCallback(() => {
    setTransactionState({
      isLoading: false,
      error: null,
      result: null,
      isSuccess: false,
    })
  }, [])

  const registerTourist = useCallback(
    async (touristData: TouristData): Promise<BlockchainResult | null> => {
      if (!connected || !wallet) {
        setTransactionState((prev) => ({
          ...prev,
          error: "Wallet not connected",
        }))
        return null
      }

      setTransactionState({
        isLoading: true,
        error: null,
        result: null,
        isSuccess: false,
      })

      try {
        console.log("[v0] Initiating tourist registration transaction...")
        const result = await solanaService.registerTourist(wallet, touristData)

        setTransactionState({
          isLoading: false,
          error: null,
          result,
          isSuccess: true,
        })

        console.log("[v0] Tourist registration successful:", result)
        return result
      } catch (error: any) {
        console.error("[v0] Tourist registration failed:", error)
        setTransactionState({
          isLoading: false,
          error: error.message || "Registration failed",
          result: null,
          isSuccess: false,
        })
        return null
      }
    },
    [connected, wallet],
  )

  const updateTripDetails = useCallback(
    async (digitalId: string, tripDetails: TripDetails): Promise<BlockchainResult | null> => {
      if (!connected || !wallet) {
        setTransactionState((prev) => ({
          ...prev,
          error: "Wallet not connected",
        }))
        return null
      }

      setTransactionState({
        isLoading: true,
        error: null,
        result: null,
        isSuccess: false,
      })

      try {
        console.log("[v0] Initiating trip details update transaction...")
        const result = await solanaService.updateTripDetails(wallet, digitalId, tripDetails)

        setTransactionState({
          isLoading: false,
          error: null,
          result,
          isSuccess: true,
        })

        console.log("[v0] Trip details update successful:", result)
        return result
      } catch (error: any) {
        console.error("[v0] Trip details update failed:", error)
        setTransactionState({
          isLoading: false,
          error: error.message || "Trip update failed",
          result: null,
          isSuccess: false,
        })
        return null
      }
    },
    [connected, wallet],
  )

  const verifyTransaction = useCallback(async (signature: string): Promise<boolean> => {
    try {
      return await solanaService.verifyTransaction(signature)
    } catch (error) {
      console.error("[v0] Transaction verification failed:", error)
      return false
    }
  }, [])

  return {
    ...transactionState,
    registerTourist,
    updateTripDetails,
    verifyTransaction,
    resetState,
    getExplorerUrl: solanaService.getExplorerUrl,
    getAccountExplorerUrl: solanaService.getAccountExplorerUrl,
  }
}
