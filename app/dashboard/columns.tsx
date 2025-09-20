import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, Printer, Trash2 } from "lucide-react";
import React from "react";

import { ColumnDef } from "@tanstack/react-table";
import { InvoiceColumns } from "@/types/invoice";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import EditInvoiceDialog from "@/components/dialog/edit-invoice";
import { Invoice } from "@/types/invoice";

export const columns = (
  onUpdate: (invoice: Invoice) => void
): ColumnDef<InvoiceColumns>[] => [
  {
    accessorKey: "customerName",
    header: "Customer Name",
  },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice Number",
  },
  {
    accessorKey: "cashierName",
    header: "Cashier Name",
    cell: ({ row }) => {
      return row.original.cashierName.toUpperCase();
    },
  },
  {
    accessorKey: "invoiceDate",
    header: "Created date",
    cell: ({ row }) => {
      return new Date(row.getValue("invoiceDate")).toLocaleDateString("en-GB");
    },
  },
  {
    header: "Actions",
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const invoice = row.original;
      const router = useRouter();
      const { toastSuccess } = useToast();
      const [open, setOpen] = React.useState(false);
      const [editOpen, setEditOpen] = React.useState(false);

      const handlePrint = (invoice: InvoiceColumns) => {
        router.replace(`/invoices/${invoice.id}/print`);
      };

      return (
        <>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              title="Copy invoice number to clipboard"
              onClick={() => {
                navigator.clipboard.writeText(invoice.invoiceNumber);
                toastSuccess("Copied to clipboard");
              }}
            >
              <Copy className="w-4 h-4" /> Copy ID
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="w-4 h-4" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => handlePrint(invoice)}
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
          </div>
          {editOpen && (
            <EditInvoiceDialog
              invoice={invoice as Invoice}
              open={editOpen}
              onClose={() => setEditOpen(false)}
              onSave={onUpdate}
            />
          )}
        </>
      );
    },
  },
];
