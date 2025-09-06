"use client";

import { Dispatch, SetStateAction } from "react";
import OpacityBackground from "../components/signin/OpacityBackground";
import LogoutCard from "./LogoutCard";

interface LoginModalProps {
    opeLogoutModal: boolean;
    setOpeLogoutModal: Dispatch<SetStateAction<boolean>>;
}

export default function LogoutModal({ opeLogoutModal, setOpeLogoutModal }: LoginModalProps) {
    if (!opeLogoutModal) return null;

    return (
        <OpacityBackground onBackgroundClick={() => setOpeLogoutModal(false)}>
            <LogoutCard onCancel={() => setOpeLogoutModal(false)} />
        </OpacityBackground>
    );
}
