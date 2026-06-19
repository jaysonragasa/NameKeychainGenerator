import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
}

export function SaveModal({ isOpen, onClose, onSave }: SaveModalProps) {
    const [name, setName] = useState('My Keychain');
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setName('My Keychain');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            setError('Project name cannot be empty');
            return;
        }
        onSave(trimmedName);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#16191f]/60 backdrop-blur-xl border border-white/10 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Save size={16} className="text-cyan-400" />
                        Save Project File
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">File Name</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(''); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                            autoFocus
                            className="w-full bg-[#0a0c10] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
                        />
                        <span className="text-slate-500 font-mono text-sm">.keychain3d</span>
                    </div>
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                    
                    <div className="mt-6 flex justify-end gap-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-sm font-bold transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                        >
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
