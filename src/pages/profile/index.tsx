import Image from "next/image";
import Head from 'next/head';
import React, { useEffect } from 'react';
import { useRouter } from "next/router";
import ProfilePage from "@/comps/profile/profileComp";
import LayoutShell from "@/comps/layouts/LayoutShell";
import { decodeTeacherToken } from "@/utils/authToken";

function PageContent() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <ProfilePage />
    </div>
  );
}

export default function TeacherProfile() {
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
        <title>โปรไฟล์</title>
        <meta name="profile" content="Profile" />
      </Head>
      <LayoutShell>
        <PageContent></PageContent>
      </LayoutShell>
    </>
  );
}
