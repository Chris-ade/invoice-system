"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useApiQuery } from "@/hooks/useApi";
import ActivityIndicator from "@/components/common/activity-indicator";
import { useRouter } from "next/navigation";
import { InvoiceResponse } from "@/types/invoice";

export default function PrintableInvoice() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { isPending, data } = useApiQuery(`/invoices/${id}`);

  useEffect(() => {
    if (!data) return;

    // Trigger print after a small delay so DOM is ready
    const timer = setTimeout(() => window.print(), 500);

    // Handler for when print dialog closes
    const handleAfterPrint = () => {
      router.push("/dashboard");
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [data, router]);

  if (isPending) {
    return (
      <ActivityIndicator isContent={true} isFull={true} text="Loading..." />
    );
  }

  const invoice = (data as InvoiceResponse) || null;

  if (!invoice) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div id="printable-invoice" className="receipt text-xs font-mono p-2">
      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="font-bold text-[8px]">BOUESTI WATER</h1>
        <p>
          Bamidele Olumilua University of Science, Education and Technology,
          Ikere-Ekiti
        </p>
        <p>Tel: 08069016322</p>
      </div>

      {/* Customer + meta info */}
      <div className="mb-1">
        <p>
          <strong>Sold To:</strong> {invoice.customerName ?? "WALK IN CUSTOMER"}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(invoice.invoiceDate).toLocaleDateString("en-GB")}{" "}
          {new Date(invoice.invoiceDate).toLocaleTimeString("en-GB")}
        </p>
        <p>
          <strong>Cashier:</strong> {invoice.cashierName.toUpperCase()}
        </p>
        <p>
          <strong>Receipt No:</strong> {invoice.invoiceNumber}
        </p>
      </div>

      {/* Items Table */}
      <table className="w-full mb-1">
        <thead>
          <tr className="border-y border-dashed border-gray-500">
            <th className="text-left">QTY</th>
            <th className="text-left">PRODUCT</th>
            <th className="text-right">PRICE</th>
            <th className="text-right">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.quantity}</td>
              <td>{item.description}</td>
              <td className="text-right">{item.amount.toFixed(2)}</td>
              <td className="text-right">{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr className="border-dashed border-gray-600 my-1" />

      {/* Totals */}
      <div className="mb-2">
        <p>
          <strong>Total:</strong> {invoice.total.toFixed(2)}
        </p>
        <p>
          <strong>Invoice Amount:</strong> {invoice.total.toFixed(2)}
        </p>
        <p>
          <strong>Transfer Amount:</strong> {invoice.total.toFixed(2)}
        </p>
        <p>
          <strong>Balance:</strong> 0.00
        </p>
      </div>

      <hr className="border-dashed border-gray-600 my-1" />

      {/* Footer */}
      <div className="text-center mt-2">
        <p>Thanks For Your Patronage...</p>
        <p>Goods bought in good condition are Not Returnable</p>
      </div>
    </div>
  );
}
