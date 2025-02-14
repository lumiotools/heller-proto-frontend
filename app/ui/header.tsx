"use client";

import React, { useState } from "react";
import { Cpu, Menu } from "lucide-react";
import Link from "next/link";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-[#0a0a2e] text-white font-montserrat">
      <div className="container mx-auto">
        {/* Main Navigation */}
        <div className="h-16 px-4 lg:px-8 flex items-center justify-between">
          {/* Logo and title section */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-900/20">
              <Cpu className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                AI CAD Analyzer
              </h1>
              <p className="text-sm text-gray-400">
                Intelligent Design Analysis
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className="flex space-x-1">
              <Link
                href="/"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-blue-900/20 rounded-md transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/guidelines"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-blue-900/20 rounded-md transition-colors text-sm font-medium"
              >
                Guidelines
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-blue-900/20"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 py-2 border-t border-blue-900/30">
            <nav className="space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-blue-900/20 rounded-md transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/guidelines"
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-blue-900/20 rounded-md transition-colors text-sm font-medium"
              >
                Guidelines
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
