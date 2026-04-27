"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useMediaQuery } from "@/comps/public/useMediaQuery";
import { decodeRegistrationToken } from "@/utils/authToken";
import { dataRegistration } from "@/comps/layouts/tabRoute";
import { Avatar, Button } from "@mantine/core";
import { useNotification } from "@/comps/noti/notiComp";
import { useReportIssue } from "@/comps/layouts/reportIssue/useReportIssue";
import ReportIssueModal from "@/comps/layouts/reportIssue/ReportIssueModal";
import {
  IconHelpCircle,
  IconLogout,
} from "@tabler/icons-react";

interface MainLinkProps {
  label: string;
  route: string;
  icon?: React.ReactNode;
}

function SidebarLink({ label, route, icon }: MainLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

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
        className={`w-[92%] flex items-center gap-3 px-4 py-3 transition-colors duration-200 rounded-xl cursor-pointer
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
  const { showNotification } = useNotification();

  const {
    reportModalOpened,
    reportTitle,
    reportDetail,
    reportFiles,
    isSubmittingReport,
    setReportTitle,
    setReportDetail,
    openReportModal,
    closeReportModal,
    handleSelectReportFiles,
    handleRemoveReportFile,
    handleSubmitReport,
  } = useReportIssue({
    token,
    showNotification,
  });

  const userProfile = {
    name: token?.institution?.inst_name_th,
    email: token?.institution?.inst_email,
    avatar: "/image/school.png"
  };

  useEffect(() => {
    const token = decodeRegistrationToken();
    setToken(token);
  }, [router.isReady]);


  if (!isLargerThanSm) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("linklian_registration_access_token");
    router.push("/registration/login");
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between fixed left-0 top-0 z-50 overflow-y-auto">

      {/* Top Section: Logo & Menu */}
      <div>
        {/* Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100 mb-4">
          <Link href="/home">
            <Image
              src="/image/logo-web.png"
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
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconHelpCircle size={20} stroke={1.5} />}
          fullWidth
          justify="flex-start"
          className="mb-2 ml-1"
          size="md"
          onClick={openReportModal}
        >
          <span className="text-sm font-medium">แจ้งปัญหา</span>
        </Button>

        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconLogout size={20} stroke={1.5} />}
          fullWidth
          justify="flex-start"
          className="mb-2 ml-1"
          size="md"
          onClick={handleLogout}
        >
          <span className="text-sm font-medium">ออกจากระบบ</span>
        </Button>

        {/* User Profile Card */}
        <div className="flex items-center gap-3 mt-2 pt-2">
          <Avatar
            src={token?.institution.logo_url}
            alt={token?.institution.inst_name_th}
            size={40}
            radius={40}
            color="orange"
            p={2}
            // className="border-2 border-white shadow-sm"
            className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 p-1 relative"
          >
            {token?.institution.inst_name_th?.[0]}
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-gray-800 truncate">{userProfile.name}</span>
            <span className="text-[10px] text-gray-500 truncate">{userProfile.email}</span>
          </div>
        </div>
      </div>

      <ReportIssueModal
        opened={reportModalOpened}
        onClose={closeReportModal}
        reportTitle={reportTitle}
        onChangeTitle={setReportTitle}
        reportDetail={reportDetail}
        onChangeDetail={setReportDetail}
        reportFiles={reportFiles}
        onSelectFiles={handleSelectReportFiles}
        onRemoveFile={handleRemoveReportFile}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmittingReport}
      />

    </div>
  );
}