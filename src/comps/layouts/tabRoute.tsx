import {
    IconBell,
    IconSchool,
    IconUsers,
    IconMessageDots,
    IconUser,
    IconHome,
    IconDatabaseCog,
    IconBook2,
    IconFileAnalytics,
    IconCalendarUser,
    IconUsersGroup
} from "@tabler/icons-react";

export const tabRoutes = {
    tab1: "/assignment",
    tab2: "/classes",
    // tab3: "/community",
    tab3: "/profile",
};

export const data = [
    {
        label: "แจ้งเตือน",
        route: "/notification",
        icon: <IconBell size={18} stroke={1.8} />,
    },
    {
        label: "ห้องเรียน",
        route: "/classes",
        icon: <IconSchool size={18} stroke={1.8} />,
    },
    // {
    //   label: "ชุมชน",
    //   route: "/community",
    //   icon: <IconUsers size={18} stroke={1.8} />,
    // },
    {
        label: "ข้อความ",
        route: "/messages",
        icon: <IconMessageDots size={18} stroke={1.8} />,
    },
    {
        label: "โปรไฟล์",
        route: "/profile",
        icon: <IconUser size={18} stroke={1.8} />,
    },
];


export const tabRoutesRegistration = {
    tab1: "/registration/home",
    tab2: "/registration/classes",
    // tab3: "/registration/community",
    tab3: "/registration/profile",
};


export const dataRegistration = [
    {
        label: "หน้าแรก",
        route: "/registration/home",
        icon: <IconHome size={18} stroke={1.8} />,
    },
    {
        label: "ข้อมูลพื้นฐาน",
        route: "/registration/info",
        icon: <IconDatabaseCog size={18} stroke={1.8} />,
    },
    {
        label: "งานหลักสูตร",
        route: "/registration/curriculum",
        icon: <IconBook2 size={18} stroke={1.8} />,
    },
    {
        label: "งานทะเบียนนักเรียน",
        route: "/registration/registration",
        icon: <IconUsersGroup size={18} stroke={1.8} />,
    },
    {
        label: "งานจัดตาราง",
        route: "/registration/scheduling",
        icon: <IconCalendarUser size={18} stroke={1.8} />,
    },
    {
        label: "คู่มือ",
        route: "/registration/manual",
        icon: <IconFileAnalytics size={18} stroke={1.8} />,
    },
];