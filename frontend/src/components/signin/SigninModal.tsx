"use client";

import { Dispatch, SetStateAction } from "react";
import OpacityBackground from "./OpacityBackground";
import SignInCard from "./SigninCard";

interface LoginModalProps {
    opensignInModal: boolean;
    setOpenSignInModal: Dispatch<SetStateAction<boolean>>;
}

export default function SignInModal({
    opensignInModal,
    setOpenSignInModal,
}: LoginModalProps) {
    if (!opensignInModal) return null;

    return (
        <OpacityBackground onBackgroundClick={() => setOpenSignInModal(false)}>
            <SignInCard />
        </OpacityBackground>
    );
}