"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function PrivacyPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/login">
              <Button variant="outline" className="mb-4 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("privacy.backToLogin")}
              </Button>
            </Link>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {t("privacy.title")}
              </h1>
              <p className="text-gray-600">{t("privacy.lastUpdated")}</p>
            </div>
          </div>

          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We collect information you provide directly to us, such as when you create an account, use our
                    services, or contact us for support. This may include:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>Name and email address</li>
                    <li>Learning progress and preferences</li>
                    <li>Payment information (processed securely by third-party providers)</li>
                    <li>Communications with our support team</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
                  <p className="text-gray-700 leading-relaxed">We use the information we collect to:</p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Personalize your learning experience</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. Information Sharing</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We do not sell, trade, or otherwise transfer your personal information to third parties except as
                    described in this policy. We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>With service providers who assist us in operating our platform</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>With your consent</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Data Security</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We implement appropriate technical and organizational measures to protect your personal information
                    against unauthorized access, alteration, disclosure, or destruction. However, no method of
                    transmission over the internet is 100% secure.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Data Retention</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We retain your personal information for as long as necessary to provide our services and fulfill the
                    purposes outlined in this policy, unless a longer retention period is required by law.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">6. Your Rights</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Depending on your location, you may have certain rights regarding your personal information,
                    including:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>Access to your personal information</li>
                    <li>Correction of inaccurate information</li>
                    <li>Deletion of your personal information</li>
                    <li>Portability of your data</li>
                    <li>Objection to processing</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies and similar tracking technologies to collect information about your browsing
                    activities and to provide personalized content and advertisements. You can control cookies through
                    your browser settings.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">8. Children's Privacy</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our services are not intended for children under 13 years of age. We do not knowingly collect
                    personal information from children under 13. If we become aware that we have collected such
                    information, we will take steps to delete it.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">9. International Transfers</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Your information may be transferred to and processed in countries other than your own. We ensure
                    appropriate safeguards are in place to protect your information in accordance with this policy.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">10. Changes to This Policy</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this privacy policy from time to time. We will notify you of any changes by posting
                    the new policy on this page and updating the "last updated" date.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">11. Contact Us</h3>
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions about this privacy policy or our privacy practices, please contact us at
                    privacy@keeleseiklus.com.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("privacy.returnToLogin")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
