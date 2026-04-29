import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { decodeTeacherToken, removeTeacherToken } from "@/utils/authToken";
import { IconLogout } from "@tabler/icons-react";
import { Card, Avatar, Text, Stack, ActionIcon } from "@mantine/core";
import { IconPencil } from '@tabler/icons-react';
import { getUserProfile, updateProfile } from '@/utils/api/profile';
import { uploadFileStorage } from "@/utils/api/fileStorage";
import { UserProfileFields, TeachingScheduleFields } from "@/utils/interface/profile.types";

interface TeacherProfileCompsProps {
    onLogout?: () => void;
}

export default function TeacherProfileComps({ onLogout }: TeacherProfileCompsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfileFields | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = decodeTeacherToken();
                if (!token.user_id)
                    return;

                const res = await getUserProfile(token.user_id);
                if (res?.success) {
                    setProfile(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        console.log('Profile data:', profile);

        fetchProfile();
    }, []);

    const handleLogout = () => {
        removeTeacherToken();
        if (onLogout) {
            onLogout();
        } else {
            router.push("/teacherLogin");
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !profile) return;

        try {
            setIsUploading(true);

            const tempImageUrl = URL.createObjectURL(file);
            setProfile(prev => prev ? { ...prev, profile_pic: tempImageUrl } : null);

            const uploadRes = await uploadFileStorage(file, 'user', 'profile-upload');

            console.log("Upload response:", uploadRes);

            const uploadedImageUrl = uploadRes?.files?.[0]?.fileUrl;

            if (!uploadedImageUrl) {
                throw new Error("Failed to upload image");
            }

            console.log("Uploaded image URL:", uploadedImageUrl);

            // Update profile with new image URL
            const token = decodeTeacherToken();
            if (!token.user_id) return;

            const updateData = {
                code: profile.code,
                email: profile.email,
                first_name: profile.first_name,
                last_name: profile.last_name,
                phone: profile.phone || undefined,
                profile_pic: uploadedImageUrl,
            };

            const res = await updateProfile(token.user_id, updateData);

            if (res?.success && res?.data?.profile_pic) {
                setProfile(prev => prev ? { ...prev, profile_pic: res.data.profile_pic } : null);
            }

            console.log("Update profile response:", res);

        } catch (error) {
            console.error("Error uploading profile picture:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card shadow="sm" padding="lg" radius="lg" className="relative border border-gray-200" bg="white" mb="lg"
            style={{ height: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            id="profile-card"
        >
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div
                    className="relative inline-block"
                    style={{ position: 'relative', width: '120px', height: '120px', alignItems: 'center', display: 'flex' }}
                >
                    <Avatar
                        src={profile?.profile_pic}
                        size={120}
                        radius={100}
                        color="#DB763F"
                        className="border-2 border-white shadow-sm"
                        id="profile-pic"
                    >
                        {profile?.first_name?.[0]}
                    </Avatar>

                    <ActionIcon
                        variant="filled"
                        color="#DB763F"
                        size="md"
                        radius="100%"
                        className="border-2 border-white shadow-sm"
                        style={{ position: 'absolute', bottom: 1, right: 5, zIndex: 10 }}
                        onClick={handleAvatarClick}
                        loading={isUploading}
                        id="edit-profile-pic-button"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />

                        <IconPencil size={20} />
                    </ActionIcon>
                </div>

                <Stack gap="xs" className="flex-1" pt="sm">
                    <Text size="md" fw={500} id="user-code">
                        {profile?.code || ''}
                    </Text>
                    <Text size="xl" fw={700} id="user-name">
                        {profile?.first_name} {profile?.last_name}
                    </Text>
                    <Text size="md" color="dimmed" id="user-email">
                        {profile?.email}
                    </Text>
                    <Text size="md" color="red" onClick={handleLogout} className="cursor-pointer" id="logout-button">
                        <IconLogout size={16} className="inline mr-2" />
                        ออกจากระบบ
                    </Text>
                </Stack>
            </div>
        </Card>
    );
}
