"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Copy, Loader2, Upload, FileText, ArrowUpCircle } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

interface Lead {
  id: string
  full_name: string
  email: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  garage?: string
  basement?: string
  features?: string
  renovations?: string
}

interface EcmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: Lead | null
}

interface Comparable {
  label: string
  sector: string
  price: string
  date: string
  bedrooms: string
  bathrooms: string
  area: string
  notes: string
  adjustment: string
  comparable_id: string
  status: string
  property: any
  pricing: any
}

interface SubjectProperty {
  address: string
  city: string
  property_type: string
  bedrooms: number
  bathrooms: number
  powder_rooms: number
  year_built: number | null
  living_area: string
  features: string
  renovations: string
  garage: string
  basement: string // Ajout du champ basement
  property: any
  pricing: any
  source: any
}

export function EcmDialog({ open, onOpenChange, lead }: EcmDialogProps) {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [ecmId, setEcmId] = useState<string | null>(null)
  const [subjectProperty, setSubjectProperty] = useState<any>(null)
  const [comparables, setComparables] = useState<any[]>([])
  const [sourceFiles, setSourceFiles] = useState<any[]>([])
  const [analystNotes, setAnalystNotes] = useState("")
  const [rangeLow, setRangeLow] = useState("")
  const [rangeHigh, setRangeHigh] = useState("")
  const [generatedText, setGeneratedText] = useState("")

  const debouncedComparables = useDebounce(comparables, 600)
  const debouncedAnalystNotes = useDebounce(analystNotes, 600)
  const debouncedRangeLow = useDebounce(rangeLow, 600)
  const debouncedRangeHigh = useDebounce(rangeHigh, 600)

  const handleGenerateEcm = async () => {
    // Placeholder for handleGenerateEcm function
  }

  const handleCopyText = () => {
    // Placeholder for handleCopyText function
  }

  useEffect(() => {
    if (open && lead) {
      loadEcmData()
    }
  }, [open, lead])

  useEffect(() => {
    if (ecmId && !loading) {
      handleAutosave()
    }
  }, [debouncedComparables, debouncedAnalystNotes, debouncedRangeLow, debouncedRangeHigh])

  const loadEcmData = async () => {
    if (!lead) return

    console.log("[ECM Dialog] 🔍 Lead object:", lead)
    console.log("[ECM Dialog] 🔍 lead.id:", lead.id)
    console.log("[ECM Dialog] 🔍 typeof lead.id:", typeof lead.id)
    console.log("[ECM Dialog] 🔍 lead.id length:", lead.id?.length)

    setLoading(true)
    try {
      console.log("[ECM Dialog] Loading ECM for lead:", lead.id)
      const response = await fetch(`/api/admin/leads/${lead.id}/ecm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadData: lead }),
      })

      console.log("[ECM Dialog] Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[ECM Dialog] ECM loaded:", data.ecm.id)
        setEcmId(data.ecm.id)
        setSubjectProperty(data.ecm.subject_property_snapshot)
        setComparables(data.ecm.comparables || [])
        setSourceFiles(data.ecm.source_files || [])
        setAnalystNotes(data.ecm.analyst_notes || "")
        setRangeLow(data.ecm.range_low?.toString() || "400000")
        setRangeHigh(data.ecm.range_high?.toString() || "450000")
        setGeneratedText(data.ecm.generated_text || "")
      } else {
        const errorData = await response.json()
        console.error("[ECM Dialog] Failed to load ECM:", errorData)
        alert(`Erreur lors du chargement de l'ECM: ${errorData.error}`)
      }
    } catch (error: any) {
      console.error("[ECM Dialog] Error loading ECM:", error)
      alert(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAutosave = useCallback(async () => {
    if (!ecmId) return

    try {
      await fetch(`/api/admin/ecm/${ecmId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comparables: debouncedComparables,
          analyst_notes: debouncedAnalystNotes,
          range_low: debouncedRangeLow ? Number.parseFloat(debouncedRangeLow) : null,
          range_high: debouncedRangeHigh ? Number.parseFloat(debouncedRangeHigh) : null,
        }),
      })
    } catch (error) {
      console.error("Error autosaving ECM:", error)
    }
  }, [ecmId, debouncedComparables, debouncedAnalystNotes, debouncedRangeLow, debouncedRangeHigh])

  const handlePdfUpload = async (files: FileList | null) => {
    console.log("[ECM Dialog] handlePdfUpload called, files:", files?.length)

    if (!files || files.length === 0) {
      console.log("[ECM Dialog] No files")
      return
    }

    if (!ecmId) {
      console.warn("[ECM Dialog] No ecmId, aborting")
      alert("⚠️ Veuillez attendre que l'ECM soit chargé avant d'importer des fichiers")
      return
    }

    if (!lead) {
      console.warn("[ECM Dialog] No lead")
      return
    }

    console.log("[ECM Dialog] Starting upload, ecmId:", ecmId)
    setUploading(true)
    const formData = new FormData()
    formData.append("leadId", lead.id)
    formData.append("ecmReportId", ecmId)

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i])
    }

    try {
      const response = await fetch("/api/admin/ecm/import-pdfs", {
        method: "POST",
        body: formData,
      })

      console.log("[ECM Dialog] Upload response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[ECM Dialog] Import successful:", data)

        const newComparables = data?.ecm_report?.comparables ?? data?.comparables ?? []
        const newSubject = data?.ecm_report?.subject_property_snapshot ?? data?.subject_property_snapshot ?? null
        const newSourceFiles = data?.ecm_report?.source_files ?? data?.source_files ?? []

        setSubjectProperty(newSubject)
        setComparables(newComparables)
        setSourceFiles(newSourceFiles)

        if (newComparables.length === 0) {
          console.warn("[ECM Dialog] No comparables returned from upload")
        }

        alert("✅ PDFs importés et analysés avec succès!")
      } else {
        const errorData = await response.json()
        console.error("[ECM Dialog] Import failed:", errorData)
        alert(`❌ Erreur lors de l'import: ${errorData.error}`)
      }
    } catch (error: any) {
      console.error("[ECM Dialog] Upload error:", error)
      alert(`❌ Erreur: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    console.log("[v0] Drag event:", e.type)
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    console.log("[v0] Drop event triggered")
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      console.log("[v0] Files dropped:", e.dataTransfer.files.length)
      handlePdfUpload(e.dataTransfer.files)
    } else {
      console.log("[v0] No files in drop event")
    }
  }

  const handleSetAsSubject = async (comparableId: string) => {
    if (!ecmId) return

    try {
      const response = await fetch(`/api/admin/ecm/${ecmId}/set-subject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comparableId }),
      })

      if (response.ok) {
        const data = await response.json()
        setSubjectProperty(data.ecm.subject_property_snapshot)
        setComparables(data.ecm.comparables || [])
        alert("Propriété analysée mise à jour!")
      } else {
        alert("Erreur lors du swap")
      }
    } catch (error) {
      console.error("Error setting subject:", error)
      alert("Erreur")
    }
  }

  const handleRemoveComparable = (comparableId: string) => {
    const updated = comparables.map((c) => (c.comparable_id === comparableId ? { ...c, status: "removed" } : c))
    setComparables(updated)
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            ECM - Évaluation comparative de marché
            <p className="text-sm font-normal text-gray-500 mt-1">{lead.full_name}</p>
          </DialogTitle>
        </DialogHeader>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            loading || !ecmId
              ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
              : dragActive
                ? "border-[#E30613] bg-red-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
          onDragEnter={loading || !ecmId ? undefined : handleDrag}
          onDragLeave={loading || !ecmId ? undefined : handleDrag}
          onDragOver={loading || !ecmId ? undefined : handleDrag}
          onDrop={loading || !ecmId ? undefined : handleDrop}
        >
          <Upload className={`h-10 w-10 mx-auto mb-3 ${loading || !ecmId ? "text-gray-300" : "text-gray-400"}`} />
          <p className="text-sm font-medium mb-2">
            {loading ? "Chargement de l'ECM..." : !ecmId ? "Initialisation..." : "Importer des fiches Centris (PDF)"}
          </p>
          <p className="text-xs text-gray-500 mb-4">
            {loading || !ecmId ? "Veuillez patienter..." : "Glissez-déposez vos PDFs ici ou cliquez pour choisir"}
          </p>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={(e) => handlePdfUpload(e.target.files)}
            className="hidden"
            id="pdf-upload"
            disabled={uploading || loading || !ecmId}
          />
          <Button
            asChild
            size="sm"
            variant="outline"
            disabled={uploading || loading || !ecmId}
            className="gap-2 bg-transparent"
          >
            <label
              htmlFor="pdf-upload"
              className={uploading || loading || !ecmId ? "cursor-not-allowed" : "cursor-pointer"}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Traitement en cours...
                </>
              ) : loading || !ecmId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Choisir des fichiers
                </>
              )}
            </label>
          </Button>

          {sourceFiles.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-xs font-medium mb-2">Fichiers importés:</p>
              <div className="space-y-1">
                {sourceFiles.map((file, i) => (
                  <div key={i} className={`text-xs p-2 rounded ${file.parsed_ok ? "bg-green-50" : "bg-red-50"}`}>
                    <span className="font-medium">{file.filename}</span>
                    {file.parse_confidence && (
                      <span className="ml-2 text-gray-500">({Math.round(file.parse_confidence * 100)}% confiance)</span>
                    )}
                    {file.error && <span className="ml-2 text-red-600">- {file.error}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-500">Chargement de l'ECM...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* COLONNE GAUCHE */}
            <div className="space-y-6">
              {/* Propriété analysée */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-lg mb-4">Propriété analysée</h3>

                {subjectProperty && (
                  <div className="space-y-2 text-sm">
                    {(subjectProperty.property?.address_full || subjectProperty.address) && (
                      <p>
                        <span className="font-medium">Adresse:</span>{" "}
                        {subjectProperty.property?.address_full || subjectProperty.address}
                      </p>
                    )}

                    {subjectProperty.pricing?.list_price && (
                      <p>
                        <span className="font-medium">Prix demandé:</span>{" "}
                        {subjectProperty.pricing.list_price.toLocaleString()} $
                      </p>
                    )}

                    {(subjectProperty.property?.rooms?.bedrooms || subjectProperty.bedrooms) && (
                      <p>
                        <span className="font-medium">Chambres:</span>{" "}
                        {subjectProperty.property?.rooms?.bedrooms || subjectProperty.bedrooms}
                      </p>
                    )}

                    {(subjectProperty.property?.rooms?.bathrooms || subjectProperty.bathrooms) && (
                      <p>
                        <span className="font-medium">Salles de bain:</span>{" "}
                        {subjectProperty.property?.rooms?.bathrooms || subjectProperty.bathrooms}
                      </p>
                    )}

                    {(subjectProperty.property?.year_built || subjectProperty.year_built) && (
                      <p>
                        <span className="font-medium">Année:</span>{" "}
                        {subjectProperty.property?.year_built || subjectProperty.year_built}
                      </p>
                    )}

                    {(subjectProperty.property?.living_area_sqft || subjectProperty.living_area) && (
                      <p>
                        <span className="font-medium">Superficie:</span>{" "}
                        {subjectProperty.property?.living_area_sqft || subjectProperty.living_area} pi²
                      </p>
                    )}

                    {subjectProperty.garage && (
                      <p>
                        <span className="font-medium">Garage:</span> {subjectProperty.garage}
                      </p>
                    )}

                    {subjectProperty.basement && (
                      <p>
                        <span className="font-medium">Sous-sol:</span> {subjectProperty.basement}
                      </p>
                    )}

                    {subjectProperty.features && (
                      <p>
                        <span className="font-medium">Atouts:</span> {subjectProperty.features}
                      </p>
                    )}

                    {subjectProperty.renovations && (
                      <p>
                        <span className="font-medium">Rénovations:</span> {subjectProperty.renovations}
                      </p>
                    )}

                    {subjectProperty.source?.parse_confidence && (
                      <p className="text-xs text-gray-500 mt-3">
                        Confiance du parsing: {Math.round(subjectProperty.source.parse_confidence * 100)}%
                      </p>
                    )}
                  </div>
                )}

                {!subjectProperty && (
                  <p className="text-sm text-gray-500">
                    {lead?.address ? lead.address : "Chargement des données de la propriété..."}
                  </p>
                )}
              </div>

              {/* Comparables */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Comparables</h3>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {(comparables ?? [])
                    .filter((c) => c.status === "active")
                    .map((comp) => (
                      <div key={comp.comparable_id} className="border rounded-lg p-3 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            {comp.property?.address_full && (
                              <p className="font-medium text-sm">{comp.property.address_full}</p>
                            )}
                            {comp.pricing?.list_price && (
                              <p className="text-sm text-gray-600">{comp.pricing.list_price.toLocaleString()} $</p>
                            )}
                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                              {comp.property?.rooms?.bedrooms && <span>{comp.property.rooms.bedrooms} ch.</span>}
                              {comp.property?.rooms?.bathrooms && <span>{comp.property.rooms.bathrooms} sdb</span>}
                              {comp.property?.living_area_sqft && <span>{comp.property.living_area_sqft} pi²</span>}
                              {comp.property?.year_built && <span>{comp.property.year_built}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs bg-transparent"
                            onClick={() => handleSetAsSubject(comp.comparable_id)}
                          >
                            <ArrowUpCircle className="h-3 w-3" />
                            Définir comme sujet
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveComparable(comp.comparable_id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                  {(comparables ?? []).filter((c) => c.status === "active").length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Aucun comparable. Importez plusieurs PDFs pour ajouter des comparables.
                    </p>
                  )}
                </div>
              </div>

              {/* Notes analyste */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Notes de l'analyste</h3>
                <Textarea
                  value={analystNotes}
                  onChange={(e) => setAnalystNotes(e.target.value)}
                  rows={6}
                  placeholder="Ajoutez vos observations, analyses de marché, tendances du secteur..."
                />
              </div>
            </div>

            {/* COLONNE DROITE */}
            <div className="space-y-6">
              {/* Fourchette */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h3 className="font-semibold text-lg mb-3">Fourchette d'évaluation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Minimum ($)</Label>
                    <Input
                      type="number"
                      value={rangeLow}
                      onChange={(e) => setRangeLow(e.target.value)}
                      placeholder="400000"
                    />
                  </div>
                  <div>
                    <Label>Maximum ($)</Label>
                    <Input
                      type="number"
                      value={rangeHigh}
                      onChange={(e) => setRangeHigh(e.target.value)}
                      placeholder="450000"
                    />
                  </div>
                </div>
              </div>

              {/* Génération */}
              <div className="border rounded-lg p-4">
                <Button
                  onClick={handleGenerateEcm}
                  disabled={generating}
                  className="w-full gap-2 bg-[#E30613] hover:bg-[#C00510]"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    "Générer l'ECM"
                  )}
                </Button>
              </div>

              {/* Texte généré */}
              {generatedText && (
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Texte généré</h3>
                    <Button onClick={handleCopyText} size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Copy className="h-4 w-4" />
                      Copier
                    </Button>
                  </div>
                  <Textarea
                    value={generatedText}
                    onChange={(e) => setGeneratedText(e.target.value)}
                    rows={20}
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
