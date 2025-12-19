"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AbandonedCart, whatsAppTemplates, useSendWhatsAppNotification } from "@/lib/abandoned-carts/useAbandonedCarts"
import { MessageCircle, Send, Loader2, CheckCircle, Phone } from "lucide-react"
import { toast } from "react-hot-toast"

interface WhatsAppDialogProps {
  cart: AbandonedCart | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WhatsAppDialog({ cart, open, onOpenChange }: WhatsAppDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { sendNotification } = useSendWhatsAppNotification()

  if (!cart) return null

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = whatsAppTemplates.find(t => t.id === templateId)
    if (template) {
      // Replace placeholders with actual values
      const personalizedMessage = template.message
        .replace('{{name}}', cart.customer.name.split(' ')[0])
        .replace('{{value}}', cart.subtotal.toLocaleString())
      setMessage(personalizedMessage)
    }
    setIsSent(false)
  }

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please select a template or enter a message')
      return
    }

    setIsSending(true)
    try {
      // Format phone number for WhatsApp (remove + and spaces)
      const formattedPhone = cart.customer.phone.replace(/[\s+]/g, '')
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(message)
      
      // Open WhatsApp Web with pre-filled message
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
      
      // Call backend API to log the notification (dummy for now)
      await sendNotification(cart.customer.phone, cart.customer.name, cart.subtotal)
      
      setIsSent(true)
      toast.success('WhatsApp opened with message!')
    } catch (error) {
      toast.error('Failed to send notification')
      console.error(error)
    } finally {
      setIsSending(false)
    }
  }

  const handleClose = () => {
    setSelectedTemplate('')
    setMessage('')
    setIsSent(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Send WhatsApp Notification
          </DialogTitle>
          <DialogDescription>
            Send a reminder to {cart.customer.name} about their abandoned cart worth ₹{cart.subtotal.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">{cart.customer.name}</p>
              <p className="text-sm text-muted-foreground font-mono">{cart.customer.phone}</p>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Select Message Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {whatsAppTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Preview/Edit */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Select a template or type your message..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length} characters
            </p>
          </div>

          {isSent && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">WhatsApp opened successfully! Check your browser.</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending || !message.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Opening WhatsApp...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Open in WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
