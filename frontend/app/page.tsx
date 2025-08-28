"use client"
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";


export default function Home() {

  const router = useRouter();

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Button
        onClick={() => router.push("/game")}
        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
             shadow-md transition-all duration-300 ease-in-out 
             hover:-translate-y-1 hover:scale-105 hover:shadow-xl active:scale-95"
      >
        GET STARTED
      </Button>
    </div>
  );
}
