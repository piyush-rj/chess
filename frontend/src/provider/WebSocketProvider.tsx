"use client";
import React, { createContext, useEffect, useRef, useState } from "react";
import { useUserSessionStore } from "../store/useUserSessionStore";

const url = process.env.NEXT_PUBLIC_BACKEND_WS_URL;

type Message = { type: string; payload?: any };

interface SocketContextType {
    send: (msg: Message) => void;
    lastMessage: Message | null;
    isConnected: boolean;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const socketRef = useRef<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<Message | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { session } = useUserSessionStore(); 

    useEffect(() => {

        if (!session?.user.id || !url) {
            console.log("session or utl ont found");
            return;
        }

        console.log("user id is ->", session?.user.id);
        const ws = new WebSocket(`${url!}/?playerId=${session?.user.id}`);
        socketRef.current = ws;

        ws.onopen = () => setIsConnected(true);
        ws.onclose = () => setIsConnected(false);
        ws.onmessage = (event) => {
            try {
                setLastMessage(JSON.parse(event.data));
            } catch {
                console.error("Invalid WS message:", event.data);
            }
        };

        return () => ws.close();
    }, [session?.user.id]);

    const send = (msg: Message) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(msg));
        }
    };

    return (
        <SocketContext.Provider value={{ send, lastMessage, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}
