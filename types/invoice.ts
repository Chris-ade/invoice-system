export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  cashierName: string;
  invoiceDate: Date;
  items: {
    id: number;
    invoiceId: number;
    description: string;
    size?: string;
    quantity: number;
    amount: number;
    total: number;
  }[];
  total: number;
}

export interface InvoiceColumns {
  id: number;
  invoiceNumber: string;
  customerName: string;
  cashierName: string;
  total: number;
  invoiceDate: Date;
}

export interface Response {
  stats: {
    totalInvoices: number;
    totalCashiers: number;
    totalInvoiceGenerated: number;
  };
  invoices: InvoiceResponse[];
}

export interface InvoiceResponse {
  id: number;
  invoiceNumber: string;
  customerName: string;
  cashierName: string;
  cashierId: number;
  invoiceDate: Date;
  createdAt: Date;
  total: number;
  items: InvoiceItemResponse[];
}

export interface InvoiceItemResponse {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  amount: number;
  total: number;
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  amount: number;
  total: number;
}
