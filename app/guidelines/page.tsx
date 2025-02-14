"use client";
import React, { useState } from "react";
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
  Heater,
  Fan,
  Paintbrush,
  ShipWheel,
  Boxes,
  Shield,
  RotateCcw,
  Square,
  Container,
  Link,
  SwitchCamera,
  Cog,
  FileCheck,
  Truck,
  Anchor,
  ShoppingCart,
  Ruler,
  AlertTriangle,
  LoaderPinwheel,
  Power,
  SquarePower,
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
  const [activeTab, setActiveTab] = useState<CategoryType>("thermal");

  const guidelines: GuidelineItem[] = [
    {
      icon: <Heater className="text-red-500" size={24} />,
      text: "Minimize heat paths to outside.",
      category: "thermal",
    },
    {
      icon: <Fan className="text-blue-500" size={24} />,
      text: "Adequate ventilation - muffin fans to cool cap and base.",
      category: "thermal",
    },
    {
      icon: <Paintbrush className="text-purple-500" size={24} />,
      text: "Proper finish called on all detail drawings.",
      category: "specifications",
    },
    {
      icon: <ShipWheel className="text-gray-500" size={24} />,
      text: "Use aluminized steel wherever possible in heated regions.",
      category: "thermal",
    },
    {
      icon: <Boxes className="text-amber-500" size={24} />,
      text: "Apply as much as possible one piece instead of multiple pieces.",
      category: "mechanical",
    },
    {
      icon: <Shield className="text-green-500" size={24} />,
      text: "Review structural members for acceptable stress and deflection.",
      category: "mechanical",
    },
    {
      icon: <RotateCcw className="text-blue-600" size={24} />,
      text: "All rotating members must joined with key or pin, do not rely setscrew alone. In cases where only a setscrew can be used (impeller hub for example) check screw diameter with formula found in Machinery's Handbook.",
      category: "mechanical",
    },
    {
      icon: <Square className="text-gray-600" size={24} />,
      text: "Flat on all shafts where set screw bear.",
      category: "mechanical",
    },
    {
      icon: <Container className="text-red-600" size={24} />,
      text: "Avoid through holes in any part used for nitrogen containment.",
      category: "safety",
    },
    {
      icon: <Link className="text-yellow-600" size={24} />,
      text: "Provision for routing of drive chains.",
      category: "mechanical",
    },
    {
      icon: <SwitchCamera className="text-purple-600" size={24} />,
      text: "Provision for mounting of limit switches, with easy access for service tech. If mounting a limit switch to a moving member then also design in a cable carrier.",
      category: "assembly",
    },
    {
      icon: <Cog className="text-blue-700" size={24} />,
      text: "Provisions for mounting of all drive motors and encoders.",
      category: "assembly",
    },
    {
      icon: <FileCheck className="text-green-600" size={24} />,
      text: "Appropriate drawings been marked 'make from' or 'similar to' to save time at vendor.",
      category: "specifications",
    },
    {
      icon: <Truck className="text-orange-500" size={24} />,
      text: "Effects of shipping considered in the design (i.e. vibration, low temperatures, and shock loads).",
      category: "logistics",
    },
    {
      icon: <Anchor className="text-gray-700" size={24} />,
      text: "Provisions made for shipping (i.e. holes for anchoring to a skid).",
      category: "logistics",
    },
    {
      icon: <ShoppingCart className="text-indigo-500" size={24} />,
      text: "Buy versus make considered for each part.",
      category: "logistics",
    },
    {
      icon: <Ruler className="text-teal-500" size={24} />,
      text: "Product does not exceed 24-inch useable region of 30-inch module, 28-inch for 34-inch module and 30-inch for 36-inch module.",
      category: "specifications",
    },
    {
      icon: <AlertTriangle className="text-yellow-500" size={24} />,
      text: "Review design for interference between subsystems.",
      category: "mechanical",
    },
    {
      icon: <LoaderPinwheel className="text-red-700" size={24} />,
      text: "No sintered bearings in heated regions. Use graph alloy (400C) or Igus (252C).",
      category: "mechanical",
    },
    {
      icon: <Power className="text-orange-600" size={24} />,
      text: "Do not exceed PV rating of bearings.",
      category: "mechanical",
    },
    {
      icon: <SquarePower className="text-blue-800" size={24} />,
      text: "Limit switch actuators should designed to prevent accidental damage to switch.",
      category: "safety",
    },
  ];

  const categoryColors: Record<CategoryType, string> = {
    thermal: "bg-orange-50 border-orange-100",
    mechanical: "bg-blue-50 border-blue-100",
    safety: "bg-red-50 border-red-100",
    assembly: "bg-green-50 border-green-100",
    logistics: "bg-purple-50 border-purple-100",
    specifications: "bg-gray-50 border-gray-100",
  };

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
    <div className="min-h-screen bg-white p-8 font-montserrat">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Mechanical Design Guidelines
        </h1>

        <Tabs
          defaultValue="thermal"
          className="space-y-6"
          onValueChange={(value) => setActiveTab(value as CategoryType)}
        >
          <TabsList className="w-full flex justify-start bg-transparent h-auto py-4 space-x-4">
            <TooltipProvider>
              {Object.entries(categoryShortTitles).map(
                ([category, shortTitle]) => (
                  <Tooltip key={category}>
                    <TooltipTrigger asChild>
                      <TabsTrigger
                        value={category}
                        className={`px-6 py-2.5 rounded-2xl text-base font-medium flex-1
                        transition-all duration-200
                        ${
                          category === activeTab
                            ? "bg-[#392E7B] text-white shadow-none"
                            : "bg-white text-gray-600 shadow-sm border border-gray-100"
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
              <Card
                className={`border ${
                  categoryColors[category as CategoryType]
                } shadow-sm`}
              >
                <CardContent className="py-6 px-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 px-4">
                    {fullTitle}
                  </h2>
                  <div className="space-y-3">
                    {guidelines
                      .filter((item) => item.category === category)
                      .map((guideline, index) => (
                        <Alert
                          key={index}
                          className="flex items-center gap-4 border bg-white 
                            hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex-shrink-0">{guideline.icon}</div>
                          <AlertDescription className="text-gray-700">
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
