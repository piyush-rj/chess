"use client";

import { useUserSessionStore } from "@/src/store/useUserSessionStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import NavbarNameDisplay from "./NavbarNameDisplay";
import SignInModal from "../signin/SigninModal";
import { Button } from "../ui/button";


export default function NavbarSignin() {
    const [opensignInModal, setOpenSignInModal] = useState<boolean>(false);
    const { session } = useUserSessionStore();
    const router = useRouter();

    function handleSignIn() {
        if (!session?.user?.token) {
            setOpenSignInModal(true);
        } else {
            router.push("/dashboard");
        }
    }

    const isSignedIn = !!session?.user?.id;

    return (
        <div>
            {isSignedIn ? (
                <NavbarNameDisplay />
            ) : (
                <Button
                    onClick={handleSignIn}
                    className="hover:-translate-y-0.5 tracking-wide font-sans font-light transition-all transform-3d duration-200 bg-neutral-200 text-black hover:bg-neutral-200 text-sm h-9 flex justify-center items-center w-20 text-[18px]"
                >
                    Sign In
                </Button>
            )}
            <SignInModal
                opensignInModal={opensignInModal}
                setOpenSignInModal={setOpenSignInModal}
            />
        </div>
    );
}
