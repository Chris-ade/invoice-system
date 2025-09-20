import "./globals.css";
import "@/public/css/all.min.css";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import Layout from "./wrapper";
import { ReactNode } from "react";

const pageMetaData = {
  title: "BOUESTI Water Invoice System",
  description:
    "A secure platform for managing water invoices and payments at BOUESTI Water.",
};

type LayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>{pageMetaData.title}</title>
        <meta name="description" content={pageMetaData.description} />
      </head>
      <body>
        <Layout>{children}</Layout>
        <Toaster />
      </body>
    </html>
  );
}
