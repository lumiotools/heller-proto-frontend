import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
// import "highlight.js/styles/github.css"; // Syntax highlighting style

interface MarkdownPageProps {
  markdown: string; // Define the type for the markdown prop
}

const MarkdownPage: React.FC<MarkdownPageProps> = ({ markdown }) => {
  return (
    <div className="prose mx-auto">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPage;
