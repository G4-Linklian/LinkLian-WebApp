import React, { useEffect } from "react";
import { Box } from "@mantine/core";
import { useRouter } from "next/router";
import ClassDetail from "./classDetail/classDetail";
import { decodeTeacherToken } from "@/utils/authToken";

export default function ClassDetailComp() {
    const router = useRouter();
    const { sectionId, subjectName, className } = router.query as {
        sectionId: string | string[];
        subjectName?: string;
        className?: string;
    };

    const token = decodeTeacherToken();

    useEffect(() => {
        if (!token) {
            router.push("/teacherLogin");
        }
    }, [router, token]);

    const rawSectionId = Array.isArray(sectionId) ? sectionId[0] : sectionId;
    const parsedSectionId = Number(rawSectionId);

    if (!token || !rawSectionId || !Number.isFinite(parsedSectionId) || parsedSectionId <= 0) {
        return null;
    }

    return (
        <Box className="h-[calc(100vh-64px)] w-full overflow-hidden bg-[#FAFAFA] text-black">
            <ClassDetail
                sectionId={parsedSectionId}
                subjectName={subjectName ?? ""}
                className={className ?? ""}
            />
        </Box>
    );
}
