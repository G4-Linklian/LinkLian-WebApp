import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import LayoutShell from '@/comps/layouts/LayoutShell';
import QnaComp from '@/comps/linkLianApp/question&Answer/question&answerComp';
import { decodeTeacherToken } from '@/utils/authToken';

function PageContent() {
    return (
        <div className="flex justify-center items-center w-full h-full">
            <QnaComp />
        </div>
    );
}

export default function QnaPage() {
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
                <title>Q&A Live</title>
                <meta name="description" content="Q&A Live" />
            </Head>
            <LayoutShell>
                <PageContent />
            </LayoutShell>
        </>
    );
}
