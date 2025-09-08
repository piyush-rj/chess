"use client";
import { useState } from "react";
import useChessSocket from "../../hooks/useChessSocket";
import ChessBoard from "./ChessBoard";
import GameJoinButton from "../Base/GameJoinButton";
import { Button } from "../ui/button";
import { Copy, X } from "lucide-react";
import { useChessGameStore } from "@/src/store/useChessGameStore";

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

function ConfirmationDialog({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    type = 'warning'
}: ConfirmationDialogProps) {
    if (!isOpen) return null;

    const getButtonColors = () => {
        switch (type) {
            case 'danger':
                return "bg-red-600 hover:bg-red-700";
            case 'warning':
                return "bg-amber-600 hover:bg-amber-700";
            case 'info':
            default:
                return "bg-blue-600 hover:bg-blue-700";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button
                        onClick={onCancel}
                        className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Message */}
                <p className="text-zinc-300 mb-6">{message}</p>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <Button
                        onClick={onCancel}
                        className="border border-zinc-600 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className={`text-white ${getButtonColors()}`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function GameControls() {
    const { createGame, joinGame, makeMove, leaveGame } = useChessSocket();
    const { gameId, playerColor } = useChessGameStore();

    // State for confirmation dialogs
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);

    const copyToClipboard = () => {
        if (gameId) navigator.clipboard.writeText(gameId);
    };

    const handleLeaveGame = () => {
        setShowLeaveConfirmation(true);
    };

    const handleConfirmLeaveGame = () => {
        setShowLeaveConfirmation(false);
        leaveGame();
    };

    return (
        <>
            <div className="flex flex-col gap-4 items-center">
                {!gameId ? (
                    <div className="flex gap-3">
                        <Button
                            onClick={createGame}
                            className="px-4 py-2.5 text-[20px] font-light rounded-md bg-[#7675BE] hover:bg-[#7675BE] hover:-translate-y-0.5 tracking-wide text-black"
                        >
                            Create Game
                        </Button>
                        <GameJoinButton onJoin={joinGame} />
                    </div>
                ) : (
                    <Button
                        onClick={handleLeaveGame}
                        className="px-4 py-2.5 text-md font-light rounded-md bg-red-500 hover:bg-red-600 text-white"
                    >
                        Leave Game
                    </Button>
                )}

                {gameId && (
                    <div className="fixed bottom-4 right-4 border-2 px-4 py-3 rounded-md border-neutral-700 bg-black/10 backdrop-blur-lg shadow-lg">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-zinc-400">
                                Game ID:{" "}
                                <span className="font-mono">{gameId.slice(0, 10)}</span>
                            </p>
                            <button
                                onClick={copyToClipboard}
                                className="p-1 rounded-md hover:bg-zinc-700/40"
                            >
                                <Copy size={16} className="text-zinc-300" />
                            </button>
                        </div>
                        <p className="text-sm text-zinc-400 font-bold mt-2">
                            You are {playerColor}
                        </p>
                    </div>
                )}

                <ChessBoard makeMove={makeMove} />
            </div>

            {/* Leave Game Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showLeaveConfirmation}
                title="Leave Game"
                message="Are you sure you want to leave this game? This action cannot be undone and will end the game for your opponent."
                confirmText="Leave Game"
                cancelText="Stay"
                type="danger"
                onConfirm={handleConfirmLeaveGame}
                onCancel={() => setShowLeaveConfirmation(false)}
            />
        </>
    );
}