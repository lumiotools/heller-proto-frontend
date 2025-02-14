import React from "react";
import { Cpu } from "lucide-react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="h-16 px-8 mx-auto flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50">
        {/* Logo and title section */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Cpu className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              AI CAD Analyzer
            </h1>
            <p className="text-sm text-slate-500">
              Intelligent Design Analysis
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center space-x-8">
          <Link
            href="/"
            className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/guidelines"
            className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            Guidelines
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
