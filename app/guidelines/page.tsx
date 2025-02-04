"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface ValidationItem {
  id: string;
  title: string;
  status: "pending" | "pass" | "fail";
  details?: string;
  subItems?: ValidationItem[];
}

interface ComponentData {
  id: string;
  name: string;
  material?: string;
  thermalConductivity?: number;
  thermalExpansion?: number;
  meltingPoint?: number;
  thickness?: number;
}

export default function ValidationChecklist() {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const components: ComponentData[] = [
    {
      id: "comp1",
      name: "Base Plate",
      material: "Aluminum 6061",
      thermalConductivity: 167,
      thermalExpansion: 23.6,
      meltingPoint: 652,
      thickness: 3.2,
    },
    // Add more components as needed
  ];

  const validationChecks: ValidationItem[] = [
    {
      id: "geometry",
      title: "1. Geometry Integrity Check",
      status: "pending",
      subItems: [
        {
          id: "components",
          title: "Component List",
          status: "pass",
          details: `${components.length} components found`,
        },
        {
          id: "solid-validation",
          title: "Solid Validation",
          status: "pending",
          subItems: [
            {
              id: "open-edges",
              title: "Open Edges/Gaps Check",
              status: "pending",
            },
            {
              id: "overlapping",
              title: "Overlapping Bodies Check",
              status: "pending",
            },
            {
              id: "zero-thickness",
              title: "Zero-thickness Geometry Check",
              status: "pending",
            },
          ],
        },
      ],
    },
    {
      id: "structural",
      title: "2. Structural Analysis and Material Validation",
      status: "pending",
      subItems: [
        {
          id: "material-check",
          title: "Aluminum Material Validation",
          status: "pending",
        },
        {
          id: "thermal-props",
          title: "Thermal Properties",
          status: "pending",
          subItems: [
            {
              id: "conductivity",
              title: "Thermal Conductivity",
              status: "pending",
            },
            {
              id: "expansion",
              title: "Thermal Expansion Coefficient",
              status: "pending",
            },
            {
              id: "melting",
              title: "Melting Point",
              status: "pending",
            },
          ],
        },
        {
          id: "structural-checks",
          title: "Structural Checks",
          status: "pending",
          subItems: [
            {
              id: "thickness",
              title: "Thickness Validation (>2mm)",
              status: "pending",
            },
            {
              id: "material-assignment",
              title: "Material Assignment Check",
              status: "pending",
            },
            {
              id: "overhangs",
              title: "Overhang/Cantilever Analysis",
              status: "pending",
            },
            {
              id: "melting-validation",
              title: "Melting Point Validation",
              status: "pending",
            },
            {
              id: "thermal-stress",
              title: "Thermal Expansion & Stress Analysis",
              status: "pending",
            },
            {
              id: "heat-dissipation",
              title: "Heat Dissipation & Cooling Check",
              status: "pending",
            },
          ],
        },
      ],
    },
    {
      id: "manufacturing",
      title: "3. Manufacturing Feasibility Check",
      status: "pending",
      subItems: [
        {
          id: "hole-sizes",
          title: "Drilled Hole Size Validation",
          status: "pending",
          details: "Checking for M6, M8 standards compliance",
        },
        {
          id: "min-features",
          title: "Minimum Feature Size Check",
          status: "pending",
          details: "Validating against machining limitations",
        },
      ],
    },
  ];

  const renderValidationItem = (item: ValidationItem) => {
    const isExpanded = expandedSections.includes(item.id);
    const hasSubItems =
      Array.isArray(item.subItems) && item.subItems.length > 0;

    return (
      <div key={item.id} className="mb-2">
        <div
          className={`flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
            hasSubItems ? "bg-gray-50" : ""
          }`}
          onClick={() => hasSubItems && toggleSection(item.id)}
        >
          {hasSubItems &&
            (isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
          {getStatusIcon(item.status)}
          <span className="flex-1">{item.title}</span>
          {item.details && (
            <span className="text-sm text-gray-500">{item.details}</span>
          )}
        </div>

        {isExpanded && hasSubItems && item.subItems && (
          <div className="ml-6 mt-2 border-l-2 border-gray-200 pl-4">
            {item.subItems.map((subItem) => renderValidationItem(subItem))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-none p-8">
        <h1 className="text-3xl font-bold mb-4">Design Validation Checklist</h1>
        <Alert>
          <AlertDescription>
            Running validation checks against engineering design guidelines.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Components Under Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              {components.map((comp) => (
                <div
                  key={comp.id}
                  className="mb-2 p-2 bg-gray-50 rounded flex justify-between"
                >
                  <span>{comp.name}</span>
                  <span className="text-gray-500">{comp.material}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Validation Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {validationChecks.map((check) => renderValidationItem(check))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
