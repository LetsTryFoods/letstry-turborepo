'use client'

import { useQrAnalytics } from '@/lib/analytics/useQrAnalytics'
import {
  Smartphone,
  Layers,
  Laptop,
  Globe,
  RefreshCw,
  Hash,
  Calendar,
} from 'lucide-react'

export default function QrAnalyticsPage() {
  const { analytics, loading, error, refetch } = useQrAnalytics()

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 animate-pulse bg-white">
              <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-6 bg-white animate-pulse space-y-4">
          <div className="h-6 w-36 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <h3 className="font-semibold text-lg">Failed to load analytics telemetry</h3>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  const totals = analytics?.totalOSSplit || { android: 0, ios: 0, windows: 0, macOS: 0, other: 0 }
  const totalSum = Object.values(totals).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">QR Telemetry Hub</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time deep-link scan routing analytics and device engagement logs.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Stats
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Scans Card */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Scans</span>
            <Layers className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {analytics?.totalScans || 0}
          </p>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Active app store routes
          </div>
        </div>

        {/* Unique Scans Card */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Unique Signatures</span>
            <Hash className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {analytics?.uniqueScans || 0}
          </p>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            Distinct tracking fingerprints
          </div>
        </div>

        {/* Mobile Engagement Card */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Android Hits</span>
            <Smartphone className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {totals.android}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            {((totals.android / totalSum) * 100).toFixed(1)}% share
          </div>
        </div>

        {/* iOS Engagement Card */}
        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Apple iOS Hits</span>
            <Smartphone className="h-5 w-5 text-sky-600" />
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {totals.ios}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            {((totals.ios / totalSum) * 100).toFixed(1)}% share
          </div>
        </div>
      </div>

      {/* Comparative OS Breakdown Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Operating System Landscape</h2>
        <div className="space-y-4">
          {[
            { label: 'Android OS', count: totals.android, color: 'bg-emerald-500' },
            { label: 'Apple iOS', count: totals.ios, color: 'bg-sky-500' },
            { label: 'Windows Platform', count: totals.windows, color: 'bg-blue-600' },
            { label: 'Mac OS Systems', count: totals.macOS, color: 'bg-indigo-600' },
            { label: 'Other/Web Fallbacks', count: totals.other, color: 'bg-amber-500' },
          ].map((item) => {
            const pct = ((item.count / totalSum) * 100).toFixed(1)
            return (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>{item.label}</span>
                  <span className="text-gray-500">{item.count} scans ({pct}%)</span>
                </div>
                <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Scans Logs Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">Live Device Logs & Footprints</h2>
          <span className="text-xs bg-gray-200 text-gray-700 font-medium px-2.5 py-0.5 rounded-full">
            Showing top {analytics?.recentScans?.length || 0} hits
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <th className="p-4">Platform Info</th>
                <th className="p-4">Fingerprint Hash</th>
                <th className="p-4">IP & Region</th>
                <th className="p-4 text-center">Frequency</th>
                <th className="p-4 text-right">Latest Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {(!analytics?.recentScans || analytics.recentScans.length === 0) ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                    No scan footprints recorded yet. Scan the QR live to generate records.
                  </td>
                </tr>
              ) : (
                analytics.recentScans.map((scan, idx) => {
                  const lastTimestamp = scan.dateTime?.[scan.dateTime.length - 1] || 'N/A'
                  const isMobileOrTablet = scan.device !== 'pc'
                  return (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-medium text-gray-900 max-w-[200px] truncate">
                        <div className="flex items-center gap-2">
                          {isMobileOrTablet ? (
                            <Smartphone className="h-4 w-4 text-gray-400 shrink-0" />
                          ) : (
                            <Laptop className="h-4 w-4 text-gray-400 shrink-0" />
                          )}
                          <div>
                            <div className="font-bold text-gray-800 capitalize">{scan.os}</div>
                            <div className="text-[11px] text-gray-400 font-normal truncate" title={scan.userAgent}>
                              {scan.userAgent || 'Unknown UA string'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium select-all">
                          {scan.fingerprint?.substring(0, 12)}...
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Globe className="h-3 w-3 text-gray-400" />
                          {scan.ipAddress}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {scan.timesScanned}x
                        </span>
                      </td>
                      <td className="p-4 text-right text-gray-500 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {lastTimestamp}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
