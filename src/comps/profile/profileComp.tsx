import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { decodeTeacherToken, removeTeacherToken } from "@/utils/authToken";
import { IconLogout } from "@tabler/icons-react";
import { Button } from "@mantine/core";

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

  const handleLogout = () => {
    removeTeacherToken();
    if (onLogout) {
      onLogout();
    } else {
      router.push("/teacherLogin");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen p-5 bg-gray-100">
        <Button
          leftSection={<IconLogout size={20} stroke={2} />}
          fullWidth
          radius="md"
          size="md"
          color="red"
          onClick={handleLogout}
        >
          ออกไป
        </Button>
      </div>
  );
}
