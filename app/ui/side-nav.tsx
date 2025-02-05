"use client";

import { Home, Book } from "lucide-react";
import Link from "next/link";

export default function SideNav() {
  return (
    <div className="w-60 bg-gray-800 text-white h-screen flex flex-col">
      <div className="p-6 space-y-4">
        <Link
          href="/"
          className="flex items-center space-x-3 text-lg font-semibold hover:text-blue-400 p-2 rounded"
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/guidelines"
          className="flex items-center space-x-3 text-lg font-semibold hover:text-blue-400 p-2 rounded"
        >
          <Book className="w-5 h-5" />
          <span>Design Guidelines</span>
        </Link>
      </div>
    </div>
  );
}
