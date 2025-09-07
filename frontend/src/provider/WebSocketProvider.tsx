"use client";
import React, { createContext, useEffect, useRef, useState } from "react";
import { useUserSessionStore } from "../store/useUserSessionStore";
import { use_game_store } from "../store/useChessGameStore";

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
    const { set_connection_status, set_connection_error } = use_game_store();

    useEffect(() => {
        if (!session?.user.id) return;

        const playerId = session.user.id;
        const ws = new WebSocket(`ws://localhost:8080?playerId=${playerId}`);

        ws.onopen = () => {
            console.log("✅ WS connected");
            setIsConnected(true);
            set_connection_status(true);
        };

        ws.onclose = () => {
            console.log("❌ WS disconnected");
            setIsConnected(false);
            set_connection_status(false);
        };

        ws.onerror = (err) => {
            console.error("WS error:", err);
            set_connection_error("WebSocket error");
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                setLastMessage(message);
            } catch (e) {
                console.error("Invalid WS message:", event.data);
            }
        };

        wsRef.current = ws;

        return () => ws.close();
    }, [session?.user.id]);

    const send = (data: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        } else {
            console.warn("WS not connected, cannot send:", data);
        }
    };

    return (
        <SocketContext.Provider value={{ ws: wsRef.current, isConnected, lastMessage, send }}>
            {children}
        </SocketContext.Provider>
    );
};
