import Image from "next/image";
import Head from 'next/head';
import React from 'react';
import { useRouter } from "next/router";
import ProfilePage from "@/comps/profile/profileComp";
import LayoutShell from "@/comps/layouts/LayoutShell";

function PageContent() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/teacherLogin");
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <ProfilePage />
    </div>
  );
}

export default function TeacherProfile() {
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
