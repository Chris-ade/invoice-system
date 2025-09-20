import { res } from "@/lib/auth";
import db from "@/lib/prisma";
import { withAuthParams } from "@/lib/withAuth";
import { NextRequest } from "next/server";

export const GET = withAuthParams<{ id: string }>(
  async (req: NextRequest, context, user) => {
    try {
      const { id } = context.params;

      // Get invoice by ID
      const invoice = await db.invoice.findUnique({
        where: { id: parseInt(id) },
        include: {
          items: true,
          cashier: { select: { id: true, name: true } },
        },
      });

      if (!invoice) {
        return res({ success: false, message: "Invoice not found" }, 404);
      }

      const formattedInvoice = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        cashierName: invoice.cashier.name,
        invoiceDate: invoice.invoiceDate,
        total: invoice.total,
        items: invoice.items.map((item) => ({
          id: item.id,
          invoiceId: item.invoiceId,
          description: item.description,
          quantity: item.quantity,
          amount: item.amount,
          total: item.total,
        })),
      };

      return res({ success: true, data: formattedInvoice });
    } catch (error) {
      console.error(error);
      return res(
        {
          success: false,
          message: "Failed to create invoice",
        },
        500
      );
    }
  }
);

export const PUT = withAuthParams<{ id: string }>(
  async (req: NextRequest, context, user) => {
    try {
      const { id } = context.params;
      const body = await req.json();
      const invoiceId = parseInt(id);

      // Validate items
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return res(
          { success: false, message: "At least one item is required" },
          400
        );
      }

      const items = body.items.map((item: any) => {
        if (item.quantity <= 0) {
          throw new Error(`Invalid quantity for item: ${item.description}`);
        }
        if (item.amount < 0) {
          throw new Error(`Invalid amount for item: ${item.description}`);
        }

        return {
          id: item.id ?? null,
          description: item.description,
          quantity: item.quantity,
          amount: item.amount,
          total: item.amount * item.quantity,
        };
      });

      // Compute sum of item totals
      const computedTotal = items.reduce(
        (sum: number, item: any) => sum + item.total,
        0
      );

      const result = await db.$transaction(async (tx) => {
        // Fetch current items
        const existingItems = await tx.invoiceItem.findMany({
          where: { invoiceId },
        });

        const itemsToUpdate = items.filter((item: any) =>
          existingItems.some((ei) => ei.id === item.id)
        );

        const itemsToCreate = items.filter(
          (item: any) =>
            !item.id || !existingItems.some((ei) => ei.id === item.id)
        );

        const itemIdsToKeep = items.map((item: any) => item.id).filter(Boolean);
        const itemsToDelete = existingItems.filter(
          (ei) => !itemIdsToKeep.includes(ei.id)
        );

        // Update invoice
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            customerName: body.customerName,
            total: computedTotal,
          },
        });

        // Update existing items
        for (const item of itemsToUpdate) {
          await tx.invoiceItem.update({
            where: { id: item.id! },
            data: {
              description: item.description,
              quantity: item.quantity,
              amount: item.amount,
              total: item.total,
            },
          });
        }

        // Create new items
        if (itemsToCreate.length > 0) {
          await tx.invoiceItem.createMany({
            data: itemsToCreate.map((item: any) => ({
              invoiceId,
              description: item.description,
              quantity: item.quantity,
              amount: item.amount,
              total: item.total,
            })),
          });
        }

        // Delete removed items
        if (itemsToDelete.length > 0) {
          await tx.invoiceItem.deleteMany({
            where: { id: { in: itemsToDelete.map((i) => i.id) } },
          });
        }

        // Return updated invoice with relations
        return tx.invoice.findUnique({
          where: { id: invoiceId },
          include: {
            items: true,
            cashier: { select: { id: true, name: true } },
          },
        });
      });

      return res({ success: true, data: result });
    } catch (error) {
      console.error(error);
      return res(
        {
          success: false,
          message: "Failed to update invoice",
        },
        400
      );
    }
  }
);
