// src/public/modal.tsx
import React, { useEffect, useState } from 'react';

import {
    IconSquareRoundedXFilled
} from "@tabler/icons-react";

import { useMediaQuery } from "@/comps/public/useMediaQuery"
// import { getLocation } from "@/utils/api/location"
// import { getActivity } from "@/utils/api/activity"

interface ModalProps {
    title?: string;
    children?: React.ReactNode;
    locationID?: number;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
}


const ConfirmModal: React.FC<ModalProps> = ({ title, message, onConfirm, onCancel }) => {

    const isLargerThanSm = useMediaQuery("(min-width: 768px)");

    const renderLargeModal = () => (
        <div className="fixed inset-0 bg-gray-400/70 flex items-center justify-center z-50 text-black">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
                {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
                {message && <p className="text-gray-700 mb-6">{message}</p>}

                <div className="flex justify-end gap-4">
                    <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                        onClick={onCancel}
                    >
                        ยกเลิก
                    </button>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                        onClick={onConfirm}
                    >
                        ยืนยัน
                    </button>
                </div>

                <button
                    className="cursor-pointer absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl p-1"
                    onClick={onCancel}
                >
                    ×
                </button>
            </div>
        </div>
    );

    // ✅ Modal for smaller screens
    const renderSmallModal = () => (
        <div className="fixed inset-0 bg-gray-400/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[80%] p-6 relative flex flex-col items-center">
                {title && <h2 className="text-xl font-semibold mb-4 text-black">{title}</h2>}
                {message && <p className="text-gray-700 mb-6">{message}</p>}

                <div className="flex justify-end gap-4">
                    <button
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                        onClick={onCancel}
                    >
                        ยกเลิก
                    </button>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                        onClick={onConfirm}
                    >
                        ยืนยัน
                    </button>
                </div>

                <button
                    className="cursor-pointer absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl p-1"
                    onClick={onCancel}
                >
                    ×
                </button>
            </div>
        </div>
    );

    return isLargerThanSm ? renderLargeModal() : renderSmallModal();
};

export default ConfirmModal;
