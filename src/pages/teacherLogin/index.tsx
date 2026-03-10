import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/router";
import { useEffect } from "react";
import TeacherLoginPage from "@/comps/teacherLogin/teacherLoginComp";
import Head from 'next/head';

import React from 'react'

function PageContent() {
    const router = useRouter();

    return (
        // <div className="w-[100%] h-full text-black justify-center items-center flex">Info</div>
        <div className="bg-[#343434] w-full h-full">
            <TeacherLoginPage />
        </div>
    );
}

export default function TeacherLogin() {
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

