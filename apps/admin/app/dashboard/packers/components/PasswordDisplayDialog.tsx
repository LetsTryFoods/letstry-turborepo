'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

interface PasswordDisplayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packer: any
  password: string
}

export function PasswordDisplayDialog({ open, onOpenChange, packer, password }: PasswordDisplayDialogProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy password:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Packer Created Successfully</DialogTitle>
        </DialogHeader>
        
        {packer && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Packer <strong>{packer.name}</strong> (ID: {packer.employeeId}) has been created successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                The login credentials have been sent to the packer's phone number.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Generated Password</Label>
              <div className="flex space-x-2">
                <Input
                  id="password"
                  value={password}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this password and store it securely. The packer will need it to log in.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}