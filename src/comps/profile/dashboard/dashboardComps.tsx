import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { decodeTeacherToken, removeTeacherToken } from "@/utils/authToken";
import { Button, Card, Grid, Paper, Avatar, Text, Group, Stack, Badge, ActionIcon, ThemeIcon } from "@mantine/core";

export default function Dashboard() {
    return (
        <Card shadow="sm" padding="xl" radius="lg" className="border border-gray-200" bg="white" id="dashboard-card">
            <Text size="xl" fw={700} mb="lg" className="text-gray-800" style={{ flexShrink: 0 }}>แดชบอร์ด</Text>
            
            <Text color="dimmed"> sprint 4</Text>
        </Card>
    );
}