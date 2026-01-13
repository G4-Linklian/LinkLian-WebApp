import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RegistrationLoginPage from "@/comps/registration/auth/loginComp";
import Head from 'next/head';

import React from 'react'

import LayoutShell from "@/comps/layouts/LayoutShellManagement";

function PageContent() {
    // const [canRead, setCanRead] = useState(false);

    // useCheckTokenFlags(
    //     [{ flag: "read", onFlagUpdated: setCanRead }],
    //     "check_in"
    // );

    const router = useRouter();

    return (
        // <div className="w-[100%] h-full text-black justify-center items-center flex">Info</div>
        <div className="bg-[#343434] w-full h-full">
            <RegistrationLoginPage />
        </div>
    );
}


export default function RegistrationLogin() {
    return (
        <>
            <Head>
                <title>เข้าสู่ระบบ</title>
                <meta name="login" content="Login" />
            </Head>
            <PageContent></PageContent>
        </>
    );
}

