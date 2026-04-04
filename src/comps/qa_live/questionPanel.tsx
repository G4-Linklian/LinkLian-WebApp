import React from "react";
import {
	ActionIcon,
	Avatar,
	Badge,
	Card,
	Group,
	NativeSelect,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from "@mantine/core";
import { IconLayoutSidebarRightCollapse, IconLayoutSidebarRightExpand, IconMessageCircle, IconSend2 } from "@tabler/icons-react";

interface CommentItem {
	id: number;
	name: string;
	time: string;
	message: string;
	color: string;
}

interface QuestionPanelProps {
	fileName: string;
	comments: CommentItem[];
	showQuestionPanel: boolean;
	onToggleQuestionPanel: () => void;
}

export default function QuestionPanel({
	fileName,
	comments,
	showQuestionPanel,
	onToggleQuestionPanel,
}: QuestionPanelProps) {
	return (
		<Card
			shadow="sm"
			padding="lg"
			radius="lg"
			bg="white"
			className="border border-gray-200"
			style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
		>
			<Group justify="space-between" mb="md" wrap="nowrap">
				<Group gap={6}>
					<IconMessageCircle size={18} color="#374151" />
					<Text fw={700} size="lg">
						คำถามและความคิดเห็น
					</Text>
				</Group>
				<Group gap="xs" wrap="nowrap">
					<Badge variant="light" color="orange" radius="xl" size="lg">
						{comments.length} ข้อความ
					</Badge>
					<Tooltip label={showQuestionPanel ? "ซ่อนคอมเมนต์" : "แสดงคอมเมนต์"}>
						<ActionIcon
							variant="default"
							size="lg"
							onClick={onToggleQuestionPanel}
						>
							{showQuestionPanel ? <IconLayoutSidebarRightCollapse size={18} /> : <IconLayoutSidebarRightExpand size={18} />}
						</ActionIcon>
					</Tooltip>
				</Group>
			</Group>

			<Stack gap={8} mb="md">
				<Text c="dimmed" size="sm">
					แสดงคำถามและความคิดเห็นต่อ:
				</Text>
				<NativeSelect
					data={[`ไฟล์ที่เปิดอยู่ (${fileName})`, "บทเรียนทั้งหมด"]}
					defaultValue={`ไฟล์ที่เปิดอยู่ (${fileName})`}
				/>
			</Stack>

			<Stack gap="sm" style={{ flex: 1, overflowY: "auto" }}>
				{comments.map((comment) => (
					<Group key={comment.id} align="flex-start" wrap="nowrap">
						<Avatar color={comment.color} radius="xl">
							{comment.name.charAt(0)}
						</Avatar>
						<div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2" style={{ width: "100%" }}>
							<Group gap="xs">
								<Text fw={600} size="sm">
									{comment.name}
								</Text>
								<Text c="dimmed" size="xs">
									{comment.time}
								</Text>
							</Group>
							<Text size="sm" mt={2}>
								{comment.message}
							</Text>
						</div>
					</Group>
				))}
			</Stack>

			<Group mt="md" wrap="nowrap" align="center">
				<TextInput
					placeholder="พิมพ์ข้อความ..."
					style={{ flex: 1 }}
					radius="xl"
				/>
				<ActionIcon size={42} radius="xl" variant="filled" color="blue">
					<IconSend2 size={18} />
				</ActionIcon>
			</Group>
		</Card>
	);
}
