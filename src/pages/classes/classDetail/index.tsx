import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LayoutShell from '@/comps/layouts/LayoutShell';
import ClassDetailComp from '@/comps/linkLianApp/classDetail/classDetailComp';
import { decodeTeacherToken } from '@/utils/authToken';

function PageContent() {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <ClassDetailComp />
        </div>
    );
}

export default function ClassDetailHome() {
    const router = useRouter();
    const { subjectName } = router.query as { subjectName?: string };

    useEffect(() => {
        const token = decodeTeacherToken();
        if (!token) {
            router.push('/teacherLogin');
        }
    }, [router]);

    return (
        <>
            <Head>
                <title>{subjectName ?? 'ห้องเรียน'}</title>
                <meta name="description" content="รายละเอียดห้องเรียน" />
            </Head>
            <LayoutShell>
                <PageContent />
            </LayoutShell>
        </>
    );
}
