"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useCookieConsent } from "@/components/cookie-consent"

interface LandingSectionsProps {
  scrollToForm: () => void
  ctaText?: string
  subheadingText?: string
}

export function HowItWorksSection({ scrollToForm, ctaText, subheadingText }: LandingSectionsProps) {
  return (
    <section className="bg-gray-50 px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div>
            <span className="text-red-600 font-semibold text-sm sm:text-base mb-2 block">
              {subheadingText || "Gagnez du temps"}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 md:mb-6 text-balance leading-snug sm:leading-tight">
              Comment se déroule votre évaluation immobilière?
            </h2>
            <p className="text-gray-600 mb-6 md:mb-8 text-sm sm:text-base leading-relaxed">
              Obtenez une estimation fiable basée sur les données récentes du marché de votre secteur.
            </p>

            <div className="space-y-5 sm:space-y-6">
              {[
                {
                  title: "Entrez l'adresse de votre propriété",
                  description:
                    "Remplissez le court formulaire avec quelques informations de base. Ça prend moins d'une minute.",
                  icon: (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Analyse du marché local",
                  description:
                    "Notre équipe analyse les ventes comparables et les tendances du marché dans votre zone géographique.",
                  icon: (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  ),
                },
                {
                  title: "Recevez une estimation claire et réaliste",
                  description:
                    "Obtenez une valeur marchande fiable pour votre propriété, rapidement et sans obligation.",
                  icon: (
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
              ].map((step, index) => (
                <div key={index} className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-black text-base sm:text-lg">{step.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center lg:items-start">
              <Button
                onClick={scrollToForm}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-5 sm:py-6 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all px-6 sm:px-10 lg:px-16 min-h-[44px] my-[41px]"
                size="lg"
              >
                {ctaText || "Découvrir la valeur de ma propriété"}
              </Button>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center lg:text-left px-4 sm:px-0 mb-0 sm:mt-[-29px]">
                Gratuit • Sans engagement • 100 % confidentiel
              </p>
            </div>
          </div>

          {/* Right column - Image */}
          <div className="relative order-first lg:order-last">
            <img
              src="/images/william-20barry-2050-20rue-20jette-cc-81-2c-20trois-rivie-cc-80res-33.jpg"
              alt="Intérieur moderne d'une propriété"
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export function WhyDifferentSection({ scrollToForm, ctaText }: LandingSectionsProps) {
  return (
    <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Why This Evaluation Is Different */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 md:mb-8 text-left leading-snug sm:leading-tight">
              Pourquoi cette évaluation est différente des autres :
            </h2>
            <ul className="space-y-3 sm:space-y-4">
              {[
                "Basée sur des ventes comparables récentes de votre secteur précis",
                "Validation humaine effectuée par un expert local (suite à l'estimation automatisée)",
                "Interprétation stratégique du marché actuel",
                "Objectif clair : maximiser votre résultat net",
                "Aucune pression pour vendre",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column - Who It's For */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-6 md:mb-8 lg:mb-12 text-left leading-snug sm:leading-tight">
              Cette évaluation est faite pour vous si :
            </h2>
            <ul className="space-y-3 sm:space-y-4">
              {[
                "Vous êtes propriétaire et envisagez de vendre votre propriété",
                "Vous voulez connaître la valeur réelle avant de décider",
                "Vous souhaitez éviter de sous-évaluer ou surévaluer votre propriété",
                "Vous voulez une opinion honnête avant de mettre en marché",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-center mt-8 md:mt-12">
          <Button
            onClick={scrollToForm}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50 font-semibold py-4 sm:py-5 text-sm sm:text-base rounded-full px-6 sm:px-8 min-h-[44px] bg-transparent"
          >
            {ctaText || "Découvrir la valeur réelle de ma propriété"}
          </Button>
        </div>
      </div>
    </section>
  )
}

export function NetworkMapSection() {
  return (
    <section className="bg-white px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3 md:mb-4 text-balance leading-snug sm:leading-tight">
          Une évaluation soutenue par un réseau de professionnels immobiliers locaux
        </h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-3xl mx-auto mb-6 md:mb-10 leading-relaxed">
          Chaque estimation est basée sur des données réelles du marché et peut être révisée par des experts actifs sur
          le terrain.
        </p>

        <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex justify-center mb-4 md:mb-6 overflow-hidden">
            <svg viewBox="0 0 700 320" className="w-full max-w-3xl h-auto" xmlns="http://www.w3.org/2000/svg">
              {/* Background terrain - green land */}
              <rect x="0" y="0" width="700" height="320" fill="#e8f5e9" />

              {/* St. Lawrence River - main waterway */}
              <path
                d="M0,180 Q50,175 100,185 Q180,200 250,190 Q320,178 380,175 Q450,170 520,160 Q580,150 640,140 Q680,135 700,130"
                fill="none"
                stroke="#90caf9"
                strokeWidth="35"
                strokeLinecap="round"
              />
              <path
                d="M0,180 Q50,175 100,185 Q180,200 250,190 Q320,178 380,175 Q450,170 520,160 Q580,150 640,140 Q680,135 700,130"
                fill="none"
                stroke="#64b5f6"
                strokeWidth="20"
                strokeLinecap="round"
              />

              {/* River continuation to Trois-Rivières area */}
              <path
                d="M380,175 Q400,140 420,100 Q430,70 440,40"
                fill="none"
                stroke="#90caf9"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <path
                d="M380,175 Q400,140 420,100 Q430,70 440,40"
                fill="none"
                stroke="#64b5f6"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Richelieu River towards Sherbrooke */}
              <path
                d="M280,195 Q300,230 340,270 Q360,290 380,310"
                fill="none"
                stroke="#90caf9"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Land regions with subtle boundaries */}
              <path
                d="M0,0 L700,0 L700,130 Q680,135 640,140 Q580,150 520,160 Q450,170 380,175 Q320,178 250,190 Q180,200 100,185 Q50,175 0,180 Z"
                fill="#c8e6c9"
                fillOpacity="0.5"
                stroke="#a5d6a7"
                strokeWidth="1"
              />
              <path
                d="M0,180 Q50,175 100,185 Q180,200 250,190 Q320,178 380,175 Q450,170 520,160 Q580,150 640,140 Q680,135 700,130 L700,320 L0,320 Z"
                fill="#dcedc8"
                fillOpacity="0.5"
                stroke="#c5e1a5"
                strokeWidth="1"
              />

              {/* Regional boundaries */}
              <path d="M180,150 L180,220" stroke="#a5d6a7" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M280,80 L320,170" stroke="#a5d6a7" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M450,60 L480,150" stroke="#a5d6a7" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M580,50 L600,140" stroke="#a5d6a7" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M350,220 L400,280" stroke="#c5e1a5" strokeWidth="1" strokeDasharray="4 4" />

              {/* Highway routes */}
              <path
                d="M50,230 Q150,225 250,218 Q350,210 450,200 Q550,190 650,175"
                fill="none"
                stroke="#9e9e9e"
                strokeWidth="2"
                strokeDasharray="8 4"
                opacity="0.4"
              />
              <path
                d="M50,140 Q150,130 250,125 Q350,120 420,115 Q500,105 580,95 Q640,85 680,80"
                fill="none"
                stroke="#9e9e9e"
                strokeWidth="2"
                strokeDasharray="8 4"
                opacity="0.4"
              />

              {/* City markers */}
              {/* Montreal */}
              <circle
                cx="200"
                cy="185"
                r="24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.4"
                className="pulse-ring"
              />
              <circle cx="200" cy="185" r="10" fill="#dc2626" className="pulse-dot" />
              <text x="155" y="215" fontSize="13" fill="#1a1a1a" fontWeight="700">
                Montréal
              </text>

              {/* Laval */}
              <circle
                cx="220"
                cy="145"
                r="14"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.35"
                className="pulse-ring-delay-1"
              />
              <circle cx="220" cy="145" r="5" fill="#dc2626" className="pulse-dot-delay-1" />
              <text x="236" y="150" fontSize="11" fill="#424242" fontWeight="600">
                Laval
              </text>

              {/* Trois-Rivières */}
              <circle
                cx="420"
                cy="115"
                r="18"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.35"
                className="pulse-ring-delay-2"
              />
              <circle cx="420" cy="115" r="7" fill="#dc2626" className="pulse-dot-delay-2" />
              <text x="438" y="120" fontSize="12" fill="#424242" fontWeight="600">
                Trois-Rivières
              </text>

              {/* Shawinigan */}
              <circle
                cx="400"
                cy="60"
                r="14"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.35"
                className="pulse-ring-delay-3"
              />
              <circle cx="400" cy="60" r="5" fill="#dc2626" className="pulse-dot-delay-3" />
              <text x="355" y="50" fontSize="11" fill="#1a1a1a" fontWeight="700">
                Shawinigan
              </text>

              {/* Quebec City */}
              <circle
                cx="620"
                cy="100"
                r="22"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.4"
                className="pulse-ring-delay-4"
              />
              <circle cx="620" cy="100" r="9" fill="#dc2626" className="pulse-dot-delay-4" />
              <text x="638" y="105" fontSize="13" fill="#1a1a1a" fontWeight="700">
                Québec
              </text>

              {/* Sherbrooke */}
              <circle
                cx="420"
                cy="265"
                r="16"
                fill="none"
                stroke="#dc2626"
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.35"
                className="pulse-ring-delay-2"
              />
              <circle cx="420" cy="265" r="6" fill="#dc2626" className="pulse-dot-delay-2" />
              <text x="438" y="270" fontSize="12" fill="#424242" fontWeight="600">
                Sherbrooke
              </text>

              {/* Secondary cities */}
              <circle cx="380" cy="220" r="4" fill="#dc2626" opacity="0.6" className="pulse-dot-delay-3" />
              <text x="390" y="225" fontSize="9" fill="#757575" fontWeight="500">
                Drummondville
              </text>

              <circle cx="310" cy="185" r="4" fill="#dc2626" opacity="0.6" className="pulse-dot-delay-4" />
              <text x="320" y="182" fontSize="9" fill="#757575" fontWeight="500">
                Sorel-Tracy
              </text>

              <circle cx="320" cy="245" r="4" fill="#dc2626" opacity="0.6" className="pulse-dot-delay-1" />
              <text x="330" y="250" fontSize="9" fill="#757575" fontWeight="500">
                Granby
              </text>

              <circle cx="290" cy="220" r="4" fill="#dc2626" opacity="0.6" className="pulse-dot-delay-2" />
              <text x="255" y="232" fontSize="9" fill="#757575" fontWeight="500">
                St-Hyacinthe
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-2">
              Présence de partenaires immobiliers locaux dans plusieurs régions du Québec.
            </p>
            <p className="text-xs text-gray-400 max-w-2xl mx-auto mb-2 sm:mb-3 px-2">
              Selon les informations fournies, un professionnel immobilier local peut analyser votre situation afin
              d'affiner l'évaluation et offrir un service plus précis.
            </p>
            <p className="text-xs text-gray-600 font-medium">Aucune obligation. Aucun engagement. Aucune pression.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FAQSection() {
  return (
    <section className="bg-gray-50 px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3 md:mb-4 leading-snug sm:leading-tight text-center">
          Questions fréquentes
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mb-6 md:mb-10 leading-relaxed text-center">
          Tout ce que vous devez savoir sur le processus d'évaluation.
        </p>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
              <AccordionItem
                value="item-1"
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-black hover:text-red-600 hover:no-underline py-4 sm:py-5 text-sm sm:text-base">
                  Est-ce vraiment gratuit ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4 sm:pb-5 text-sm sm:text-base">
                  Oui, l'évaluation est 100% gratuite et sans engagement. Vous recevez une estimation de la valeur de
                  votre propriété sans aucun frais ni obligation de vendre.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-black hover:text-red-600 hover:no-underline py-4 sm:py-5 text-sm sm:text-base">
                  Est-ce une estimation automatique ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4 sm:pb-5 text-sm sm:text-base">
                  Non. L'estimation débute par une analyse automatisée des ventes comparables les plus récentes dans
                  votre secteur, à l'aide de données de marché fiables. Cette analyse est ensuite finalisée et vérifiée
                  par un expert immobilier local, afin de tenir compte des particularités de votre propriété et du
                  contexte réel du marché. Cela permet d'obtenir une estimation plus juste, plus réaliste et beaucoup
                  plus fiable qu'un simple calcul automatique.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-black hover:text-red-600 hover:no-underline py-4 sm:py-5 text-sm sm:text-base">
                  Est-ce que je vais être sollicité après ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4 sm:pb-5 text-sm sm:text-base">
                  Vous recevrez votre évaluation sans engagement. Un professionnel peut, au besoin, communiquer avec
                  vous afin de clarifier certains éléments et assurer la précision de l'analyse. Vous demeurez
                  entièrement libre de la suite.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-black hover:text-red-600 hover:no-underline py-4 sm:py-5 text-sm sm:text-base">
                  Pourquoi une évaluation marchande est importante dans le marché actuel ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4 sm:pb-5 text-sm sm:text-base">
                  Le marché immobilier évolue constamment. Une évaluation précise vous permet de prendre une décision
                  éclairée basée sur les conditions actuelles du marché, que vous vendiez maintenant ou dans quelques
                  mois.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
              <AccordionItem
                value="item-5"
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-black hover:text-red-600 hover:no-underline py-4 sm:py-5 text-sm sm:text-base">
                  Est-ce que ça fonctionne pour tous les types de propriétés ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4 sm:pb-5 text-sm sm:text-base">
                  Notre service couvre les maisons unifamiliales, les condos, les duplex, les triplex et les multiplex.
                  Pour les propriétés commerciales ou agricoles, contactez-nous pour discuter de votre situation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-6"
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-black hover:text-red-600 hover:no-underline py-4 sm:py-5 text-sm sm:text-base">
                  Dans quels secteurs offrez-vous ce service ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4 sm:pb-5 text-sm sm:text-base">
                  Nous couvrons les principales villes du Québec ainsi que leurs régions environnantes. Selon les
                  informations fournies, un professionnel immobilier local peut analyser votre situation afin d'offrir
                  une évaluation plus précise.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-7"
                className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-black hover:text-red-600 hover:no-underline py-4 sm:py-5 text-sm sm:text-base">
                  Combien de temps ça prend ?
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pb-4 sm:pb-5 text-sm sm:text-base">
                  Le formulaire prend moins d'une minute à remplir. Vous recevrez votre évaluation personnalisée dans un
                  délai de 24 à 48 heures ouvrables.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FinalCTASection({ scrollToForm, ctaText }: { scrollToForm: () => void; ctaText?: string }) {
  return (
    <section className="px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3 md:mb-4 text-balance leading-snug sm:leading-tight">
          Prenez une décision éclairée avant de vendre votre propriété
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mb-6 md:mb-8 leading-relaxed">
          Obtenez une estimation réaliste, révisée par des professionnels immobiliers locaux actifs sur le terrain, sans
          obligation et sans pression.
        </p>
        <Button
          onClick={scrollToForm}
          className="w-full sm:w-auto bg-red-600 px-6 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-semibold text-white hover:bg-red-700 rounded-full shadow-lg hover:shadow-xl transition-all min-h-[44px]"
          size="lg"
        >
          {ctaText || "Obtenir mon évaluation gratuite"}
        </Button>
        <p className="text-gray-500 text-xs sm:text-sm mt-3 md:mt-4">Gratuit • Sans engagement • 100 % confidentiel</p>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl text-center">
        <p className="text-sm sm:text-base font-semibold text-black mb-2">© 2026 — Valeurmaisonrapide.com</p>
        <p className="text-xs sm:text-sm text-gray-700 mb-3 md:mb-4">Propulsé par la technologie de Valeurmaison.ai</p>
        <div className="mb-3 md:mb-4 flex items-center justify-center gap-3">
          <a href="/politique-de-confidentialite" className="text-xs text-gray-500 hover:text-gray-700 underline">
            Politique de confidentialité
          </a>
          <span className="text-gray-300">|</span>
          <CookieSettingsButton />
        </div>
        <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
          Cette analyse ne constitue pas une évaluation agréée au sens de l'OEAQ. Les informations sont fournies à titre
          informatif seulement.
        </p>
      </div>
    </footer>
  )
}

function CookieSettingsButton() {
  const { openPreferences } = useCookieConsent()
  
  return (
    <button
      type="button"
      onClick={openPreferences}
      className="text-xs text-gray-500 hover:text-gray-700 underline cursor-pointer"
    >
      Gérer les cookies
    </button>
  )
}
