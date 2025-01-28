import Link from "next/link";

export default function SideNav() {
    return (
        <div className="w-64 bg-gray-800 text-white flex flex-col space-y-4 p-6">
            <div className="text-lg font-semibold hover:text-blue-400 cursor-pointer">
                <Link href="/">Home</Link>
            </div>
            <div className="text-lg font-semibold hover:text-blue-400 cursor-pointer">
                <Link href="/view-files">View Previous Files and Analysis</Link>
            </div>
        </div>
    );
}
