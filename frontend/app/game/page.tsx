import GameControls from "@/src/components/GameControls";

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-6">
            <h1 className="text-3xl font-bold mb-6">♟️ Chess Game</h1>
            <GameControls />
        </main>
    );
}
