import HomeFooter from "@/src/components/Base/HomeFooter";
import HomeFooterPieces from "@/src/components/Base/HomeFooterPieces";
import HomeHero from "@/src/components/Base/HomeHero";
import MainNavbar from "@/src/components/Navbar/NavbarMain";
import { GridBackgroundDemo } from "@/src/components/ui/GridBackground";
import { Spotlight } from "@/src/components/ui/spotlight-new";
import { cn } from "@/src/lib/utils";

export default function Home() {
  return (
    <div className={cn("min-h-screen w-full bg-light-base dark:bg-dark-primary select-none relative overflow-x-hidden overflow-y-hidden")}>
      <MainNavbar />

      <div className="absolute top-0 w-full max-w-full -z-3">
        <Spotlight />
      </div>
      <div className="absolute w-full h-full opacity-10 -z-2">
        <GridBackgroundDemo />
      </div>

      <div className="w-full h-full px-8 flex flex-col gap-12">
        <HomeHero />
      </div>

      <div className="absolute bottom-5 left-6">
        <HomeFooter/>
      </div>

      <div className="absolute bottom-5 left-50">
        <HomeFooterPieces/>
      </div>
    </div>

  );
}
