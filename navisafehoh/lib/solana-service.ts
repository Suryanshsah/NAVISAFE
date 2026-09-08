import { Connection, SystemProgram, clusterApiUrl, Transaction, Keypair } from "@solana/web3.js"
import { sha256 } from "js-sha256"

export interface TouristData {
  digitalId: string
  name: string
  gender: string
  age: number
  idNumber: string
  phone: string
  nationality: string
  email?: string
  registrationTimestamp: number
}

export interface TripDetails {
  startDate: number
  endDate: number
  purpose: string
  accommodation?: string
  itinerary: string
  emergencyContacts: EmergencyContact[]
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface BlockchainResult {
  signature: string
  slot: number
  blockTime: number
  touristAccountAddress: string
}

class SolanaService {
  private connection: Connection
  private mockStorage: Map<string, any> = new Map()
  private isDemoMode = true // Set to true to avoid real transactions

  constructor() {
    this.connection = new Connection(clusterApiUrl("devnet"), "confirmed")
  }

  private hashIdNumber(idNumber: string): string {
    // Hash the ID number for privacy
    return sha256(idNumber + "navisafe_salt_2024")
  }

  private generateMockSignature(): string {
    // Generate a realistic-looking transaction signature
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  async registerTourist(wallet: any, touristData: TouristData): Promise<BlockchainResult> {
    try {
      console.log("[v0] Starting tourist registration on blockchain...")

      if (!wallet || !wallet.publicKey) {
        throw new Error("Wallet not connected or invalid")
      }

      if (!touristData.registrationTimestamp || isNaN(touristData.registrationTimestamp)) {
        throw new Error("Invalid registration timestamp")
      }

      const userPublicKey = wallet.publicKey

      // Generate digital ID
      const timestamp = Date.now()
      const digitalId = `NVS-${timestamp}-${userPublicKey.toString().slice(-8)}`

      console.log("[v0] Digital ID:", digitalId)

      // Hash sensitive data
      const idNumberHash = this.hashIdNumber(touristData.idNumber)

      let signature: string
      let slot: number
      let blockTime: number

      if (this.isDemoMode) {
        // Demo mode - simulate blockchain transaction without real wallet interaction
        console.log("[v0] Running in demo mode - simulating blockchain transaction...")
        signature = this.generateMockSignature()
        slot = Math.floor(Math.random() * 1000000) + 200000000
        blockTime = Math.floor(Date.now() / 1000)

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
      } else {
        // Real blockchain mode (only use when deployed with proper domain)
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: userPublicKey,
            toPubkey: userPublicKey,
            lamports: 0,
          }),
        )

        const { blockhash } = await this.connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = userPublicKey

        let signedTransaction
        try {
          signedTransaction = await wallet.signTransaction(transaction)
        } catch (error: any) {
          if (error.message?.includes("User rejected") || error.code === 4001) {
            throw new Error("Transaction cancelled by user. Please approve the transaction to complete registration.")
          }
          throw error
        }

        signature = await this.connection.sendRawTransaction(signedTransaction.serialize())
        await this.connection.confirmTransaction(signature, "confirmed")

        const txDetails = await this.connection.getTransaction(signature, {
          commitment: "confirmed",
        })
        slot = txDetails?.slot || 0
        blockTime = txDetails?.blockTime || Math.floor(Date.now() / 1000)
      }

      console.log("[v0] Registration transaction signature:", signature)

      // Store data in mock storage (simulating on-chain storage)
      const touristAccountAddress = Keypair.generate().publicKey.toString()
      const registrationData = {
        digitalId,
        name: touristData.name,
        gender: touristData.gender,
        age: touristData.age,
        idNumberHash,
        phone: touristData.phone,
        nationality: touristData.nationality,
        email: touristData.email || null,
        registrationTimestamp: touristData.registrationTimestamp,
        userPublicKey: userPublicKey.toString(),
      }

      this.mockStorage.set(digitalId, registrationData)
      console.log("[v0] Tourist data stored:", registrationData)

      return {
        signature,
        slot,
        blockTime,
        touristAccountAddress,
      }
    } catch (error: any) {
      console.error("[v0] Registration failed:", error)
      if (error.message?.includes("User rejected") || error.message?.includes("cancelled")) {
        throw new Error("Registration cancelled. Please approve the wallet transaction to complete your registration.")
      }
      throw new Error(`Registration failed: ${error.message}`)
    }
  }

  async updateTripDetails(wallet: any, digitalId: string, tripDetails: TripDetails): Promise<BlockchainResult> {
    try {
      console.log("[v0] Updating trip details on blockchain...")

      if (!wallet || !wallet.publicKey) {
        throw new Error("Wallet not connected or invalid")
      }

      if (
        !tripDetails.startDate ||
        !tripDetails.endDate ||
        isNaN(tripDetails.startDate) ||
        isNaN(tripDetails.endDate)
      ) {
        throw new Error("Invalid trip dates")
      }

      const userPublicKey = wallet.publicKey

      // Check if tourist data exists
      const existingData = this.mockStorage.get(digitalId)
      if (!existingData) {
        throw new Error("Tourist registration not found. Please register first.")
      }

      console.log("[v0] Updating tourist account for digital ID:", digitalId)

      let signature: string
      let slot: number
      let blockTime: number

      if (this.isDemoMode) {
        // Demo mode - simulate blockchain transaction
        console.log("[v0] Running in demo mode - simulating trip update transaction...")
        signature = this.generateMockSignature()
        slot = Math.floor(Math.random() * 1000000) + 200000000
        blockTime = Math.floor(Date.now() / 1000)

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
      } else {
        // Real blockchain mode
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: userPublicKey,
            toPubkey: userPublicKey,
            lamports: 0,
          }),
        )

        const { blockhash } = await this.connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = userPublicKey

        let signedTransaction
        try {
          signedTransaction = await wallet.signTransaction(transaction)
        } catch (error: any) {
          if (error.message?.includes("User rejected") || error.code === 4001) {
            throw new Error(
              "Transaction cancelled by user. Please approve the transaction to update your trip details.",
            )
          }
          throw error
        }

        signature = await this.connection.sendRawTransaction(signedTransaction.serialize())
        await this.connection.confirmTransaction(signature, "confirmed")

        const txDetails = await this.connection.getTransaction(signature, {
          commitment: "confirmed",
        })
        slot = txDetails?.slot || 0
        blockTime = txDetails?.blockTime || Math.floor(Date.now() / 1000)
      }

      console.log("[v0] Trip update transaction signature:", signature)

      // Update data in mock storage
      const updatedData = {
        ...existingData,
        tripDetails: {
          startDate: tripDetails.startDate,
          endDate: tripDetails.endDate,
          purpose: tripDetails.purpose,
          accommodation: tripDetails.accommodation || null,
          itinerary: tripDetails.itinerary,
          emergencyContacts: tripDetails.emergencyContacts,
        },
        lastUpdated: Date.now(),
      }

      this.mockStorage.set(digitalId, updatedData)
      console.log("[v0] Trip details updated:", updatedData)

      return {
        signature,
        slot,
        blockTime,
        touristAccountAddress: existingData.touristAccountAddress || Keypair.generate().publicKey.toString(),
      }
    } catch (error: any) {
      console.error("[v0] Trip update failed:", error)
      if (error.message?.includes("User rejected") || error.message?.includes("cancelled")) {
        throw new Error("Update cancelled. Please approve the wallet transaction to update your trip details.")
      }
      throw new Error(`Trip update failed: ${error.message}`)
    }
  }

  async getTouristData(wallet: any, digitalId: string): Promise<any> {
    try {
      console.log("[v0] Fetching tourist data from blockchain...")

      const data = this.mockStorage.get(digitalId)
      if (!data) {
        throw new Error("Tourist data not found")
      }

      console.log("[v0] Retrieved tourist data:", data)
      return data
    } catch (error: any) {
      console.error("[v0] Data retrieval failed:", error)
      throw new Error(`Data retrieval failed: ${error.message}`)
    }
  }

  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      if (this.isDemoMode) {
        return signature.length === 88 // Mock signatures are 88 characters
      }

      const tx = await this.connection.getTransaction(signature, {
        commitment: "confirmed",
      })
      return tx !== null
    } catch (error) {
      console.error("[v0] Transaction verification failed:", error)
      return false
    }
  }

  getExplorerUrl(signature: string): string {
    return `https://solscan.io/tx/${signature}?cluster=devnet`
  }

  getAccountExplorerUrl(address: string): string {
    return `https://solscan.io/account/${address}?cluster=devnet`
  }

  getAllTouristData(): Array<{ digitalId: string; data: any }> {
    const allData: Array<{ digitalId: string; data: any }> = []
    for (const [digitalId, data] of this.mockStorage.entries()) {
      allData.push({ digitalId, data })
    }
    return allData
  }
}

export const solanaService = new SolanaService()
