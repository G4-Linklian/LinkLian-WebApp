// src/public/modal.tsx
import React, {useEffect, useState} from 'react';

import {
    IconSquareRoundedXFilled
} from "@tabler/icons-react";

import { useMediaQuery } from "@/comps/public/useMediaQuery"
// import { getLocation } from "@/utils/api/location"
// import { getActivity } from "@/utils/api/activity"

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    locationID? : number;
}


const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, locationID, children }) => {
    if (!isOpen) return null;

    const isLargerThanSm = useMediaQuery("(min-width: 768px)");

    const renderLargeModal = () => (
        <div className="fixed inset-0 bg-gray-400/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-xl w-full p-6 relative max-h-[80%] h-full">
            {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
            <button
              className="cursor-pointer absolute top-1 right-2 text-gray-800 text-xl p-1 px-2 rounded-full"
              onClick={onClose}
            >
              {/* <IconSquareRoundedXFilled width={20} height={20} /> */}
              x
            </button>
            <div className="flex justify-between text-black mt-5 h-[100%]">{children}</div>
          </div>
        </div>
      );
    
      // ✅ Modal for smaller screens
      const renderSmallModal = () => (
        <div className="fixed inset-0 bg-gray-400/70 flex items-end justify-center z-50">
          <div className="bg-white shadow-xl w-full p-4 relative max-h-[70%] h-full px-7" style={{borderRadius : "30px 30px 0px 0px"}}>
            {title && <h2 className="text-lg font-medium mb-2">{title}</h2>}
            {/* <button
              className="cursor-pointer absolute bottom-5 right-[46%] text-white hover:text-white text-xl p-1 bg-[#1E9900] hover:bg-[#1E9100] rounded-full"
              onClick={onClose}
            >
              <IconSquareRoundedXFilled width={35} height={35} />
            </button> */}
            <button
              className="cursor-pointer absolute top-5 right-5 text-gray-800 text-3xl p-1 px-2 rounded-full"
              onClick={onClose}
            >
              {/* <IconSquareRoundedXFilled width={20} height={20} /> */}
              x
            </button>
            <div className="text-black flex h-full w-full">{children}</div>
          </div>
        </div>
      );
    
      return isLargerThanSm ? renderLargeModal() : renderSmallModal();
};

export default Modal;
