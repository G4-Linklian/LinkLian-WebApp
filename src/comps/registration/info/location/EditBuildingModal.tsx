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
import { getRoomLocation } from "@/utils/api/roomLocation";
import { deleteBuilding } from "@/utils/api/building";
import { ConfirmModalEx } from '@/comps/public/ConfirmModal';
import { useNotification } from '@/comps/noti/notiComp';

interface EditBuildingModalProps {
  building: buildingFields | null;
  opened: boolean;
  close: () => void;
  onSubmit?: (values: buildingFields) => void;
  onDelete?: (building_id: number) => void;
}

export default function EditBuildingModal({
  building,
  opened,
  close,
  onSubmit,
  onDelete,
}: EditBuildingModalProps) {
  if (!building) return null;

  const { showNotification } = useNotification();
  const [confirmDeleteOpened, setConfirmDeleteOpened] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string>("");
  const [roomCount, setRoomCount] = useState<number>(0);
  const [relatedRooms, setRelatedRooms] = useState<buildingFields[]>([]);

  const form = useForm<buildingFields>({
    initialValues: {
      building_id: undefined,
      building_name: "",
      building_no: "",
      remark: "",
    },
  });

  useEffect(() => {
    if (!building) return;

    form.setValues({
      building_name: building.building_name ?? "",
      building_no: building.building_no ?? "",
      remark: building.remark ?? "",
      building_id: building.building_id,
    });
  }, [building]);

  const handleSubmit = (values: buildingFields) => {
    onSubmit?.(values);
    close();
  };

  const handleDelete = async () => {
    if (!building?.building_id) return;

    try {
      // เช็คว่ามี room location ที่ใช้ building นี้หรือไม่
      const result = await getRoomLocation({ building_id: Number(building.building_id) });

      if (result.success && result.data) {
        const rooms = result.data || [];
        const count = rooms.length;
        setRoomCount(count);
        setRelatedRooms(rooms);

        if (count > 0) {
          setDeleteWarning(`อาคารนี้มี ${count} ห้องที่เกี่ยวข้อง กรุณาลบข้อมูลที่เกี่ยวข้องก่อน`);
        } else {
          setDeleteWarning("");
        }
      }

      setConfirmDeleteOpened(true);
    } catch (error) {
      console.error("Error checking rooms:", error);
      showNotification(
        'เกิดข้อผิดพลาด',
        'ไม่สามารถตรวจสอบข้อมูลได้',
        'error',
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!building?.building_id) return;

    try {
      const result = await deleteBuilding(building.building_id);

      if (result.success) {
        showNotification(
          'ลบอาคารสำเร็จ',
          '',
          'success',
        );
        onDelete?.(building.building_id);
        setConfirmDeleteOpened(false);
        close();
      } else {
        showNotification(
          'ลบอาคารไม่สำเร็จ',
          result.message || 'เกิดข้อผิดพลาดในการลบข้อมูล',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting building:', error);
      showNotification(
        'ลบอาคารไม่สำเร็จ',
        'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        'error',
      );
    }
  };

  return (
    <>
      <Modal
        id="edit-building-modal"
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius={16}
      >
        <h1 className="color-black font-bold text-2xl mb-4 text-center">จัดการอาคาร</h1>
        <form onSubmit={form.onSubmit(handleSubmit)} className="gap-2 flex flex-col" id="edit-building-form">
          <TextInput
            id="input-building-name"
            label="ชื่ออาคาร"
            placeholder="เช่น อาคารเรียนรวม"
            {...form.getInputProps("building_name")}
            required
            mb="sm"
            radius={8}
          />

          <TextInput
            id="input-building-no"  
            label="หมายเลขอาคาร"
            placeholder="เช่น 101"
            {...form.getInputProps("building_no")}
            required
            mb="sm"
            radius={8}
          />

          <TextInput
            id="input-building-remark"
            label="หมายเหตุ"
            placeholder="เช่น อาคารใหม่"
            {...form.getInputProps("remark")}
            mb="sm"
            radius={8}
          />

          <Group justify="flex-end" className="mt-4">
            <Button
              id="delete-building-button"
              color="red"
              variant="outline"
              radius={8}
              onClick={handleDelete}
              type="button"
            >
              ลบ
            </Button>

            <Button type="submit" radius={8} id="save-building-button">
              บันทึก
            </Button>
          </Group>
        </form>
      </Modal>

      <ConfirmModalEx
        opened={confirmDeleteOpened}
        onClose={() => setConfirmDeleteOpened(false)}
        title="ยืนยันการลบอาคาร"
        size="lg"
        description={
          <>
            <div className="text-center mb-4">
              คุณต้องการลบอาคาร <strong>{building?.building_name}</strong> ใช่หรือไม่?
            </div>

            {roomCount > 0 && (
              <div className="mt-4 text-left">
                <Text size="sm" fw={600} mb="xs" c="red">
                  พบข้อมูลที่เกี่ยวข้อง:
                </Text>
                <div className="max-h-48 overflow-y-auto rounded-lg p-2 px-4 bg-gray-50">
                  <Text size="sm" fw={600} mb="xs" c="red">
                    ห้องเรียน ({roomCount} ห้อง):
                  </Text>
                  {relatedRooms.slice(0, 10).map((room, index) => (
                    <div key={room.room_location_id || index} className="text-sm py-2">
                      <div className="ml-4">
                        <strong>ห้อง:</strong> {room.room_number || '-'} {room.room_remark ? `(${room.room_remark})` : ''}
                      </div>
                    </div>
                  ))}
                  {relatedRooms.length > 10 && (
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      ... และอีก {relatedRooms.length - 10} ห้อง
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
        disableConfirm={roomCount > 0}
      />
    </>
  );
}
