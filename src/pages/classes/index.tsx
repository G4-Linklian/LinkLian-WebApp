import React from 'react'

import LayoutShell from "@/comps/layouts/LayoutShell";

import ClassesPage from "@/comps/classes/classesComp"

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
    return (
        <>
            <LayoutShell>
                <PageContent></PageContent>
            </LayoutShell>
        </>
    );
}