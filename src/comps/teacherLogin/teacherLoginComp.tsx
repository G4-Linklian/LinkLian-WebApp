import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useForm } from '@mantine/form';
import {
    TextInput,
    PasswordInput,
    Checkbox,
    Button,
    Group,
} from '@mantine/core';
import { IconUser, IconLock } from '@tabler/icons-react';

import { useMediaQuery } from "@/comps/public/useMediaQuery"
import { decodeTeacherToken, decodeToken } from "@/utils/authToken";
import { useNotification } from "@/comps/noti/notiComp"
import { teacherLogin, verifyTeacherOtp } from '@/utils/auth/teacherLogin';
import { OtpModalEx } from '../public/otpModal';

const TeacherLoginPage = () => {
    // const [email, setEmail] = useState('');
    // const [userEmail, setUserEmail] = useState('');
    // const [password, setPassword] = useState('');
    // const [rememberMe, setRememberMe] = useState(false);

    // const [token, setToken] = useState('');
    const [logging, setLogging] = useState(false);
    const { showNotification } = useNotification();
    const router = useRouter();

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
        validate: {
            email: (value) => (value.length > 0 ? null : 'กรุณากรอกอีเมล'),
            password: (value) => (value.length > 0 ? null : 'กรุณากรอกรหัสผ่าน'),
        },
    });

    // useEffect(() => {
    //     if (!router.isReady) return;

    //     const token = decodeTeacherToken();

    //     if (token) {
    //         router.push("/classes");
    //     }
    // }, [router.isReady, router]);

    // otp
    const [otpPage, setOtpPage] = useState<boolean>(false);
    const [otpOpened, setOtpOpened] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSessionId, setOtpSessionId] = useState<string>('');

    const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

    const handleVerificationComplete = (verified: boolean) => {
        setVerificationResult(verified);
    };

    // เก็บ token ลง localStorage
    const saveTeacherToken = (accessToken: string, rememberMe: boolean) => {
        let expiresInDays: number

        if (rememberMe) {
            expiresInDays = 30
        } else {
            expiresInDays = 1
        }
        const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000; // milliseconds

        const data = {
            token: accessToken,
            expiresAt
        };

        localStorage.setItem("linklian_teacher_access_token", JSON.stringify(data));
    };

    const completeLogin = async (accessToken: string, rememberMe: boolean) => {
        saveTeacherToken(accessToken, rememberMe);
        showNotification("เข้าสู่ระบบสำเร็จ!", "เข้าสู่ระบบเรียบร้อยแล้ว", "success");
        router.push('/classes');
    };

    const handleSubmit = async (values: typeof form.values) => {
        setLogging(true);

        try {
            const loginField: any = {
                email: values.email,
                password: values.password,
            };

            const loginData = await teacherLogin(loginField, values.rememberMe);
            console.log("Login response data:", loginData);

            if (loginData.success) {
                // otp
                if (loginData.otp_session_id) {
                    // showNotification("รอการยืนยัน OTP", "กรุณายืนยัน OTP ที่ส่งไปยังอีเมลของคุณ", "success");

                    setOtpSessionId(loginData.otp_session_id);
                    setOtpPage(true);
                    setOtpOpened(true);

                    return;
                }

                // login success
                if (loginData.access_token) {
                    const userRoleName = loginData.role_name;
                    if (userRoleName === "teacher") {
                        await completeLogin(loginData.access_token, values.rememberMe);
                    } else {
                        showNotification("เข้าสู่ระบบล้มเหลว!", "บัญชีนี้ไม่ใช่ผู้สอน", "error");
                    }
                }
            } else {
                showNotification("เข้าสู่ระบบล้มเหลว!", "บัญชีนี้ไม่ใช่ผู้สอน", "error");
                setLogging(false);
                return
            }
        } catch (error) {
            console.error("Login Error:", error);
            showNotification("Login Error", "เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ", "error");
        } finally {
            setLogging(false);
        }
    };

    const handleSubmitOtp = async (otp: string) => {
        setOtpLoading(true);
        try {
            const afterOtpData = await verifyTeacherOtp(otp, otpSessionId);
            const userRoleName = afterOtpData.role_name;

            if (afterOtpData.success && afterOtpData.access_token) {
                if (userRoleName === "teacher") {
                    await completeLogin(afterOtpData.access_token, form.values.rememberMe);
                } else {
                    showNotification("ยืนยัน OTP ไม่สำเร็จ", "บัญชีนี้ไม่ใช่ผู้สอน", "error");
                }
            } else {
                showNotification("ผิดพลาด", afterOtpData.message || "รหัส OTP ไม่ถูกต้อง", "error");
            }
        } catch (error) {
            showNotification("Error", "ไม่สามารถเชื่อมต่อระบบยืนยันรหัสได้", "error");
        } finally {
            setOtpLoading(false);
        }
    };

    const isLargerThanSm = useMediaQuery("(min-width: 768px)");

    return (
        <div className="flex min-h-screen bg-linear-to-br from-[#FFE3BB] to-[#7EC8E3] relative overflow-hidden">

            {/* Right side wavy pattern */}
            {isLargerThanSm ? (
                <>
                    <div className={`absolute right-20 h-[120%] w-[90%] opacity-95 z-0 -top-48`}
                        style={{
                            // borderRadius: '50% 0 0 50% / 100% 0 0 100%',
                            transform: 'translateX(30%)'
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className={`w-full h-[130%] rotate-3`} />

                    </div>

                    <div className={`absolute right-10 h-[120%] w-[90%] opacity-55 z-0 top-24`}
                        style={{
                            // borderRadius: '50% 0 0 50% / 100% 0 0 100%',
                            transform: 'translateX(30%)'
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className='w-full h-[130%] ' />

                    </div>

                    <div className={`absolute right-10 h-[120%] w-[90%] opacity-35 z-0 -top-10`}
                        style={{
                            // borderRadius: '50% 0 0 50% / 100% 0 0 100%',
                            transform: 'translateX(30%)'
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className='w-full h-[130%] ' />

                    </div>
                </>
            ) : (
                <>
                    <div className={`absolute right-0 h-[110%] w-[200%] opacity-95 z-0 top-0`}
                        style={{
                            // borderRadius: '50% 0 0 50% / 100% 0 0 100%',
                            transform: 'translateX(20%)',
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className={`w-[120%] h-[120%] rotate-90`} />

                    </div>

                    <div className={`absolute right-0 h-[110%] w-[150%] opacity-55 z-0 top-0`}
                        style={{
                            transform: 'translateX(-10%)'
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className='w-[120%] h-full rotate-90' />

                    </div>

                    <div className={`absolute right-0 h-[110%] w-[160%] opacity-35 z-0 top-0`}
                        style={{
                            transform: 'translateX(30%)'
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className='w-[120%] h-full rotate-90' />

                    </div>
                </>
            )}

            {/* Login Form */}
            {!otpPage ? (
                <div className={`
                    flex flex-col justify-center w-full z-10
                    ${isLargerThanSm ? 'items-end' : 'items-center'}
                `}>
                    <div className={`
                        flex flex-col w-full max-w-md p-8 rounded-lg
                        ${isLargerThanSm ? 'mr-[18%]' : 'mr-0'}
                    `}>
                        <h1 className="text-2xl font-bold text-center mb-8 text-[#000000]">เข้าสู่ระบบ</h1>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <TextInput
                                label="ชื่อผู้ใช้"
                                placeholder="ชื่อผู้ใช้"
                                leftSection={<IconUser size={18} stroke={1.5} />}
                                required
                                radius="md"
                                mb="md"
                                size='md'
                                {...form.getInputProps('email')}
                            />

                            <PasswordInput
                                label="รหัสผ่าน"
                                placeholder="รหัสผ่าน"
                                required
                                radius="md"
                                mb="md"
                                leftSection={<IconLock size={18} stroke={1.5} />}
                                size='md'
                                {...form.getInputProps('password')}
                            />

                            <Group justify="space-between" mb="lg" mt="md">
                                <Checkbox
                                    label="Remember me"
                                    {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                                />

                            </Group>

                            <Button
                                type="submit"
                                fullWidth
                                mt="xl"
                                radius="md"
                                loading={logging}
                                color="blue"
                            >
                                {logging ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <span className="text-gray-600">No account yet?</span>{' '}
                            {/* ขึ้น modal ให้ไปสมัครสมาชิกที่แอปก่อน */}
                        </div>
                    </div>
                </div>
            ) : (
                <OtpModalEx
                    opened={otpPage}
                    onClose={() => setOtpPage(false)}
                    email={form.values.email}
                    loading={otpLoading}
                    handleConfirm={handleSubmitOtp}
                />
            )}
        </div>
    );
};

export default TeacherLoginPage;