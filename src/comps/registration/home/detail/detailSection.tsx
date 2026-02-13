import React, { useEffect, useState } from 'react';
import { IconSchool, IconUsers } from '@tabler/icons-react';
import { Avatar } from '@mantine/core';
import { getInstitutionDetailById } from '@/utils/api/institution';
import { decodeRegistrationToken } from '@/utils/authToken';
import { institutionFields } from '@/utils/interface/institution.types';
import { formatDate } from '@/config/formatters';

const DetailSection = () => {
    const [institution, setInstitution] = useState<institutionFields | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                const token = decodeRegistrationToken();
                if (!token?.institution?.inst_id) return;

                const res = await getInstitutionDetailById(token.institution.inst_id);
                if (res?.success) {
                    setInstitution(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch institution detail:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstitution();
    }, []);

    const today = formatDate(new Date());

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-gray-400">กำลังโหลดข้อมูล...</div>
            </div>
        );
    }

    if (!institution) {
        return null;
    }

    return (
        <div className="detail-section">
            {/* Header row: title + date/semester */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold text-gray-800">ยินดีต้อนรับสู่ระบบทะเบียน</h2>
                <p className="text-gray-500 text-md">
                    {today} | ปีการศึกษา {institution.open_semester || '-'}
                </p>
            </div>

            {/* Cards row */}
            <div className="grid grid-cols-4 gap-4">
                {/* Institution info card - 50% */}
                <div className="col-span-2 flex items-center gap-6 px-6 py-6 bg-white rounded-xl border-2 border-[#FFE3BB] min-h-[120px]">
                    <Avatar
                        src={institution.logo_url}
                        alt={institution.inst_name_th || 'logo'}
                        size={70}
                        radius={70}
                        color="orange"
                        p={2}
                        className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 p-1 relative"
                    >
                        {institution.inst_name_th?.[0]}
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-2xl font-bold text-[#FF9C57] truncate">
                            {institution.inst_name_th || '-'}
                        </p>
                        <p className="text-base text-gray-500 leading-relaxed mt-1">
                            {institution.address || '-'}
                        </p>
                    </div>
                </div>

                {/* Student count card - 25% */}
                <div className="col-span-1 flex items-center gap-4 px-6 py-6 bg-white rounded-xl border-2 border-[#FFE3BB] min-h-[120px]">
                    <div className="w-16 h-16 rounded-xl bg-[#FFF7EE] flex items-center justify-center flex-shrink-0">
                        <IconSchool className="w-8 h-8 text-[#FF9C57]" />
                    </div>
                    <div>
                        <p className="text-base text-gray-500">จำนวนนักเรียน</p>
                        <p className="text-4xl font-bold text-gray-800">
                            {Number(institution.student_count || 0).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Staff count card - 25% */}
                <div className="col-span-1 flex items-center gap-4 px-6 py-6 bg-white rounded-xl border-2 border-[#FFE3BB] min-h-[120px]">
                    <div className="w-16 h-16 rounded-xl bg-[#FFF7EE] flex items-center justify-center flex-shrink-0">
                        <IconUsers className="w-8 h-8 text-[#FF9C57]" />
                    </div>
                    <div>
                        <p className="text-base text-gray-500">จำนวนบุคคลากร</p>
                        <p className="text-4xl font-bold text-gray-800">
                            {Number(institution.teacher_count || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailSection;
