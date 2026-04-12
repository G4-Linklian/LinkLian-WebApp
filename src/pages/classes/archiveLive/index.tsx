import React, { useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import LayoutShell from '@/comps/layouts/LayoutShell'
import ArchiveLive from '@/comps/linkLianApp/question&answer/archiveLive'
import { decodeTeacherToken } from '@/utils/authToken'

function PageContent() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ArchiveLive />
    </div>
  )
}

export default function ArchiveLivePage() {
  const router = useRouter()

  useEffect(() => {
    const token = decodeTeacherToken()
    if (!token) {
      router.push('/teacherLogin')
    }
  }, [router])

  return (
    <>
      <Head>
        <title>ประวัติไลฟ์</title>
        <meta name="description" content="ประวัติไลฟ์ในห้องเรียน" />
      </Head>
      <LayoutShell>
        <PageContent />
      </LayoutShell>
    </>
  )
}
