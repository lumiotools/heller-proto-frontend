"use client";

import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="w-full h-20 bg-[#011A2E] flex items-center justify-between px-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-lg flex justify-center items-center hover:bg-white/20 transition-colors duration-200">
          <Mic className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-white font-semibold text-xl">AI CAD Analyzer</h1>
          <p className="text-white/60 text-sm">Intelligent Design Analysis</p>
        </div>
      </div>
      <img
        src="https://heller-proto-frontend.vercel.app/hellerLogo.png"
        alt="Heller Logo"
        className="w-28"
      />
      <div className="flex items-center gap-5">
        {/* Dashboard Button */}
        <Button
          onClick={() => router.push("/")}
          className={`px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 
            ${
              pathname === "/"
                ? "text-white/90 border-white/10 bg-white/10 hover:bg-white/20"
                : "text-white/90 bg-[#011A2E] hover:bg-white/10"
            }`}
        >
          Dashboard
        </Button>

        {/* Guidelines Button */}
        <Button
          onClick={() => router.push("/guidelines")}
          className={`px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 
            ${
              pathname === "/guidelines"
                ? "text-white/90 border-white/10 bg-white/10 hover:bg-white/20"
                : "text-white/90 bg-[#011A2E] hover:bg-white/10"
            }`}
        >
          Guidelines
        </Button>

        {/* Collect Data Button */}
        <Button
          onClick={() => router.push("/dataCollect")}
          className={`px-4 py-2 rounded-md transition-all duration-200 hover:scale-105 
            ${
              pathname === "/dataCollect"
                ? "text-white/90 border-white/10 bg-white/10 hover:bg-white/20"
                : "text-white/90 bg-[#011A2E] hover:bg-white/10"
            }`}
        >
          Collect Data
        </Button>
      </div>
    </nav>
  );
}
