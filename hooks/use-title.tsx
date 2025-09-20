"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function useTitle(title: string) {
  const location = usePathname();

  useEffect(() => {
    document.title = title;
  }, [title, location]);
}

export default useTitle;
