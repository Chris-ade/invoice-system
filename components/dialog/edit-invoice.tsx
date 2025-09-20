"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Invoice, InvoiceItem } from "@/types/invoice";

interface EditInvoiceDialogProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Invoice) => void;
}

const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({
  invoice,
  open,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { toastSuccess, toastError } = useToast();

  const [formData, setFormData] = useState<{
    customerName: string;
    items: InvoiceItem[];
    total: number;
  }>({
    customerName: invoice.customerName,
    items: invoice.items.map((item) => ({
      id: item.id,
      invoiceId: invoice.id,
      description: item.description,
      size: item.size,
      quantity: item.quantity,
      amount: item.amount,
      total: item.amount * item.quantity,
    })),
    total: invoice.total,
  });

  // Keep formData in sync when invoice prop changes
  useEffect(() => {
    if (invoice) {
      setFormData({
        customerName: invoice.customerName,
        items: invoice.items.map((item) => ({
          id: item.id,
          invoiceId: invoice.id,
          description: item.description,
          size: item.size,
          quantity: item.quantity,
          amount: item.amount,
          total: item.amount * item.quantity,
        })),
        total: invoice.total,
      });
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.customerName.length < 2) {
      toastError("Customer name must be at least 2 characters.");
      return;
    }
    if (formData.items.length < 1) {
      toastError("At least one item must be added.");
      return;
    }

    setLoading(true);
    try {
      await authClient.put(`/invoices/${invoice.id}`, {
        ...formData,
      });

      toastSuccess("Invoice updated.");
      onSave({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        cashierName: invoice.cashierName,
        customerName: formData.customerName,
        total: formData.items.reduce((sum, item) => sum + item.total, 0),
        items: formData.items,
        invoiceDate: invoice.invoiceDate,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toastError("Failed to update invoice.");
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = [...formData.items];
    if (field === "description") {
      updated[index][field] = String(value);
    } else {
      updated[index][field] = Number(value);
    }

    if (field === "quantity" || field === "amount") {
      updated[index].total = updated[index].quantity * updated[index].amount;
    }

    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: 0,
          invoiceId: invoice.id,
          description: "",
          quantity: 1,
          amount: 0,
          total: 0,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const FormWrapper = (
    <Form
      className="px-4"
      formData={formData}
      setFormData={setFormData}
      loading={loading}
      onSubmit={handleSubmit}
      handleItemChange={handleItemChange}
      addItem={addItem}
      removeItem={removeItem}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-full" fullScreen>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Edit the invoice data here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          {FormWrapper}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Invoice</DrawerTitle>
          <DrawerDescription>
            Edit the invoice data here. Click save when you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        {FormWrapper}
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

interface FormProps {
  className?: string;
  formData: {
    customerName: string;
    items: InvoiceItem[];
    total: number;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      customerName: string;
      items: InvoiceItem[];
      total: number;
    }>
  >;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleItemChange: (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
}

function Form({
  className,
  formData,
  setFormData,
  loading,
  onSubmit,
  handleItemChange,
  addItem,
  removeItem,
}: FormProps) {
  const total = formData.items.reduce((sum, item) => sum + item.total, 0);

  return (
    <form
      className={cn("grid items-start gap-6 overflow-y-scroll", className)}
      onSubmit={onSubmit}
    >
      <div className="grid gap-3 mt-4">
        <Label htmlFor="customer-name">Customer Name</Label>
        <Input
          id="customer-name"
          placeholder="Edit customer name"
          value={formData.customerName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, customerName: e.target.value }))
          }
          required
        />
      </div>

      {formData.items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-y-4 gap-x-6 border-y py-4"
        >
          <div className="font-semibold w-fit">#{index + 1}</div>
          <div className="flex items-end justify-end gap-4">
            <div className="w-full space-y-3">
              <Label>Item</Label>
              <Select
                value={item.description}
                onValueChange={(val) =>
                  handleItemChange(index, "description", val)
                }
              >
                <SelectTrigger className="!h-12 w-full">
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SACHET">Sachet</SelectItem>
                  <SelectItem value="BOTTLECL75">Bottle (75cl)</SelectItem>
                  <SelectItem value="BOTTLECL50">Bottle (50cl)</SelectItem>
                  <SelectItem value="OTHERS">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-3">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                className="h-12"
              />
            </div>

            <div className="w-full space-y-3">
              <Label>Amount</Label>
              <Input
                type="number"
                min={0}
                value={item.amount}
                onChange={(e) =>
                  handleItemChange(index, "amount", e.target.value)
                }
                className="h-12"
              />
            </div>

            <div className="w-full space-y-3">
              <Label>Total</Label>
              <Input
                type="number"
                value={item.total}
                className="h-12"
                readOnly
              />
            </div>

            <div className="w-full flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  removeItem(index);
                }}
                disabled={formData.items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {index === formData.items.length - 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    addItem();
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="w-full border-b pb-4">
        <div className="flex items-center justify-end gap-x-4">
          <div className="font-semibold">Total:</div>
          <div className="text-lg font-bold">
            {new Intl.NumberFormat("en-NG", {
              style: "currency",
              currency: "NGN",
            }).format(total)}
          </div>
        </div>
      </div>

      <Button
        className="cursor-pointer"
        type="submit"
        disabled={
          formData.customerName.length < 2 ||
          formData.items.length < 1 ||
          loading
        }
      >
        {loading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}

export default EditInvoiceDialog;
