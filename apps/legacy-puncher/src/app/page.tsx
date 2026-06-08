"use client";

import { useState } from "react";
import { JsonImporter } from "@/components/json-importer";
import { OrderTable } from "@/components/order-table";
import { LegacyOrder } from "@/lib/logistics/types";
import { Toaster } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [orders, setOrders] = useState<LegacyOrder[]>([]);

  const handleImport = (importedOrders: LegacyOrder[]) => {
    setOrders(importedOrders);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Legacy Order Puncher
            </h1>
            <p className="text-slate-500">
              Import, punch shipments, and generate invoices from legacy data.
            </p>
          </div>
        </header>

        <section className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Import Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonImporter onImport={handleImport} />
            </CardContent>
          </Card>

          {orders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Orders ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTable orders={orders} />
              </CardContent>
            </Card>
          )}
        </section>
      </div>
      <Toaster position="top-right" />
    </main>
  );
}
