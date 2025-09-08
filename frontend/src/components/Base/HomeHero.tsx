"use client";
import React, { useState, useRef } from "react";
import { BishopSVG, KingSVG, KnightSVG, PawnSVG, QueenSVG, RookSVG } from "@/src/svgs/all-svgs";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import { useUserSessionStore } from "@/src/store/useUserSessionStore";
import { useRouter } from "next/navigation";
import { Roboto } from "next/font/google";
import { cn } from "@/src/lib/utils";

const allIcons = [KingSVG, QueenSVG, BishopSVG, KnightSVG, PawnSVG, RookSVG];

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
});

export default function HomeHero() {
    const { session } = useUserSessionStore();
    const router = useRouter();

    function handleOnClick() {
        if (session) {
            router.push('/game');
        } else {
            return (
                <div>Unauthorized</div>
            )
        }
    }

    return (
        <div className="w-full h-screen pb-10 rounded-t-2xl relative overflow-hidden">
            <div className="w-full h-full flex justify-center items-center text-6xl text-[#e4e4e4] flex-col font-medium">
                <div className={cn(
                    'flex flex-col h-full w-full justify-center items-center gap-y-4',
                )}>
                    <span className="text-sm px-4 tracking-wide py-1.5 border rounded-full text-neutral-300 border-neutral-700 mb-2 bg-neutral-950/50 backdrop-blur-3xl shadow-lg">
                        {/* <AnimatedShinyText>Losing is not an option</AnimatedShinyText> */}
                        Losing is not an option
                    </span>
                    <span className="text-7xl">
                        Don't just Play.{" "}
                        <span className="text-[#B8B7E4]"> Dominate.</span>
                    </span>
                    <span className="flex w-full justify-center gap-x-4">
                        <Button className="bg-[#c3c3d1] w-32 h-10 text-[18px] text-neutral-900 hover:bg-[#c3c3d1] hover:-translate-y-0.5 transition-all duration-200">
                            Read Docs
                        </Button>
                        <Button
                            onClick={handleOnClick}
                            className="bg-[#7675be] h-10 w-38 text-[18px] text-black hover:bg-[#7675be] hover:-translate-y-0.5 transition-all duration-200 font-medium flex">
                            Start Playing
                            <span className="flex justify-center items-center"><ChevronRight /></span>
                        </Button>
                    </span>
                </div>
            </div>

            <div className="absolute top-20 left-10 animate-float-slow">
                <Bubble icon={KingSVG} />
            </div>
            <div className="absolute top-80 left-50 animate-float">
                <Bubble icon={BishopSVG} />
            </div>

            <div className="absolute top-30 right-10 animate-float">
                <Bubble icon={QueenSVG} />
            </div>
            <div className="absolute top-80 right-50 animate-float-fast">
                <Bubble icon={KnightSVG} />
            </div>
        </div>
    );
}

interface BubbleProps {
    icon: React.ComponentType<{ className?: string }>;
}

export function Bubble({ icon: Icon }: BubbleProps) {
    const [CurrentIcon, setCurrentIcon] = useState(() => Icon);
    const intervalRef = useRef<number | null>(null);

    const handleMouseEnter = () => {
        if (intervalRef.current) return;
        intervalRef.current = window.setInterval(() => {
            const RandomIcon = allIcons[Math.floor(Math.random() * allIcons.length)];
            setCurrentIcon(() => RandomIcon);
        }, 200);
    };

    const handleMouseLeave = () => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setCurrentIcon(() => Icon);
        }
    };

    return (
        <div
            className="w-20 h-20 rounded-full bg-neutral-900/10 backdrop-blur-lg border border-neutral-800 flex justify-center items-center shadow-lg cursor-pointer transition-all duration-200 hover:scale-110"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <CurrentIcon className="w-10 h-10 text-[#e4e4e4]" />
        </div>
    );
}
