/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Download, X } from 'lucide-react';
import ThreeCanvas from './components/ThreeCanvas';
import Controls from './components/Controls';
import { KeychainParams } from './lib/keychainLogic';
import { exportToSTL } from './lib/exportSTL';
import { exportTo3MFFile } from './lib/export3MF';

const STORAGE_KEY = 'keyforge-3d-params';

const defaultParams: KeychainParams = {
    text: 'Keylab3D',
    textScale: 1,
    textThickness: 3,
    textAlign: 'center',
    textItalic: false,
    textBold: false,
    textUnderline: false,
    lineSpacing: 1.2,
    baseThickness: 2,
    paddingX: 3,
    paddingY: 3,
    ringOuter: 4,
    ringInner: 2,
    overlap: 2,
    cornerRadius: 4,
    baseStyle: 'flat',
    baseType: 'contour',
    ringPosition: 0,
    fontUrl: '/Pacifico-Regular.ttf',
    baseColor: '#3d4657',
    textColor: '#4fd1c5',
    frameColor: '#4fd1c5',
    contourSmoothing: 1.5,
    frameHeight: 4,
    frameThickness: 2,
    showBuildPlate: true,
    buildPlateWidth: 180,
    buildPlateLength: 180
};

export default function App() {
    const [params, setParams] = useState<KeychainParams>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.fontUrl && parsed.fontUrl.startsWith('blob:')) {
                    parsed.fontUrl = defaultParams.fontUrl;
                }
                return { ...defaultParams, ...parsed };
            }
        } catch (e) {
            console.error('Failed to load from localStorage', e);
        }
        return defaultParams;
    });

    useEffect(() => {
        const toSave = { ...params };
        if (toSave.fontUrl.startsWith('blob:')) {
            toSave.fontUrl = defaultParams.fontUrl;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }, [params]);

    const [isExporting, setIsExporting] = useState(false);
    const [leftOpen, setLeftOpen] = useState(window.innerWidth > 768);
    const [rightOpen, setRightOpen] = useState(window.innerWidth > 768);
    const [showDonation, setShowDonation] = useState(false);
    const [dim, setDim] = useState({ w: 0, l: 0, h: 0, v: 0 });
    const groupRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setLeftOpen(false);
                setRightOpen(false);
            } else {
                setLeftOpen(true);
                setRightOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleExport = (format: 'stl' | '3mf') => {
        if (!groupRef.current) return;
        setIsExporting(true);
        try {
            // A quick timeout to allow UI to update if needed, export might freeze main thread briefly
            setTimeout(async () => {
                try {
                    if (format === 'stl') {
                        exportToSTL(groupRef.current!, `${params.text || 'keychain'}.stl`);
                    } else if (format === '3mf') {
                        await exportTo3MFFile(groupRef.current!, `${params.text || 'keychain'}.3mf`);
                    }
                } catch (e) {
                    console.error("Export failed", e);
                }
                setIsExporting(false);
            }, 50);
        } catch (e) {
            console.error(e);
            setIsExporting(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#0f1115] text-slate-200 flex flex-col font-sans overflow-hidden">
            <nav className="h-14 md:h-16 px-4 md:px-8 flex flex-none items-center justify-between bg-[#16191f] border-b border-white/5 z-30 relative">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <span className="font-black text-black text-xs md:text-sm">KL</span>
                    </div>
                    <h1 className="text-base md:text-lg font-semibold tracking-tight text-white">KeychainLab<span className="text-slate-500 font-normal">3D</span></h1>
                </div>
                <div className="flex items-center gap-6 text-xs md:text-sm font-medium">
                    <span className="text-cyan-400 cursor-default border-b-2 border-cyan-400 py-4 md:py-5">Generator</span>
                </div>
            </nav>
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                
                {/* Controls Panel (Left, Bottom Sheet on Mobile) */}
                <aside 
                    className={`bg-[#16191f] flex flex-col overflow-hidden transition-[height,width] duration-300 ease-in-out z-40 order-2 md:order-1 relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl flex-shrink-0 ${
                        leftOpen 
                            ? 'h-[55vh] md:h-full w-full md:w-80 rounded-t-2xl md:rounded-none border-t border-white/10 md:border-t-0 md:border-r md:border-white/5' 
                            : 'h-0 md:h-full w-full md:w-0 rounded-t-2xl md:rounded-none border-t-0 md:border-r-0'
                    }`}
                >
                    <button 
                        onClick={() => setLeftOpen(false)}
                        className="md:hidden absolute top-4 right-4 z-50 p-2 bg-[#0a0c10] border border-white/10 rounded-lg text-slate-400 hover:text-white shadow-lg"
                    >
                        <X size={18} />
                    </button>
                    <div className="w-full md:w-80 p-6 pt-14 md:pt-6 h-full overflow-y-auto">
                        <Controls params={params} setParams={setParams} />
                    </div>
                </aside>
                
                <div className="order-1 md:order-2 flex-1 bg-[#0a0c10] relative flex items-center justify-center overflow-hidden z-10 min-w-0">
                    <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                    
                    {/* Left Canvas Toggle (Controls) */}
                    <button 
                        onClick={() => setLeftOpen(!leftOpen)}
                        className={`absolute left-4 top-4 z-50 p-2.5 bg-[#16191f]/90 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-colors ${leftOpen ? 'text-cyan-400' : 'text-slate-400 hover:text-white'} shadow-lg`}
                        title={leftOpen ? "Close Controls" : "Open Controls"}
                    >
                        {leftOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>

                    {/* Right Canvas Toggle (Export) */}
                    <button 
                        onClick={() => setRightOpen(!rightOpen)}
                        className={`absolute right-4 top-4 z-50 p-2.5 bg-[#16191f]/90 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-colors ${rightOpen ? 'text-cyan-400' : 'text-slate-400 hover:text-white'} shadow-lg`}
                        title={rightOpen ? "Close Export" : "Open Export"}
                    >
                        {rightOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                    </button>

                    <div className="w-full h-full cursor-grab active:cursor-grabbing relative z-10">
                        <ThreeCanvas 
                            params={params} 
                            onGroupReady={(group) => { 
                                groupRef.current = group; 
                                const box = new THREE.Box3().setFromObject(group);
                                const size = new THREE.Vector3();
                                box.getSize(size);
                                setDim({ 
                                    w: size.x, 
                                    l: size.y, 
                                    h: size.z,
                                    v: (size.x * size.y * size.z * 0.7) / 1000
                                });
                            }} 
                        />
                    </div>
                    {isExporting && (
                        <div className="absolute inset-0 bg-[#0f1115]/80 flex items-center justify-center z-30 backdrop-blur-sm">
                            <div className="bg-[#16191f] border border-white/10 px-6 py-4 rounded-lg shadow-xl font-medium text-cyan-400 flex items-center space-x-3">
                                <svg className="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Generating Export File...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Export Panel (Right) */}
                <aside 
                    className={`bg-[#16191f] border-white/5 flex flex-col overflow-hidden transition-all duration-300 ease-in-out absolute md:relative z-40 shadow-2xl h-full right-0 order-3 md:order-3 ${
                        rightOpen ? 'w-72 max-w-[85vw] border-l translate-x-0' : 'w-72 max-w-[85vw] border-l-0 translate-x-full md:w-0 md:min-w-0 md:translate-x-0'
                    }`}
                >
                    <button 
                        onClick={() => setRightOpen(false)}
                        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-[#0a0c10] border border-white/10 rounded-lg text-slate-400 hover:text-white shadow-lg"
                    >
                        <PanelRightClose size={18} />
                    </button>
                    <div className="w-72 max-w-[85vw] p-6 pt-16 md:pt-6 h-full flex flex-col justify-between overflow-y-auto">
                        <div className="space-y-6">
                            <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
                                <h4 className="text-xs font-bold text-cyan-400 uppercase mb-2 flex items-center gap-2">
                                    <Download size={14} />
                                    Print Specs
                                </h4>
                                <ul className="text-[11px] space-y-1.5 text-slate-400 font-mono">
                                    <li>Width: {dim.w.toFixed(1)} mm ({(dim.w / 25.4).toFixed(2)}")</li>
                                    <li>Length: {dim.l.toFixed(1)} mm ({(dim.l / 25.4).toFixed(2)}")</li>
                                    <li>Thickness: {dim.h.toFixed(1)} mm ({(dim.h / 25.4).toFixed(2)}")</li>
                                    <li>Est. Time: ~{Math.max(5, Math.round(dim.v * 4.5))} min</li>
                                    <li>Volume: ~{dim.v.toFixed(1)} cm³</li>
                                    <li>Format: STL / 3MF</li>
                                </ul>
                            </div>
                        </div>
                        <div className="space-y-3 mt-4 md:mt-0">
                            <button 
                                onClick={() => handleExport('stl')}
                                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Download .STL
                            </button>
                            <button 
                                onClick={() => handleExport('3mf')}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Download .3MF
                            </button>
                            <div className="pt-4 border-t border-white/10 text-center relative">
                                <p className="text-[10px] text-slate-400 mb-2 font-medium">If you think this tool helped you</p>
                                <button 
                                    onClick={() => setShowDonation(!showDonation)}
                                    className="w-full bg-[#16191f] border border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-bold py-2 rounded-lg transition-all text-xs shadow-inner"
                                >
                                    Send gcash 'yah
                                </button>
                                {showDonation && (
                                    <div className="absolute bottom-[110%] left-0 right-0 p-3 bg-white rounded-xl shadow-2xl z-50 border-[3px] border-cyan-500">
                                        <div className="relative">
                                            <button 
                                                onClick={() => setShowDonation(false)}
                                                className="absolute -top-6 -right-6 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg"
                                            >
                                                ✕
                                            </button>
                                            <img src="/gcash_qr.png" alt="GCash QR Code" className="w-full h-auto rounded" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </main>
            <footer className="h-10 bg-[#16191f] border-t border-white/5 px-8 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-slate-600 z-30 relative">
                <div className="flex gap-6">
                    <span>Protected by <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors underline decoration-slate-600 hover:decoration-cyan-400 underline-offset-4">GNU GPLv3 License</a></span>
                </div>
                <div className="flex gap-6">
                    <span>WebGL Acceleration Active</span>
                </div>
            </footer>
        </div>
    );
}

