import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BuildingDetail from "@/comps/registration/info/location/buildingDetail";
import Head from 'next/head';

import React from 'react'

import LayoutShellManagement from "@/comps/layouts/LayoutShellManagement";

function PageContent() {
    // const [canRead, setCanRead] = useState(false);

    // useCheckTokenFlags(
    //     [{ flag: "read", onFlagUpdated: setCanRead }],
    //     "check_in"
    // );

    // const router = useRouter();

    return (
        <div className="w-[100%] h-full text-black px-8 py-4 bg-[#FAFAFA]">
            <BuildingDetail />
        </div>
    );
}


export default function SemesterHome() {
    return (
        <>
            <Head>
                <title>อาคารเรียน</title>
                <meta name="description" content="Information Page" />
            </Head>

            <LayoutShellManagement>
                <PageContent></PageContent>
            </LayoutShellManagement>
        </>
    );
}

