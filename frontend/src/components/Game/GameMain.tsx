"use client";
import { useState, useRef, useEffect } from "react";
import HomeFooterPieces from "@/src/components/Base/HomeFooterPieces";
import GameControls from "@/src/components/Game/GameControls";
import GameFooterProfile from "@/src/components/Game/GameFooterProfile";
import GameNavbar from "@/src/components/Navbar/GameNavbar";
import { GridBackgroundDemo } from "@/src/components/ui/GridBackground";
import { cn } from "@/src/lib/utils";
import { LogOutIcon } from "lucide-react";
import LogoutModal from "@/src/utility/LogoutModal";
import { gsap } from "gsap";
import { useActiveGamesStore } from "@/src/store/useActiveGameStore";
import axios from "axios";
import { GET_ACTIVE_GAME_URL } from "@/src/backend-utils/api-routes";
import { useUserSessionStore } from "@/src/store/useUserSessionStore";
import ActiveGamesDisplay from "./AcitveGamesDisplay";

export default function GameMain() {
    const [panel, setPanel] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const { setActiveGames } = useActiveGamesStore();
    const { session } = useUserSessionStore();

    useEffect(() => {
        const fetchActiveGames = async () => {
            if(!session) return;
            const playerId = session.user.id;

            try {
                const response = await axios.get(GET_ACTIVE_GAME_URL, {
                    params: { playerId },
                });

                console.log("response from backedn is ", response);

                
                if (response.data.success) {
                    console.log("data inside response is: ", response.data);
                    setActiveGames(response.data.activeGames);
                }

            } catch (error) {
                console.error('Error in fetching games: ', error);
            }
        };

        fetchActiveGames();
    }, [setActiveGames])

    useEffect(() => {
        if (!panelRef.current) return;
        if (panel) {
            gsap.fromTo(
                panelRef.current,
                { opacity: 0, y: -10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    }, [panel]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setPanel(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleLogoutClick() {
        setPanel(false);
        setShowLogoutModal(true);
    }

    return (
        <>
            <div className={cn("h-screen w-full select-none relative overflow-x-hidden overflow-y-hidden")}>

                <div ref={containerRef} className="absolute top-3 right-4 flex justify-center items-center gap-x-2">
                    <GameNavbar />

                    <div
                        onClick={handleLogoutClick}
                        className={cn(
                            'p-2.5 size-10 flex justify-center items-center rounded-full',
                            'border border-neutral-700',
                            'text-[#7F7FAF] hover:bg-[#53160e] hover:border hover:border-[#521c15] hover:text-[#bdbdbd] transition-all duration-300 cursor-pointer'
                        )}
                    >
                        <LogOutIcon />
                    </div>

                </div>

                <div className="absolute w-full h-full opacity-10 -z-2">
                    <GridBackgroundDemo />
                </div>

                <div className="w-full h-full px-8 flex justify-center items-center gap-12">
                    <GameControls />
                    <ActiveGamesDisplay/>
                </div>

                <div className="absolute bottom-3 left-4">
                    <GameFooterProfile />
                </div>

                <div className="absolute bottom-3 left-30">
                    <HomeFooterPieces />
                </div>
            </div>

            {showLogoutModal && (
                <LogoutModal
                    opeLogoutModal={showLogoutModal}
                    setOpeLogoutModal={setShowLogoutModal}
                />
            )}
        </>
    );
}
