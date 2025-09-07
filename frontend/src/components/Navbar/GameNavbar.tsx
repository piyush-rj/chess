'use client'
import { useUserSessionStore } from "@/src/store/useUserSessionStore";
import Image from "next/image";
import { useState } from "react";
import { Roboto } from 'next/font/google';
import { cn } from "@/src/lib/utils";

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
});

export default function GameNavbar() {

    const [currentImage, setCurrentImage] = useState<number>(0);
    const [isPressed, setIsPressed] = useState<boolean>(false);
    const { session } = useUserSessionStore();

    if (!session) {
        return <div>
            session not found
        </div>
    }

    const allImages = [session?.user.image, '/images/dazai.jpeg', '/images/Gojo.jpeg', '/images/tanjiro.jpeg'];

    function handleClick() {
        setIsPressed(true);
        console.log("session image is", session?.user.image);

        setTimeout(() => {
            setIsPressed(false);
            setCurrentImage((prev) => (prev + 1) % allImages.length);
        }, 100);
    };

    return (
        <div className="px-3 py-2 flex rounded-xl border border-neutral-700 items-center gap-x-4">
            <span className={cn(
                'rounded-md flex justify-center items-center',
                roboto.className,
                'tracking-wider font-light'
            )}>
                {session.user.name}
            </span>

            <span
                onClick={handleClick}
                className={`h-8 w-8 rounded-md overflow-hidden relative cursor-pointer 
                      transition-transform duration-150 ${isPressed ? 'scale-90' : 'scale-100'}`}
            >
                <Image
                    src={`${allImages[currentImage]}`}
                    alt="you"
                    fill
                    className="object-cover"
                />
            </span>
        </div>
    )
}