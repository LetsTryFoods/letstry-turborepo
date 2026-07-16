import * as fs from 'fs';
import * as path from 'path';

// Store logs in apps/backend/logs/whatsapp.log
const logDir = path.join(process.cwd(), 'logs');
const logFile = path.join(logDir, 'whatsapp.log');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

export function logWhatsAppEvent(eventTitle: string, payload?: any) {
  try {
    const timestamp = new Date().toISOString();
    let dataStr = '';
    if (payload !== undefined) {
      dataStr = ` | Data: ${typeof payload === 'object' ? JSON.stringify(payload) : String(payload)}`;
    }
    const logLine = `[${timestamp}] [WhatsApp/Webhook] ${eventTitle}${dataStr}\n`;

    fs.appendFileSync(logFile, logLine);
  } catch (err) {
    console.error('Failed to write to WhatsApp log file:', err);
  }
}
