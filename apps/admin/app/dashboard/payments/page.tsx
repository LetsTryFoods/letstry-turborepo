'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePaymentsList } from '@/lib/payment/usePayments';
import { getStatusBadgeColor, formatCurrency, formatDateTime } from '@/lib/payment/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, DollarSign } from 'lucide-react';

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmountInput, setMinAmountInput] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmountInput, setMaxAmountInput] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinAmount(minAmountInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [minAmountInput]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMaxAmount(maxAmountInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [maxAmountInput]);

  const queryInput = useMemo(() => ({
    page,
    limit: 50,
    filters: {
      searchQuery: searchTerm || undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      minAmount: minAmount || undefined,
      maxAmount: maxAmount || undefined,
    },
  }), [page, searchTerm, selectedStatuses, startDate, endDate, minAmount, maxAmount]);

  const { data, loading, error } = usePaymentsList(queryInput);

  const payments = (data as any)?.getAdminPaymentsList?.payments || [];
  const total = (data as any)?.getAdminPaymentsList?.total || 0;
  const totalPages = (data as any)?.getAdminPaymentsList?.totalPages || 1;
  const summary = (data as any)?.getAdminPaymentsList?.summary || {
    totalPayments: 0,
    totalAmount: '0',
    totalRefunded: '0',
    successCount: 0,
    failedCount: 0,
    pendingCount: 0,
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setPage(1);
  };

  if (loading) return <div className="p-6">Loading payments...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading payments</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalAmount, 'INR')}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.totalRefunded, 'INR')}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold">{summary.successCount}</p>
              </div>
              <Badge variant="default" className="h-8 px-3">Success</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed/Pending</p>
                <p className="text-2xl font-bold">{summary.failedCount + summary.pendingCount}</p>
              </div>
              <Badge variant="secondary" className="h-8 px-3">Failed</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Payment ID, Order ID, PSP Txn ID..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                  placeholder="Start Date"
                />
              </div>

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                  placeholder="End Date"
                />
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Min Amount"
                  value={minAmountInput}
                  onChange={(e) => setMinAmountInput(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Max Amount"
                  value={maxAmountInput}
                  onChange={(e) => setMaxAmountInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'].map(status => (
                <Button
                  key={status}
                  variant={selectedStatuses.includes(status) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>

            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  setSearchTerm('');
                }}
                className="w-fit"
              >
                Clear search
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading && <div className="text-center py-8">Loading payments...</div>}

      {payments.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Payments ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Payment ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.map((payment: any) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono">{payment.paymentOrderId}</td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {payment.orderId || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {formatCurrency(payment.amount, payment.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={payment.paymentOrderStatus === 'SUCCESS' ? 'default' : 'secondary'}>
                            {payment.paymentOrderStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{payment.paymentMethod || '-'}</td>
                        <td className="px-4 py-3 text-sm">{formatDateTime(payment.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/payments/${payment.paymentOrderId}`}>
                            <Button variant="link" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Showing {payments.length} of {total} payments
                </span>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

