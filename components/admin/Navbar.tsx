"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useAuth } from "@/components/auth/AuthProvider";
import Image from "next/image";

interface NavbarProps {
  user: User;
  userRole: "admin" | "sales_rep" | null;
}

export default function Navbar({ user, userRole }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-zinc-900 text-white fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/proposal-generator">
              <Image
                src="/XMA-White.svg"
                alt="XMA Agency Logo"
                className="h-8 w-auto"
                width={32}
                height={32}
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link
              href="/proposal-generator"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/proposal-generator")
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              Proposal Generator
            </Link>
            <Link
              href="/proposals"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/proposals")
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              View Proposals
            </Link>
            {userRole === "admin" && (
              <>
                <Link
                  href="/reports"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/reports")
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  Reports
                </Link>
                <Link
                  href="/sales-team"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/sales-team")
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  Sales Team
                </Link>
                <Link
                  href="/invoices"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive("/invoices")
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-zinc-700 hover:text-white"
                  }`}
                >
                  Invoices
                </Link>
              </>
            )}

            {/* Profile dropdown */}
            <div className="relative ml-4">
              <button
                className="bg-zinc-700 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-white"
                onClick={toggleProfile}
              >
                <span className="px-3 py-2 rounded-md text-sm font-medium flex items-center">
                  {user.email}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </span>
              </button>

              {isProfileOpen && (
                <div className="origin-top-right overflow-hidden absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-zinc-700 ring-1 ring-black ring-opacity-5">
                  <div>
                    <Link
                      href="/admin/packages"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-600"
                      >
                      Packages
                    </Link>
                    <Link
                      href="/admin/tos-management"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-600"
                      >
                      Terms & Conditions
                    </Link>
                    <Link
                      href="/account/mcp-keys"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-600"
                    >
                      MCP API Keys
                    </Link>
                  </div>
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-600"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-zinc-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/proposal-generator"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/proposal-generator")
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-zinc-600 hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Proposal Generator
            </Link>
            <Link
              href="/proposals"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/proposals")
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-zinc-600 hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              View Proposals
            </Link>
            {userRole === "admin" && (
              <>
                <Link
                  href="/reports"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/reports")
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-zinc-600 hover:text-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Reports
                </Link>
                <Link
                  href="/sales-team"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/sales-team")
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-zinc-600 hover:text-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sales Team
                </Link>
                <Link
                  href="/invoices"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive("/invoices")
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-zinc-600 hover:text-white"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Invoices
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-zinc-600">
            <div className="px-2 space-y-1">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-300">
                {user.email}
              </div>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-zinc-600 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
