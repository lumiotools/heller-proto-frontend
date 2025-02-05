import React from "react";

interface HTMLContentProps {
  htmlContent: string;
}

export const HTMLContent: React.FC<HTMLContentProps> = ({ htmlContent }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      <style>{`
        .technical-details h2,
        .validation-section h2,
        .results-section h2 {
          @apply text-2xl font-bold mt-6 mb-4 text-gray-800;
        }

        .technical-details h3,
        .validation-section h3,
        .results-section h3 {
          @apply text-xl font-semibold mt-4 mb-2 text-gray-700;
        }

        .technical-details ul,
        .validation-section ul,
        .results-section ul {
          @apply pl-6 mb-4;
        }

        .technical-details li,
        .validation-section li,
        .results-section li {
          @apply mb-2 text-gray-600;
        }

        .technical-details p,
        .validation-section p,
        .results-section p {
          @apply mb-4 text-gray-600;
        }

        .validation-section,
        .results-section {
          @apply mt-8;
        }
      `}</style>
    </div>
  );
};
