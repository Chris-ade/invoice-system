"use client";

import React, { Fragment, use } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";

const Header = ({
  toggleTheme,
  theme,
  resolvedTheme,
}: {
  toggleTheme: () => void;
  theme: string;
  resolvedTheme: string;
}) => {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const navigate = useRouter();

  const userInitials = user?.name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="fixed top-0 left-0 w-full z-[15] bg-primary-foreground dark:border-b-surface/20 transition-all duration-300 ease-in-out shadow-sm border-b border-surface/20 h-[70px]">
      <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <nav className="relative z-50 flex items-center justify-between w-full mt-2 mb-3">
          <div className="flex items-center md:gap-x-12">
            <Link
              href="/"
              className="flex items-center gap-2 text-surface text-lg font-bold"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
                <i className="fas fa-droplet" />
              </div>
              BOUESTI Water
            </Link>
          </div>
          <div className="flex-grow"></div>
          <div className="flex items-center gap-x-2 md:gap-x-2">
            <a
              className="inline-block rounded-lg py-2 px-4 bg-transparent hover:bg-primary hover:text-white text-surface"
              onClick={toggleTheme}
              title={`Switch to ${
                theme === "dark"
                  ? "light"
                  : theme === "light"
                  ? "system"
                  : "dark"
              } mode`}
            >
              <i
                className={`fa ${
                  resolvedTheme === "light" ? "fa-sun-alt" : "fa-moon"
                }`}
              ></i>
            </a>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-x-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-semibold bg-gray-200 dark:bg-gray-700">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center justify-center border-0 h-[32px] w-[32px] rounded-full cursor-pointer"
                    >
                      <i className="fas fa-bars"></i>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[256px] py-3 text-xl"
                    align="end"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="pl-6 py-3">
                        <Link
                          href="/lecturer/students"
                          className="dropdown-item w-full flex items-center gap-x-3"
                        >
                          <i className="far fa-users"></i> Students
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="pl-6 py-3">
                      <a
                        className="w-full cursor-pointer flex items-center gap-x-3"
                        onClick={async (e) => {
                          e.preventDefault();
                          await logoutUser();
                        }}
                      >
                        <i className="far fa-sign-out"></i> Log out
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Fragment>
                <div className="hidden md:block">
                  <Link
                    className="inline-block rounded-lg px-2 py-1 text-sm text-surface hover:bg-primary hover:text-white mr-4"
                    href="/auth/login"
                  >
                    Log in
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Link
                    className="inline-block rounded-lg px-2 py-1 text-sm text-surface hover:bg-primary hover:text-white"
                    href="/auth/register"
                  >
                    Sign Up
                  </Link>
                </div>
              </Fragment>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
