import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import React from 'react'
import RegistrationComp from "@/comps/registration/registration/registrationComp";
import Head from 'next/head';
import LayoutShellManagement from "@/comps/layouts/LayoutShellManagement";

function PageContent() {
    // const [canRead, setCanRead] = useState(false);

    // useCheckTokenFlags(
    //     [{ flag: "read", onFlagUpdated: setCanRead }],
    //     "check_in"
    // );

    const router = useRouter();

    return (
        <div className="w-[100%] h-full text-black px-8 py-4 bg-[#FAFAFA]">
            <RegistrationComp />
        </div>
    );
}


export default function RegistrationHome() {
    return (
        <>
            <Head>
                <title>งานทะเบียนนักเรียน</title>
                <meta name="description" content="Information Page" />
            </Head>
            <LayoutShellManagement>
                <PageContent></PageContent>
            </LayoutShellManagement>
        </>
    );
}

