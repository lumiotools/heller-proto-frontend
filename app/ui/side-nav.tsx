"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SideNav() {
  const [showGuidelines, setShowGuidelines] = useState(true);

  const guidelines = [
    "Minimize heat paths to outside",
    "Adequate ventilation - muffin fans to cool cap and base",
    "Proper finish called on all detail drawings",
    "Use aluminized steel wherever possible in heated regions",
    "Apply as much as possible one piece instead of multiple pieces",
    "Review structural members for acceptable stress and deflection",
    "All rotating members must joined with key or pin, do not rely setscrew alone",
    "Flat on all shafts where set screw bear",
    "Avoid through holes in any part used for nitrogen containment",
    "Provision for routing of drive chains",
    "Provision for mounting of limit switches, with easy access",
    "Provisions for mounting of all drive motors and encoders",
    "Appropriate drawings marked 'make from' or 'similar to'",
    "Effects of shipping considered in the design",
    "Provisions made for shipping",
    "Buy versus make considered for each part",
    "Product size within module specifications",
  ];

  return (
    <div className="w-80 bg-gray-800 text-white h-screen flex flex-col overflow-y-auto">
      <div className="p-6 space-y-4">
        <div className="pt-4">
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="flex items-center justify-between w-full text-lg font-semibold hover:text-blue-400"
          >
            Design Guidelines
            {showGuidelines ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {showGuidelines && (
            <div className="mt-2 space-y-2 text-sm text-gray-300">
              {guidelines.map((guideline, index) => (
                <div
                  key={index}
                  className="py-1 pl-4 pr-2 hover:bg-gray-700 rounded"
                >
                  {guideline}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
