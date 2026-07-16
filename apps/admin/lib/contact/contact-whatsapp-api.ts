const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

const BASE = process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL || "http://localhost:3000/api";

function apiBase() {
  // contact-support lives on the same backend as whatsapp
  return BASE.replace(/\/whatsapp.*$/, "");
}

export interface ConversationResponse {
  contact: any;
  chat: any;
  messages: any[];
  windowOpen: boolean;
  windowExpiresAt: string | null;
}

export async function getConversation(contactId: string): Promise<ConversationResponse> {
  const res = await fetch(`${apiBase()}/contact-support/${contactId}/conversation`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to load conversation");
  return res.json();
}

export async function sendFreeText(
  contactId: string,
  text: string,
): Promise<{ success: boolean; message: any }> {
  const res = await fetch(`${apiBase()}/contact-support/${contactId}/send-free-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send message");
  return data;
}

export async function sendTemplate(
  contactId: string,
  templateName: string,
  components: any[] = [],
  languageCode = "en",
): Promise<{ success: boolean }> {
  const res = await fetch(`${apiBase()}/contact-support/${contactId}/send-template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ templateName, components, languageCode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send template");
  return data;
}

export async function sendAck(
  contactId: string,
  phone: string,
  name: string,
): Promise<{ success: boolean }> {
  const res = await fetch(`${apiBase()}/contact-support/${contactId}/send-ack`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ phone, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send ack");
  return data;
}
