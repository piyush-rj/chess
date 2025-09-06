'use client'

import { TwitterSVG, GitHubSVG } from "@/src/svgs/all-svgs";
import Image from "next/image";
import { useState } from "react";

export default function HomeFooter() {
    const [currentImage, setCurrentImage] = useState<number>(0);
    const [isPressed, setIsPressed] = useState(false);

    const allImages = ['pfp.jpg', 'dazai.jpeg', 'Gojo.jpeg', 'tanjiro.jpeg'];

    function handleClick() {
        setIsPressed(true);

        setTimeout(() => {
            setIsPressed(false);
            setCurrentImage((prev) => (prev + 1) % allImages.length);
        }, 100);
    };

    return (
        <div className="px-3 py-2 flex border border-neutral-700 rounded-2xl items-center gap-x-4">
            <span
                onClick={handleClick}
                className={`h-8 w-8 rounded-md overflow-hidden relative cursor-pointer 
          transition-transform duration-150 ${isPressed ? 'scale-90' : 'scale-100'}`}
            >
                <Image
                    src={`/images/${allImages[currentImage]}`}
                    alt="dev"
                    fill
                    className="object-cover"
                />
            </span>
            <span className="h-8 w-8 rounded-md flex justify-center items-center hover:bg-neutral-900 transition-colors transform duration-200 cursor-pointer">
                <a
                    href="https://github.com/piyush-rj/chess"
                    target="_blank"
                >
                    <GitHubSVG />
                </a>
            </span>
            <span className="h-8 w-8 rounded-md flex justify-center items-center hover:bg-neutral-900 transition-colors transform duration-200 cursor-pointer">
                <a
                    href="https://x.com/PiyushC2P"
                    target="_blank"
                >
                    <TwitterSVG />
                </a>
            </span>
        </div>
    );
}
