import React from 'react';

interface CreatePostModalProps {
  children: React.ReactNode;
}

const CreatePostModal = ({ children }: CreatePostModalProps) => {
  return (
    <div id="crp-modal-overlay" className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-[1px] p-4 md:inset-x-0 md:bottom-0 md:top-[64px] md:p-56">
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-full w-full overflow-hidden bg-white md:h-[78vh] md:max-w-3xl md:rounded-2xl md:shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
