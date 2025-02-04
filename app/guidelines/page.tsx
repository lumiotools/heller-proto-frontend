"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileCheck, AlertTriangle, Info } from "lucide-react";

type Priority = "critical" | "high" | "medium";
type GuidelineType = "documentation" | "technical" | "analysis" | "logistics";

interface Guideline {
  title: string;
  content: string;
  priority: Priority;
  type: GuidelineType;
}

export default function Guidelines() {
  const guidelines: Guideline[] = [
    {
      title: "Drawing Documentation",
      content:
        "Ensure proper finish callouts on all detail drawings. Verify there are no open ends in the design. All drawings must include proper dimensions and tolerances.",
      priority: "high",
      type: "documentation",
    },
    {
      title: "Material Selection Requirements",
      content:
        "Use aluminized steel in heated regions where temperature exceeds 200°F. Every component must have material clearly assigned in the design documentation. Include material properties and heat treatment specifications where applicable.",
      priority: "high",
      type: "technical",
    },
    {
      title: "Structural Analysis Requirements",
      content:
        "All structural members must be reviewed for stress and deflection limits. FEA analysis required for critical components. Maximum allowable stress: 60% of yield strength. Maximum deflection: L/240 for spans over 24 inches.",
      priority: "critical",
      type: "analysis",
    },
    {
      title: "Manufacturing Instructions",
      content:
        'Drawings must be marked with either "make from" or "similar to" references to expedite vendor processing. Include detailed manufacturing notes and special process requirements. All critical dimensions must be highlighted.',
      priority: "medium",
      type: "documentation",
    },
    {
      title: "Shipping and Environmental Considerations",
      content:
        "Design must account for shipping conditions including temperature (-20°F to 120°F), humidity (0-100%), and vibration. Package design must protect against typical shipping impacts. Include handling instructions for temperature-sensitive components.",
      priority: "medium",
      type: "logistics",
    },
    {
      title: "Size and Modularity Constraints",
      content:
        "Product dimensions must not exceed: 24-inch usable region for 30-inch modules, 28-inch for 34-inch modules, and 30-inch for 36-inch modules. Allow for thermal expansion in sizing calculations.",
      priority: "high",
      type: "technical",
    },
  ];

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "high":
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileCheck className="h-5 w-5 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case "critical":
        return "border-l-4 border-red-500";
      case "high":
        return "border-l-4 border-yellow-500";
      default:
        return "border-l-4 border-green-500";
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-none p-8">
        <h1 className="text-3xl font-bold mb-4">
          Engineering Design Guidelines
        </h1>
        <Alert>
          <AlertDescription>
            These guidelines must be followed for all new designs and design
            revisions.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 pt-0">
        <div className="grid gap-6 md:grid-cols-2">
          {guidelines.map((guideline, index) => (
            <Card
              key={index}
              className={`${getPriorityColor(guideline.priority)}`}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {getPriorityIcon(guideline.priority)}
                <CardTitle className="text-lg">{guideline.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{guideline.content}</p>
                <div className="mt-4 flex gap-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {guideline.type}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {guideline.priority} priority
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
