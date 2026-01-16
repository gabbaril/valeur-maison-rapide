"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface User {
  email: string
}

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: User | null
  newPassword: string
  setNewPassword: (password: string) => void
  passwordError: string
  passwordSuccess: string
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  selectedUser,
  newPassword,
  setNewPassword,
  passwordError,
  passwordSuccess,
  onSubmit,
  onCancel,
}: ResetPasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label className="mb-1">Email de l'utilisateur</Label>
            <Input value={selectedUser?.email || ""} disabled className="bg-gray-50" />
          </div>
          <div>
            <Label className="mb-1" htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 caractères"
              minLength={6}
              required
            />
            {passwordError && <p className="text-sm text-red-600 mt-1">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-600 mt-1">{passwordSuccess}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Confirmer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
