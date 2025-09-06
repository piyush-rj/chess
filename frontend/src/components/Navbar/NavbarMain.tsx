import { cn } from "@/src/lib/utils";
import NavbarSignin from "./NavbarSignin";
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
});

export default function MainNavbar() {
    return (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 py-2 rounded-2xl shadow-lg z-30 bg-neutral-950/50 border border-neutral-800">
            <div className={cn(
                'px-4 flex items-center justify-between w-full tracking-wider font-extralight text-xl',
                roboto.className
            )}>
                <span className="font-extralight text-[21px]">Grid<span className="text-[#9998d3] font-medium">64</span></span>

                <div className="flex justify-center items-center gap-x-2">
                    <NavbarSignin />
                </div>

            </div>
        </div>
    )
}