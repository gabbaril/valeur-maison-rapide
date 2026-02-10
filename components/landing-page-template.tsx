"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Star, Loader2 } from "lucide-react"
import AddressAutocomplete from "@/components/address-autocomplete"
import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { HowItWorksSection, WhyDifferentSection, NetworkMapSection, FAQSection, FinalCTASection, Footer, type LandingMapVariant } from "@/components/landing-sections"
import { LANDING_IMAGES, type LandingImageVariant } from "@/lib/landing-images"

interface LandingPageTemplateProps {
  heroTitle?: string
  addressPlaceholder?: string
  mapVariant?: LandingMapVariant
  mapText?: string
  imageVariant?: LandingImageVariant
  showMerci?: boolean
}

export function LandingPageTemplate({
  heroTitle = "Vous pensez vendre en 2026 ou dans les prochains mois ?",
  addressPlaceholder = "123 Rue Exemple, Trois-Rivières",
  mapVariant = "default",
  mapText = "plusieurs régions du Québec",
  imageVariant = "default",
  showMerci = false,
}: LandingPageTemplateProps) {
  const images = LANDING_IMAGES[imageVariant]
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "",
    intention: "",
    consent_contact: false
  })
  const [trackingData, setTrackingData] = useState({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    referrer: "",
  })
  const [showEstimateModal, setShowEstimateModal] = useState(false)
  const [estimatePhase, setEstimatePhase] = useState<"loading" | "done">("loading")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [phoneError, setPhoneError] = useState("")

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const storedUtm = localStorage.getItem("vmar_utm")

    let utmData = {
      utm_source: urlParams.get("utm_source") || "",
      utm_medium: urlParams.get("utm_medium") || "",
      utm_campaign: urlParams.get("utm_campaign") || "",
      utm_content: urlParams.get("utm_content") || "",
      utm_term: urlParams.get("utm_term") || "",
      referrer: document.referrer || "",
    }

    // If no new UTM params, try to load from localStorage
    if (!utmData.utm_source && storedUtm) {
      try {
        const parsed = JSON.parse(storedUtm)
        utmData = { ...utmData, ...parsed }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Save to localStorage if we have UTM data
    if (utmData.utm_source || utmData.utm_medium || utmData.utm_campaign) {
      localStorage.setItem("vmar_utm", JSON.stringify(utmData))
    }

    setTrackingData(utmData)
  }, [])

  const scrollToForm = () => {
    document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Show modal with loading phase
    setEstimatePhase("loading")
    setShowEstimateModal(true)

    await new Promise((resolve) => setTimeout(resolve, 1600))

    // Switch to done phase
    setEstimatePhase("done")

    await new Promise((resolve) => setTimeout(resolve, 2400))

    // Close modal and go to step 2
    setShowEstimateModal(false)
    setFormStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const phoneDigits = formData.phone.replace(/\D/g, "")
    if (phoneDigits.length !== 10) {
      setPhoneError("Le numéro de téléphone doit contenir 10 chiffres (ex: 819-123-1234)")
      return
    }
    setPhoneError("")

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    const payload = {
      fullName: formData.firstName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      propertyType: formData.propertyType,
      intention: formData.intention,
      consent_contact: formData.consent_contact,
      utm_source: trackingData.utm_source,
      utm_medium: trackingData.utm_medium,
      utm_campaign: trackingData.utm_campaign,
      utm_content: trackingData.utm_content,
      utm_term: trackingData.utm_term,
      referrer: trackingData.referrer,
    }

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const result = await res.json()
        const errorMsg = result.error || "Erreur lors de l'enregistrement"
        alert(`Erreur: ${errorMsg}`)
        setIsSubmitting(false)
        return
      }

      const result = await res.json()

      if (!result.ok) {
        const errorMsg = result.error || "Erreur lors de l'enregistrement"
        alert(`Erreur: ${errorMsg}`)
        setIsSubmitting(false)
        return
      }

      setSubmitSuccess(true)
      router.push(`${pathname}/merci`)
    } catch (error: any) {
      alert(`Une erreur est survenue: ${error.message}`)
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Dialog open={showEstimateModal} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md border-0 shadow-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center py-8 px-4">
            {estimatePhase === "loading" ? (
              <>
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                <p className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Localisation de votre propriété en cours
                </p>
                <p className="text-sm text-gray-600 text-center">
                  Nous avons identifié votre propriété à l'aide des données satellitaires et cadastrales disponibles
                  pour votre secteur.
                </p>
              </>
            ) : (
              <>
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
                <p className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Calcul de la valeur marchande estimée en cours
                </p>
                <p className="text-sm text-gray-600 text-center">
                  Nous analysons actuellement les ventes récentes et les propriétés comparables dans votre secteur afin
                  d'établir une estimation préliminaire de la valeur marchande de votre propriété.
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <section
        className="relative px-4 py-10 sm:py-12 md:py-16 md:px-6 lg:py-24 lg:px-8 bg-cover bg-center bg-no-repeat min-h-[600px] sm:min-h-[700px]"
        id="form-section"
        style={{
          backgroundImage: `url('${images.heroBackground}')`,
        }}
      >
        <div className="absolute inset-0 bg-white/75"></div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 shadow-xl">
            {/* Left column - Content */}
            <div className={`order-2 lg:order-1 ${formStep === 2 ? "lg:-mt-16" : ""}`}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black text-balance leading-snug sm:leading-tight mb-4 md:mb-6 text-center lg:text-center">
                {heroTitle}
              </h1>
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                <li>
                  <p className="text-base sm:text-lg text-gray-600 font-medium text-center lg:text-center">
                    Évaluation gratuite • Données locales • Sans engagement
                  </p>
                </li>
                <li>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-center lg:text-center">
                    {"En 2026, une estimation approximative\npeut vous faire perdre des milliers de dollars. "}
                  </p>
                </li>
              </ul>

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-red-600" />
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed text-center lg:text-left">
                    Analyse basée sur les ventes comparables de votre secteur précis
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-red-600" />
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    Validation humaine effectuée par un expert immobilier local
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-red-600" />
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    100% confidentiel, sans obligation
                  </p>
                </div>
              </div>

              <div className="mt-6 md:mt-8 flex flex-col items-center lg:items-start justify-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">4.9</span>
                  <div className="flex gap-0.5 sm:gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Basé sur 175+ avis</p>
                <div className="flex gap-1.5 sm:gap-2">
                  {[
                    { initials: "VG", bg: "bg-green-200" },
                    { initials: "BS", bg: "bg-yellow-200" },
                    { initials: "PV", bg: "bg-red-200" },
                    { initials: "DR", bg: "bg-purple-200" },
                    { initials: "SM", bg: "bg-green-200" },
                  ].map((user, index) => (
                    <div
                      key={index}
                      className={`flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full ${user.bg} text-xs sm:text-sm font-semibold text-gray-800`}
                    >
                      {user.initials}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - 2-Step Form */}
            {showMerci ? (
              <div className="order-1 lg:order-2 w-full max-w-xl mx-auto lg:max-w-none">
                <Card className="border-gray-200 bg-white shadow-xl">
                  <CardContent className="p-4 sm:p-6 md:p-8">
                    <div className="text-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8">
                      {/* Check icon */}
                      <div className="mx-auto mb-4 md:mb-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-green-600" />
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Merci !</h2>

                      {/* Main text */}
                      <p className="text-gray-700 text-base sm:text-lg mb-3 md:mb-4">
                        Votre demande a été envoyée avec succès.
                      </p>

                      {/* Secondary text */}
                      <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-3 md:mb-4">
                        Un professionnel immobilier local analyse actuellement votre demande afin d'établir une évaluation
                        marchande la plus précise possible.
                      </p>

                      {/* Complementary text */}
                      <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                        Si des informations supplémentaires sont nécessaires, vous serez contacté dans les prochaines 24 à
                        48 heures.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
            <div className="order-1 lg:order-2 w-full max-w-xl mx-auto lg:max-w-none">
              <Card className="border-gray-200 bg-white shadow-xl">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black mb-2 text-center">
                    {formStep === 1
                      ? "Complétez le formulaire en quelques secondes pour obtenir votre valeur"
                      : "Votre estimation est en cours de finalisation"}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 md:mb-6 text-center">
                    {formStep === 1
                      ? "Vous vous demandez combien vaut votre propriété aujourd'hui ? Notre estimation gratuite en ligne vous permet d'obtenir une évaluation marchande réaliste, rapidement et sans engagement."
                      : "Nous avons analysé les propriétés similaires dans votre secteur afin d'établir une estimation préliminaire de la valeur de votre propriété. Il ne reste que quelques informations à confirmer pour compléter l'analyse."}
                  </p>

                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`h-2 flex-1 max-w-[80px] sm:max-w-[100px] rounded-full transition-colors ${
                          formStep >= 1 ? "bg-red-600" : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`h-2 flex-1 max-w-[80px] sm:max-w-[100px] rounded-full transition-colors ${
                          formStep >= 2 ? "bg-red-600" : "bg-gray-200"
                        }`}
                      />
                    </div>
                    <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">Étape {formStep} sur 2</p>
                  </div>

                  {submitSuccess ? (
                    <div className="text-center py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8">
                      {/* Check icon */}
                      <div className="mx-auto mb-4 md:mb-6 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-green-600" />
                      </div>

                      {/* Title */}
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Merci !</h2>

                      {/* Main text */}
                      <p className="text-gray-700 text-base sm:text-lg mb-3 md:mb-4">
                        Votre demande a été envoyée avec succès.
                      </p>

                      {/* Secondary text */}
                      <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                        Un professionnel local analysera votre demande afin d'établir une évaluation marchande la plus
                        précise possible.
                        <br />
                        <br />
                        Si des informations supplémentaires sont nécessaires, vous serez contacté dans les prochaines 24
                        à 48 heures.
                      </p>
                    </div>
                  ) : (
                    <>
                      {formStep === 1 && (
                        <form onSubmit={handleStep1Submit} className="space-y-4 max-w-md mx-auto w-full">
                          <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                              Adresse de la propriété *
                            </label>
                            <AddressAutocomplete
                              id="address"
                              name="address"
                              required
                              value={formData.address}
                              onChange={(value) => setFormData({ ...formData, address: value })}
                              placeholder={addressPlaceholder}
                              className="w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                              Type de propriété *
                            </label>
                            <select
                              id="propertyType"
                              name="propertyType"
                              required
                              value={formData.propertyType}
                              onChange={handleChange}
                              className="w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-sm sm:text-base"
                            >
                              <option value="">Sélectionnez...</option>
                              <option value="unifamiliale">Unifamiliale</option>
                              <option value="condo">Condo</option>
                              <option value="immeuble-revenus-4-et-moins">Immeubles à revenus (4 logements et -)</option>
                              <option value="immeuble-revenus-5-et-plus">Immeubles à revenus (5 logements et +)</option>
                              <option value="chalet">Chalet</option>
                              <option value="terrain">Terrain</option>
                              <option value="autre">Autre</option>
                            </select>
                          </div>

                          <Button
                            type="submit"
                            className="w-full hover:bg-red-600 text-white font-semibold py-5 sm:py-6 text-base sm:text-lg rounded-lg bg-red-600 mt-4 sm:mt-6 min-h-[44px]"
                          >
                            Voir mon estimation →
                          </Button>

                          <p className="text-xs text-gray-500 text-center">
                            {"Gratuit • Sans engagement • 100 % confidentiel"}
                          </p>
                        </form>
                      )}

                      {formStep === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 max-w-md mx-auto w-full">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                              Nom complet *
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              required
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="Jean Tremblay"
                              className="w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                              Téléphone *
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              required
                              value={formData.phone}
                              onChange={(e) => {
                                handleChange(e)
                                setPhoneError("") // Clear error on change
                              }}
                              placeholder="(819) 555-1234"
                              className={`w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm sm:text-base ${phoneError ? "border-red-500" : "border-gray-300"}`}
                            />
                            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                              Courriel *
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              required
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="jean@exemple.com"
                              className="w-full min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm sm:text-base"
                            />
                          </div>

                          <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                              Quelle est votre intention actuellement ?
                            </label>
                            <div className="space-y-2">
                              {[
                
                                "Évaluer mes options pour 2026–2027",
                                "Vente possible dans les prochains mois",
                                "Déjà en réflexion active pour vendre",
                                "Autre / Je ne sais pas encore",
                              ].map((option) => (
                                <label
                                  key={option}
                                  className={`flex items-center p-3 sm:p-3 border rounded-lg cursor-pointer transition-all min-h-[44px] ${
                                    formData.intention === option
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-200 hover:border-gray-300 active:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="intention"
                                    value={option}
                                    checked={formData.intention === option}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 flex-shrink-0"
                                  />
                                  <span className="ml-3 text-xs sm:text-sm text-gray-700">{option}</span>
                                </label>
                              ))}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                              Cette information nous permet d'adapter l'analyse et le niveau de suivi. Aucune pression.
                            </p>
                          </div>

                          {/* Consentement */}
                          <div className="p-4 border-gray-200">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.consent_contact}
                                onChange={(e) => setFormData((prev) => ({ ...prev, consent_contact: e.target.checked }))}
                                className="mt-1 h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                                required
                              />
                              <span className="text-sm text-gray-700">
                                J'accepte que ValeurMaisonRapide ou un expert local me contacte afin de donner suite à ma demande d’évaluation.
                              </span>
                            </label>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                            <Button
                              type="button"
                              onClick={() => setFormStep(1)}
                              variant="outline"
                              className="w-full sm:w-auto sm:flex-1 py-5 sm:py-6 text-sm sm:text-base border-gray-300 order-2 sm:order-1 min-h-[44px]"
                            >
                              ← Retour
                            </Button>
                            <Button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full sm:w-auto sm:flex-[2] hover:bg-red-700 text-white font-semibold py-5 sm:py-6 text-sm sm:text-base rounded-lg bg-red-600 order-1 sm:order-2 min-h-[44px]"
                            >
                              {isSubmitting ? "Envoi en cours..." : "Obtenir mon évaluation gratuite"}
                            </Button>
                          </div>

                          <p className="text-xs text-muted-foreground text-center mt-2 sm:mt-3 leading-relaxed">
                            Vos informations demeurent confidentielles.
                          </p>
                        </form>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            )}
          </div>
        </div>
      </section>
      <HowItWorksSection
        scrollToForm={scrollToForm}
        subheadingText="Simple, rapide et sans engagement"
        ctaText="Découvrir la valeur réelle de ma propriété"
        imageSrc={images.howItWorksImage}
      />
      <WhyDifferentSection scrollToForm={scrollToForm} ctaText="Découvrir la valeur réelle de ma propriété" />
      <NetworkMapSection mapVariant={mapVariant} mapText={mapText} />
      <FAQSection />
      <FinalCTASection scrollToForm={scrollToForm} ctaText="Obtenir mon évaluation gratuite" />
      <Footer />
    </div>
  )
}
