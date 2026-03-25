import React, { useEffect, useState } from "react";
import { Box, Center, Loader } from "@mantine/core";
import { useRouter } from "next/router";
import { decodeTeacherToken } from "@/utils/authToken";
import ClassPage from "./classPage/classPage";

export default function ClassComp() {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const token = decodeTeacherToken();
        if (!token) {
            router.push("/teacherLogin");
            return;
        }

        setIsReady(true);
    }, [router]);

    if (!isReady) {
        return (
            <Center h="100vh">
                <Loader size="sm" color="orange" />
            </Center>
        );
    }

    return (
        <Box className="h-[calc(100vh-64px)] w-full overflow-hidden bg-[#FAFAFA] text-black">
            <ClassPage />
        </Box>
    );
}
