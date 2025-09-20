"use client";

import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated, registerUser } = useAuth();
  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser({ name, password });
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      // Use transition to prevent blocking updates
      startTransition(() => {
        router.push(`/dashboard`);
      });
    }
  }, [user]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 items-center justify-center max-w-6xl mx-auto h-screen">
      <div className="flex flex-col gap-y-3 px-4">
        <h3 className="text-xl font-semibold">Hello, there!</h3>
        <p>
          Please fill in the form to create an account. If you already have an
          account, you can{" "}
          <Link href="/auth/login" className="underline underline-offset-5">
            login here
          </Link>
          .
        </p>
      </div>

      <div className="w-full max-w-[360px] mx-auto py-10">
        <div className="flex flex-col items-center gap-2 text-center mb-6">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Fill in the form below to create an account{" "}
            <i className="far fa-arrow-down ml-1"></i>
          </p>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="mb-6">
            <Input
              className="h-12"
              placeholder="Your username"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <Input
              className="h-12"
              placeholder="Your password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-3 flex items-center">
              <div className="cursor-pointer" onClick={handleToggle}>
                <i
                  className={`fad ${
                    showPassword ? "fa-lock" : "fa-lock-open"
                  } mr-2`}
                />
                {showPassword ? "Hide" : "Show"} password
              </div>
            </div>
          </div>

          <div className="mt-2 mb-4">
            <Button
              type="submit"
              className="w-full cursor-pointer font-bold hover:ring-2 hover:ring-primary hover:text-surface hover:bg-transparent hover:text-primary my-2"
              disabled={name.length === 0 || password.length === 0 || loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Register"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
