import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";

export default function Header() {
    return (
        <div className="flex items-center justify-between bg-gray-800 text-white p-4">
            <div className="text-xl font-bold">
                Logo
            </div>
            <div className="flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Search for files..."
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Search
                </button>
            </div>
            <div>
                <Link href="">
                    <FontAwesomeIcon icon={faUser} className="text-2xl hover:text-blue-500" />
                </Link>
            </div>
        </div>
    );
}
