import { Card, Avatar, Text, Group, Badge, Button, Stack, Divider, Tooltip, ActionIcon } from '@mantine/core';
import { IconPhone, IconMail, IconId, IconSchool, IconEdit, IconDots, IconUserPin } from '@tabler/icons-react';

function InstructorCard({ instructor, onEdit } : any) {

  const fullName = `${instructor.first_name} ${instructor.middle_name ? instructor.middle_name + ' ' : ''}${instructor.last_name}`;

  const getStatusColor = (status : any) => {
    switch (status) {
      case 'ครูสอนหลัก': return 'green';
      case 'อาจารย์สอนหลัก': return 'green';
      case 'ผู้ช่วยสอน': return 'blue';
      default: return 'blue';
    }
  };

  return (
    <Card shadow="sm" padding="xs" radius="lg" withBorder className="h-full flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
      
      <div className='pb-2'>
        <Group justify="space-between" mb="xs">
            <Badge color={getStatusColor(instructor.position)} variant="light">
                {instructor.position || 'Unknown'}
            </Badge>
            <ActionIcon variant="subtle" color="gray">
                <IconDots size={16} />
            </ActionIcon>
        </Group>

        <Group align="flex-start" wrap="nowrap">
          {/* Profile Image (Azure Blob) */}
          <Avatar 
            src={instructor.profile_pic}
            alt={fullName} 
            size={80} 
            radius={80} 
            color="orange"
            className="border-2 border-white shadow-sm"
          >
             {instructor.first_name?.[0]} 
          </Avatar>

          {/* Name & Code */}
          <div style={{ flex: 1 }}>
            <Text size="lg" fw={700} lineClamp={1} title={fullName}>
              {fullName}
            </Text>
            
            <Group gap={5} mt={4}>
                <IconId size={14} className="text-gray-500" />
                <Text size="sm" c="dimmed">
                 {instructor.email}
                </Text>
            </Group>

            {/* <Group gap={5} mt={4}>
                <IconUserPin size={14} className="text-gray-500" />
                <Text size="sm" c="dimmed">
                 {instructor.position || '-'}
                </Text>
            </Group> */}

             {/* {instructor.learning_area_id && (
                <Group gap={5} mt={2}>
                    <IconMail size={14} stroke={1.5} className="text-gray-500" />
                    <Text size="xs" c="dimmed">
                    {instructor.learning_area_name || '-'}
                    </Text>
                </Group>
             )} */}
          </div>
        </Group>
      </div>

    </Card>
  );
}

export default InstructorCard;