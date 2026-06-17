/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Download } from 'lucide-react';
import ThreeCanvas from './components/ThreeCanvas';
import Controls from './components/Controls';
import { KeychainParams } from './lib/keychainLogic';
import { exportToSTL } from './lib/exportSTL';

const defaultParams: KeychainParams = {
    text: 'Name',
    textScale: 15,
    textThickness: 3,
    baseThickness: 3.5,
    paddingX: 4,
    paddingY: 4,
    ringOuter: 6,
    ringInner: 3.5,
    overlap: 1.5,
    cornerRadius: 0,
    baseStyle: 'flat',
    baseType: 'contour',
    fontUrl: 'https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
    baseColor: '#87ceeb',
    textColor: '#ffff00',
    frameColor: '#87ceeb'
};

export default function App() {
    const [params, setParams] = useState<KeychainParams>(defaultParams);
    const [isExporting, setIsExporting] = useState(false);
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(true);
    const groupRef = useRef<THREE.Group | null>(null);

    const handleExport = () => {
        if (!groupRef.current) return;
        setIsExporting(true);
        try {
            // A quick timeout to allow UI to update if needed, export might freeze main thread briefly
            setTimeout(() => {
                exportToSTL(groupRef.current!, `${params.text || 'keychain'}.stl`);
                setIsExporting(false);
            }, 50);
        } catch (e) {
            console.error(e);
            setIsExporting(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#0f1115] text-slate-200 flex flex-col font-sans overflow-hidden">
            <nav className="h-16 px-8 flex flex-none items-center justify-between bg-[#16191f] border-b border-white/5 z-30 relative">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <span className="font-black text-black text-sm">KF</span>
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight text-white">KeyForge <span className="text-slate-500 font-normal">3D</span></h1>
                </div>
                <div className="flex items-center gap-6 text-sm font-medium">
                    <span className="text-cyan-400 cursor-default border-b-2 border-cyan-400 py-5">Generator</span>
                    <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Templates</span>
                    <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Gallery</span>
                    <div className="h-4 w-px bg-white/10 ml-2"></div>
                    <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-md transition-colors">My Account</button>
                </div>
            </nav>
            <main className="flex-1 flex overflow-hidden relative">
                <aside 
                    className={`bg-[#16191f] border-white/5 flex flex-col overflow-hidden transition-[width,min-width,border] duration-300 ease-in-out relative z-20 shadow-2xl ${
                        leftOpen ? 'w-80 min-w-[20rem] border-r' : 'w-0 min-w-0 border-r-0'
                    }`}
                >
                    <div className="w-80 min-w-[20rem] p-6 h-full overflow-y-auto">
                        <Controls params={params} setParams={setParams} />
                    </div>
                </aside>
                
                <div className="flex-1 bg-[#0a0c10] relative flex items-center justify-center overflow-hidden z-10 min-w-0">
                    <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    
                    {/* Left Panel Toggle */}
                    <button 
                        onClick={() => setLeftOpen(!leftOpen)}
                        className="absolute left-4 top-4 z-20 p-2.5 bg-[#16191f]/80 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white shadow-lg"
                        title={leftOpen ? "Close Controls" : "Open Controls"}
                    >
                        {leftOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>

                    {/* Right Panel Toggle */}
                    <button 
                        onClick={() => setRightOpen(!rightOpen)}
                        className="absolute right-4 top-4 z-20 p-2.5 bg-[#16191f]/80 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white shadow-lg"
                        title={rightOpen ? "Close Export" : "Open Export"}
                    >
                        {rightOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                    </button>

                    <div className="w-full h-full cursor-grab active:cursor-grabbing relative z-10">
                        <ThreeCanvas 
                            params={params} 
                            onGroupReady={(group) => { groupRef.current = group; }} 
                        />
                    </div>
                    {isExporting && (
                        <div className="absolute inset-0 bg-[#0f1115]/80 flex items-center justify-center z-30 backdrop-blur-sm">
                            <div className="bg-[#16191f] border border-white/10 px-6 py-4 rounded-lg shadow-xl font-medium text-cyan-400 flex items-center space-x-3">
                                <svg className="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating STL File...</span>
                            </div>
                        </div>
                    )}
                </div>

                <aside 
                    className={`bg-[#16191f] border-white/5 flex flex-col overflow-hidden transition-[width,min-width,border] duration-300 ease-in-out relative z-20 shadow-2xl ${
                        rightOpen ? 'w-72 min-w-[18rem] border-l' : 'w-0 min-w-0 border-l-0'
                    }`}
                >
                    <div className="w-72 min-w-[18rem] p-6 h-full flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
                                <h4 className="text-xs font-bold text-cyan-400 uppercase mb-2 flex items-center gap-2">
                                    <Download size={14} />
                                    Print Specs
                                </h4>
                                <ul className="text-[11px] space-y-1.5 text-slate-400 font-mono">
                                    <li>Est. Time: ~45min</li>
                                    <li>Volume: ~12cm³</li>
                                    <li>Format: Standard STL</li>
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <button 
                                onClick={handleExport}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Download .STL
                            </button>
                        </div>
                    </div>
                </aside>
            </main>
            <footer className="h-10 bg-[#16191f] border-t border-white/5 px-8 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-slate-600 z-30 relative">
                <div>Status: Ready for Export</div>
                <div className="flex gap-6">
                    <span>WebGL Acceleration Active</span>
                    <span>Unit: Metric (mm)</span>
                </div>
            </footer>
        </div>
    );
}

