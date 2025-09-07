import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import SessionProvider from "@/src/provider/SessionProvider";
import { WebSocketProvider } from "@/src/provider/WebSocketProvider";
import { getServerSession } from "next-auth";
import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}

export default async function GameLayout({ children }: LayoutProps) {
    const session = await getServerSession(authOptions);

    return (
        <>
            <SessionProvider session={session} />
            <WebSocketProvider>
                {children}
            </WebSocketProvider>
        </>
    );
}
