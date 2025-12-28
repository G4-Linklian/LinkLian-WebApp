import { NotificationProvider } from "@/comps/noti/notiComp";

import React, { useEffect, useState } from "react";
import {
  IconNews,
  IconSchool,
  IconUsers,
  IconMessageDots,
  IconUser,
  IconBell
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Sidebar } from "./_mainLink";

import { useMediaQuery } from "@/comps/public/useMediaQuery"
import { decodeToken } from "@/utils/authToken";
import { tabRoutes } from "./tabRoute";

const LayoutShell = ({ children }: any) => {
    const [opened, setOpened] = useState(true);
    const [token, setToken] = useState<any | null>(null);
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [profileImage, setProfileImage] = useState<string>("");

    const [activeTab, setActiveTab] = useState<string | null>("tab3");

    useEffect(() => {
        const cleanPath = router.pathname.split('?')[0];
        const normalizedPath = cleanPath.startsWith('/myex/') ? '/myex' : cleanPath;

        const currentTab = Object.keys(tabRoutes).find(
            (key) => tabRoutes[key as keyof typeof tabRoutes] === normalizedPath
        );

        if (currentTab) {
            setActiveTab(currentTab);
        }
    }, [router.pathname]);

    const tabTextStyle = (isActive: boolean) => ({
        fontSize: "12px",
        fontWeight: "700",
        color: isActive ? "#5F9FE3" : "gray",
        marginTop: "4px",
    });

    const isLargerThanSm = useMediaQuery("(min-width: 768px)");

    return (
        <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
            {/* Navbar for PC */}
            {isLargerThanSm && (
                <div 
                className="h-screen w-64"
                style={{
                    backgroundColor: "#ffffff",
                    position: "relative",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    zIndex: 9999,
                    paddingTop: "10px"
                }}>
                    <Sidebar />
                </div>
            )}

            {!isLargerThanSm && (
                <div 
                className="h-screen w-64"
                style={{
                    width: "30%",
                    backgroundColor: "#ffffff",
                    position: "relative",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    zIndex: 9999,
                    paddingTop: "10px"
                }}>
                    <div className="flex flex-col items-center">
                        <Sidebar />
                    </div>
                </div>
            )}

            <NotificationProvider>

                {/* Main content */}
                <main style={{
                    background: "#ffffff",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "calc(100% - 16rem)",
                }}>
                    {children}
                </main>
            </NotificationProvider>
        </div>
    );
};

export default LayoutShell;

