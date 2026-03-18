import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LayoutShell from '@/comps/layouts/LayoutShell';
import ClassDetailComp from '@/comps/linkLianApp/class/classDetailComp';

export default function ClassDetailHome() {
    const router      = useRouter();
    const { subjectName } = router.query as { subjectName?: string };

    return (
        <>
            <Head>
                <title>{subjectName ?? 'ห้องเรียน'}</title>
                <meta name="description" content="รายละเอียดห้องเรียน" />
            </Head>
            <LayoutShell>
                <ClassDetailComp />
            </LayoutShell>
        </>
    );
}
