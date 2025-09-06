"use client"

import { Session } from "next-auth";
import { useUserSessionStore } from "../store/useUserSessionStore";
import { useEffect } from "react";

interface SessionProviderProps {
    session: Session | null;
}

export default function SessionProvider({ session }: SessionProviderProps) {
    const { setSession } = useUserSessionStore();

    useEffect(() => {
        setSession(session);
    }, [session, setSession]);

    return null;
}