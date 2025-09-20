import { res } from "@/lib/auth";
import db from "@/lib/prisma";
import { withAuth } from "@/lib/withAuth";
import { NextRequest } from "next/server";
import { ItemType } from "@/lib/generated/prisma";

export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    const body = await req.json();

    // Find last invoice number
    const lastInvoice = await db.invoice.findFirst({
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });

    let nextNumber = 1;
    if (lastInvoice?.invoiceNumber) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.replace("BW-", ""));
      nextNumber = lastNum + 1;
    }

    const invoiceNumber = `BW-${String(nextNumber).padStart(4, "0")}`;

    // Validate + compute totals
    const items = body.items.map((item: any) => {
      if (!Object.values(ItemType).includes(item.description as ItemType)) {
        throw new Error(`Invalid item type: ${item.description}`);
      }

      return {
        description: item.description as ItemType,
        quantity: item.quantity,
        amount: item.amount,
        total: item.amount * item.quantity,
      };
    });

    const total = body.invoiceTotal;

    // Create invoice
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        customerName: body.customerName,
        cashierId: user.id,
        createdAt: body.invoiceDate ? new Date(body.invoiceDate) : undefined,
        total,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
        cashier: { select: { id: true, name: true } },
      },
    });

    return res({ success: true, data: invoice });
  } catch (error: any) {
    console.error(error);
    return res(
      { success: false, message: error.message || "Failed to create invoice" },
      500
    );
  }
});
