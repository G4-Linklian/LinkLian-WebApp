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
import { MainLinks } from "./_mainLink";

import { useMediaQuery } from "@/comps/public/useMediaQuery"
import { decodeToken } from "@/utils/authToken";

const LayoutShell = ({ children }: any) => {
    const [opened, setOpened] = useState(true);
    const [token, setToken] = useState<any | null>(null);
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [profileImage, setProfileImage] = useState<string>("");

    const [activeTab, setActiveTab] = useState<string | null>("tab3");


    const tabRoutes = {
        tab1: "/homework",
        tab2: "/classes",
        tab3: "/community",
        tab4: "/profile",
    };

    useEffect(() => {
        const cleanPath = router.pathname.split('?')[0]; // ตัด query string ออก
        const normalizedPath = cleanPath.startsWith('/myex/') ? '/myex' : cleanPath; // ถ้าเริ่มด้วย /myex/ ถือว่าเป็น /myex

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
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            {/* Navbar for PC */}
            {isLargerThanSm && (
                <nav style={{
                    width: "100%",
                    backgroundColor: "#ffffff",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "60px",
                    zIndex: 9999,
                    paddingTop: "10px"
                }}>
                    <div className="flex flex-col items-center">
                        <MainLinks />

                    </div>
                </nav>
            )}

            {!isLargerThanSm && (
                <nav style={{
                    width: "100%",
                    backgroundColor: "#ffffff",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "60px",
                    zIndex: 9999,
                    paddingTop: "10px"
                }}>
                    <div className="flex flex-col items-center">
                        <MainLinks />
                    </div>
                </nav>
            )}

            {/* Mobile bottom nav */}
            {!isLargerThanSm && !router.pathname.startsWith("/myex/activity") && (
                <div className="sima" style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.08)",
                    zIndex: 10,
                    height: "80px",
                    paddingTop: "10px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "50px",
                    marginTop: "0px"
                }}>
                    {Object.entries(tabRoutes).map(([tab, path]) => (
                        <div key={tab} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }} onClick={() => {
                            setActiveTab(tab);
                            router.push(path);
                        }}>
                            {tab === "tab1" && <IconNews size={28} color={activeTab === tab ? "#5F9FE3" : "gray"} />}
                            {tab === "tab2" && <IconSchool size={28} color={activeTab === tab ? "#5F9FE3" : "gray"} />}
                            {tab === "tab3" && <IconUsers size={28} color={activeTab === tab ? "#5F9FE3" : "gray"} />}
                            {tab === "tab4" && <IconUser size={28} color={activeTab === tab ? "#5F9FE3" : "gray"} />}
                            <span style={tabTextStyle(activeTab === tab)}>
                                {tab === "tab1"
                                    ? "การบ้าน"
                                    : tab === "tab2"
                                        ? "ห้องเรียน"
                                        : tab === "tab3"
                                            ? "ชุมชน"
                                            : tab === "tab4"
                                                ? "โปรไฟล์"
                                                    : null}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            <NotificationProvider>

                {/* Main content */}
                <main style={{
                    background: "#ffffff",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {children}
                </main>
            </NotificationProvider>
        </div>
    );
};

export default LayoutShell;

