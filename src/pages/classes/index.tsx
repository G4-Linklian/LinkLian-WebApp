import React, { useEffect } from 'react'
import { useRouter } from 'next/router';
import LayoutShell from "@/comps/layouts/LayoutShell";
import ClassesPage from "@/comps/classes/classesComp"
import { decodeTeacherToken } from "@/utils/authToken";

function PageContent() {
    // const [canRead, setCanRead] = useState(false);

    // useCheckTokenFlags(
    //     [{ flag: "read", onFlagUpdated: setCanRead }],
    //     "check_in"
    // );

    return (
        <div className="flex justify-center items-center w-full h-full">
            <ClassesPage/>
        </div>
        // <>
        //     {canRead && (
        //         <div className="fadeIn-animation">
        //             {/* <CheckIn /> */}
        //         </div>
        //     )}
        // </>
    );
}


export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const token = decodeTeacherToken();

        if (!token) {
            router.push("/teacherLogin");
        }
    }, [router]);

    return (
        <>
            <LayoutShell>
                <PageContent></PageContent>
            </LayoutShell>
        </>
    );
}