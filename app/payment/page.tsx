"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CreditCard, Shield, Check, Crown, Star } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"

interface PaymentPlan {
  id: string
  name: string
  price: number
  originalPrice?: number
  duration: string
  features: string[]
  popular?: boolean
  savings?: string
}

const paymentPlans: PaymentPlan[] = [
  {
    id: "monthly",
    name: "Monthly Premium",
    price: 9.99,
    duration: "per month",
    features: [
      "Access to all 40 modules",
      "Unlimited quiz attempts",
      "Progress tracking",
      "Certificate upon completion",
      "Email support",
      "Mobile app access",
    ],
  },
  {
    id: "yearly",
    name: "Yearly Premium",
    price: 79.99,
    originalPrice: 119.88,
    duration: "per year",
    savings: "Save 33%",
    popular: true,
    features: [
      "Access to all 40 modules",
      "Unlimited quiz attempts",
      "Progress tracking",
      "Certificate upon completion",
      "Priority email support",
      "Mobile app access",
      "Bonus cultural content",
      "Advanced pronunciation tools",
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime Access",
    price: 199.99,
    originalPrice: 299.99,
    duration: "one-time payment",
    savings: "Best Value",
    features: [
      "Lifetime access to all modules",
      "All future content updates",
      "Unlimited quiz attempts",
      "Progress tracking",
      "Certificate upon completion",
      "Priority support",
      "Mobile app access",
      "Bonus cultural content",
      "Advanced pronunciation tools",
      "1-on-1 tutoring session",
    ],
  },
]

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState("yearly")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    email: "",
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { t } = useLanguage()

  const moduleId = searchParams.get("module")
  const returnUrl = searchParams.get("return") || "/modules"

  useEffect(() => {
    // Check if user is already premium
    const currentUser = localStorage.getItem("currentUser")
    if (currentUser) {
      const user = JSON.parse(currentUser)
      if (user.subscriptionStatus === "premium" || user.subscriptionStatus === "admin_override") {
        router.push(returnUrl)
      }
    }
  }, [router, returnUrl])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = t("payment.emailRequired")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("payment.validEmail")
    }

    if (paymentMethod === "card") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = t("payment.cardRequired")
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = t("payment.validCard")
      }

      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = t("payment.expiryRequired")
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = t("payment.validExpiry")
      }

      if (!formData.cvv.trim()) {
        newErrors.cvv = t("payment.cvvRequired")
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = t("payment.validCvv")
      }

      if (!formData.cardName.trim()) {
        newErrors.cardName = t("payment.nameRequired")
      }
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t("payment.mustAcceptTerms")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update user subscription status
      const currentUser = localStorage.getItem("currentUser")
      if (currentUser) {
        const user = JSON.parse(currentUser)
        const updatedUser = {
          ...user,
          subscription: "Premium",
          subscriptionStatus: "premium",
          subscriptionDate: new Date().toISOString().split("T")[0],
          subscriptionPlan: selectedPlan,
        }

        localStorage.setItem("currentUser", JSON.stringify(updatedUser))

        // Also update in admin students if exists
        const adminStudents = localStorage.getItem("adminStudents")
        if (adminStudents) {
          const students = JSON.parse(adminStudents)
          const updatedStudents = students.map((student: any) =>
            student.email === user.email
              ? {
                  ...student,
                  subscription: "Premium",
                  subscriptionStatus: "premium",
                  subscriptionDate: new Date().toISOString().split("T")[0],
                  subscriptionPlan: selectedPlan,
                }
              : student,
          )
          localStorage.setItem("adminStudents", JSON.stringify(updatedStudents))
        }
      }

      // Redirect to success page or back to modules
      if (moduleId) {
        router.push(`/modules/${moduleId}`)
      } else {
        router.push("/modules?payment=success")
      }
    } catch (error) {
      console.error("Payment processing error:", error)
      setErrors({ submit: t("payment.processingFailed") })
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedPlanData = paymentPlans.find((plan) => plan.id === selectedPlan)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={returnUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("payment.backToModules")}
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {t("payment.title")}
            </h1>
            <p className="text-gray-600 text-lg">{t("payment.subtitle")}</p>
            {moduleId && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                  <strong>
                    Module {moduleId} {t("payment.moduleRequiresPremium")}
                  </strong>{" "}
                  {t("payment.upgradeNow")}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("payment.choosePlan")}</CardTitle>
                <CardDescription>{t("payment.selectPlan")}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="space-y-4">
                  {paymentPlans.map((plan) => (
                    <div key={plan.id} className="relative">
                      <div
                        className={`border rounded-lg p-6 cursor-pointer transition-all ${
                          selectedPlan === plan.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${plan.popular ? "ring-2 ring-purple-500" : ""}`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-purple-600 text-white">
                              <Star className="w-3 h-3 mr-1" />
                              Most Popular
                            </Badge>
                          </div>
                        )}
                        {plan.savings && !plan.popular && (
                          <div className="absolute -top-3 right-4">
                            <Badge className="bg-green-600 text-white">{plan.savings}</Badge>
                          </div>
                        )}
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <Label htmlFor={plan.id} className="text-lg font-semibold cursor-pointer">
                                {plan.name}
                              </Label>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600">
                                  €{plan.price}
                                  <span className="text-sm font-normal text-gray-500 ml-1">{plan.duration}</span>
                                </div>
                                {plan.originalPrice && (
                                  <div className="text-sm text-gray-500 line-through">€{plan.originalPrice}</div>
                                )}
                              </div>
                            </div>
                            <ul className="space-y-2">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-sm text-gray-600">
                                  <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>{t("payment.paymentMethod")}</CardTitle>
                <CardDescription>{t("payment.choosePayment")}</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="cursor-pointer">
                      PayPal
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="email">{t("payment.emailAddress")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder={t("payment.emailPlaceholder")}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="cardNumber">{t("payment.cardNumber")}</Label>
                      <Input
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                        placeholder={t("payment.cardPlaceholder")}
                        maxLength={19}
                        className={errors.cardNumber ? "border-red-500" : ""}
                      />
                      {errors.cardNumber && <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">{t("payment.expiryDate")}</Label>
                        <Input
                          id="expiryDate"
                          value={formData.expiryDate}
                          onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
                          placeholder={t("payment.expiryPlaceholder")}
                          maxLength={5}
                          className={errors.expiryDate ? "border-red-500" : ""}
                        />
                        {errors.expiryDate && <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>}
                      </div>
                      <div>
                        <Label htmlFor="cvv">{t("payment.cvv")}</Label>
                        <Input
                          id="cvv"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                          placeholder={t("payment.cvvPlaceholder")}
                          maxLength={4}
                          className={errors.cvv ? "border-red-500" : ""}
                        />
                        {errors.cvv && <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cardName">{t("payment.cardholderName")}</Label>
                      <Input
                        id="cardName"
                        value={formData.cardName}
                        onChange={(e) => handleInputChange("cardName", e.target.value)}
                        placeholder={t("payment.cardholderPlaceholder")}
                        className={errors.cardName ? "border-red-500" : ""}
                      />
                      {errors.cardName && <p className="text-sm text-red-600 mt-1">{errors.cardName}</p>}
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div className="mt-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800">
                        You will be redirected to PayPal to complete your payment securely.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{t("payment.orderSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlanData && (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedPlanData.name}</p>
                        <p className="text-sm text-gray-500">{selectedPlanData.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">€{selectedPlanData.price}</p>
                        {selectedPlanData.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">€{selectedPlanData.originalPrice}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center font-bold text-lg">
                      <span>{t("payment.total")}</span>
                      <span className="text-purple-600">€{selectedPlanData.price}</span>
                    </div>

                    {selectedPlanData.savings && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm font-medium">
                          🎉 You're saving €{(selectedPlanData.originalPrice! - selectedPlanData.price).toFixed(2)}!
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={formData.acceptTerms}
                          onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                        />
                        <Label htmlFor="terms" className="text-sm cursor-pointer">
                          {t("payment.acceptTerms")}{" "}
                          <Link href="/terms" className="text-purple-600 hover:underline">
                            {t("payment.termsOfService")}
                          </Link>{" "}
                          {t("payment.and")}{" "}
                          <Link href="/privacy" className="text-purple-600 hover:underline">
                            {t("payment.privacyPolicy")}
                          </Link>
                        </Label>
                      </div>
                      {errors.acceptTerms && <p className="text-sm text-red-600">{errors.acceptTerms}</p>}
                    </div>

                    {errors.submit && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{errors.submit}</p>
                      </div>
                    )}

                    <Button
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t("payment.processing")}
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          {t("payment.completePayment")}
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        <Shield className="w-3 h-3 inline mr-1" />
                        {t("payment.securePayment")}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
