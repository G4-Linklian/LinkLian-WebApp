// LoginPage.tsx
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
import { decodeRegistrationToken, decodeToken } from "@/utils/authToken";
import { useNotification } from "@/comps/noti/notiComp"
import { loginInstitution } from '@/utils/auth/registrationLogin';


const RegistrationLoginPage = () => {
    const [email, setEmail] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [token, setToken] = useState('');
    const [loging, setLoging] = useState(false);

    // const tokenData = decodeToken();
    const { showNotification } = useNotification();
    const router = useRouter();

    const [otpPage, setOtpPage] = useState<boolean>(false);

    const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

    useEffect(() => {
        console.log("Router pathname changed:", router.pathname);
        const token = decodeRegistrationToken();

        if (router.pathname == "/registration/login" && token) {
            router.push("/registration/home");
        }
    }, [router.pathname]);


    const handleVerificationComplete = (verified: boolean) => {
        setVerificationResult(verified);
        console.log(`Verification ${verified ? 'successful' : 'failed'} for ${form.values.email}`);
    };


    const handleSubmit = async (values: typeof form.values) => {
        // e.preventDefault();
        setLoging(true);

        try {
            // console.log('Login attempt:', { email, password, rememberMe });

            const loginField: any = {
                inst_email: values.email,
                inst_password: values.password
            };

            const loginData = await loginInstitution(loginField);

            if (loginData.success) {
                setUserEmail(loginData.institution);
                setToken(loginData.token);

                let expiresInDays: number

                if (values.rememberMe) {
                    expiresInDays = 30
                } else {
                    expiresInDays = 1
                }
                const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000; // milliseconds

                const data = {
                    token: loginData.token,
                    expiresAt
                };

                localStorage.setItem("linklian_registration_access_token", JSON.stringify(data));

                showNotification("เข้าสู่ระบบสำเร็จ!", "คุณได้เข้าสู่ระบบเรียบร้อยแล้ว", "success");
                router.push('/registration/home');
            } else {
                showNotification("เข้าสู่ระบบล้มเหลว!", `${loginData.message}`, "error");
                setLoging(false);
                return
            }



        } catch (error) {
            console.error("Login Error:", error);
            showNotification("Login Error", "เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ", "error");
        } finally {
            setLoging(false);
        }
    };

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            rememberMe: false,
        },

        validate: {
            email: (value) =>
                /^\S+@\S+$/.test(value) ? null : 'Invalid email',
            password: (value) =>
                value.length < 6 ? 'Password must be at least 6 characters' : null,
        },
    });



    const isLargerThanSm = useMediaQuery("(min-width: 768px)");

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#FFE3BB] to-[#7EC8E3] relative overflow-hidden">

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
                            // borderRadius: '50% 0 0 50% / 100% 0 0 100%',
                            transform: 'translateX(-10%)'
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className='w-[120%] h-[100%] rotate-90' />

                    </div>

                    <div className={`absolute right-0 h-[110%] w-[160%] opacity-35 z-0 top-0`}
                        style={{
                            // borderRadius: '50% 0 0 50% / 100% 0 0 100%',
                            transform: 'translateX(30%)'
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className='w-[120%] h-[100%] rotate-90' />

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
                        <h1 className="text-2xl font-bold text-center mb-8 text-[#000000]">การเข้าสู่ระบบ</h1>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <TextInput
                                label="อีเมล"
                                placeholder="อีเมล"
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
                            // Mantine มีปุ่มเปิด/ปิดตาให้อัตโนมัติอยู่แล้วครับ
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
                                loading={loging}
                                color="blue"
                            >
                                {loging ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>

                        <div className="mt-4 text-center">
                            <span className="text-gray-600">No account yet?</span>{' '}
                            <Link href="/auth/register" className="text-blue-500 hover:text-blue-600 font-medium">
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};

export default RegistrationLoginPage;