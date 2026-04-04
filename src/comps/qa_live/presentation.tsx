import React from "react";
import { Card, Group, Stack, Text, Button } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

interface PresentationPanelProps {
	chapterTitle: string;
	fileName: string;
	currentPage: number;
	totalPages: number;
}

export default function PresentationPanel({
	chapterTitle,
	fileName,
	currentPage,
	totalPages,
}: PresentationPanelProps) {
	return (
		<Card
			shadow="sm"
			padding="lg"
			radius="lg"
			bg="white"
			className="border border-gray-200"
			style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
		>
			<Group justify="space-between" mb="sm" wrap="nowrap">
				<Text fw={700} c="#2E6ED9" size="lg" lineClamp={2}>
					{chapterTitle}
				</Text>
				<Text c="dimmed" size="sm" lineClamp={1}>
					{fileName}
				</Text>
			</Group>

			<div
				className="rounded-2xl border border-gray-200 bg-gray-50"
				style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center", alignItems: "center" }}
			>
				<div
					style={{ width: 210, height: 360 }}
					className="rounded-2xl bg-linear-to-b from-cyan-700 to-blue-600 text-white shadow-lg"
				>
					<Stack align="center" justify="center" h="100%" px="md" gap={6}>
						<Text size="sm" ta="center" opacity={0.95}>
							Hands-on · Analyzing microbiome data
						</Text>
						<Text fw={700} size="34px" ta="center" style={{ lineHeight: 1.1 }}>
							Ch2 Quality Control
						</Text>
						<Text size="sm" ta="center" opacity={0.95}>
							Week 2 - Data Preprocessing
						</Text>
					</Stack>
				</div>
			</div>

			<Group justify="space-between" mt="md" wrap="nowrap">
				<Button variant="default" leftSection={<IconChevronLeft size={16} />}>
					ก่อนหน้า
				</Button>
				<Text fw={600} c="dimmed">
					หน้า {currentPage} / {totalPages}
				</Text>
				<Button variant="default" rightSection={<IconChevronRight size={16} />}>
					ถัดไป
				</Button>
			</Group>
		</Card>
	);
}
