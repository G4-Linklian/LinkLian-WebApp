import {
  Modal,
  Button,
  Group,
  TextInput,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { buildingFields } from "@/utils/interface/building.types";
import { useEffect, useState } from "react";
import { getSchedule } from "@/utils/api/section";
import { deleteRoomLocation } from "@/utils/api/roomLocation";
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';
import { SectionSchedulePayload } from "@/utils/interface/section.types";

interface EditRoomLocationModalProps {
  roomLocation: buildingFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: buildingFields) => void;
  onDelete?: (room_location_id: number) => void;
}

export default function EditRoomLocationModal({
  roomLocation,
  opened,
  close,
  onSubmit,
  onDelete,
}: EditRoomLocationModalProps) {
  if (!roomLocation) return null;

  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string>("");
  const [scheduleCount, setScheduleCount] = useState<number>(0);
  const [relatedSchedules, setRelatedSchedules] = useState<SectionSchedulePayload[]>([]);

  const form = useForm<buildingFields>({
    initialValues: {
      floor: "",
      room_number: "",
      room_remark: "",
    },
  });

  useEffect(() => {
    if (!roomLocation) return;

    form.setValues({
      floor: roomLocation.floor ?? "",
      room_number: roomLocation.room_number ?? "",
      room_remark: roomLocation.room_remark ?? "",
    });
  }, [roomLocation]);

  const handleSubmit = (values: buildingFields) => {
    onSubmit?.(values);
    close();
  };

  const handleDelete = async () => {
    if (!roomLocation?.room_location_id) return;

    try {
      // เช็คว่ามี schedule ที่ใช้ห้องนี้หรือไม่
      const result = await getSchedule({ room_location_id: Number(roomLocation.room_location_id) });

      if (result.success && result.data) {
        const schedules = result.data || [];
        const count = schedules.length;
        setScheduleCount(count);
        setRelatedSchedules(schedules);

        if (count > 0) {
          setDeleteWarning(`ห้องนี้มี ${count} ตารางเรียนที่เกี่ยวข้อง กรุณาลบข้อมูลที่เกี่ยวข้องก่อน`);
        } else {
          setDeleteWarning("");
        }
      }

      setConfirmDeleteOpened(true);
    } catch (error) {
      console.error("Error checking schedules:", error);
      showNotification(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถตรวจสอบข้อมูลได้',
        'error',
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!roomLocation?.room_location_id) return;

    try {
      const result = await deleteRoomLocation(roomLocation.room_location_id);

      if (result.success) {
        showNotification(
          'ลบห้องเรียนสำเร็จ',
          '',
          'success',
        );
        onDelete?.(roomLocation.room_location_id);
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบห้องเรียนไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting room location:', error);
      showNotification(
        'ลบห้องเรียนไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  return (
    <>
      <Modal
        id="edit-room-location-modal"
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius={16}
      >
        <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการห้องเรียน</h1>
        <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="edit-room-location-form">
          <TextInput
            id="input-floor"
            label="ชั้น"
            placeholder="เช่น 1"
            {...form.getInputProps("floor")}
            required
            mb="sm"
            radius={8}
          />

          <TextInput
            id="input-room-number"
            label="หมายเลขห้อง"
            placeholder="เช่น 01, 02, 11"
            {...form.getInputProps("room_number")}
            required
            mb="sm"
            radius={8}
          />

          <TextInput
            id="input-room-remark"
            label="หมายเหตุ"
            placeholder="เช่น ห้องปฏิบัติการคอมพิวเตอร์"
            {...form.getInputProps("room_remark")}
            mb="sm"
            radius={8}
          />

          <Group justify="flex-end" className="mt-4">
            <Button
              id="delete-button"
              color="red"
              variant="outline"
              radius={8}
              onClick={handleDelete}
              type="button"
            >
              ลบ
            </Button>

            <Button type="submit" radius={8} id="save-button">
              บันทึก
            </Button>
          </Group>
        </form>
      </Modal>

      <ConfirmModalEx
        opened={confirmDeleteOpened}
        onClose={() => setConfirmDeleteOpened(false)}
        title="ยืนยันการลบห้องเรียน"
        size="lg"
        description={
          <>
            <div className="text-center mb-4">
              คุณต้องการลบห้อง <strong>{roomLocation?.room_number}</strong> ใช่หรือไม่?
            </div>

            {scheduleCount > 0 && (
              <div className="mt-4 text-left">
                <Text size="sm" fw={600} mb="xs" c="red">
                  พบตารางเรียนที่เกี่ยวข้อง ({scheduleCount} รายการ):
                </Text>
                <div className="max-h-48 overflow-y-auto rounded-lg p-2 px-4 bg-gray-50">
                  <Text size="sm" fw={600} mb="xs" c="red">
                    กลุ่มเรียน ({scheduleCount} รายการ):
                  </Text>
                  {relatedSchedules.slice(0, 10).map((schedule, index) => (
                    <div key={schedule.schedule_id || index} className="text-sm py-2">
                      <div className="ml-4">
                        <strong>กลุ่มเรียน:</strong> {schedule.section_name} <strong>วัน:</strong> {schedule.day_of_week ? ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'][schedule.day_of_week] : '-'}
                      </div>
                      <div className="text-gray-600 text-xs ml-4">
                        เวลา: {schedule.start_time} - {schedule.end_time}
                      </div>
                    </div>
                  ))}
                  {relatedSchedules.length > 10 && (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      ... และอีก {relatedSchedules.length - 10} รายการ
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        }
        warningText={deleteWarning}
        handleConfirm={handleConfirmDelete}
        color="red"
        disableConfirm={scheduleCount > 0}
      />
    </>
  );
}
