import React from 'react';
import { Button } from "../ui/button";
import { X } from "lucide-react";

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

export default function ConfirmationDialog({
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
                        variant="outline"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
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