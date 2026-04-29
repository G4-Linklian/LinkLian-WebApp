import React from 'react';
import { Grid, Paper, Group, Text, ThemeIcon } from '@mantine/core';
import { TeacherAssets } from '@/utils/interface/dashboard.types';
import { IconFileDescription, IconBroadcast, IconAlignCenter } from '@tabler/icons-react';
import { AppColors } from '@/constants/colors';

interface TeacherAssetsProps {
    assets: TeacherAssets;
}

export default function AssetsOverview({ assets }: TeacherAssetsProps) {
    const primary = AppColors.primaryPalette;

    return (
        <Grid>
            <Grid.Col span={4}>
                <Paper withBorder p="lg" radius="lg" shadow="sm">
                    <Group justify="space-between">
                        <Text size="sm" color="dimmed" fw={700}>ไฟล์เอกสารทั้งหมด</Text>
                        <ThemeIcon
                            variant="light"
                            size={30}
                            radius="md"
                            styles={{ root: { backgroundColor: primary[200], color: primary[700] } }}
                        >
                            <IconFileDescription size={20} />
                        </ThemeIcon>
                    </Group>
                    <Group align="flex-end" gap="xs" mt={15}>
                        <Text size="xl" fw={700} lh={1}>{assets.total_file}</Text>
                        <Text size="sm" c={assets.file_this_month > 0 ? primary[600] : 'gray'}>
                            +{assets.file_this_month} เดือนนี้
                        </Text>
                    </Group>
                </Paper>
            </Grid.Col>

            <Grid.Col span={4}>
                <Paper withBorder p="lg" radius="lg" shadow="sm">
                    <Group justify="space-between">
                        <Text size="sm" color="dimmed" fw={700}>จำนวนไลฟ์ทั้งหมด</Text>
                        <ThemeIcon
                            variant="light"
                            size={30}
                            radius="md"
                            styles={{ root: { backgroundColor: primary[200], color: primary[700] } }}
                        >
                            <IconBroadcast size={20} />
                        </ThemeIcon>
                    </Group>
                    <Group align="flex-end" gap="xs" mt={15}>
                        <Text size="xl" fw={700} lh={1}>{assets.total_qa_live}</Text>
                        <Text size="sm" c={assets.qa_live_this_month > 0 ? primary[600] : 'gray'}>
                            +{assets.qa_live_this_month} เดือนนี้
                        </Text>
                    </Group>
                </Paper>
            </Grid.Col>

            <Grid.Col span={4}>
                <Paper withBorder p="lg" radius="lg" shadow="sm">
                    <Group justify="space-between">
                        <Text size="sm" color="dimmed" fw={700}>งานที่สั่งทั้งหมด</Text>
                        <ThemeIcon
                            variant="light"
                            size={30}
                            radius="md"
                            styles={{ root: { backgroundColor: primary[200], color: primary[700] } }}
                        >
                            <IconAlignCenter size={20} />
                        </ThemeIcon>
                    </Group>
                    <Group align="flex-end" gap="xs" mt={15}>
                        <Text size="xl" fw={700} lh={1}>{assets.total_assignment}</Text>
                        <Text size="sm" c={assets.assignment_this_month > 0 ? primary[600] : 'gray'}>
                            +{assets.assignment_this_month} เดือนนี้
                        </Text>
                    </Group>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}