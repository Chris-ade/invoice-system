"use client";

import ActivityIndicator from "@/components/common/activity-indicator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useApiQuery } from "@/hooks/useApi";
import PrivateRoute from "@/services/route";
import { Users, Trash2, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/common/date-picker";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import {
  InvoiceColumns,
  InvoiceItem,
  InvoiceResponse,
  Response,
} from "@/types/invoice";

export default function Page() {
  const [stats, setStats] = useState<Response | null>(null);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 0, invoiceId: 0, description: "", quantity: 1, amount: 0, total: 0 },
  ]);
  const [invoiceTotal, setInvoiceTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const router = useRouter();
  const { toastSuccess, toastError } = useToast();

  const { isPending, data, refetch, isRefetching } = useApiQuery("/dashboard");
  // Set listing data
  useEffect(() => {
    if (!isPending && data) {
      setStats(data as Response);
      setInvoices((data as { invoices: InvoiceResponse[] }).invoices);
    }
  }, [isPending, data]);

  useEffect(() => {
    const total = items.reduce((acc, item) => acc + item.total, 0);
    setInvoiceTotal(total);
  }, [items]);

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = [...items];
    if (field === "description") {
      updated[index][field] = String(value) as never;
    } else {
      updated[index][field] = Number(value) as never;
    }

    // recalc total whenever quantity or amount changes
    if (field === "quantity" || field === "amount") {
      updated[index].total = updated[index].quantity * updated[index].amount;
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: 0,
        invoiceId: 0,
        description: "",
        quantity: 1,
        amount: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setCustomerName("");
    setInvoiceDate(new Date());
    setItems([
      {
        id: 0,
        invoiceId: 0,
        description: "",
        quantity: 1,
        amount: 0,
        total: 0,
      },
    ]);
    setInvoiceTotal(0);
    setShowCreateForm(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await apiClient.post("/invoices", {
        customerName,
        invoiceDate,
        invoiceTotal,
        items,
      });

      if (res.status !== 200) throw new Error("Failed to generate invoice");

      toastSuccess("Invoice created successfully!");
      resetForm();
      refetch();
    } catch (err) {
      console.error(err);
      toastError("Error creating invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (invoice: InvoiceColumns) => {
    refetch();
  };

  if (isPending) {
    return (
      <ActivityIndicator isContent={true} isFull={true} text="Loading..." />
    );
  }

  return (
    <PrivateRoute>
      <section className="p-6 flex flex-col">
        {/* Stats */}
        <div className="flex justify-between items-center my-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Invoices
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {stats?.stats.totalInvoices}
              </div>
              <a
                href={`/admin/students`}
                className="text-sm hover:underline hover:underline-offset-4"
              >
                View
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Cashiers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {stats?.stats.totalCashiers}
              </div>
              <a
                href={`/admin/students`}
                className="text-sm hover:underline hover:underline-offset-4"
              >
                View
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-4">
          <Card>
            <CardHeader className="flex justify-between items-center pb-2 flex-wrap">
              <div className="space-y-1">
                <CardTitle>Invoices History</CardTitle>
                <CardDescription>
                  Here are the invoices you've generated so far.
                </CardDescription>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={async () => await refetch()}
                >
                  {isRefetching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <DataTable
                  columns={columns(handleUpdate)}
                  data={invoices as InvoiceColumns[]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice form */}
          {showCreateForm && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Create an invoice</CardTitle>
                  <CardDescription>
                    Add multiple items below and submit to generate an invoice.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex-1 space-y-3">
                        <Label>Customer name</Label>
                        <Input
                          type="text"
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter customer name"
                          className="h-12"
                        />
                      </div>

                      <div className="flex-1">
                        <DatePicker label="Date" onChange={setInvoiceDate} />
                      </div>
                    </div>

                    <h3>Order items</h3>

                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-y-4 gap-x-6 border-y py-4"
                      >
                        <div className="font-semibold w-fit">#{index + 1}</div>
                        <div className="flex items-end justify-end gap-4">
                          <div className="w-full space-y-3">
                            <Label>Item</Label>
                            <Select
                              onValueChange={(e) =>
                                handleItemChange(index, "description", e)
                              }
                            >
                              <SelectTrigger className="!h-12 w-full">
                                <SelectValue placeholder="Select an item" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SACHET">Sachet</SelectItem>
                                <SelectItem value="BOTTLECL75">
                                  Bottle (75cl)
                                </SelectItem>
                                <SelectItem value="BOTTLECL50">
                                  Bottle (50cl)
                                </SelectItem>
                                <SelectItem value="OTHERS">Others</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="w-full space-y-3">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min={1}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              placeholder="1"
                              className="h-12"
                            />
                          </div>

                          <div className="w-full space-y-3">
                            <Label>Amount</Label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "amount",
                                  e.target.value
                                )
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
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {index === items.length - 1 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={addItem}
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
                          }).format(invoiceTotal)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-x-3">
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="h-11 cursor-pointer"
                      >
                        {loading ? "Generating..." : "Generate Invoice"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </PrivateRoute>
  );
}
