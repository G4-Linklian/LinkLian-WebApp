import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Head from 'next/head';
import React from 'react'

import LayoutShellManagement from "@/comps/layouts/LayoutShellManagement";
import ScheduleComp from "@/comps/registration/schedule/scheduleComp";

function PageContent() {
    // const [canRead, setCanRead] = useState(false);

    // useCheckTokenFlags(
    //     [{ flag: "read", onFlagUpdated: setCanRead }],
    //     "check_in"
    // );

    const router = useRouter();

    return (
        <div className="w-[100%] h-full text-black px-8 py-4 bg-[#FAFAFA]">
            <ScheduleComp />
        </div>
    );
}


export default function SchedulingHome() {
    return (
        <>
            <Head>
                <title>งานจัดตาราง</title>
                <meta name="description" content="Information Page" />
            </Head>

            <LayoutShellManagement>
                <PageContent></PageContent>
            </LayoutShellManagement>
        </>
    );
}

