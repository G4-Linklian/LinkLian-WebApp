"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/comps/public/useMediaQuery"
import { useNotification } from "@/comps/noti/notiComp";
import { decodeToken } from "@/utils/authToken";
import Image from "next/image";

interface MainLinkProps {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

import {
  IconBell,
  IconSchool,
  IconUsers,
  IconMessageDots,
  IconUser,
} from "@tabler/icons-react";

function ProvideLink({ label, route, icon }: MainLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isLargerThanSms = useMediaQuery("(min-width: 768px)");

  const changeRoute = () => {
    const newRoute = "/" + route;
    if (pathname === newRoute) {
      router.reload();
    } else {
      router.push(newRoute, undefined, { shallow: true });
    }
  };

  return (
    <button
      onClick={changeRoute}
      className={`relative hover:bg-gray-900`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "5px 14px",
        borderRadius: "8px",
        fontSize: isLargerThanSms ? "0.9rem" : "1.2rem",
        fontWeight: isLargerThanSms ? "normal" : "bold",
        backgroundColor: "#FFF2DD",
        transition: "background-color 0.1s",
        cursor: "pointer",
        color: "#93381B"
      }}
    >

      {/* label */}
      <div className="text font-semibold">{label}</div>

      {/* icon */}
      {icon && <span className="flex items-center">{icon}</span>}
    </button>
  );
}


export function MainLinks() {
  const router = useRouter();
  const isLargerThanSm = useMediaQuery("(min-width: 768px)");
  const [showNav, setShowNav] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [token, setToken] = useState<any | null>(false);
  const tokens = decodeToken();
  const { showNotification } = useNotification();
  let data: MainLinkProps[]

  useEffect(() => {
    const token = decodeToken();
    setToken("token")
  }, [router.isReady]);

  data = [
    // {
    //   label: "แจ้งเตือน",
    //   route: "notification",
    //   icon: <IconBell size={18} stroke={1.8} />,
    // },
    {
      label: "ห้องเรียน",
      route: "classes",
      icon: <IconSchool size={18} stroke={1.8} />,
    },
    // {
    //   label: "ชุมชน",
    //   route: "community",
    //   icon: <IconUsers size={18} stroke={1.8} />,
    // },
    // {
    //   label: "ข้อความ",
    //   route: "messages",
    //   icon: <IconMessageDots size={18} stroke={1.8} />,
    // },
    {
      label: "โปรไฟล์",
      route: "profile",
      icon: <IconUser size={18} stroke={1.8} />,
    },
  ];

  const Links = ({ links }: { links: MainLinkProps[] }) => (
    <div className="flex gap-2 justify-end" style={{ width: "100%" }}>
      {links.map((link) => (
        <ProvideLink key={link.label} {...link} />
      ))}
    </div>
  );

  const MobileNav = ({ links }: { links: MainLinkProps[] }) => (
    <div className="absolute top-0 left-0 h-60 bg-white text-black flex flex-col z-30 w-full mt-16 gap-3">
      {links.map((link) => (
        <ProvideLink key={link.label} {...link} />
      ))}
    </div>
  );


  return (
    <div
      className="mx-0"
      style={{
        display: "flex",
        justifyContent: isLargerThanSm ? "space-between" : "space-between",
        alignItems: "center",
        height: "3rem",
        width: isLargerThanSm ? "80%" : "100%",
      }}
    >
      {showNav && <MobileNav links={data} />}

      <div className="flex flex-col justify-center">
        <Link href="/home" className="text-[#1E9900] font-black text-xl mr-6 ml-2">
          <Image
            src="/image/logo-web.png"
            alt="profile"
            width={120}
            height={50}
            style={{
              marginLeft: isLargerThanSm ? '10px' : '0'
            }}
          />
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }} className="text-black flex items-center">

      </div>

      {isLargerThanSm && (
        <div className="flex items-center justify-end" style={{ width: "75%" }}>
          <Links links={data} />
        </div>
      )}
    </div>
  );
}

