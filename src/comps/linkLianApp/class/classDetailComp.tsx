import React from 'react'
import { useRouter } from 'next/router'
import ClassDetail from '@/comps/linkLianApp/class/classDetail/classDetail'

const ClassDetailComp = () => {
  const router = useRouter()
  const { sectionId, subjectName, className } = router.query as {
    sectionId: string | string[]
    subjectName?: string
    className?: string
  }

  const rawSectionId = Array.isArray(sectionId) ? sectionId[0] : sectionId
  const parsedSectionId = Number(rawSectionId)

  if (!rawSectionId || !Number.isFinite(parsedSectionId) || parsedSectionId <= 0) {
    return null
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-[#FAFAFA] text-black">
      <ClassDetail
        sectionId={parsedSectionId}
        subjectName={subjectName ?? ''}
        className={className ?? ''}
      />
    </div>
  )
}

export default ClassDetailComp
