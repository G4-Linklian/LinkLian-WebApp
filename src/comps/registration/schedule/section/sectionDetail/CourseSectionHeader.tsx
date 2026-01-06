import React, { useState } from 'react';
import {
  IconClock,
  IconUsers,
  IconBook,
  IconCalendar,
  IconMapPin,
  IconSchool,
  IconEdit
} from '@tabler/icons-react';
import { Button } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { dayOfWeekFormatter, timeFormatter, normalizeTime } from '@/config/formatters';
import { sectionFields } from '@/utils/interface/section.types';
import EditSectionModal from '@/comps/registration/schedule/section/EditSectionModal';
import SectionDetailEditModal from '@/comps/registration/schedule/section/sectionDetail/EditSectionDetailModal';
import { getSectionMaster, updateSectionSchedule, createSectionSchedule, createSchedule } from '@/utils/api/section';
import { useNotification } from '@/comps/noti/notiComp';
import AddSectionDetailModal from '@/comps/registration/schedule/section/sectionDetail/AddSectionDetailModal';

const CourseSectionHeader = ({ sectionData, scheduleData, token, semesterOptions, sectionId }: any) => {
  const course = sectionData?.[0] || {};
  const [openedSectionEditModal, { open: openSectionEditModal, close: closeSectionEditModal }] = useDisclosure(false);
  const [openedSectionDetailEditModal, { open: openSectionDetailEditModal, close: closeSectionDetailEditModal }] = useDisclosure(false);
  const [selectedSection, setSelectedSection] =
    useState<sectionFields | null>(null);
  const [openedAddSchedule, { open: openAddSchedule, close: closeAddSchedule }] = useDisclosure(false);

  const { showNotification } = useNotification();

  const openSectionEditModals = (section: sectionFields) => {
    setSelectedSection(section);
    openSectionEditModal();
  };

  const openSectionDetailEditModals = (section: sectionFields) => {
    setSelectedSection(section);
    openSectionDetailEditModal();
  };



  const updateSectionData = async (values: sectionFields) => {
    // if (!instId) return;

    try {

      const payload = {
        ...values,
        day_of_week: Number(values.day_of_week),
        start_time: normalizeTime(values.start_time),
        end_time: normalizeTime(values.end_time),
      };

      console.log("Edit subject payload:", payload);

      const res = await updateSectionSchedule(payload);

      if (res.success) {
        showNotification("แก้ไข Section สำเร็จ!", "", "success");
      } else {
        showNotification("แก้ไข Section ล้มเหลว!", res.message, "error");
      }
    } catch (error) {
      console.error("Update section failed:", error);
      showNotification("แก้ไข Section ล้มเหลว!", "An error occurred while updating the section.", "error");
    }
  };

  const createSectionScheduleData = async (values: sectionFields) => {
    // if (!instId) return;

    try {

      const payload = {
        day_of_week: Number(values.day_of_week),
        start_time: normalizeTime(values.start_time),
        end_time: normalizeTime(values.end_time),
        section_id: Number(sectionId),
        room_location_id: Number(values.room_location_id)
      };

      console.log("Create section schedule payload:", payload);

      console.log("Edit subject payload:", payload);

      const res = await createSchedule(payload);

      if (res.success) {
        showNotification("แก้ไข Section สำเร็จ!", "", "success");
      } else {
        showNotification("แก้ไข Section ล้มเหลว!", res.message, "error");
      }
    } catch (error) {
      console.error("Update section failed:", error);
      showNotification("แก้ไข Section ล้มเหลว!", "An error occurred while updating the section.", "error");
    }
  };


  const openAddScheduleModal = () => {
    openAddSchedule();
  };

  const StatItem = ({ icon: Icon, label, value, colorClass, bgClass }: any) => (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm transition-transform hover:-translate-y-1">
      <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[260px]">

        {/* Left Side: Course Info & Stats (กินพื้นที่ 8/12 ส่วน) */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between relative">

          <div className="z-10">
            {/* Header Tags */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 text-xs font-bold tracking-wide text-blue-400 uppercase bg-blue-50 rounded-full">
                  ภาคเรียนที่ {course.semester}
                </span>
                <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full border border-gray-200">
                  {course.subject_code}
                </span>
                <span className="px-3 py-1 text-xs font-medium text-purple-400 bg-purple-50 rounded-full">
                  กลุ่มการเรียนรู้ : {course.learning_area_name}
                </span>
              </div>
              <div className="ml-auto">
                <IconEdit className="w-6 h-6 text-gray-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSectionEditModals(course);
                  }}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>

            {/* Title Section */}
            <div className="mb-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug mb-1">
                {course.name_th}
              </h1>
              <p className="text-lg text-gray-500 font-normal">
                {course.name_en}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 text-gray-600 font-medium">
                <IconSchool className="w-5 h-5 text-gray-400" />
                <span>{course.section_name}</span>
              </div>
            </div>
          </div>

          {/* Bottom Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatItem
              icon={IconBook}
              label="หน่วยกิต"
              value={course.credit}
              bgClass="bg-[#FFF7EE]"
              colorClass="text-[#FF9C57]"
            />
            <StatItem
              icon={IconClock}
              label="ชั่วโมง/สัปดาห์"
              value={course.hour_per_week}
              bgClass="bg-[#FFF7EE]"
              colorClass="text-[#FF9C57]"
            />
            <StatItem
              icon={IconUsers}
              label="จำนวนนักเรียน"
              value={course.student_count}
              bgClass="bg-[#FFF7EE]"
              colorClass="text-[#FF9C57]"
            />
          </div>
        </div>

        {/* Right Side: Schedule (กินพื้นที่ 4/12 ส่วน) */}
        <div className="lg:col-span-4 bg-gray-50/80 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-white rounded-md shadow-sm">
                <IconCalendar className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">ตารางเวลาเรียน</h3>
            </div>
            <Button
              size="xs"
              radius="md"
              onClick={() => {
                openAddScheduleModal();
              }}
            >
              เพิ่มเวลาเรียน
            </Button>
          </div>

          <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
            {scheduleData && scheduleData.length > 0 ? (
              scheduleData.map((item: any, index: number) => (
                <div
                  key={index}
                  className="group relative flex flex-col p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-200"
                >
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full"></div>
                  <div className="pl-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-600">
                        {dayOfWeekFormatter(item.day_of_week)}
                      </span>
                      <IconEdit className="w-6 h-6 text-gray-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSectionDetailEditModals(item);
                        }}
                        style={{ cursor: "pointer" }}
                        size={"xs"}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-gray-800 font-bold text-base mb-1">
                      {timeFormatter(String(item.start_time))} - {timeFormatter(String(item.end_time))}
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <IconMapPin className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      <span className="truncate">
                        {item.building_name} ห้อง{" "}
                        {item.room_format === "by_building_no"
                          ? `${item.building_no}${item.floor}${item.room_number}`
                          : `${item.building_name}${item.floor}${item.room_number}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <IconCalendar className="w-10 h-10 mb-2 opacity-20" />
                <span className="text-sm">ไม่มีตารางเรียน</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditSectionModal
        section={selectedSection}
        opened={openedSectionEditModal}
        close={closeSectionEditModal}
        onSubmit={async (values) => {
          await updateSectionData(values);
          closeSectionEditModal();
        }}
        token={token}
        semesterData={semesterOptions}
      />

      <SectionDetailEditModal
        section={selectedSection}
        opened={openedSectionDetailEditModal}
        close={closeSectionDetailEditModal}
        onSubmit={async (values) => {
          await updateSectionData(values);
          closeSectionDetailEditModal();
        }}
        token={token}
        semesterData={semesterOptions}
      />


      <AddSectionDetailModal
        opened={openedAddSchedule}
        close={closeAddSchedule}
        onSubmit={async (values) => {
          await createSectionScheduleData(values);
          closeAddSchedule();
        }}
        token={token}
        semesterData={semesterOptions}
      />

    </div>
  );
};

export default CourseSectionHeader;