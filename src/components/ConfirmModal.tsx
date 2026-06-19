import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#16191f]/60 backdrop-blur-xl border border-white/10 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-400" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5">
                    <p className="text-sm text-slate-300 leading-relaxed">
                        {message}
                    </p>
                    
                    <div className="mt-6 flex justify-end gap-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
