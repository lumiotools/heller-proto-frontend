import Showdown from "showdown";

interface MarkdownConverterOptions {
  outputDir?: string;
}

interface ConversionResult {
  html: string;
  blob?: Blob;
}

class MarkdownConverter {
  private converter: Showdown.Converter;
  private options: Required<MarkdownConverterOptions>;

  constructor(options: MarkdownConverterOptions = {}) {
    this.converter = new Showdown.Converter({
      tables: true,
      tasklists: true,
      strikethrough: true,
      emoji: true,
    });

    this.options = {
      outputDir: "output",
      ...options,
    };
  }

  public convert(markdown: string, filename?: string): ConversionResult {
    try {
      // Convert markdown to HTML
      const html = this.converter.makeHtml(markdown);

      // Create blob if filename is provided
      if (filename) {
        const fullHtml = this.wrapWithTemplate(html);
        const blob = new Blob([fullHtml], { type: "text/html" });
        return { html, blob };
      }

      return { html };
    } catch (error) {
      throw new Error(
        `Failed to convert markdown to HTML: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private wrapWithTemplate(html: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Markdown</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
        }
        pre {
            background-color: #f6f8fa;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            font-family: Consolas, Monaco, 'Andale Mono', monospace;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1rem;
            margin-left: 0;
            color: #666;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f6f8fa;
        }
    </style>
</head>
<body>
${html}
</body>
</html>`;
  }

  // Method to download the HTML file
  public downloadHtml(markdown: string, filename: string): void {
    const { blob } = this.convert(markdown, filename);
    if (!blob) return;

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".html") ? filename : `${filename}.html`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default MarkdownConverter;
