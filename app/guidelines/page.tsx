"use client";

import type React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Boxes,
  Shield,
  RotateCcw,
  Square,
  Link,
  AlertTriangle,
  Power,
  Thermometer,
  Fan,
  Paintbrush,
  ShipWheel,
  Container,
  SwitchCamera,
  Cog,
  FileCheck,
  Truck,
  Anchor,
  ShoppingCart,
  Ruler,
} from "lucide-react";

type CategoryType =
  | "thermal"
  | "mechanical"
  | "safety"
  | "assembly"
  | "logistics"
  | "specifications";

interface GuidelineItem {
  icon: React.ReactNode;
  text: string;
  category: CategoryType;
}

const Guidelines: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CategoryType>("mechanical");

  const guidelines: GuidelineItem[] = [
    // Thermal
    {
      icon: (
        <Thermometer className="text-[#011A2EB2] stroke-[1.67px]" size={20} />
      ),
      text: "Minimize heat paths to outside.",
      category: "thermal",
    },
    {
      icon: <Fan className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Adequate ventilation - muffin fans to cool cap and base.",
      category: "thermal",
    },
    {
      icon: (
        <ShipWheel className="text-[#011A2EB2] stroke-[1.67px]" size={20} />
      ),
      text: "Use aluminized steel wherever possible in heated regions.",
      category: "thermal",
    },
    // Mechanical
    {
      icon: <Boxes className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Apply as much as possible one piece instead of multiple pieces.",
      category: "mechanical",
    },
    {
      icon: <Shield className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Review structural members for acceptable stress and deflection.",
      category: "mechanical",
    },
    {
      icon: (
        <RotateCcw className="text-[#011A2EB2] stroke-[1.67px]" size={20} />
      ),
      text: "All rotating members must joined with key or pin, do not rely setscrew alone. In cases where only a setscrew can be used (impeller hub for example) check screw diameter with formula found in Machinery's Handbook.",
      category: "mechanical",
    },
    {
      icon: <Square className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Flat on all shafts where set screw bear.",
      category: "mechanical",
    },
    {
      icon: <Link className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Provision for routing of drive chains.",
      category: "mechanical",
    },
    {
      icon: (
        <AlertTriangle className="text-[#011A2EB2] stroke-[1.67px]" size={20} />
      ),
      text: "Review design for interference between subsystems.",
      category: "mechanical",
    },
    {
      icon: <Power className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Do not exceed PV rating of bearings.",
      category: "mechanical",
    },
    // Safety
    {
      icon: (
        <Container className="text-[#011A2EB2] stroke-[1.67px]" size={20} />
      ),
      text: "Avoid through holes in any part used for nitrogen containment.",
      category: "safety",
    },
    {
      icon: <Shield className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Limit switch actuators should designed to prevent accidental damage to switch.",
      category: "safety",
    },
    // Assembly
    {
      icon: (
        <SwitchCamera className="text-[#011A2EB2] stroke-[1.67px]" size={20} />
      ),
      text: "Provision for mounting of limit switches, with easy access for service tech. If mounting a limit switch to a moving member then also design in a cable carrier.",
      category: "assembly",
    },
    {
      icon: <Cog className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Provisions for mounting of all drive motors and encoders.",
      category: "assembly",
    },
    // Logistics
    {
      icon: <Truck className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Effects of shipping considered in the design (i.e. vibration, low temperatures, and shock loads).",
      category: "logistics",
    },
    {
      icon: <Anchor className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Provisions made for shipping (i.e. holes for anchoring to a skid).",
      category: "logistics",
    },
    {
      icon: (
        <ShoppingCart className="text-[#011A2EB2] stroke-[1.67px]" size={20} />
      ),
      text: "Buy versus make considered for each part.",
      category: "logistics",
    },
    // Specifications
    {
      icon: (
        <Paintbrush className="text-[#011A2EB2] stroke-[1.67px]" size={20} />
      ),
      text: "Proper finish called on all detail drawings.",
      category: "specifications",
    },
    {
      icon: (
        <FileCheck className="text-[#011A2EB2] stroke-[1.67px]" size={20} />
      ),
      text: "Appropriate drawings been marked 'make from' or 'similar to' to save time at vendor.",
      category: "specifications",
    },
    {
      icon: <Ruler className="text-[#011A2EB2] stroke-[1.67px]" size={20} />,
      text: "Product does not exceed 24-inch useable region of 30-inch module, 28-inch for 34-inch module and 30-inch for 36-inch module.",
      category: "specifications",
    },
  ];

  const categoryShortTitles: Record<CategoryType, string> = {
    thermal: "Thermal",
    mechanical: "Mechanical",
    safety: "Safety",
    assembly: "Assembly",
    logistics: "Logistics",
    specifications: "Specs",
  };

  const categoryFullTitles: Record<CategoryType, string> = {
    thermal: "Thermal Considerations",
    mechanical: "Mechanical Design",
    safety: "Safety Requirements",
    assembly: "Assembly & Installation",
    logistics: "Logistics & Manufacturing",
    specifications: "Specifications & Documentation",
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-[#011A2ECC] text-3xl font-semibold mb-8">
          Mechanical Design Guidelines
        </h1>

        <Tabs
          defaultValue="mechanical"
          className="space-y-6"
          onValueChange={(value) => setActiveTab(value as CategoryType)}
        >
          <TabsList className="w-full flex justify-start bg-transparent h-auto space-x-4 p-0">
            <TooltipProvider>
              {Object.entries(categoryShortTitles).map(
                ([category, shortTitle]) => (
                  <Tooltip key={category}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={category}
                        className={`px-8 py-2.5 rounded-lg text-[#011A2E] text-sm font-medium transition-colors
                        ${
                          category === activeTab
                            ? "bg-white shadow-sm border border-gray-200"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        {shortTitle}
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{categoryFullTitles[category as CategoryType]}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              )}
            </TooltipProvider>
          </TabsList>

          {Object.entries(categoryFullTitles).map(([category, fullTitle]) => (
            <TabsContent
              key={category}
              value={category}
              className="mt-6 transition-all duration-300"
            >
              <Card className="border border-gray-200 shadow-sm rounded-xl">
                <CardContent className="p-8">
                  <h2 className="text-[#0083BF] text-xl font-semibold mb-6">
                    {fullTitle}
                  </h2>
                  <div className="space-y-4">
                    {guidelines
                      .filter((item) => item.category === category)
                      .map((guideline, index) => (
                        <Alert
                          key={index}
                          className="flex items-start gap-4 bg-transparent border-0 p-0 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {guideline.icon}
                          </div>
                          <AlertDescription className="text-[#011A2E] text-sm py-0.5">
                            {guideline.text}
                          </AlertDescription>
                        </Alert>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Guidelines;
