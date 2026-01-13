import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'

interface CancelShipmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  awbNumber: string
}

export function CancelShipmentDialog({
  isOpen,
  onClose,
  onConfirm,
  awbNumber,
}: CancelShipmentDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Cancel Shipment</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to cancel shipment <strong>{awbNumber}</strong>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            No, Keep it
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, Cancel Shipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
