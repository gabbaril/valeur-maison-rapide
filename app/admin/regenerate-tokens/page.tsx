"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function RegenerateTokensPage() {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    total: number
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/admin/regenerate-all-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erreur lors de la régénération")
        return
      }

      setResult(data)
    } catch (err) {
      setError("Erreur réseau")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Régénérer tous les tokens</CardTitle>
          <CardDescription>
            Cette action va créer de nouveaux tokens pour tous les leads et renvoyer les emails avec le
            bouton de finalisation (les tokens restent valides jusqu'à complétion)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe admin</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="space-y-2">
                  <div className="font-semibold text-green-900">Emails envoyés avec succès!</div>
                  <div className="text-sm text-green-700">
                    <div>Total de leads: {result.total}</div>
                    <div className="text-green-600">Emails envoyés: {result.success}</div>
                    {result.failed > 0 && <div className="text-red-600">Échecs: {result.failed}</div>}
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                      <div className="font-semibold text-yellow-900 mb-1">Détails des échecs:</div>
                      {result.errors.map((err, idx) => (
                        <div key={idx} className="text-yellow-800">
                          {err}
                        </div>
                      ))}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Régénération en cours...
                </>
              ) : (
                "Régénérer tous les tokens et renvoyer les emails"
              )}
            </Button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <div className="font-semibold text-blue-900 mb-2">Cette action va:</div>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Supprimer tous les anciens tokens</li>
              <li>Générer de nouveaux tokens (valides jusqu'à complétion du lead)</li>
              <li>Envoyer un email avec le bouton de finalisation à chaque lead</li>
              <li>Remplacer les liens existants (même s'ils sont encore valides)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
