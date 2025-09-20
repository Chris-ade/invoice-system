import { NextRequest } from "next/server";
import { res } from "@/lib/auth";
import db from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    // Basic counts
    const [invoicesCount, cashierCount] = await Promise.all([
      db.invoice.count(),
      db.cashier.count(),
    ]);

    const invoices = await db.invoice.findMany({
      where: { cashierId: user.id },
      include: { items: true, cashier: true },
    });

    const invoicesResponse = invoices.map((inv) => {
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        cashierName: inv.cashier.name,
        total: inv.total,
        invoiceDate: inv.invoiceDate,
        items: inv.items,
      };
    });

    const response = {
      stats: {
        totalInvoices: invoicesCount,
        totalCashiers: cashierCount,
      },
      invoices: invoicesResponse,
    };

    return res({ success: true, data: response });
  } catch (error: any) {
    console.error(error);
    return res(
      { success: false, message: "Failed to fetch dashboard data" },
      500
    );
  }
});
