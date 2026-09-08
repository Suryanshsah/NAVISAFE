import * as anchor from "@coral-xyz/anchor"
import type { Program } from "@coral-xyz/anchor"
import type { NavisafeTouristRegistry } from "../target/types/navisafe_tourist_registry"
import { expect } from "chai"
import { describe, before, it } from "mocha"

describe("navisafe-tourist-registry", () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const program = anchor.workspace.NavisafeTouristRegistry as Program<NavisafeTouristRegistry>
  const user = provider.wallet as anchor.Wallet

  let touristAccountPda: anchor.web3.PublicKey
  let bump: number
  const digitalId = "NVS-TEST-123456789"

  before(async () => {
    // Derive the PDA for the tourist account
    ;[touristAccountPda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("tourist"), user.publicKey.toBuffer(), Buffer.from(digitalId)],
      program.programId,
    )
  })

  it("Registers a new tourist", async () => {
    const name = "John Doe"
    const gender = "male"
    const age = 30
    const idNumberHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456" // Mock hash
    const phone = "+1234567890"
    const nationality = "United States"
    const email = "john.doe@example.com"
    const registrationTimestamp = Math.floor(Date.now() / 1000)

    const tx = await program.methods
      .registerTourist(
        digitalId,
        name,
        gender,
        age,
        idNumberHash,
        phone,
        nationality,
        email,
        new anchor.BN(registrationTimestamp),
      )
      .accounts({
        touristAccount: touristAccountPda,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    console.log("Registration transaction signature:", tx)

    // Fetch the account and verify data
    const touristAccount = await program.account.touristAccount.fetch(touristAccountPda)

    expect(touristAccount.digitalId).to.equal(digitalId)
    expect(touristAccount.name).to.equal(name)
    expect(touristAccount.gender).to.equal(gender)
    expect(touristAccount.age).to.equal(age)
    expect(touristAccount.nationality).to.equal(nationality)
    expect(touristAccount.phone).to.equal(phone)
    expect(touristAccount.email).to.equal(email)
    expect(touristAccount.isActive).to.be.true
    expect(touristAccount.authority.toString()).to.equal(user.publicKey.toString())
  })

  it("Updates trip details", async () => {
    const startDate = Math.floor(Date.now() / 1000) + 86400 // Tomorrow
    const endDate = startDate + 7 * 86400 // One week later
    const purpose = "Tourism"
    const accommodation = "Hotel ABC, 123 Main St"
    const itinerary = "Day 1: Arrival, Day 2: City tour, Day 3: Museum visits"
    const emergencyContacts = [
      {
        name: "Jane Doe",
        relationship: "Spouse",
        phone: "+1234567891",
      },
    ]

    const tx = await program.methods
      .updateTripDetails(
        new anchor.BN(startDate),
        new anchor.BN(endDate),
        purpose,
        accommodation,
        itinerary,
        emergencyContacts,
      )
      .accounts({
        touristAccount: touristAccountPda,
        user: user.publicKey,
      })
      .rpc()

    console.log("Trip update transaction signature:", tx)

    // Fetch the account and verify trip data
    const touristAccount = await program.account.touristAccount.fetch(touristAccountPda)

    expect(touristAccount.tripStartDate.toNumber()).to.equal(startDate)
    expect(touristAccount.tripEndDate.toNumber()).to.equal(endDate)
    expect(touristAccount.purpose).to.equal(purpose)
    expect(touristAccount.accommodation).to.equal(accommodation)
    expect(touristAccount.itinerary).to.equal(itinerary)
    expect(touristAccount.emergencyContacts).to.have.length(1)
    expect(touristAccount.emergencyContacts[0].name).to.equal("Jane Doe")
  })

  it("Retrieves tourist data", async () => {
    const tx = await program.methods
      .getTouristData()
      .accounts({
        touristAccount: touristAccountPda,
      })
      .rpc()

    console.log("Data retrieval transaction signature:", tx)
  })

  it("Deactivates tourist account", async () => {
    const tx = await program.methods
      .deactivateTourist()
      .accounts({
        touristAccount: touristAccountPda,
        user: user.publicKey,
      })
      .rpc()

    console.log("Deactivation transaction signature:", tx)

    // Fetch the account and verify deactivation
    const touristAccount = await program.account.touristAccount.fetch(touristAccountPda)
    expect(touristAccount.isActive).to.be.false
    expect(touristAccount.deactivationTimestamp).to.not.be.null
  })
})
