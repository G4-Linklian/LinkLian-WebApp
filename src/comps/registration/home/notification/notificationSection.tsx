import React from 'react';

const NotificationSection = () => {
    return (
        <div className="notification-section mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">การแจ้งเตือน</h3>

            {/* TODO: เพิ่มรายการแจ้งเตือนที่นี่ */}
            <div id="notification-list" className="bg-white rounded-xl border-2 border-gray-100 p-6 min-h-[120px] flex items-center justify-center">
                <p className="text-gray-400 text-sm">ยังไม่มีการแจ้งเตือน</p>
            </div>
        </div>
    );
};

export default NotificationSection;
