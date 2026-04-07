import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/router";
import { ActionIcon, Badge, Button, Grid, Group, Paper, Stack, Tooltip, Text } from "@mantine/core";
import {
    IconLayoutSidebarLeftExpand,
    IconLayoutSidebarRightExpand,
    IconPlayerStopFilled,
    IconSquare,
} from "@tabler/icons-react";
import MaterialList from "./materialList";
import PresentationPanel from "./presentation";
import QuestionPanel from "./questionPanel";
import {
    getLiveById,
    createLiveLog,
    createQuestion,
    updateLive,
    getCurrentLog,
    searchLiveLog,
    searchQuestion,
    updateQuestion,
    searchSectionFiles,
    createUpvote,
    deleteUpvote,
    searchUpvote,
} from "@/utils/api/social-feed/qna";
import { decodeRegistrationToken, decodeTeacherToken } from "@/utils/authToken";
import { getUserProfile } from "@/utils/api/profile";

interface QaLiveMaterialItem {
    post_id?: number;
    section_id?: number;
    post_title?: string;
    post_content?: {
        post_content_id?: number;
        title?: string;
        created_at?: string;
    };
    attachments?: {
        attachment_id?: number;
        file_url?: string;
        file_type?: string;
        original_name?: string;
    }[];
}

interface QaQuestion {
    qa_question_id: number;
    qa_live_id: number;
    asker_id?: number;
    question: string;
    asker: {
        user_sys_id: number | null;
        first_name: string;
        last_name: string;
        profile_pic: string | null;
    };
    post_id: number;
    attachment_id: number;
    slide_number?: number;
    status: string;
    upvote_count: number;
    created_at: string;
    flag_valid: boolean;
    file_name?: string;
    is_anonymous?: boolean;
}

interface QaLiveLogItem {
    log_id?: number;
    qa_live_id?: number;
    post_id?: number | string;
    attachment_id?: number | string;
    opened_at?: string;
    post_content?: {
        post_content_id?: number;
        title?: string;
    };
    post_attachment?: {
        attachment_id?: number | string;
        original_name?: string;
    };
}

interface CurrentUserProfile {
    first_name?: string;
    last_name?: string;
    profile_pic?: string | null;
}

type QaLiveAttachment = NonNullable<QaLiveMaterialItem["attachments"]>[number];

export default function QaLiveComp() {
    const [showMaterialPanel, setShowMaterialPanel] = useState(true);
    const [showQuestionPanel, setShowQuestionPanel] = useState(true);
    const [materials, setMaterials] = useState<QaLiveMaterialItem[]>([]);
    const [activeMaterialId, setActiveMaterialId] = useState<number | undefined>(undefined);
    const [activeAttachmentId, setActiveAttachmentId] = useState<number | undefined>(undefined);
    const [selectedAttachment, setSelectedAttachment] = useState<QaLiveAttachment | undefined>(undefined);
    const [selectedPostTitle, setSelectedPostTitle] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");
    const [currentSlide, setCurrentSlide] = useState(1);
    const [requestedSlide, setRequestedSlide] = useState<number | undefined>(undefined);
    const [slideJumpKey, setSlideJumpKey] = useState(0);
    const [isEndingLive, setIsEndingLive] = useState(false);
    const [questions, setQuestions] = useState<QaQuestion[]>([]);
    const [liveLogs, setLiveLogs] = useState<QaLiveLogItem[]>([]);
    const [selectedQuestionFileFilter, setSelectedQuestionFileFilter] = useState("all");
    const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null);
    const [liveTitle, setLiveTitle] = useState("");
    const [liveByUserId, setLiveByUserId] = useState<number | undefined>(undefined);
    const [viewerCount, setViewerCount] = useState<number>(0);

    const socketRef = useRef<WebSocket | null>(null);
    const materialsRef = useRef<QaLiveMaterialItem[]>([]);

    const router = useRouter();
    const rawLiveId = Array.isArray(router.query.qaLiveId) ? router.query.qaLiveId[0] : router.query.qaLiveId;
    const qaLiveId = Number(rawLiveId);

    const currentUserId = useMemo(() => {
        const teacherToken = decodeTeacherToken();
        if (teacherToken?.user_id) return Number(teacherToken.user_id);
        const registrationToken = decodeRegistrationToken();
        if (registrationToken?.user_id) return Number(registrationToken.user_id);
        return undefined;
    }, []);

    const isLiveOwner = useMemo(() => {
        if (!currentUserId || !liveByUserId) return false;
        return Number(currentUserId) === Number(liveByUserId);
    }, [currentUserId, liveByUserId]);

    const [isSyncEnabled, setIsSyncEnabled] = useState(true);
    const isSyncEnabledRef = useRef(isSyncEnabled);

    useEffect(() => {
        isSyncEnabledRef.current = isSyncEnabled;
    }, [isSyncEnabled]);

    // sync materialsRef for socket
    useEffect(() => {
        materialsRef.current = materials;
    }, [materials]);

    const upsertQuestion = (nextQuestion: QaQuestion) => {
        setQuestions((prev) => {
            const exists = prev.some((item) => item.qa_question_id === nextQuestion.qa_question_id);
            if (exists) {
                return prev.map((item) =>
                    item.qa_question_id === nextQuestion.qa_question_id ? { ...item, ...nextQuestion } : item
                );
            }
            return [...prev, nextQuestion];
        });
    };

    const normalizeQuestionWithProfile = (
        question: QaQuestion,
        profileMap: Map<number, CurrentUserProfile>,
    ): QaQuestion => {
        if (question.is_anonymous === true) return question;

        const askerUserId = Number(question.asker?.user_sys_id || question.asker_id || 0);
        const profile = askerUserId > 0 ? profileMap.get(askerUserId) : undefined;

        const nextAsker = {
            user_sys_id: question.asker?.user_sys_id ?? (askerUserId > 0 ? askerUserId : null),
            first_name: question.asker?.first_name || profile?.first_name || "",
            last_name: question.asker?.last_name || profile?.last_name || "",
            profile_pic: question.asker?.profile_pic || profile?.profile_pic || null,
        };

        return { ...question, asker: nextAsker };
    };

    // socket connection
    useEffect(() => {
        if (!router.isReady) return;

        if (!Number.isFinite(qaLiveId) || qaLiveId <= 0) return;

        const socketUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL?.replace('http', 'ws')}/ws/qa`;
        const ws = new WebSocket(socketUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("Socket connected");

            ws.send(JSON.stringify({
                type: "JOIN_LIVE",
                payload: {
                    qa_live_id: String(qaLiveId),
                    user_id: currentUserId ? String(currentUserId) : "0"
                }
            }));
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                const payload = msg.payload;

                switch (msg.type) {
                    case "VIEWER_COUNT_UPDATED":
                        if (payload.count !== undefined) {
                            setViewerCount(payload.count);
                        }
                        break;
                    case "LIVE_CURRENT_STATE":
                        if (!payload || !payload.attachment_id) break;

                        const currentMats = materialsRef.current;
                        const targetMat = currentMats.find(m =>
                            m.attachments?.some(a => Number(a.attachment_id) === Number(payload.attachment_id))
                        );
                        const targetAtt = targetMat?.attachments?.find(
                            a => Number(a.attachment_id) === Number(payload.attachment_id)
                        );

                        if (targetMat && targetAtt) {
                            setActiveMaterialId(targetMat.post_id);
                            setActiveAttachmentId(targetAtt.attachment_id);
                            setSelectedAttachment(targetAtt);
                            setSelectedPostTitle(targetMat.post_title || targetMat.post_content?.title || "");
                        }
                        break;

                    case "FILE_CHANGED":
                        if (payload.qa_live_id !== qaLiveId) break;

                        if (!isSyncEnabledRef.current) {
                            break;
                        }

                        const currentMaterials = materialsRef.current;
                        const material = currentMaterials.find(m =>
                            m.attachments?.some(a => a.attachment_id === payload.attachment_id)
                        );
                        const attachment = material?.attachments?.find(
                            a => a.attachment_id === payload.attachment_id
                        );

                        if (material && attachment) {
                            setActiveMaterialId(material.post_id);
                            setActiveAttachmentId(attachment.attachment_id);
                            setSelectedAttachment(attachment);
                        }

                        setLiveLogs((prev) => {
                            const nextItem = {
                                qa_live_id: payload.qa_live_id,
                                post_id: payload.post_id,
                                attachment_id: payload.attachment_id,
                                opened_at: payload.opened_at,
                            };
                            const deduped = prev.filter((item) => item.attachment_id !== payload.attachment_id);
                            return [nextItem, ...deduped];
                        });
                        break;

                    case "QA_LIVE_ENDED":
                        if (payload.qa_live_id !== qaLiveId) break;
                        router.push({
                            pathname: "/classes/classDetail",
                            query: {
                                sectionId: router.query.sectionId,
                                subjectName: router.query.subjectName,
                                className: router.query.className,
                            },
                        });
                        break;

                    case "QA_NEW_QUESTION":
                        if (payload.qa_live_id !== qaLiveId) break;
                        upsertQuestion(payload);
                        break;

                    case "QA_QUESTION_UPDATED":
                        if (payload.qa_live_id !== qaLiveId) break;
                        setQuestions(prev =>
                            prev.map(q =>
                                q.qa_question_id === payload.qa_question_id
                                    ? { ...q, status: payload.status, question: payload.question }
                                    : q
                            )
                        );
                        break;

                    case "QA_UPVOTED":
                        console.log("socket message:", payload);
                        
                        if (Number(payload.qa_live_id) !== Number(qaLiveId)) {
                            console.log("qaLiveId isn't matching:", payload.qa_live_id, "vs", qaLiveId);
                            break;
                        }

                        setQuestions(prev =>
                            prev.map(q =>
                                Number(q.qa_question_id) === Number(payload.qa_question_id)
                                    ? { ...q, upvote_count: Number(payload.upvote_count) }
                                    : q
                            )
                        );
                        break;
                }
            } catch (error) {
                console.error("Error parsing socket message", error);
            }
        };

        ws.onclose = () => {
            console.log("Socket disconnected");
        };

        ws.onerror = (error) => {
            console.error("Socket Error:", error);
        };

        return () => {
            ws.close();
        };
    }, [qaLiveId, router]);

    useEffect(() => {
        const fetchLiveTitle = async () => {
            if (!Number.isFinite(qaLiveId) || qaLiveId <= 0)
                return;

            try {
                const res = await getLiveById(qaLiveId);
                if (res?.success && res?.data) {
                    setLiveTitle(res.data.live_title || "ไลฟ์ถามตอบ");
                    const ownerId = Number(res.data.live_by);
                    setLiveByUserId(Number.isFinite(ownerId) && ownerId > 0 ? ownerId : undefined);
                }
            } catch (error) {
                console.error("Failed to fetch live title:", error);
            }
        };

        void fetchLiveTitle();
    }, [qaLiveId]);

    useEffect(() => {
        const fetchCurrentUserProfile = async () => {
            if (!currentUserId)
                return;

            try {
                const res = await getUserProfile(currentUserId);
                if (res?.success && res?.data) {
                    setCurrentUserProfile(res.data as CurrentUserProfile);
                }
            } catch (error) {
                console.error("Failed to fetch current user profile:", error);
            }
        };

        void fetchCurrentUserProfile();
    }, [currentUserId]);

    useEffect(() => {
        const fetchLiveLogs = async () => {
            if (!Number.isFinite(qaLiveId) || qaLiveId <= 0) return;

            try {
                const [logRes, currentLogRes] = await Promise.all([
                    searchLiveLog({
                        qa_live_id: qaLiveId,
                        sort_by: "opened_at",
                        sort_order: "DESC",
                    }),
                    getCurrentLog(qaLiveId),
                ]);

                const fetchedLogs = logRes?.success && Array.isArray(logRes.data)
                    ? (logRes.data as QaLiveLogItem[])
                    : [];

                const currentLog = currentLogRes?.success && currentLogRes?.data
                    ? [currentLogRes.data as QaLiveLogItem]
                    : [];

                const merged = [...currentLog, ...fetchedLogs];
                const dedupByAttachment = new Map<number, QaLiveLogItem>();

                merged.forEach((item) => {
                    const attachmentId = Number(item.attachment_id || item.post_attachment?.attachment_id);
                    if (!Number.isFinite(attachmentId) || attachmentId <= 0) return;

                    const existing = dedupByAttachment.get(attachmentId);
                    if (!existing) {
                        dedupByAttachment.set(attachmentId, item);
                        return;
                    }

                    const prevTime = new Date(existing.opened_at || 0).getTime();
                    const nextTime = new Date(item.opened_at || 0).getTime();
                    if (nextTime > prevTime) {
                        dedupByAttachment.set(attachmentId, item);
                    }
                });

                const normalized = Array.from(dedupByAttachment.values()).sort((a, b) => {
                    const aTime = new Date(a.opened_at || 0).getTime();
                    const bTime = new Date(b.opened_at || 0).getTime();
                    return bTime - aTime;
                });

                if (selectedAttachment?.attachment_id) {
                    const exists = normalized.some((item) => Number(item.attachment_id) === Number(selectedAttachment.attachment_id));
                    if (!exists) {
                        normalized.unshift({
                            qa_live_id: qaLiveId,
                            post_id: activeMaterialId,
                            attachment_id: selectedAttachment.attachment_id,
                            opened_at: new Date().toISOString(),
                        });
                    }
                }

                setLiveLogs(normalized);
            } catch (error) {
                console.error("Failed to fetch live logs:", error);
            }
        };

        void fetchLiveLogs();
    }, [qaLiveId, selectedAttachment?.attachment_id, activeMaterialId]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!Number.isFinite(qaLiveId) || qaLiveId <= 0) return;

            try {
                const res = await searchQuestion({
                    qa_live_id: qaLiveId,
                    flag_valid: true,
                    sort_by: "created_at",
                    sort_order: "ASC",
                });

                if (res?.success && Array.isArray(res.data)) {
                    const fetchedQuestions = res.data as QaQuestion[];
                    const askerIds = Array.from(new Set(
                        fetchedQuestions
                            .filter((item) => item.is_anonymous !== true)
                            .map((item) => Number(item.asker?.user_sys_id || item.asker_id || 0))
                            .filter((id) => Number.isFinite(id) && id > 0)
                    ));

                    const profileEntries = await Promise.all(
                        askerIds.map(async (id) => {
                            try {
                                const profileRes = await getUserProfile(id);
                                if (profileRes?.success && profileRes?.data) {
                                    return [id, profileRes.data as CurrentUserProfile] as const;
                                }
                            } catch {
                                return [id, {} as CurrentUserProfile] as const;
                            }
                            return [id, {} as CurrentUserProfile] as const;
                        })
                    );

                    const profileMap = new Map<number, CurrentUserProfile>(profileEntries);
                    const normalizedQuestions = fetchedQuestions.map((item) =>
                        normalizeQuestionWithProfile(item, profileMap)
                    );

                    setQuestions(normalizedQuestions);
                }
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            }
        };

        fetchQuestions();
    }, [qaLiveId]);

    const getLiveByUserId = (): number | null => {
        try {
            const token = decodeTeacherToken();
            return token?.user_id || null;
        } catch {
            return null;
        }
    };

    const getAskerUserId = (): number | undefined => {
        try {
            const teacherToken = decodeTeacherToken();
            if (teacherToken?.user_id) return Number(teacherToken.user_id);

            const registrationToken = decodeRegistrationToken();
            if (registrationToken?.user_id) return Number(registrationToken.user_id);

            return undefined;
        } catch {
            return undefined;
        }
    };

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearchKeyword(searchKeyword.trim());
        }, 300);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [searchKeyword]);

    useEffect(() => {
        const fetchSectionFiles = async () => {
            try {
                const sectionId = router.query.sectionId;
                const keyword = debouncedSearchKeyword;
                const res = await searchSectionFiles({
                    section_id: Number(sectionId),
                    flag_valid: true,
                });

                if (res?.success) {
                    const rawData = Array.isArray(res.data) ? (res.data as QaLiveMaterialItem[]) : [];
                    const mapped = rawData.map((item) => ({
                        ...item,
                        post_title: item.post_content?.title || item.post_title || "",
                        attachments: Array.isArray(item.attachments) ? item.attachments : [],
                    }));

                    const normalizedKeyword = keyword.toLowerCase();
                    const filtered = normalizedKeyword
                        ? mapped.filter((item) => {
                            const postTitle = (item.post_title || item.post_content?.title || "").toLowerCase();
                            const hasTitleMatch = postTitle.includes(normalizedKeyword);
                            const hasAttachmentMatch = (item.attachments || []).some((attachment) => {
                                const originalName = (attachment.original_name || "").toLowerCase();
                                return originalName.includes(normalizedKeyword);
                            });
                            return hasTitleMatch || hasAttachmentMatch;
                        })
                        : mapped;

                    const rawPostId = Array.isArray(router.query.postId) ? router.query.postId[0] : router.query.postId;
                    const rawAttachmentId = Array.isArray(router.query.attachmentId) ? router.query.attachmentId[0] : router.query.attachmentId;
                    const queryPostId = Number(rawPostId);
                    const queryAttachmentId = Number(rawAttachmentId);

                    const preservedAttachmentId = selectedAttachment?.attachment_id;
                    const preservedMaterialFromCurrent = filtered.find((item) => item.post_id === activeMaterialId);
                    const preservedAttachmentFromCurrent = filtered
                        .flatMap((item) => item.attachments || [])
                        .find((item) => item.attachment_id === preservedAttachmentId);
                    const preservedMaterialFromAttachment = filtered.find((item) =>
                        (item.attachments || []).some((attachment) => attachment.attachment_id === preservedAttachmentId)
                    );

                    const matchedMaterialByPost = Number.isFinite(queryPostId)
                        ? filtered.find((item) => item.post_id === queryPostId)
                        : undefined;
                    const firstMaterial = matchedMaterialByPost || filtered[0];
                    const matchedAttachment = Number.isFinite(queryAttachmentId)
                        ? firstMaterial?.attachments?.find((item) => item.attachment_id === queryAttachmentId)
                        : undefined;
                    const firstAttachment = matchedAttachment || firstMaterial?.attachments?.[0];

                    setMaterials(filtered);

                    if (preservedAttachmentFromCurrent && preservedMaterialFromAttachment) {
                        setActiveMaterialId(preservedMaterialFromAttachment.post_id);
                        setActiveAttachmentId(preservedAttachmentFromCurrent.attachment_id);
                        setSelectedAttachment(preservedAttachmentFromCurrent);
                        setSelectedPostTitle(
                            preservedMaterialFromAttachment.post_title || preservedMaterialFromAttachment.post_content?.title || ""
                        );
                        return;
                    }

                    if (preservedMaterialFromCurrent && !keyword) {
                        setActiveMaterialId(preservedMaterialFromCurrent.post_id);
                        const fallbackAttachment = preservedMaterialFromCurrent.attachments?.[0];
                        setActiveAttachmentId(fallbackAttachment?.attachment_id);
                        setSelectedAttachment(fallbackAttachment);
                        setSelectedPostTitle(
                            preservedMaterialFromCurrent.post_title || preservedMaterialFromCurrent.post_content?.title || ""
                        );
                        return;
                    }

                    if (keyword) {
                        return;
                    }

                    setActiveMaterialId(firstMaterial?.post_id);
                    setActiveAttachmentId(firstAttachment?.attachment_id);
                    setSelectedAttachment(firstAttachment);
                    setSelectedPostTitle(firstMaterial?.post_title || firstMaterial?.post_content?.title || "");
                } else {
                    setMaterials([]);
                    setActiveMaterialId(undefined);
                    setActiveAttachmentId(undefined);
                    setSelectedAttachment(undefined);
                    if (!debouncedSearchKeyword) {
                        setSelectedPostTitle("");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch section files:", error);
                setMaterials([]);
                setActiveMaterialId(undefined);
                setActiveAttachmentId(undefined);
                setSelectedAttachment(undefined);
                if (!debouncedSearchKeyword) {
                    setSelectedPostTitle("");
                }
            }
        };

        fetchSectionFiles();
    }, [router.query.sectionId, router.query.postId, router.query.attachmentId, debouncedSearchKeyword]);

    const centerSpan = useMemo(() => {
        if (showMaterialPanel && showQuestionPanel) return 6;
        if (showMaterialPanel || showQuestionPanel) return 9;
        return 12;
    }, [showMaterialPanel, showQuestionPanel]);

    const areBothSidePanelsHidden = !showMaterialPanel && !showQuestionPanel;
    const isSingleSidePanelVisible = showMaterialPanel !== showQuestionPanel;

    const questionFileOptions = useMemo(() => {
        const uniqueOptions = new Map<string, { value: string; label: string }>();

        liveLogs.forEach((log) => {
            const logPostId = Number(log.post_id);
            const logAttachmentId = Number(log.attachment_id || log.post_attachment?.attachment_id);

            if (Number.isNaN(logAttachmentId) || logAttachmentId <= 0) return;

            const material = materials.find((item) => Number(item.post_id) === logPostId);
            const attachment = material?.attachments?.find((item) => Number(item.attachment_id) === logAttachmentId);

            const title = log.post_content?.title || material?.post_title || material?.post_content?.title || "ไม่ระบุหัวข้อ";
            const originalName = log.post_attachment?.original_name || attachment?.original_name || `ไฟล์ #${logAttachmentId}`;
            const fileLabel = `${title} - ${originalName}`;

            const valueString = String(logAttachmentId);

            uniqueOptions.set(valueString, {
                value: valueString,
                label: fileLabel,
            });
        });

        const options = Array.from(uniqueOptions.values());

        return [{ value: "all", label: "บทเรียนทั้งหมด" }, ...options];
    }, [liveLogs, materials]);

    const filteredQuestions = useMemo(() => {
        if (selectedQuestionFileFilter === "all") return questions;
        return questions.filter((q) => String(q.attachment_id) === selectedQuestionFileFilter);
    }, [questions, selectedQuestionFileFilter]);

    const displayQuestions = useMemo(() => {
        return filteredQuestions.map((q) => {
            let lockedFileName = q.file_name;

            if (!lockedFileName) {
                const matchedMaterial = materials.find((m) =>
                    m.attachments?.some((a) => Number(a.attachment_id) === Number(q.attachment_id))
                );
                const matchedAttachment = matchedMaterial?.attachments?.find(
                    (a) => Number(a.attachment_id) === Number(q.attachment_id)
                );
                lockedFileName = matchedAttachment?.original_name || "ไม่ระบุชื่อไฟล์";
            }

            return { ...q, file_name: lockedFileName };
        });
    }, [filteredQuestions, materials]);

    const activeMaterial = useMemo(
        () => materials.find((item) => item.post_id === activeMaterialId) || materials[0],
        [materials, activeMaterialId]
    );

    const presentationPostTitle = activeMaterial?.post_title || activeMaterial?.post_content?.title || "ไม่พบชื่อโพสต์";
    const presentationAttachment = selectedAttachment;
    const presentationFileName = (() => {
        const attachment = presentationAttachment;
        if (attachment?.original_name) return attachment.original_name;
        const fileUrl = attachment?.file_url;
        if (!fileUrl) return "ไม่พบชื่อไฟล์";
        const rawName = fileUrl.split("/").pop() || "ไม่พบชื่อไฟล์";
        return decodeURIComponent(rawName);
    })();

    const handleSelectMaterial = (postId?: number) => {
        setActiveMaterialId(postId);
        const selectedMaterial = materials.find((item) => item.post_id === postId);
        if (selectedMaterial) {
            setSelectedPostTitle(selectedMaterial.post_title || selectedMaterial.post_content?.title || "");
        }
    };

    const handleSelectAttachment = async (postId?: number, attachment?: QaLiveAttachment) => {
        const isSameAttachment = activeAttachmentId != null && attachment?.attachment_id === activeAttachmentId;

        setActiveMaterialId(postId);
        setSelectedAttachment(attachment);
        setActiveAttachmentId(attachment?.attachment_id);
        const selectedMaterial = materials.find((item) => item.post_id === postId);
        if (selectedMaterial) {
            setSelectedPostTitle(selectedMaterial.post_title || selectedMaterial.post_content?.title || "");
        }

        if (
            Number.isFinite(qaLiveId) &&
            qaLiveId > 0 &&
            !isSameAttachment &&
            postId != null &&
            attachment?.attachment_id != null
        ) {
            try {
                await createLiveLog({
                    qa_live_id: qaLiveId,
                    post_id: postId,
                    attachment_id: attachment.attachment_id,
                });
            } catch (error) {
                console.error("Failed to create live log when switching attachment:", error);
            }
        }
    };

    const handleEndLive = async () => {
        const liveBy = getLiveByUserId();
        if (!Number.isFinite(qaLiveId) || qaLiveId <= 0 || !liveBy) return;

        setIsEndingLive(true);
        try {
            await updateLive(qaLiveId, {
                status: "END",
                live_by: liveBy,
            });
            await router.push({
                pathname: "/classes/classDetail",
                query: {
                    sectionId: router.query.sectionId,
                    subjectName: router.query.subjectName,
                    className: router.query.className,
                },
            });
        } catch (error) {
            console.error("Failed to end live:", error);
        } finally {
            setIsEndingLive(false);
        }
    };

    const handleLeaveLive = async () => {
        await router.push({
            pathname: "/classes/classDetail",
            query: {
                sectionId: router.query.sectionId,
                subjectName: router.query.subjectName,
                className: router.query.className,
            },
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentSlide(page);

        if (isLiveOwner && socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: "SLIDE_SYNC",
                payload: {
                    qa_live_id: String(qaLiveId),
                    slide_number: page,
                    user_id: String(currentUserId)
                }
            }));
        }
    };

    const handleSendQuestion = async (payload: {
        question: string;
        isAnonymous: boolean;
        fileName: string;
        slideNumber?: number;
    }) => {
        if (!Number.isFinite(qaLiveId) || qaLiveId <= 0) return;
        if (!activeMaterialId || !activeAttachmentId) return;

        const askerId = getAskerUserId();
        if (!askerId) {
            throw new Error("ไม่พบข้อมูลผู้ใช้งานสำหรับส่งคำถาม");
        }

        const res = await createQuestion({
            qa_live_id: qaLiveId,
            asker_id: askerId,
            question: payload.question,
            post_id: activeMaterialId,
            attachment_id: activeAttachmentId,
            slide_number: payload.slideNumber,
            is_anonymous: payload.isAnonymous,
            file_name: payload.fileName,
        });

        const created = res?.data;
        if (res?.success && created && !Array.isArray(created)) {
            const createdQuestion = created as QaQuestion;
            if (!payload.isAnonymous) {
                createdQuestion.is_anonymous = false;
                if (!createdQuestion.asker?.first_name || !createdQuestion.asker?.last_name) {
                    createdQuestion.asker = {
                        user_sys_id: currentUserId ?? null,
                        first_name: currentUserProfile?.first_name || "",
                        last_name: currentUserProfile?.last_name || "",
                        profile_pic: currentUserProfile?.profile_pic || null,
                    };
                }
            }
            upsertQuestion(createdQuestion);
        }
    };

    const handleUpvoteQuestion = async (questionId: number) => {
        if (!currentUserId || currentUserId === 0) {
            console.error("User must be logged in to upvote questions");
            return;
        }

        try {
            const searchRes = await searchUpvote({
                qa_question_id: questionId,
                voter_id: currentUserId
            });

            console.log("Search result:", searchRes);
            const hasVoted = searchRes?.data && searchRes.data.length > 0;

            if (hasVoted) {
                console.log("delete upvote");
                await deleteUpvote({ qa_question_id: questionId, voter_id: currentUserId });
            } else {
                console.log("create upvote");
                await createUpvote({ qa_question_id: questionId, voter_id: currentUserId });
            }

            console.log("Upvote process completed for question ID:", questionId);

        } catch (error) {
            console.error("Error to upvote:", error);
        }
    };

    const handleJumpToQuestion = (question: QaQuestion) => {
        const matchedMaterial = materials.find((item) => {
            const byPost = item.post_id === question.post_id;
            const byAttachment = (item.attachments || []).some((attachment) => attachment.attachment_id === question.attachment_id);
            const byFileName = question.file_name
                ? (item.attachments || []).some(
                    (attachment) =>
                        (attachment.original_name || "").toLowerCase() === question.file_name?.toLowerCase()
                )
                : false;
            return byPost || byAttachment || byFileName;
        });

        const matchedAttachment = matchedMaterial?.attachments?.find((attachment) => {
            if (attachment.attachment_id === question.attachment_id) return true;
            if (question.file_name && attachment.original_name) {
                return attachment.original_name.toLowerCase() === question.file_name.toLowerCase();
            }
            return false;
        });

        if (matchedMaterial && matchedAttachment) {
            void handleSelectAttachment(matchedMaterial.post_id, matchedAttachment);
        } else if (matchedMaterial) {
            handleSelectMaterial(matchedMaterial.post_id);
        }

        if (question.slide_number && question.slide_number > 0) {
            setRequestedSlide(question.slide_number);
            setCurrentSlide(question.slide_number);
            setSlideJumpKey((prev) => prev + 1);
        }
    };

    const handleMarkAsAnswered = async (questionId: number, currentStatus: string) => {
        const isAnswered = ["ANSWERED"].includes((currentStatus || "").toUpperCase());
        const nextStatus = isAnswered ? "PENDING" : "ANSWERED";

        setQuestions(prev => prev.map(q => 
            q.qa_question_id === questionId ? { ...q, status: nextStatus } : q
        ));

        try {
            await updateQuestion(questionId, {
                status: nextStatus,
            });
            
            console.log(`Question ID ${questionId} marked as ${nextStatus}`);

        } catch (error) {
            console.error("Error updating question status:", error);
        }
    };

    const displayPostTitle = selectedPostTitle || activeMaterial?.post_content?.title || "ไม่พบชื่อโพสต์";

    return (
        <div className="w-full bg-[#FAFAFA] overflow-hidden" style={{ height: "calc(100vh - 72px)" }}>
            <div className="mx-auto pt-3" style={{ width: "94%", height: "100%" }}>
                <Paper radius="xl" p="md" className="border border-gray-200" bg="white" style={{ height: "calc(100% - 4px)" }}>
                    <Stack h="100%" gap="md" style={{ minHeight: 0 }}>
                        <Group justify="space-between" wrap="wrap">
                            <Group>
                                <Badge color="red" variant="light" size="xl" radius="sm" leftSection={<IconSquare size={8} fill="currentColor" />}>
                                    ไลฟ์ {viewerCount > 0 ? `(${viewerCount})` : ""}
                                </Badge>
                                <Text fw={700} size="lg">
                                    {liveTitle}
                                </Text>
                            </Group>

                            <Group gap="xs">
                                <Button
                                    variant="default"
                                    leftSection={<IconPlayerStopFilled size={14} />}
                                    onClick={isLiveOwner ? handleEndLive : handleLeaveLive}
                                    loading={isLiveOwner && isEndingLive}
                                >
                                    {isLiveOwner ? "ปิดไลฟ์" : "ออกจากไลฟ์"}
                                </Button>
                            </Group>
                        </Group>

                        <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
                            {!showMaterialPanel && (
                                <Tooltip label="บทเรียน">
                                    <ActionIcon
                                        variant="default"
                                        size="lg"
                                        onClick={() => setShowMaterialPanel(true)}
                                        style={{
                                            position: "absolute",
                                            left: 8,
                                            top: "calc((var(--mantine-spacing-md) / 2) - 8px)",
                                            transform: "none",
                                            zIndex: 30,
                                        }}
                                    >
                                        <IconLayoutSidebarLeftExpand size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            )}

                            {!showQuestionPanel && (
                                <Tooltip label="คำถาม">
                                    <ActionIcon
                                        variant="default"
                                        size="lg"
                                        onClick={() => setShowQuestionPanel(true)}
                                        style={{
                                            position: "absolute",
                                            right: 8,
                                            top: "calc((var(--mantine-spacing-md) / 2) - 8px)",
                                            transform: "none",
                                            zIndex: 30,
                                        }}
                                    >
                                        <IconLayoutSidebarRightExpand size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            )}

                            <Grid
                                gutter="md"
                                align="stretch"
                                style={{ height: "100%", minHeight: 0, overflow: "hidden" }}
                                styles={{ inner: { height: "100%", minHeight: 0 } }}
                            >
                                {showMaterialPanel && (
                                    <Grid.Col span={{ base: 12, md: 3 }} style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", height: "100%" }}>
                                        <MaterialList
                                            materials={materials}
                                            activeMaterialId={activeMaterialId}
                                            activeAttachmentId={activeAttachmentId}
                                            searchKeyword={searchKeyword}
                                            onSearchKeywordChange={setSearchKeyword}
                                            showMaterialPanel={showMaterialPanel}
                                            onToggleMaterialPanel={() => setShowMaterialPanel((prev) => !prev)}
                                            onSelectMaterial={handleSelectMaterial}
                                            onSelectAttachment={handleSelectAttachment}
                                        />
                                    </Grid.Col>
                                )}

                                <Grid.Col
                                    span={{ base: 12, md: centerSpan }}
                                    offset={{ base: 0, md: 0 }}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        minHeight: 0,
                                        ...(areBothSidePanelsHidden
                                            ? {
                                                maxWidth: "92%",
                                                marginLeft: "auto",
                                                marginRight: "auto",
                                            }
                                            : isSingleSidePanelVisible
                                                ? {
                                                    maxWidth: "92%",
                                                    marginLeft: "auto",
                                                    marginRight: "auto",
                                                    paddingLeft: !showMaterialPanel ? 60 : 0,
                                                    paddingRight: !showQuestionPanel ? 60 : 0,
                                                }
                                            : {}),
                                    }}
                                >
                                    <PresentationPanel
                                        chapterTitle={displayPostTitle}
                                        fileName={presentationFileName}
                                        fileUrl={presentationAttachment?.file_url}
                                        fileType={presentationAttachment?.file_type}
                                        onPageChange={handlePageChange}
                                        requestedPage={requestedSlide}
                                        jumpKey={slideJumpKey}
                                    />
                                </Grid.Col>

                                {showQuestionPanel && (
                                    <Grid.Col span={{ base: 12, md: 3 }} style={{ display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", height: "100%" }}>
                                        <QuestionPanel
                                            fileName={presentationFileName}
                                            currentSlide={currentSlide}
                                            questions={displayQuestions}
                                            showQuestionPanel={showQuestionPanel}
                                            currentUserId={currentUserId}
                                            currentUserProfile={currentUserProfile}
                                            fileFilterOptions={questionFileOptions}
                                            selectedFileFilter={selectedQuestionFileFilter}
                                            onFileFilterChange={setSelectedQuestionFileFilter}
                                            onToggleQuestionPanel={() => setShowQuestionPanel((prev) => !prev)}
                                            onSendQuestion={handleSendQuestion}
                                            onJumpToQuestion={handleJumpToQuestion}
                                            onUpvoteQuestion={handleUpvoteQuestion}
                                            isLiveOwner={isLiveOwner}
                                            onMarkAsAnswered={handleMarkAsAnswered}
                                        />
                                    </Grid.Col>
                                )}
                            </Grid>
                        </div>
                    </Stack>
                </Paper>
            </div>
        </div>
    );
}