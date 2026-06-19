'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import api from '@/lib/axios';

const WHATSAPP_API_BASE = process.env.NEXT_PUBLIC_WHATSAPP_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://apiv3.letstryfoods.com';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BaileysStatus {
  connectionStatus: 'disconnected' | 'qr_pending' | 'connected';
  qrCodeBase64?: string;
  phoneConnected?: string;
  connectedAt?: string;
  lastMessageAt?: string;
  needsRescan: boolean;
  disconnectReason?: string;
  dailyCount: number;
  dailyLimit: number;
}

interface Stats {
  today: {
    total: number;
    success: number;
    failed: number;
    skippedLimit: number;
    nurenSuccess: number;
    baileysSuccess: number;
    noneDelivered: number;
    baileysLimit: number;
    baileysUsedToday: number;
  };
  period: {
    total: number;
    success: number;
    failed: number;
    nurenSuccess: number;
    baileysSuccess: number;
  };
  baileys: {
    connectionStatus: string;
    phoneConnected?: string;
    needsRescan: boolean;
    dailyCount: number;
    dailyLimit: number;
  };
}

interface LogEntry {
  _id: string;
  phoneNumber: string;
  recipientName?: string;
  orderId?: string;
  templateName: string;
  channel: 'NUREN' | 'BAILEYS' | 'NONE';
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED_LIMIT' | 'NO_FALLBACK';
  primaryAttempted: boolean;
  primarySuccess: boolean;
  fallbackAttempted: boolean;
  fallbackSuccess: boolean;
  payload?: Record<string, any>;
  errorMessage?: string;
  sentAt: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColor = {
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  SKIPPED_LIMIT: 'bg-amber-100 text-amber-700',
  NO_FALLBACK: 'bg-gray-100 text-gray-600',
};

const channelBadge = {
  NUREN: 'bg-blue-100 text-blue-700',
  BAILEYS: 'bg-purple-100 text-purple-700',
  NONE: 'bg-gray-100 text-gray-500',
};

function fmt(date: string) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WhatsAppPage() {
  const [baileysStatus, setBaileysStatus] = useState<BaileysStatus | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const [savingLimit, setSavingLimit] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testText, setTestText] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [qrScanned, setQrScanned] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const pollingRef = useRef<any>(null);
  const prevQrRef = useRef<string | null>(null);

  // ── Fetch functions ─────────────────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get(`${WHATSAPP_API_BASE}/whatsapp/baileys/status`);
      setBaileysStatus(prev => {
        // Detect: had QR before, now QR is gone but still qr_pending → user scanned!
        if (
          prev?.connectionStatus === 'qr_pending' &&
          prevQrRef.current &&
          !data.qrCodeBase64 &&
          data.connectionStatus === 'qr_pending'
        ) {
          setQrScanned(true);
        }
        // Reset scanned flag once fully connected or disconnected
        if (data.connectionStatus === 'connected' || data.connectionStatus === 'disconnected') {
          setQrScanned(false);
        }
        prevQrRef.current = data.qrCodeBase64 ?? null;
        return data;
      });
    } catch { /* silent */ }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get(`${WHATSAPP_API_BASE}/whatsapp/stats`);
      setStats(data);
    } catch { /* silent */ }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      if (channelFilter) params.set('channel', channelFilter);
      const { data } = await api.get(`${WHATSAPP_API_BASE}/whatsapp/logs?${params}`);
      setLogs(data.logs || []);
      setLogsTotal(data.total || 0);
    } catch { /* silent */ }
    setLoading(false);
  }, [page, statusFilter, channelFilter]);

  // ── Init & polling ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStatus();
    fetchStats();
    fetchLogs();

    pollingRef.current = setInterval(() => {
      fetchStatus();
      fetchStats();
    }, 10000); // poll every 10s

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchStatus, fetchStats, fetchLogs]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // QR polling — faster when qr_pending
  useEffect(() => {
    if (baileysStatus?.connectionStatus === 'qr_pending') {
      const qrInterval = setInterval(fetchStatus, 3000);
      return () => clearInterval(qrInterval);
    }
  }, [baileysStatus?.connectionStatus, fetchStatus]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await api.post(`${WHATSAPP_API_BASE}/whatsapp/baileys/connect`);
      
      const checkStatus = async (attempts = 0) => {
        if (attempts > 15) {
          setConnecting(false);
          return;
        }
        try {
          const { data } = await api.get(`${WHATSAPP_API_BASE}/whatsapp/baileys/status`);
          setBaileysStatus(data);
          
          if (data.connectionStatus === 'qr_pending' || data.connectionStatus === 'connected') {
            setConnecting(false);
          } else if (data.connectionStatus === 'disconnected' && attempts > 3) {
            // Backend gave up and stays disconnected
            setConnecting(false);
          } else {
            setTimeout(() => checkStatus(attempts + 1), 1000);
          }
        } catch {
          setConnecting(false);
        }
      };
      
      setTimeout(() => checkStatus(0), 1000);
    } catch {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect WhatsApp fallback?')) return;
    await api.post(`${WHATSAPP_API_BASE}/whatsapp/baileys/disconnect`);
    setTimeout(fetchStatus, 1000);
  };

  const handleSaveLimit = async () => {
    const n = parseInt(newLimit);
    if (!n || n < 1 || n > 100) return alert('Limit must be 1–100');
    setSavingLimit(true);
    await api.patch(`${WHATSAPP_API_BASE}/whatsapp/settings`, { baileysDailyLimit: n });
    setEditingLimit(false);
    setSavingLimit(false);
    fetchStatus();
    fetchStats();
  };

  const handleTestMessage = async () => {
    if (!testPhone || !testText) return alert('Phone and message required');
    setSendingTest(true);
    try {
      await api.post(`${WHATSAPP_API_BASE}/whatsapp/baileys/test-message`, {
        phoneNumber: testPhone,
        text: testText,
      });
      alert('Test message sent successfully!');
      setTestPhone('');
      setTestText('');
    } catch (err: any) {
      alert(`Failed: ${err.response?.data?.message || err.message}`);
    }
    setSendingTest(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const status = baileysStatus?.connectionStatus;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">📱 WhatsApp Notifications</h1>

      {/* ── Re-scan Alert ─────────────────────────────────────────────────── */}
      {baileysStatus?.needsRescan && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold">WhatsApp Fallback needs re-scan!</p>
            <p className="text-sm">
              Session disconnected ({baileysStatus.disconnectReason || 'unknown reason'}).
              Scan the QR code below to restore the fallback.
            </p>
          </div>
        </div>
      )}

      {/* ── Connection Card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Baileys Fallback Connection
            </h2>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${status === 'connected' ? 'bg-emerald-500' :
                  status === 'qr_pending' ? 'bg-amber-400 animate-pulse' :
                    'bg-red-400'
                }`} />
              <span className="text-sm font-medium text-gray-600 capitalize">
                {status === 'qr_pending' && !qrScanned ? 'Waiting for QR scan…' :
                 status === 'qr_pending' && qrScanned ? '⏳ QR Scanned — Establishing connection…' :
                 status === 'connected' ? '🟢 Connected' :
                 status || 'Loading…'}
              </span>
              {baileysStatus?.phoneConnected && status === 'connected' && (
                <span className="text-sm text-gray-400">— +{baileysStatus.phoneConnected}</span>
              )}
            </div>
            {baileysStatus?.connectedAt && (
              <p className="text-xs text-gray-400 mt-1">
                Connected: {fmt(baileysStatus.connectedAt)}
              </p>
            )}
            {baileysStatus?.lastMessageAt && (
              <p className="text-xs text-gray-400">
                Last message: {fmt(baileysStatus.lastMessageAt)}
              </p>
            )}
          </div>

          {/* Daily Limit */}
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Today&apos;s Fallback Usage</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl font-bold text-gray-800">
                {baileysStatus?.dailyCount ?? '—'}
                <span className="text-base font-normal text-gray-400">
                  /{baileysStatus?.dailyLimit ?? '—'}
                </span>
              </span>
              <button
                onClick={() => { setEditingLimit(true); setNewLimit(String(baileysStatus?.dailyLimit || 10)); }}
                className="text-xs text-blue-500 hover:text-blue-700 underline"
              >
                Change
              </button>
            </div>
            {/* Limit bar */}
            {baileysStatus && (
              <div className="mt-1 h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (baileysStatus.dailyCount / baileysStatus.dailyLimit) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Edit Limit Modal inline */}
        {editingLimit && (
          <div className="mt-4 flex items-center gap-3 bg-gray-50 rounded-xl p-4">
            <label className="text-sm font-medium text-gray-700">New daily limit:</label>
            <input
              type="number"
              min={1}
              max={100}
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveLimit}
              disabled={savingLimit}
              className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {savingLimit ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditingLimit(false)} className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-5">
          {status !== 'connected' && (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="bg-emerald-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
            >
              {connecting ? 'Connecting…' : status === 'qr_pending' ? '🔄 Refresh QR' : '📱 Connect WhatsApp'}
            </button>
          )}
          {status === 'connected' && (
            <button
              onClick={handleDisconnect}
              className="border border-red-300 text-red-600 text-sm px-5 py-2 rounded-lg hover:bg-red-50 font-medium"
            >
              Disconnect
            </button>
          )}
          <button
            onClick={() => { fetchStatus(); fetchStats(); }}
            className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            ↻ Refresh
          </button>
        </div>

        {/* QR Code */}
        {status === 'qr_pending' && baileysStatus?.qrCodeBase64 && !qrScanned && (
          <div className="mt-5 flex flex-col items-center gap-3 p-5 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-sm font-medium text-gray-600">
              Open WhatsApp → Linked Devices → Link a Device → Scan
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={baileysStatus.qrCodeBase64}
              alt="WhatsApp QR Code"
              className="w-56 h-56 rounded-lg border"
            />
            <p className="text-xs text-gray-400 animate-pulse">Waiting for scan… auto-refreshes</p>
          </div>
        )}

        {/* Post-scan connecting state */}
        {status === 'qr_pending' && qrScanned && (
          <div className="mt-5 flex flex-col items-center gap-4 p-6 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-base font-semibold text-emerald-700">QR scanned! Connecting to WhatsApp…</p>
            </div>
            <p className="text-sm text-emerald-600">Please wait, this may take a few seconds. Do not close this page.</p>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Test Message Card ─────────────────────────────────────────────── */}
      {status === 'connected' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Send Test Message</h2>
          <p className="text-sm text-gray-500 mb-4">
            Test the Baileys connection. These messages bypass the daily limit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Phone (e.g. 919876543210)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Message Text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleTestMessage}
              disabled={sendingTest || !testPhone || !testText}
              className="bg-blue-600 text-white text-sm px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium whitespace-nowrap"
            >
              {sendingTest ? 'Sending...' : 'Send Test'}
            </button>
          </div>
        </div>
      )}

      {/* ── Stats Cards ───────────────────────────────────────────────────── */}
      {stats && stats.today && stats.period && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Today', value: stats.today.total, color: 'text-gray-800', bg: 'bg-white' },
            { label: '✅ Delivered', value: stats.today.success, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: '❌ Failed', value: stats.today.failed, color: 'text-red-700', bg: 'bg-red-50' },
            { label: '⏭️ Limit Skipped', value: stats.today.skippedLimit, color: 'text-amber-700', bg: 'bg-amber-50' },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} rounded-xl border border-gray-100 shadow-sm p-5`}>
              <p className="text-xs text-gray-400 mb-1">{card.label}</p>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
          <div className="bg-blue-50 rounded-xl border border-blue-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-1">nuren.ai Sent</p>
            <p className="text-3xl font-bold text-blue-700">{stats.today.nurenSuccess}</p>
          </div>
          <div className="bg-purple-50 rounded-xl border border-purple-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-1">Baileys Sent</p>
            <p className="text-3xl font-bold text-purple-700">{stats.today.baileysSuccess}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 col-span-2">
            <p className="text-xs text-gray-400 mb-1">7-Day Total</p>
            <p className="text-3xl font-bold text-gray-800">{stats.period.total}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.period.success} delivered · {stats.period.failed} failed
            </p>
          </div>
        </div>
      )}

      {/* ── Logs Table ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Message Logs</h2>
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="SKIPPED_LIMIT">Skipped (Limit)</option>
              <option value="NO_FALLBACK">No Fallback</option>
            </select>
            <select
              value={channelFilter}
              onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Channels</option>
              <option value="NUREN">nuren.ai</option>
              <option value="BAILEYS">Baileys</option>
              <option value="NONE">None</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                  {['Time', 'Phone', 'Order', 'Template', 'Channel', 'Status', 'Error', ''].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">Loading…</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">No logs found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(log.sentAt)}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">
                      {log.phoneNumber.replace(/^91/, '+91 ')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {log.orderId ? (
                        <span className="font-mono">{log.orderId.slice(-8)}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{log.templateName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${channelBadge[log.channel]}`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[log.status]}`}>
                        {log.status === 'SUCCESS' ? '✅' : log.status === 'FAILED' ? '❌' : log.status === 'SKIPPED_LIMIT' ? '⏭️' : '—'}
                        {' '}{log.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-red-500 text-xs max-w-xs truncate">
                      {log.errorMessage || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {logsTotal > 20 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, logsTotal)} of {logsTotal}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <button
                disabled={page * 20 >= logsTotal}
                onClick={() => setPage(p => p + 1)}
                className="text-sm border border-gray-300 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
      {/* ── Log Detail Modal ───────────────────────────────────────────────── */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Message Log Details</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedLog._id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 space-y-5">

              {/* Status + Channel */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusColor[selectedLog.status]}`}>
                  {selectedLog.status === 'SUCCESS' ? '✅' : selectedLog.status === 'FAILED' ? '❌' : '⏭️'}
                  {selectedLog.status.replace(/_/g, ' ')}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${channelBadge[selectedLog.channel]}`}>
                  {selectedLog.channel}
                </span>
              </div>

              {/* Core Details */}
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                {([
                  ['Phone Number', selectedLog.phoneNumber.replace(/^91/, '+91 ')],
                  ['Template', selectedLog.templateName],
                  ['Order ID', selectedLog.orderId || '—'],
                  ['Recipient', selectedLog.recipientName || '—'],
                  ['Sent At', selectedLog.sentAt ? new Date(selectedLog.sentAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }) : '—'],
                  ['Created At', selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }) : '—'],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex items-start px-4 py-2.5 gap-4">
                    <span className="text-xs text-gray-400 w-28 shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-gray-700 font-mono break-all">{value}</span>
                  </div>
                ))}
              </div>

              {/* Delivery Attempt Status */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Attempts</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { label: 'Primary Attempted', value: selectedLog.primaryAttempted },
                    { label: 'Primary Success', value: selectedLog.primarySuccess },
                    { label: 'Fallback Attempted', value: selectedLog.fallbackAttempted },
                    { label: 'Fallback Success', value: selectedLog.fallbackSuccess },
                  ] as { label: string; value: boolean }[]).map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className={`text-xs font-bold ${value ? 'text-emerald-600' : 'text-red-500'}`}>
                        {value ? '✓ Yes' : '✗ No'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payload */}
              {selectedLog.payload && Object.keys(selectedLog.payload).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payload</p>
                  <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                    {Object.entries(selectedLog.payload).map(([key, val]) => (
                      <div key={key} className="flex items-start px-4 py-2.5 gap-4">
                        <span className="text-xs text-gray-400 w-32 shrink-0 pt-0.5 font-mono">{key}</span>
                        <span className="text-sm text-gray-700 break-all">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {selectedLog.errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">Error Message</p>
                  <p className="text-sm text-red-700 font-mono break-all">{selectedLog.errorMessage}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
