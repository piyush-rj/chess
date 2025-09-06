import { create } from 'zustand';
import { Session } from "next-auth";

interface UserSessionProps {
    session: Session | null;
    setSession: (data: Session | null) => void;
}

export const useUserSessionStore = create<UserSessionProps>((set) => ({
    session: null,
    setSession: (data: Session | null) => set({session: data}),
}))