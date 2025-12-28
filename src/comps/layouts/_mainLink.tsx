"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useMediaQuery } from "@/comps/public/useMediaQuery";
import { decodeToken, decodeRegistrationToken } from "@/utils/authToken";
import { dataRegistration } from "@/comps/layouts/tabRoute";

import {
  IconHelpCircle,
} from "@tabler/icons-react";

interface MainLinkProps {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

function SidebarLink({ label, route, icon }: MainLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  // console.log("pathname", pathname, route);

  // เช็คว่า Route ปัจจุบันตรงกับปุ่มนี้ไหม เพื่อทำ Highlight
  const isActive = pathname === "" + route || pathname?.startsWith("" + route);

  const changeRoute = () => {
    const newRoute = "" + route;
    if (pathname === newRoute) {
      router.reload();
    } else {
      router.push(newRoute, undefined, { shallow: true });
    }
  };

  return (
    <div className="flex items-center justify-between pr-2">
      <div className="w-[5%] flex">
        <div className={`${isActive ? "bg-[#FF9C57]" : "bg-transparent"} w-2 h-6 rounded-r-lg`}></div>
      </div>
      <button
        onClick={changeRoute}
        className={`w-[92%] flex items-center gap-3 px-4 py-3 transition-colors duration-200 rounded-xl
        ${isActive
            ? "bg-[#FFF7EE] text-[#E87722]"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
      >
        {/* Icon */}
        {icon && (
          <span className={`text-xl ${isActive ? "text-[#E87722]" : "text-gray-500"}`}>
            {icon}
          </span>
        )}

        {/* Label */}
        <div className={`text-base ${isActive ? "font-semibold" : "font-normal"}`}>
          {label}
        </div>
      </button>
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();
  const isLargerThanSm = useMediaQuery("(min-width: 768px)");
  const [token, setToken] = useState<any | null>(false);

  const userProfile = {
    name: token?.institution?.inst_name_th,
    email: token?.institution?.inst_email,
    // email: "wachirawit.prem@linklian.ac.th",
    avatar: "/image/ME.png"
  };

  useEffect(() => {
    const token = decodeRegistrationToken();
    console.log("token", token);
    setToken(token);
  }, [router.isReady]);


  if (!isLargerThanSm) {
    return null;
  }

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between fixed left-0 top-0 z-50 overflow-y-auto">

      {/* Top Section: Logo & Menu */}
      <div>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100 mb-4">
          <Link href="/home">
            <Image
              src="/image/banner-black.png"
              alt="Link-Lian Logo"
              width={140}
              height={50}
              className="cursor-pointer object-contain"
            />
          </Link>
        </div>

        {/* Menu Links */}
        <nav className="flex flex-col gap-1">
          {dataRegistration.map((link) => (
            <SidebarLink key={link.label} {...link} />
          ))}
        </nav>
      </div>

      {/* Bottom Section: Support & Profile */}
      <div className="border-t border-gray-200 p-4">
        {/* Help Link */}
        <button className="flex items-center gap-4 px-4 py-3 text-gray-600 hover:text-black hover:bg-gray-50 w-full rounded-md mb-2">
          <IconHelpCircle size={20} stroke={1.5} />
          <span className="text-sm font-medium">แจ้งปัญหา</span>
        </button>

        {/* User Profile Card */}
        <div className="flex items-center gap-3 mt-2 pt-2">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 relative">
            {/* ใช้ img หรือ Next Image ก็ได้ */}
            <img
              src={userProfile.avatar}
              alt="User"
              className="w-full h-full object-cover"
            // onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/40" }} // Fallback image
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-gray-800 truncate">{userProfile.name}</span>
            <span className="text-[10px] text-gray-500 truncate">{userProfile.email}</span>
          </div>
        </div>
      </div>

    </div>
  );
}