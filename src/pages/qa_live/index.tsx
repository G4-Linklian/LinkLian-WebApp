import Head from "next/head";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import QaLiveComp from "@/comps/qa_live/qaLiveComp";
import LayoutShell from "@/comps/layouts/LayoutShell";
import { decodeTeacherToken } from "@/utils/authToken";

function PageContent() {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <QaLiveComp />
        </div>
    );
}

export default function QaLivePage() {
    const router = useRouter();

    useEffect(() => {
        const token = decodeTeacherToken();

        if (!token) {
            router.push("/teacherLogin");
        }
    }, [router]);

    return (
        <>
            <Head>
                <title>Q&A Live Sessions</title>
                <meta name="Q&A" content="Q&A Live Sessions" />
            </Head>
            <LayoutShell>
                <PageContent></PageContent>
            </LayoutShell>
        </>
    );
}
