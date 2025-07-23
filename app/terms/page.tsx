"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function TermsPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/login">
              <Button variant="outline" className="mb-4 bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("terms.backToLogin")}
              </Button>
            </Link>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {t("terms.title")}
              </h1>
              <p className="text-gray-600">{t("terms.lastUpdated")}</p>
            </div>
          </div>

          <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing and using Keele Seiklus (Estonian Learning Platform), you accept and agree to be bound
                    by the terms and provision of this agreement.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">2. Use License</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Permission is granted to temporarily download one copy of the materials on Keele Seiklus for
                    personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of
                    title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li>modify or copy the materials</li>
                    <li>use the materials for any commercial purpose or for any public display</li>
                    <li>attempt to reverse engineer any software contained on the website</li>
                    <li>remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">3. User Accounts</h3>
                  <p className="text-gray-700 leading-relaxed">
                    When you create an account with us, you must provide information that is accurate, complete, and
                    current at all times. You are responsible for safeguarding the password and for all activities that
                    occur under your account.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">4. Payment Terms</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Some parts of the service are billed on a subscription basis. You will be billed in advance on a
                    recurring and periodic basis. Billing cycles are set on a monthly or yearly basis, depending on the
                    type of subscription plan you select.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">5. Content</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our service allows you to post, link, store, share and otherwise make available certain information,
                    text, graphics, videos, or other material. You are responsible for the content that you post to the
                    service.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">6. Privacy Policy</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of
                    the service, to understand our practices.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">7. Termination</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We may terminate or suspend your account and bar access to the service immediately, without prior
                    notice or liability, under our sole discretion, for any reason whatsoever and without limitation.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">8. Disclaimer</h3>
                  <p className="text-gray-700 leading-relaxed">
                    The information on this website is provided on an "as is" basis. To the fullest extent permitted by
                    law, this company excludes all representations, warranties, conditions and terms.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">9. Limitations</h3>
                  <p className="text-gray-700 leading-relaxed">
                    In no event shall Keele Seiklus or its suppliers be liable for any damages (including, without
                    limitation, damages for loss of data or profit, or due to business interruption) arising out of the
                    use or inability to use the materials on the website.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">10. Governing Law</h3>
                  <p className="text-gray-700 leading-relaxed">
                    These terms and conditions are governed by and construed in accordance with the laws of Estonia and
                    you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">11. Changes to Terms</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or replace these terms at any time. If a
                    revision is material, we will try to provide at least 30 days notice prior to any new terms taking
                    effect.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold mb-3">12. Contact Information</h3>
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at
                    support@keeleseiklus.com.
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("terms.returnToLogin")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
