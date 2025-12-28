import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import React from 'react'

import LayoutShell from "@/comps/layouts/LayoutShell";

function PageContent() {
    // const [canRead, setCanRead] = useState(false);

    // useCheckTokenFlags(
    //     [{ flag: "read", onFlagUpdated: setCanRead }],
    //     "check_in"
    // );

    const router = useRouter();

    return (
        <div className="w-[100%] h-full text-black justify-center items-center flex">Home Page</div>
    );
}


export default function RegistrationHome() {
    return (
        <>
            <LayoutShell>
                <PageContent></PageContent>
            </LayoutShell>
        </>
    );
}

