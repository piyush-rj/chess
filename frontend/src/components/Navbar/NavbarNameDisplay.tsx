"use client";
import { useUserSessionStore } from "@/src/store/useUserSessionStore";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { LogOut } from "lucide-react";
import LogoutModal from "@/src/utility/LogoutModal";
import NameCard from "@/src/utility/NameCard";

export default function NavbarNameDisplay() {
    const { session } = useUserSessionStore();
    const [panel, setPanel] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!panelRef.current) return;

        if (panel) {
            gsap.fromTo(
                panelRef.current,
                { opacity: 0, y: -10, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: "back.out(1.7)",
                }
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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogoutClick = () => {
        setPanel(false);
        setShowLogoutModal(true);
    };

    if (!session || !session.user) return null;

    return (
        <>
            <div
                ref={containerRef}
                className="relative h-full flex items-center justify-end cursor-pointer select-none"
            >
                <div
                    onClick={() => setPanel((prev) => !prev)}
                    className="flex items-center gap-2 px-3 space-x-3 py-1 rounded-full transition"
                >
                    <NameCard />

                    {session.user.image && (
                        <span className="h-8 w-8 rounded-full overflow-hidden relative shadow-lg">
                            <Image
                                src={session.user.image!}
                                alt="User Avatar"
                                fill
                                className="object-cover rounded-full"
                                unoptimized
                            />
                        </span>
                    )}
                </div>

                {panel && (
                    <div
                        ref={panelRef}
                        className="absolute top-11 right-5 mt-2 z-50 w-[120px] bg-neutral-950 border border-neutral-700 rounded-[10px] rounded-tr-none shadow-xl overflow-hidden"
                    >
                        <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-[#7675BE] hover:bg-neutral-950 hover:text-[#8988c9] rounded-md transition-colors duration-200"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                )}
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
