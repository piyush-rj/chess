"use client";
import { ShinyButton } from "../magicui/shiny-button";
import React, { useState } from "react";
import { cn } from "@/src/lib/utils";
import { Input } from "@/components/ui/input";
import { useUserSessionStore } from "@/src/store/useUserSessionStore";

type Props = {
    onJoin: (gameId: string) => void;
};

export default function GameJoinButton({ onJoin }: Props) {
    const [code, setCode] = useState<string>("");
    const [hovered, setHovered] = useState(false);
    const { session } = useUserSessionStore();

    function joinGameHandler() {
        if (!session) return;
        if (code.trim()) {
            onJoin(code.trim());
            setCode("");
        }
    }

    function handleOnEnter(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            joinGameHandler();
        }
    }

    const shouldShowInput = hovered;

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Input
                type="text"
                placeholder="Enter Game ID"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleOnEnter}
                className={cn(
                    "absolute top-4.5 right-[-190px] -translate-y-1/2 z-[999]",
                    "w-45 px-5 py-3 rounded-lg border border-neutral-300",
                    "bg-neutral-900 border-neutral-700 text-white",
                    "placeholder:font-mono placeholder:text-center placeholder:px-3",
                    "focus:border-none",
                    "transition-all duration-300 ease-in-out",
                    shouldShowInput
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-5"
                )}
                autoFocus={shouldShowInput}
                title="Press ENTER to join"
            />

            <ShinyButton
                onClick={joinGameHandler}
                className={cn(
                    "rounded-md text-xl bg-neutral-800/50 px-6 py-2 border border-neutral-700"
                )}
            >
                Join Game
            </ShinyButton>
        </div>
    );
}
