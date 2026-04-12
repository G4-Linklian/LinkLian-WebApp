import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Alert, Box, Button, Loader, Paper, ScrollArea, Select, Text, TextInput, Group, Stack, ThemeIcon } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { formatDateTime } from '@/utils/function/classHelper'
import { searchLive } from '@/utils/api/social-feed/qna'
import { AppColors } from '@/constants/colors'
import { IconSearch, IconBroadcast, IconCalendarEvent, IconPlayerPlay } from '@tabler/icons-react'

interface LiveHistoryItem {
    qa_live_id: number
    live_title?: string
    status?: string
    started_at?: string
    ended_at?: string
    live_by?: number
}

type SortOption =
    | 'created_desc'
    | 'created_asc'

const SORT_CONFIG: Record<SortOption, { sort_by: string; sort_order: 'ASC' | 'DESC' }> = {
    created_desc: { sort_by: 'started_at', sort_order: 'DESC' },
    created_asc: { sort_by: 'started_at', sort_order: 'ASC' },
}

export default function ArchiveLive() {
    const router = useRouter()
    const { sectionId, subjectName, className } = router.query as {
        sectionId?: string | string[]
        subjectName?: string
        className?: string
    }

    const resolvedSectionId = Number(Array.isArray(sectionId) ? sectionId[0] : sectionId)

    const [liveList, setLiveList] = useState<LiveHistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500)
    const [sortOption, setSortOption] = useState<SortOption>('created_desc')

    const toDisplayDate = (raw?: string): string => (raw ? formatDateTime(raw) : '-')

    const fetchLiveHistory = async () => {
        if (!Number.isFinite(resolvedSectionId) || resolvedSectionId <= 0) {
            setLiveList([])
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const sortConfig = SORT_CONFIG[sortOption]

            const res: any = await searchLive({
                section_id: resolvedSectionId,
                status: 'END',
                flag_valid: true,
                sort_by: sortConfig.sort_by,
                sort_order: sortConfig.sort_order,
            })

            const rows = Array.isArray(res?.data)
                ? res.data
                : Array.isArray(res?.result?.data)
                    ? res.result.data
                    : []

            const mapped = rows
                .map((item: any) => {
                    const qaLiveId = Number(item?.qa_live_id)
                    if (!Number.isFinite(qaLiveId) || qaLiveId <= 0) return null
                    return {
                        qa_live_id: qaLiveId,
                        live_title: String(item?.live_title ?? '').trim(),
                        status: String(item?.status ?? '').trim(),
                        started_at: item?.started_at ?? item?.startedAt,
                        ended_at: item?.ended_at ?? item?.endedAt,
                        live_by: Number(item?.live_by),
                    } as LiveHistoryItem
                })
                .filter(Boolean) as LiveHistoryItem[]

            const sortedMapped = [...mapped].sort((a, b) => {
                const aTime = new Date(a.started_at || 0).getTime()
                const bTime = new Date(b.started_at || 0).getTime()
                return sortOption === 'created_asc' ? aTime - bTime : bTime - aTime
            })

            const keyword = debouncedSearchTerm.trim().toLowerCase()
            if (!keyword) {
                setLiveList(sortedMapped)
            } else {
                setLiveList(
                    sortedMapped.filter((item) => String(item.live_title || '').toLowerCase().includes(keyword)),
                )
            }
        } catch {
            setError('โหลดประวัติไลฟ์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
            setLiveList([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void fetchLiveHistory()
    }, [resolvedSectionId, debouncedSearchTerm, sortOption])

    const openLive = (qaLiveId: number) => {
        void router.push({
            pathname: '/classes/qa_live',
            query: {
                sectionId: resolvedSectionId,
                qaLiveId,
                mode: 'history',
                ...(subjectName ? { subjectName } : {}),
                ...(className ? { className } : {}),
            },
        })
    }

    return (
        <Box className="h-[calc(100vh-64px)] w-full overflow-hidden bg-[#FAFAFA] text-black">
            <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-4 md:px-6">
                <Paper
                    radius="lg"
                    withBorder
                    p="md"
                    className="mb-3 shadow-sm"
                    style={{
                        backgroundColor: '#FFFFFFCC',
                        backdropFilter: 'blur(4px)',
                        borderColor: '#CED4DA',
                    }}
                >
                    <div className="min-w-0">
                        <Text size="xl" fw={800} c="dark.8">ประวัติไลฟ์ย้อนหลัง</Text>
                        <Text size="sm" c="dimmed" truncate>
                            {String(subjectName || className || 'ห้องเรียน')} • รายการย้อนหลัง
                        </Text>
                    </div>
                </Paper>

                <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_260px]">
                    <TextInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ค้นหาจากชื่อประวัติไลฟ์"
                        radius="md"
                        styles={{
                            input: {
                                backgroundColor: '#FFFFFFE6',
                                borderColor: '#CED4DA',
                            },
                        }}
                        leftSection={<IconSearch size={16} className="text-gray-400" />}
                    />
                    <Select
                        value={sortOption}
                        onChange={(value) => {
                            if (value) setSortOption(value as SortOption)
                        }}
                        data={[
                            { value: 'created_desc', label: 'วันที่เริ่มล่าสุด' },
                            { value: 'created_asc', label: 'วันที่เริ่มเก่าสุด' },
                        ]}
                        radius="md"
                        styles={{
                            input: {
                                backgroundColor: '#FFFFFFE6',
                                borderColor: '#CED4DA',
                            },
                        }}
                        comboboxProps={{ withinPortal: false }}
                    />
                </div>

                <Paper radius="lg" className="min-h-0 flex-1 overflow-hidden" bg="transparent">
                    <ScrollArea type="hover" scrollbars="y" className="h-full" classNames={{ viewport: 'pr-3' }}>
                        {isLoading && (
                            <div className="flex flex-col items-center gap-3 py-16">
                                <Loader color="orange" />
                                <Text size="sm" c="orange.5">กำลังโหลดประวัติไลฟ์...</Text>
                            </div>
                        )}

                        {!isLoading && error && (
                            <div className="py-4">
                                <Alert color="red" variant="light">{error}</Alert>
                                <Button mt="sm" variant="light" color="orange" radius="xl" onClick={() => { void fetchLiveHistory() }}>
                                    ลองใหม่
                                </Button>
                            </div>
                        )}

                        {!isLoading && !error && liveList.length === 0 && (
                            <div className="flex flex-col items-center gap-3 py-16">
                                <Text size="sm" c="gray.5">ไม่พบประวัติไลฟ์ที่จบแล้ว</Text>
                            </div>
                        )}

                        {!isLoading && !error && liveList.length > 0 && (
                            <div className="space-y-4 py-2">
                                {liveList.map((item) => (
                                    <Paper
                                        key={item.qa_live_id}
                                        withBorder
                                        radius="lg"
                                        p="lg"
                                        bg="white"
                                        className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-default"
                                    >
                                        <Group justify="space-between" wrap="nowrap" align="center">
                                            
                                            <Group wrap="nowrap" align="center" gap="md" className="min-w-0">
                                                <ThemeIcon size={52} radius="md" variant="light" color="orange" className="shrink-0 hidden md:flex">
                                                    <IconBroadcast size={24} />
                                                </ThemeIcon>
                                                
                                                <Stack gap={4} className="min-w-0">
                                                    <Text size="lg" fw={700} c="dark.8" className="truncate">
                                                        {item.live_title || `ประวัติไลฟ์ #${item.qa_live_id}`}
                                                    </Text>
                                                    <Group gap="xs" c="dimmed">
                                                        <IconCalendarEvent size={16} className="shrink-0" />
                                                        <Text size="sm" className="truncate">
                                                            เริ่ม: {toDisplayDate(item.started_at)} • จบ: {toDisplayDate(item.ended_at)}
                                                        </Text>
                                                    </Group>
                                                </Stack>
                                            </Group>

                                            <div className="flex shrink-0 items-center pl-4">
                                                <Button
                                                    variant="light"
                                                    color="orange"
                                                    radius="xl"
                                                    leftSection={<IconPlayerPlay size={16} />}
                                                    onClick={() => openLive(item.qa_live_id)}
                                                    className="transition-transform active:scale-95"
                                                >
                                                    ดูย้อนหลัง
                                                </Button>
                                            </div>

                                        </Group>
                                    </Paper>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </Paper>
            </div>
        </Box>
    )
}