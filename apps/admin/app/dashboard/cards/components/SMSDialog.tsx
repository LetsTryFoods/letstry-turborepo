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
import { AbandonedCart, smsTemplates, useSendSMSNotification } from "@/lib/abandoned-carts/useAbandonedCarts"
import { MessageSquare, Send, Loader2, CheckCircle, Phone } from "lucide-react"
import { toast } from "react-hot-toast"

interface SMSDialogProps {
  cart: AbandonedCart | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SMSDialog({ cart, open, onOpenChange }: SMSDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { sendSMS } = useSendSMSNotification()

  if (!cart) return null

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = smsTemplates.find(t => t.id === templateId)
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
      // Call backend API to send SMS (dummy for now)
      await sendSMS(cart.customer.phone, cart.customer.name, cart.subtotal, message)
      
      setIsSent(true)
      toast.success('SMS notification sent successfully!')
    } catch (error) {
      toast.error('Failed to send SMS notification')
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

  // SMS character limit info
  const charCount = message.length
  const smsCount = Math.ceil(charCount / 160) || 1

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Send SMS Notification
          </DialogTitle>
          <DialogDescription>
            Send an SMS reminder to {cart.customer.name} about their abandoned cart worth ₹{cart.subtotal.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-600" />
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
                {smsTemplates.map((template) => (
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
              rows={4}
              className="resize-none"
              maxLength={320}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{charCount}/320 characters</span>
              <span>{smsCount} SMS message{smsCount > 1 ? 's' : ''}</span>
            </div>
          </div>

          {isSent && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">SMS notification sent successfully!</span>
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending SMS...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send SMS
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
