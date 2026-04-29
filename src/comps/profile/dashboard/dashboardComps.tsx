import React, { useEffect, useState } from "react";
import { decodeTeacherToken } from "@/utils/authToken";
import { Stack, Text, Group, Select, ScrollArea } from "@mantine/core"; // 🌟 เอา Card ออกจาก import
import { getTeacherDashboard, getReportMonth } from "@/utils/api/dashboard";
import { TeacherDashboardPayload } from "@/utils/interface/dashboard.types";
import AssetsOverview from "./assetsOverview";
import TopBookmarkedPosts from "./topBookmarkedPosts";
import SectionOverview from "./sectionOverview";
import { formatMonthYear } from "@/config/formatters";

export default function Dashboard() {
    const [dashboardData, setDashboardData] = useState<TeacherDashboardPayload | null>(null);
    const [roleType, setRoleType] = useState<string>("");

    const [reportMonth, setReportMonth] = useState<string | null>(null);
    const [monthOptions, setMonthOptions] = useState<{ value: string, label: string }[]>([]);

    useEffect(() => {
        const fetchReportMonths = async () => {
            const token = decodeTeacherToken();
            if (!token || !token.user_id) return;

            try {
                const res = await getReportMonth({ user_sys_id: token.user_id });

                if (res.success && res.data) {
                    const options = res.data.map((month: string) => ({
                        value: month,
                        label: formatMonthYear(month),
                    }));

                    setMonthOptions(options);

                    if (options.length > 0) {
                        setReportMonth(options[0].value);
                    }
                }
            } catch (error) {
                console.error("Error fetching report months:", error);
            }
        };

        fetchReportMonths();
    }, []);

    useEffect(() => {
        if (!reportMonth) return;

        console.log("Selected report month:", reportMonth);

        const fetchDashboardData = async () => {
            const token = decodeTeacherToken();
            if (!token || !token.user_id) return;

            if (!token.role_name) {
                console.error("Role type not found in token");
                return;
            }
            setRoleType("TEACHER");

            try {
                setDashboardData(null);

                const res = await getTeacherDashboard({
                    user_sys_id: token.user_id,
                    role_type: roleType,
                    report_month: reportMonth,
                });
                console.log("Dashboard API response:", res);

                if (res.success && res.data.length > 0) {
                    setDashboardData(res.data[0].payload);
                } else {
                    setDashboardData(null);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
    }, [reportMonth]);

    return (
        <Stack gap="lg" w="100%" id="dashboard-container">

            <Group justify="space-between">
                <Text size="xl" fw={700} className="text-gray-800" style={{ flexShrink: 0 }}>
                    แดชบอร์ด
                </Text>

                <Group gap="sm">
                    <Text size="sm" color="dimmed">ประจำเดือน:</Text>
                    <Select
                        data={monthOptions}
                        value={reportMonth}
                        onChange={(value) => setReportMonth(value)}
                        placeholder={monthOptions.length === 0 ? "ไม่มีข้อมูล" : "เลือกเดือน"}
                        disabled={monthOptions.length === 0}
                        allowDeselect={false}
                        w={200}
                        radius="md"
                    />
                </Group>
            </Group>

            <ScrollArea 
                h="calc(100vh - 390px)"
                type="auto"
                offsetScrollbars 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingRight: 10 }}
            >
                {dashboardData ? (
                    <Stack gap="lg"> 
                        <AssetsOverview assets={dashboardData.assets || {}} />
                        <TopBookmarkedPosts posts={dashboardData.top_bookmarked_posts || []} />
                        <SectionOverview sections={dashboardData.section || []} />
                    </Stack>
                ) : (
                    <Text color="dimmed" ta="center" py="xl">ไม่พบข้อมูล หรือ กำลังโหลดข้อมูลแดชบอร์ด...</Text>
                )}
            </ScrollArea>
        </Stack>
    );
}