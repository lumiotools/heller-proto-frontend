"use client";

export default function Guidelines() {
  const guidelines = [
    {
      title: "Drawing Documentation",
      content:
        "Proper finish called on all detail drawings. Check for open ends in the design.",
    },
    {
      title: "Material Selection",
      content:
        "Use aluminized steel wherever possible in heated regions. Check whether material is assigned to each components in the design",
    },
    {
      title: "Structural Analysis",
      content:
        "Review structural members for acceptable stress and deflection. Check for FEA data and apply rule on stress and deflection limits.",
    },
    {
      title: "Manufacturing Instructions",
      content:
        'Appropriate drawings been marked "make from" or "similar to" to save time at vendor. Extract labels and instructions from the CAD drawings',
    },
    {
      title: "Shipping Considerations",
      content:
        "Effects of shipping considered in the design. Extract melting point, thermal conductivity, thermal coefficient",
    },
    {
      title: "Size Constraints",
      content:
        "Product does not exceed 24-inch usable region of 30-inch module, 28-inch for 34-inch module and 30-inch for 36-inch module.",
    },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Design Guidelines</h1>
      <div className="space-y-6">
        {guidelines.map((guideline, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">{guideline.title}</h2>
            <p className="text-gray-600">{guideline.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
