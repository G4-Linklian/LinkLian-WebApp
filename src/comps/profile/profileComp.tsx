import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { decodeTeacherToken, removeTeacherToken } from "@/utils/authToken";
import { IconLogout } from "@tabler/icons-react";
import { Button, Card, Grid, Paper, Avatar, Text, Group, Stack, Badge, ActionIcon, ThemeIcon } from "@mantine/core";
import { IconEdit, IconChevronRight, IconCreditCard } from '@tabler/icons-react';
import { getUserProfile, getTeachingSchedule, updateProfile } from '@/utils/api/profile';
import { UserProfileFields, TeachingScheduleFields } from "@/utils/interface/profile.types";
import TeacherProfileComps from "./teacherProfile/teacherProfileComps";
import TeachingSchedule from "./teachingSchedule/teachingSchedule";
import Dashboard from "./dashboard/dashboardComps";

interface ProfileCompProps {
  onLogout?: () => void;
}

export default function ProfileComp({ onLogout }: ProfileCompProps) {
  const router = useRouter();

  useEffect(() => {
    const token = decodeTeacherToken();
    if (!token) {
      router.push("/teacherLogin");
    }
  }, [router]);

  return (
    <div className="w-full bg-gray-50 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="mx-auto pt-12" style={{ width: '80%', height: '100%' }}>
        <Grid gutter="lg" style={{ height: '100%' }} id="profile-grid">
          {/* Left */}
          <Grid.Col span={8} style={{ height: '100%' }}>
            <Stack gap="lg" style={{ height: '100%' }}>

              <TeacherProfileComps />
              <Dashboard />

            </Stack>
          </Grid.Col>

          {/* Right */}
          <Grid.Col span={4} style={{ height: '100%' }}>

            <TeachingSchedule />
            
          </Grid.Col>
        </Grid>
      </div>
    </div>
  );
}
