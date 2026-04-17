import React from 'react';
import { useRouter } from 'next/router';
import { Card, Stack, Paper, Group, Text, Button } from '@mantine/core';
import { TeacherTopBookmarkedPost } from '@/utils/interface/dashboard.types';
import { AppColors } from '@/constants/colors';

interface Props {
    posts: TeacherTopBookmarkedPost[];
}

export default function TopBookmarks({ posts }: Props) {
    const primary = AppColors.primaryPalette;
    const router = useRouter();

    const handleNavigate = (sectionId: number, subjectName: string, className: string, postId: number) => {
        router.push({
            pathname: '/classes/classDetail',
            query: {
                sectionId: sectionId,
                subjectName: subjectName, 
                className: className,
                openPostId: postId
            },
        });
    };

    return (
        <Card shadow="sm" radius="lg" withBorder p="lg" h="100%">
            <Text size="lg" fw={700} mb="md">โพสต์ยอดนิยม</Text>

            <Stack gap="sm">
                {posts && posts.length > 0 ? (
                    posts.map((post, index) => (
                        <Paper key={post.post_content_id} p="lg" radius="md" withBorder >
                            <Group wrap="nowrap" align="center">
                                <Text fw={900} c={primary[600]} size="xl">
                                    #{index + 1}
                                </Text>

                                <div style={{ flex: 1 }}>
                                    <Text size="sm" fw={600} lineClamp={2}>
                                        {post.title}
                                    </Text>

                                    <Group gap="xs" mt={4}>
                                        <Text size="sm" c={primary[600]}>{post.bookmark_count} บุ๊กมาร์ก</Text>
                                    </Group>

                                    {post.section_instances && post.section_instances.length > 0 && (
                                        <Group gap="xs" mt="md">
                                            {post.section_instances.map((instance) => (
                                                <Button
                                                    key={`${instance.post_id}-${instance.section_id}`}
                                                    variant="light"
                                                    color="gray"
                                                    radius="lg"
                                                    size="compact-xs"
                                                    className="cursor-pointer"
                                                    style={{ textTransform: 'none', fontWeight: 500 }}
                                                    onClick={() => handleNavigate(instance.section_id, instance.subject_name, instance.section_name, instance.post_id)}
                                                >
                                                    {instance.subject_name} - {instance.section_name}
                                                </Button>
                                            ))}
                                        </Group>
                                    )}
                                </div>
                            </Group>
                        </Paper>
                    ))
                ) : (
                    <Text c="dimmed" ta="center" py="xl">
                        ยังไม่มีโพสต์ที่ถูกบันทึกในเดือนนี้
                    </Text>
                )}
            </Stack>
        </Card>
    );
}