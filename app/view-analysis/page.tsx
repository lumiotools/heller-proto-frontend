import MarkdownPage from "@/app/ui/read-markdown";

export default async function Page() {
    // Fetch Markdown content from the API
    const res = await fetch("https://run.mocky.io/v3/f5903b0c-85ce-489c-af79-cb2a2f605910");
    const object = await res.json();

    return (
        <div>
            <MarkdownPage markdown={object.markdown} />
        </div>
    );
}
