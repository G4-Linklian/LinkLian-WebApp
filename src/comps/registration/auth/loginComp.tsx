// LoginPage.tsx
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import {
    IconUserCircle,
    IconUser,
    IconLock
} from '@tabler/icons-react';

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
        console.log(`Verification ${verified ? 'successful' : 'failed'} for ${email}`);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoging(true);

        try {
            console.log('Login attempt:', { email, password, rememberMe });

            const loginField: any = {
                inst_email: email,
                inst_password: password
            };

            const loginData = await loginInstitution(loginField);

            if (loginData.success) {
                setUserEmail(loginData.institution);
                setToken(loginData.token);

                let expiresInDays: number

                if (rememberMe) {
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

                showNotification("Login successful!", "You have been logged in successfully.", "success");
                // Redirect to home or dashboard
                router.push('/registration/home');
            } else {
                showNotification("Login failed!", `${loginData.message}`, "error");
                setLoging(false);
                return
            }



        } catch (error) {
            console.error("Login Error:", error);
            showNotification("Login Error", "เกิดข้อผิดพลาดระหว่างการเข้าสู่ระบบ", "error");
        } finally {
            // router.push('/home');
            setLoging(false);
            //setLoging(false); // ปิด loading ไม่ว่าจะสำเร็จหรือ error
        }
    };


    const isLargerThanSm = useMediaQuery("(min-width: 768px)");

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-[#FFE3BB] to-[#7EC8E3] relative overflow-hidden">

            {/* Right side wavy pattern */}
            {isLargerThanSm ? (
                <>
                    <div className={`absolute right-0 h-[120%] w-[90%] opacity-95 z-0 -top-48`}
                        style={{
                            // borderRadius: '50% 0 0 50% / 100% 0 0 100%',
                            transform: 'translateX(30%)'
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className={`w-full h-[130%] rotate-3`} />

                    </div>

                    <div className={`absolute -right-20 h-[120%] w-[90%] opacity-55 z-0 top-32`}
                        style={{
                            // borderRadius: '50% 0 0 50% / 100% 0 0 100%',
                            transform: 'translateX(30%)'
                        }} >
                        <Image src={"/image/clevDT.png"} alt={"clev"} width={1000} height={1000} className='w-full h-[130%] ' />

                    </div>

                    <div className={`absolute -right-10 h-[120%] w-[90%] opacity-35 z-0 top-0`}
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
                        <h1 className="text-2xl font-bold text-center mb-8 text-[#000000]">Login</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <IconUser size={20} className="text-teal-500" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="username or email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 block w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <IconLock size={20} className="text-teal-500" />
                                        </div>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 block w-full border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                        remember me
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <Link href="/resetpassword" className="text-blue-500 hover:text-blue-600">
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>


                            {loging ? (
                                <div className='flex w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 mt-1"></div>
                                    Loging...
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Login
                                    </button>
                                </>
                            )}
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