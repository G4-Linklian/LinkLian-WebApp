import React from 'react';
import Head from 'next/head';
import LayoutShell from '@/comps/layouts/LayoutShell';
import ClassComp from '@/comps/linkLianApp/class/classComp';

export default function ClassesHome() {
  return (
    <>
      <Head>
        <title>ห้องเรียน</title>
        <meta name="description" content="ห้องเรียนของคุณ" />
      </Head>
      <LayoutShell>
        <ClassComp />
      </LayoutShell>
    </>
  );
}
