import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LayoutShell from '@/comps/layouts/LayoutShell';
import ClassComp from '@/comps/linkLianApp/class/classComp';
import { decodeTeacherToken } from '@/utils/authToken';

function PageContent() {
  return <ClassComp />;
}

export default function ClassesHome() {
  const router = useRouter();

  useEffect(() => {
    const token = decodeTeacherToken();
    if (!token) {
      router.push('/teacherLogin');
    }
  }, [router]);

  return (
    <>
      <Head>
        <title>ห้องเรียน</title>
        <meta name="description" content="ห้องเรียนของคุณ" />
      </Head>
      <LayoutShell>
        <PageContent />
      </LayoutShell>
    </>
  );
}
