import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import InfoComp from "@/comps/registration/info/infoComp";
import Head from 'next/head';

import React from 'react'

import LayoutShell from "@/comps/layouts/LayoutShell";

function PageContent() {
    // const [canRead, setCanRead] = useState(false);

    // useCheckTokenFlags(
    //     [{ flag: "read", onFlagUpdated: setCanRead }],
    //     "check_in"
    // );

    // const router = useRouter();

    return (
        <div className="w-[100%] h-full text-black px-8 py-4 bg-[#FAFAFA]">
            <InfoComp />
        </div>
    );
}


export default function RegistrationHome() {
    return (
        <>
            <Head>
                <title>Information</title>
                <meta name="description" content="Information Page" />
            </Head>

            <LayoutShell>
                <PageContent></PageContent>
            </LayoutShell>
        </>
    );
}

