import Image from "next/image";
import SideNav from "@/app/ui/side-nav";
import Header from "@/app/ui/header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import UploadButton from "@/app/ui/upload-button";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1">
        <SideNav />
        <div className="flex flex-col items-center justify-center w-full bg-gray-100 p-6">
          <h2 className="text-2xl font-bold mb-4">Or...</h2>
          <UploadButton />
        </div>
      </div>
    </div>
  );
}
