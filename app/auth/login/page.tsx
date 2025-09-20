"use client";

import { startTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import PrivateRoute from "@/services/route";
import Link from "next/link";

export default function Page() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated, loginUser } = useAuth();
  const router = useRouter();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser({ name, password });
    } catch (error) {
      console.error("Login failed:", error);
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
          Please login with your credentials to access the dashboard, if you
          don't have an account, you can{" "}
          <Link href="/auth/register" className="underline underline-offset-5">
            create one
          </Link>
          .
        </p>
      </div>

      <div className="w-full max-w-[360px] mx-auto py-10">
        <div className="flex flex-col items-center gap-2 text-center mb-6">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Login with your credentials below{" "}
            <i className="far fa-arrow-down ml-1"></i>
          </p>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="mb-6">
            <Input
              className="h-12"
              placeholder="Username"
              type="text"
              id="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <Input
              className="h-12"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              id="password"
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
              {loading ? <Loader2 className="animate-spin" /> : "Login"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
