"use client";

import React, { useState, useEffect } from "react";
import Header from "./partials/header";
import Footer from "./partials/footer";
import ActivityIndicator from "@/components/common/activity-indicator";
import { useTheme } from "@/context/theme-context";
import { usePathname } from "next/navigation";
import { Providers } from "./providers";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <InnerLayout>{children}</InnerLayout>
    </Providers>
  );
}
function InnerLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [showLoader, setShowLoader] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (pathname !== prevPath) {
      setShowLoader(true);
      const timeout = setTimeout(() => {
        setShowLoader(false);
        setPrevPath(pathname);
      }, 1000); // Keep in sync with bar animation

      return () => clearTimeout(timeout);
    }
  }, [pathname]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="h-full flex flex-col gap-0">
      <ActivityIndicator isContent={false} show={showLoader} />
      <Header
        toggleTheme={toggleTheme}
        theme={theme}
        resolvedTheme={resolvedTheme}
      />
      <main role="main" className="flex-1 w-full mt-[70px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
