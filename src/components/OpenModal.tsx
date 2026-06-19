import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Trash2 } from 'lucide-react';
import { getSavedProjects, deleteProject } from '../lib/projectStorage';

interface OpenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (name: string) => void;
}

export function OpenModal({ isOpen, onClose, onLoad }: OpenModalProps) {
    const [projects, setProjects] = useState<string[]>([]);
    
    useEffect(() => {
        if (isOpen) {
            setProjects(getSavedProjects());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDelete = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the project "${name}"?`)) {
            deleteProject(name);
            setProjects(getSavedProjects());
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#16191f] border border-white/10 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FolderOpen size={16} className="text-cyan-400" />
                        Open Project
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-2 overflow-y-auto flex-1">
                    {projects.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-sm">
                            No saved projects found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {projects.map(name => (
                                <div 
                                    key={name}
                                    onClick={() => onLoad(name)}
                                    className="group flex items-center justify-between p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                                >
                                    <span className="text-slate-200 font-medium truncate pr-4">{name}</span>
                                    <button 
                                        onClick={(e) => handleDelete(name, e)}
                                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-400/10 rounded-md"
                                        title="Delete project"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-white/5 bg-[#0a0c10] flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
