"use client";
import React, { createContext, useEffect, useState, useRef } from "react";
import { useUserSessionStore } from "../store/useUserSessionStore";

interface SocketContextType {
    ws: WebSocket | null;
    isConnected: boolean;
    lastMessage: any | null;
    send: (data: any) => void;
}

export const SocketContext = createContext<SocketContextType>({
    ws: null,
    isConnected: false,
    lastMessage: null,
    send: () => { },
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const { session } = useUserSessionStore();

    useEffect(() => {
        if (!session?.user.id) return;

        const playerId = session?.user.id;
        const ws = new WebSocket(`ws://localhost:8080?playerId=${playerId}`);

        ws.onopen = () => setIsConnected(true);

        ws.onclose = () => setIsConnected(false);
        
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setLastMessage(message);
        };

        wsRef.current = ws;

        return () => ws.close();
    }, [session?.user.id]);

    const send = (data: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        }
    };

    return (
        <SocketContext.Provider value={{ ws: wsRef.current, isConnected, lastMessage, send }}>
            {children}
        </SocketContext.Provider>
    );
};
