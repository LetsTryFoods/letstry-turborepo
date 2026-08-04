"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Order } from "@/lib/orders/queries";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";

const WHATSAPP_API_BASE =
  process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://apiv3.letstryfoods.com";

export type WhatsAppTemplateType = "unavailable" | "delay";

export const DELAY_REASONS = [
  { value: "higher than usual order volume today", label: "High Demand" },
  { value: "unexpected weather conditions in your area", label: "Weather Disruption" },
  { value: "a delay at our fulfillment center", label: "Fulfillment Delay" },
  { value: "logistics challenges on the delivery route", label: "Logistics / Traffic" },
  { value: "increased demand during the holiday period", label: "Holiday Rush" },
  { value: "a last-minute inventory issue", label: "Inventory Issue" },
] as const;

interface WhatsAppNotifyDialogProps {
  order: Order | null;
  templateType: WhatsAppTemplateType;
  open: boolean;
  onClose: () => void;
}

function getCustomerPhone(order: Order): string | null {
  return (
    order.customer?.phone ||
    order.userInfo?.phoneNumber ||
    order.shippingAddress?.phone ||
    null
  );
}

function getCustomerFirstName(order: Order): string {
  const full =
    order.customer?.name ||
    order.userInfo?.firstName ||
    order.shippingAddress?.fullName ||
    "Customer";
  return full.split(" ")[0];
}

function buildPreview(
  templateType: WhatsAppTemplateType,
  firstName: string,
  orderId: string,
  delayReason: string
): string {
  if (templateType === "unavailable") {
    return `Hi ${firstName}, 👋\n\nWe wanted to update you about your *LetsTry Foods* order *#${orderId}*.\n\nDue to the unavailability of one or more items, your order may take a little longer than expected to reach you. We're working on it and will keep you posted! ⏳\n\nThank you for your patience and for choosing LetsTry Foods! 🙏\n— Team LetsTry Foods`;
  }
  return `Hi ${firstName}, 👋\n\nWe wanted to give you a heads-up about your *LetsTry Foods* order *#${orderId}*.\n\n⏳ Your order is running a little late due to *${delayReason}*.\n\nWe're working hard to get it to you as soon as possible. We truly appreciate your patience! ❤️\n\nFor any help, simply reply to this message.\n\nThank you for being a valued customer! 🙏\n— Team LetsTry Foods`;
}

export function WhatsAppNotifyDialog({
  order,
  templateType,
  open,
  onClose,
}: WhatsAppNotifyDialogProps) {
  const [delayReason, setDelayReason] = useState<string>(DELAY_REASONS[0].value);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  if (!order) return null;

  const phone = getCustomerPhone(order);
  const firstName = getCustomerFirstName(order);
  const orderId = order.orderId;

  const preview = buildPreview(templateType, firstName, orderId, delayReason);

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  const handleSend = async () => {
    if (!phone) {
      setResult({ ok: false, msg: "No phone number found for this customer." });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      if (templateType === "unavailable") {
        await api.post(`${WHATSAPP_API_BASE}/whatsapp/meta/send-template`, {
          phoneNumber: phone,
          templateName: "order_partial_unavailable",
          languageCode: "en",
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: firstName },
                { type: "text", text: orderId },
              ],
            },
          ],
        });
      } else {
        await api.post(`${WHATSAPP_API_BASE}/whatsapp/meta/send-template`, {
          phoneNumber: phone,
          templateName: "order_delivery_delay",
          languageCode: "en",
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: firstName },
                { type: "text", text: orderId },
                { type: "text", text: delayReason },
              ],
            },
          ],
        });
      }

      setResult({ ok: true, msg: `Message sent to ${phone}` });
      toast.success(`WhatsApp sent to ${firstName}!`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to send message.";
      setResult({ ok: false, msg });
      toast.error(`Failed: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  const isDelay = templateType === "delay";
  const title = isDelay ? "Notify: Order Delay" : "Notify: Item Unavailable";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order & customer info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{order.customer?.name || "Customer"}</p>
              <p className="text-muted-foreground text-xs">{order.orderId}</p>
            </div>
            <div className="text-right shrink-0">
              {phone ? (
                <p className="font-mono text-xs font-medium">{phone}</p>
              ) : (
                <Badge variant="destructive" className="text-[10px]">No phone</Badge>
              )}
            </div>
          </div>

          {/* Delay reason picker (only for delay template) */}
          {isDelay && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Reason for delay</Label>
              <Select value={delayReason} onValueChange={setDelayReason}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELAY_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Message preview */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Preview</Label>
            <div className="relative">
              {/* WhatsApp bubble */}
              <div className="rounded-xl rounded-tl-sm bg-[#dcf8c6] dark:bg-[#1d3a29] p-3 text-[12px] leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-[system-ui] shadow-sm border border-green-200/60">
                {preview}
                <p className="text-right text-[10px] text-gray-500 mt-1">07:11 ✓✓</p>
              </div>
              <div className="absolute -top-0 left-0 w-3 h-3 bg-[#dcf8c6] dark:bg-[#1d3a29] clip-triangle" />
            </div>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                result.ok
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {result.ok ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{result.msg}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={sending}>
            {result?.ok ? "Close" : "Cancel"}
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={sending || !phone || !!result?.ok}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send on WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
