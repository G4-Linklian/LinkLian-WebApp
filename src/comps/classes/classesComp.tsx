import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { getUser, updateUser } from "@/utils/api/userData"

import { decodeToken } from "@/utils/authToken";

import { useNotification } from "@/comps/noti/notiComp"


// Function to generate default avatar if no profile image exists
function generateDefaultAvatar(letter: string) {
    const svg = `
  <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0EA5E9" />
        <stop offset="50%" stop-color="#2563EB" />
        <stop offset="100%" stop-color="#1E40AF" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#avatarGradient)" />
    <text 
      x="50%" 
      y="50%" 
      font-size="64" 
      fill="white" 
      dominant-baseline="middle" 
      text-anchor="middle" 
      font-family="Arial, sans-serif"
      font-weight="bold">
      ${letter}
    </text>
  </svg>
  `;

    // For client-side usage
    if (typeof window !== 'undefined') {
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    // Server-side fallback
    return '';
}

const ClassesPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });


    const { showNotification } = useNotification();


    const [isEditing, setIsEditing] = useState(false);

    // File upload state
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div> */}
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>User Profile</title>
                <meta name="description" content="Manage your user profile" />
            </Head>

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 md:p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>


                </div>
            </div>
        </>
    );
};

export default ClassesPage;