import useChessSocket from "@/src/hooks/useChessSocket";
import ActiveGamesDisplay from "./AcitveGamesDisplay";
import GameControls from "./GameControls";

export default function GameLayout() {

    return (
        <div className="w-full h-full flex justify-between items-center py-3">
            <div className="w-[20%] h-full flex justify-start items-center flex-col p-4 border-r border-neutral-800 bg-neutral-900/50 backdrop-blur-lg">
                <span 
                    className="w-full ">
                    <span className="bg-neutral-950 w-full rounded-md border border-neutral-700 px-3 p-2 text-xl">
                        Active games
                    </span>
                </span>
                <ActiveGamesDisplay />
            </div>


            <div className="w-[80%] h-full flex justify-center items-center">
                <GameControls />
            </div>
        </div>
    )
}