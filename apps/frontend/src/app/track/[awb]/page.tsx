'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Truck, XCircle, Package, MapPin, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface TrackingEvent {
  statusCode: string;
  statusDescription: string;
  location: string | null;
  actionDatetime: string;
  remarks: string | null;
}

interface TrackingData {
  awbNumber: string;
  statusCode: string;
  statusDescription: string;
  origin: string;
  destination: string;
  bookedAt: string;
  isDelivered: boolean;
  isCancelled: boolean;
  estimatedDelivery: string | null;
  trackingHistory: TrackingEvent[];
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

function StatusIcon({ isDelivered, isCancelled }: { isDelivered: boolean; isCancelled: boolean }) {
  if (isDelivered) return <CheckCircle className="h-10 w-10 text-green-600" />;
  if (isCancelled) return <XCircle className="h-10 w-10 text-red-500" />;
  return <Truck className="h-10 w-10 text-yellow-500" />;
}

function statusBadgeClass(isDelivered: boolean, isCancelled: boolean): string {
  if (isDelivered) return 'bg-green-100 text-green-700';
  if (isCancelled) return 'bg-red-100 text-red-700';
  return 'bg-yellow-100 text-yellow-700';
}

export default function TrackPage() {
  const params = useParams();
  const awb = params.awb as string;

  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!awb) return;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${baseUrl}/shipments/track/${awb}`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then((json) => setData(json))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [awb]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Tracking Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">No shipment found for AWB <span className="font-medium">{awb}</span></p>
          <Link href="/" className="text-yellow-600 hover:underline text-sm">← Back to home</Link>
        </div>
      </main>
    );
  }

  const sortedHistory = [...data.trackingHistory].sort(
    (a, b) => new Date(b.actionDatetime).getTime() - new Date(a.actionDatetime).getTime(),
  );

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/" className="text-sm text-yellow-600 hover:underline">
          ← Back to home
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <StatusIcon isDelivered={data.isDelivered} isCancelled={data.isCancelled} />
            <div>
              <p className="text-xs text-gray-400 mb-0.5">AWB Number</p>
              <p className="text-lg font-semibold text-gray-900">{data.awbNumber}</p>
            </div>
          </div>

          <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 ${statusBadgeClass(data.isDelivered, data.isCancelled)}`}
          >
            {data.statusDescription || data.statusCode || 'In Progress'}
          </span>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex gap-2 items-start">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">From</p>
                <p className="font-medium text-gray-800">{data.origin || '—'}</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">To</p>
                <p className="font-medium text-gray-800">{data.destination || '—'}</p>
              </div>
            </div>
            <div className="flex gap-2 items-start">
              <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">Booked On</p>
                <p className="font-medium text-gray-800">{formatDateTime(data.bookedAt)}</p>
              </div>
            </div>
            {data.estimatedDelivery && (
              <div className="flex gap-2 items-start">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">Est. Delivery</p>
                  <p className="font-medium text-gray-800">{formatDateTime(data.estimatedDelivery)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {sortedHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-5 flex gap-2 items-center">
              <Package className="h-4 w-4 text-yellow-500" />
              Tracking History
            </h2>
            <ol className="relative border-l border-gray-200 space-y-6 ml-2">
              {sortedHistory.map((event, idx) => (
                <li key={idx} className="ml-4">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-yellow-400" />
                  <p className="text-xs text-gray-400">{formatDateTime(event.actionDatetime)}</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">{event.statusDescription || event.statusCode}</p>
                  {event.location && (
                    <p className="text-xs text-gray-500 mt-0.5 flex gap-1 items-center">
                      <MapPin className="h-3 w-3" /> {event.location}
                    </p>
                  )}
                  {event.remarks && (
                    <p className="text-xs text-gray-400 mt-0.5">{event.remarks}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
