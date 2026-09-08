"use client"

import type React from "react"
import { useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  AlertCircle,
  Plus,
  X,
  Shield,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { useBlockchainTransaction } from "@/hooks/use-blockchain-transaction"

interface TripDetailsFormProps {
  onSubmit: (tripDetails: any) => void
  onBack: () => void
  userInfo?: any // Contains blockchain data from previous step
}

interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

// Zod schemas
const phoneRegex = /^\+91\s?[6-9]\d{4}\s?\d{5}$/

const emergencyContactSchema = z.object({
  name: z.string().min(1, "All fields are required for this contact"),
  relationship: z.string().min(1, "All fields are required for this contact"),
  phone: z.string().regex(phoneRegex, "Phone number must be valid (+91 XXXXX XXXXX)"),
})

const tripDetailsSchema = z
  .object({
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => new Date(val) >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: "Start date cannot be in the past",
      }),
    endDate: z.string().min(1, "End date is required"),
    itinerary: z.string().min(1, "Trip itinerary is required"),
    purpose: z.string().min(1, "Purpose of visit is required"),
    accommodation: z.string().optional(),
    emergencyContacts: z.array(emergencyContactSchema).min(1, "At least one valid emergency contact is required"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  })

export function TripDetailsForm({ onSubmit, onBack, userInfo }: TripDetailsFormProps) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    itinerary: "",
    purpose: "",
    accommodation: "",
    emergencyContacts: [{ name: "", relationship: "", phone: "" }] as EmergencyContact[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    isLoading: isSubmittingToBlockchain,
    error: blockchainError,
    result: blockchainResult,
    isSuccess: blockchainSuccess,
    updateTripDetails,
    getExplorerUrl,
    resetState,
  } = useBlockchainTransaction()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = tripDetailsSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = err.path.join("_")
        fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    resetState()

    if (userInfo?.blockchainData?.digitalId) {
      try {
        const tripDetails = {
          startDate: new Date(formData.startDate).getTime(),
          endDate: new Date(formData.endDate).getTime(),
          purpose: formData.purpose,
          accommodation: formData.accommodation || undefined,
          itinerary: formData.itinerary,
          emergencyContacts: formData.emergencyContacts,
        }

        console.log("[v0] Submitting trip details to blockchain:", tripDetails)
        const result = await updateTripDetails(userInfo.blockchainData.digitalId, tripDetails)

        if (result) {
          // Wait a moment to show success, then proceed
          setTimeout(() => {
            onSubmit({
              ...formData,
              blockchainTripData: {
                transactionSignature: result.signature,
                slot: result.slot,
                blockTime: result.blockTime,
                touristAccountAddress: result.touristAccountAddress,
              },
            })
          }, 2000)
        }
      } catch (error: any) {
        console.error("[v0] Trip details blockchain submission failed:", error)
      }
    } else {
      // Fallback to regular submission if no blockchain data
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const addEmergencyContact = () => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: "", relationship: "", phone: "" }],
    }))
  }

  const removeEmergencyContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index),
    }))
  }

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact,
      ),
    }))
    const key = `emergencyContacts_${index}_${field}`
    if (errors[key] || errors.emergencyContacts) {
      setErrors((prev) => ({ ...prev, [key]: "", emergencyContacts: "" }))
    }
  }

  const getTripDuration = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }
    return 0
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <Card className="w-full max-w-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Trip Details & Emergency Contacts</CardTitle>
          <p className="text-sm text-muted-foreground">
            Help us keep you safe by providing your travel plans and emergency contacts
          </p>

          {userInfo?.blockchainData && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Personal Data Secured on Blockchain
                </span>
              </div>
              <div className="text-xs text-green-700 dark:text-green-300 mt-1">
                Digital ID: {userInfo.blockchainData.digitalId?.slice(0, 16)}...
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {blockchainError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{blockchainError}</AlertDescription>
            </Alert>
          )}

          {blockchainSuccess && blockchainResult && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <div className="space-y-2">
                  <p>Trip details successfully stored on blockchain!</p>
                  <div className="flex items-center space-x-2 text-xs">
                    <span>Transaction:</span>
                    <a
                      href={getExplorerUrl(blockchainResult.signature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline inline-flex items-center"
                    >
                      {blockchainResult.signature.slice(0, 8)}...
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 animate-in fade-in-0 slide-in-from-top-4 duration-500 delay-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Time-Bound Digital Tourist ID</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Your Digital Tourist ID will be valid only for the duration of your visit. The system will
                  automatically deactivate monitoring after your trip ends.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Trip Duration */}
            <div className="space-y-5">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Trip Duration</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className={`h-11 rounded-lg border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${errors.startDate ? "border-red-500" : ""}`}
                  />
                  {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    className={`h-11 rounded-lg border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${errors.endDate ? "border-red-500" : ""}`}
                  />
                  {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                </div>
              </div>

              {getTripDuration() > 0 && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span>Trip duration: {getTripDuration()} days</span>
                </div>
              )}
            </div>

            {/* Purpose of Visit */}
            <div className="space-y-3">
              <Label htmlFor="purpose" className="text-sm font-medium">
                Purpose of Visit
              </Label>
              <Input
                id="purpose"
                placeholder="e.g., Tourism, Business, Family visit"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                className={`h-11 rounded-lg border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${errors.purpose ? "border-red-500" : ""}`}
              />
              {errors.purpose && <p className="text-xs text-red-500 mt-1">{errors.purpose}</p>}
            </div>

            {/* Accommodation */}
            <div className="space-y-3">
              <Label htmlFor="accommodation" className="text-sm font-medium">
                Accommodation Details (Optional)
              </Label>
              <Input
                id="accommodation"
                placeholder="Hotel name, address, or contact details"
                value={formData.accommodation}
                onChange={(e) => handleInputChange("accommodation", e.target.value)}
                className="h-11 rounded-lg border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </div>

            {/* Trip Itinerary */}
            <div className="space-y-3">
              <Label htmlFor="itinerary" className="text-sm font-medium">
                Trip Itinerary
              </Label>
              <Textarea
                id="itinerary"
                placeholder="Describe your planned activities, places to visit, and daily schedule..."
                value={formData.itinerary}
                onChange={(e) => handleInputChange("itinerary", e.target.value)}
                className={`min-h-24 rounded-lg border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${errors.itinerary ? "border-red-500" : ""}`}
              />
              {errors.itinerary && <p className="text-xs text-red-500 mt-1">{errors.itinerary}</p>}
              <p className="text-xs text-muted-foreground">
                This helps authorities locate you quickly in case of emergencies
              </p>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Emergency Contacts</Label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmergencyContact}
                  className="hover:scale-105 transition-all duration-200 bg-transparent rounded-lg"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Contact
                </Button>
              </div>

              {errors.emergencyContacts && <p className="text-xs text-red-500">{errors.emergencyContacts}</p>}

              <div className="space-y-4">
                {formData.emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="p-5 border-2 border-border rounded-xl space-y-4 animate-in fade-in-0 slide-in-from-left-4 duration-300 hover:shadow-md transition-shadow"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="px-3 py-1">
                        Contact {index + 1}
                      </Badge>
                      {formData.emergencyContacts.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmergencyContact(index)}
                          className="hover:scale-105 transition-all duration-200 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Full Name</Label>
                        <Input
                          placeholder="Contact name"
                          value={contact.name}
                          onChange={(e) => updateEmergencyContact(index, "name", e.target.value)}
                          className="h-10 rounded-lg border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                        {errors[`emergencyContacts_${index}_name`] && (
                          <p className="text-xs text-red-500">{errors[`emergencyContacts_${index}_name`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Relationship</Label>
                        <Input
                          placeholder="e.g., Spouse, Parent, Friend"
                          value={contact.relationship}
                          onChange={(e) => updateEmergencyContact(index, "relationship", e.target.value)}
                          className="h-10 rounded-lg border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Phone Number</Label>
                        <Input
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={contact.phone}
                          onChange={(e) => updateEmergencyContact(index, "phone", e.target.value)}
                          className="h-10 rounded-lg border-2 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                        {errors[`emergencyContacts_${index}_phone`] && (
                          <p className="text-xs text-red-500">{errors[`emergencyContacts_${index}_phone`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmittingToBlockchain}
                className="flex-1 h-12 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 bg-transparent border-2"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingToBlockchain}
                className="flex-1 h-12 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
              >
                {isSubmittingToBlockchain ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Storing on Blockchain...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
