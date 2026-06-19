import React, { useState } from 'react';
import { KeychainParams } from '../lib/keychainLogic';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, ChevronDown, ChevronRight } from 'lucide-react';

interface ControlsProps {
    params: KeychainParams;
    setParams: (params: KeychainParams) => void;
}

function Accordion({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-white/10 rounded-lg bg-[#0a0c10] mb-2 shadow-sm">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2.5 flex justify-between items-center bg-[#16191f] hover:bg-[#1a1e26] transition-colors ${isOpen ? 'rounded-t-lg border-b border-white/5' : 'rounded-lg'}`}
            >
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">{title}</span>
                {isOpen ? <ChevronDown size={14} className="text-cyan-500" /> : <ChevronRight size={14} className="text-slate-500" />}
            </button>
            {isOpen && (
                <div className="p-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

export default function Controls({ params, setParams }: ControlsProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setParams({
            ...params,
            [name]: type === 'number' || type === 'range' ? parseFloat(value) : value
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setParams({ ...params, fontUrl: url });
        }
        if (e.target) {
            e.target.value = '';
        }
    };

    return (
        <div className="flex flex-col pb-8">
            <Accordion title="Typography" defaultOpen={true}>
                <section>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Text</label>
                    <div className="bg-[#0a0c10] border border-white/10 rounded-lg overflow-hidden shadow-inner focus-within:border-cyan-500/50 transition-colors">
                        <textarea 
                            name="text" 
                            value={params.text} 
                            onChange={handleChange}
                            className="w-full bg-transparent px-4 py-3 text-white focus:outline-none font-mono text-sm resize-y min-h-[80px]"
                            placeholder="Enter text here..."
                        />
                        <div className="bg-[#16191f] border-t border-white/10 px-2 py-2 flex items-center justify-between">
                            <div className="flex gap-1">
                                <button onClick={() => setParams({...params, textBold: !params.textBold})} className={`p-1.5 rounded transition-colors ${params.textBold ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} title="Bold"><Bold size={14} /></button>
                                <button onClick={() => setParams({...params, textItalic: !params.textItalic})} className={`p-1.5 rounded transition-colors ${params.textItalic ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} title="Italic"><Italic size={14} /></button>
                                <button onClick={() => setParams({...params, textUnderline: !params.textUnderline})} className={`p-1.5 rounded transition-colors ${params.textUnderline ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} title="Underline"><Underline size={14} /></button>
                            </div>
                            <div className="flex gap-1 border-l border-white/10 pl-2">
                                <button onClick={() => setParams({...params, textAlign: 'left'})} className={`p-1.5 rounded transition-colors ${params.textAlign === 'left' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} title="Align Left"><AlignLeft size={14} /></button>
                                <button onClick={() => setParams({...params, textAlign: 'center'})} className={`p-1.5 rounded transition-colors ${params.textAlign === 'center' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} title="Align Center"><AlignCenter size={14} /></button>
                                <button onClick={() => setParams({...params, textAlign: 'right'})} className={`p-1.5 rounded transition-colors ${params.textAlign === 'right' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} title="Align Right"><AlignRight size={14} /></button>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Font Selection</label>
                    <select 
                        name="fontUrl" 
                        value={params.fontUrl} 
                        onChange={handleChange}
                        className="w-full bg-[#0a0c10] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner font-mono mb-2"
                    >
                        <optgroup label="Three.js Defaults">
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json">Helvetiker</option>
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json">Helvetiker Bold</option>
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/optimer_regular.typeface.json">Optimer</option>
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/optimer_bold.typeface.json">Optimer Bold</option>
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/gentilis_regular.typeface.json">Gentilis</option>
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/gentilis_bold.typeface.json">Gentilis Bold</option>
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/droid/droid_sans_regular.typeface.json">Droid Sans</option>
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/droid/droid_sans_bold.typeface.json">Droid Sans Bold</option>
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/droid/droid_serif_regular.typeface.json">Droid Serif</option>
                            <option value="https://unpkg.com/three@0.160.0/examples/fonts/droid/droid_serif_bold.typeface.json">Droid Serif Bold</option>
                        </optgroup>
                        <optgroup label="Google Fonts (TTF)">
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Regular.ttf">Roboto</option>
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Black.ttf">Roboto Black</option>
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/pacifico/Pacifico-Regular.ttf">Pacifico</option>
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/lobster/Lobster-Regular.ttf">Lobster</option>
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/caveat/Caveat-Regular.ttf">Caveat</option>
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/righteous/Righteous-Regular.ttf">Righteous</option>
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/Oswald-Regular.ttf">Oswald</option>
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/bangers/Bangers-Regular.ttf">Bangers</option>
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/bungee/Bungee-Regular.ttf">Bungee</option>
                            <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf">Press Start 2P</option>
                        </optgroup>
                    </select>
                    <input
                        type="text"
                        name="fontUrl"
                        value={params.fontUrl.startsWith('blob:') ? '' : params.fontUrl}
                        onChange={handleChange}
                        placeholder={params.fontUrl.startsWith('blob:') ? 'Using Local File...' : 'Or paste a custom .ttf URL here...'}
                        className="w-full bg-[#0a0c10] border border-white/10 rounded-lg px-4 py-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner font-mono opacity-50 focus:opacity-100 hover:opacity-100 mb-2"
                    />
                    <label className="w-full cursor-pointer bg-[#16191f] border border-cyan-500/30 hover:bg-cyan-500/10 rounded-lg px-4 py-2 flex items-center justify-center text-[10px] uppercase font-bold tracking-widest text-cyan-400 transition-colors shadow-inner">
                        Upload Local .TTF
                        <input type="file" accept=".ttf" onChange={handleFileUpload} className="hidden" />
                    </label>
                </section>

                <section>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Font Size</label>
                        <span className="text-xs font-mono text-cyan-400">{params.textScale}</span>
                    </div>
                    <input 
                        type="range" name="textScale" min="5" max="30" step="1" 
                        value={params.textScale} onChange={handleChange} 
                        className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </section>

                <section>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Line Spacing</label>
                        <span className="text-xs font-mono text-cyan-400">{params.lineSpacing}x</span>
                    </div>
                    <input 
                        type="range" name="lineSpacing" min="0.5" max="3" step="0.1" 
                        value={params.lineSpacing} onChange={handleChange} 
                        className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </section>

                <section>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Text Z-Offset</label>
                        <span className="text-xs font-mono text-cyan-400">{params.textThickness} mm</span>
                    </div>
                    <input 
                        type="range" name="textThickness" min="1" max="10" step="0.5" 
                        value={params.textThickness} onChange={handleChange} 
                        className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </section>
            </Accordion>

            <Accordion title="Base Shape & Style">
                <section>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Base Outline Shape</label>
                    <select 
                        name="baseType" 
                        value={params.baseType} 
                        onChange={handleChange}
                        className="w-full bg-[#0a0c10] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner font-mono"
                    >
                        <option value="contour">Contour (Hugs letters)</option>
                        <option value="pill">Pill (Rounded Box)</option>
                    </select>
                </section>

                <section>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Base Style</label>
                    <select 
                        name="baseStyle" 
                        value={params.baseStyle} 
                        onChange={handleChange}
                        className="w-full bg-[#0a0c10] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner font-mono"
                    >
                        <option value="flat">Flat</option>
                        <option value="beveled">Beveled</option>
                        <option value="framed">Raised Frame</option>
                    </select>
                </section>

                {params.baseStyle === 'framed' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Frame Height</label>
                                <span className="text-xs font-mono text-cyan-400">{params.frameHeight} mm</span>
                            </div>
                            <input 
                                type="range" name="frameHeight" min="0" max="10" step="0.1" 
                                value={params.frameHeight} onChange={handleChange} 
                                className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </section>
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Frame Thickness</label>
                                <span className="text-xs font-mono text-cyan-400">{params.frameThickness} mm</span>
                            </div>
                            <input 
                                type="range" name="frameThickness" min="0.5" max="5" step="0.1" 
                                value={params.frameThickness} onChange={handleChange} 
                                className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </section>
                    </div>
                )}

                {params.baseType === 'pill' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Corner Radius</label>
                                <span className="text-xs font-mono text-cyan-400">{params.cornerRadius} mm</span>
                            </div>
                            <input 
                                type="range" name="cornerRadius" min="0" max="25" step="1" 
                                value={params.cornerRadius} onChange={handleChange} 
                                className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </section>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <section>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Top Pad</label>
                            <span className="text-[10px] font-mono text-cyan-400">{params.paddingTop ?? params.paddingY} mm</span>
                        </div>
                        <input 
                            type="range" name="paddingTop" min="0" max="25" step="1" 
                            value={params.paddingTop ?? params.paddingY} onChange={handleChange} 
                            className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </section>
                    <section>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Bottom Pad</label>
                            <span className="text-[10px] font-mono text-cyan-400">{params.paddingBottom ?? params.paddingY} mm</span>
                        </div>
                        <input 
                            type="range" name="paddingBottom" min="0" max="25" step="1" 
                            value={params.paddingBottom ?? params.paddingY} onChange={handleChange} 
                            className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </section>
                    <section>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Left Pad</label>
                            <span className="text-[10px] font-mono text-cyan-400">{params.paddingLeft ?? params.paddingX} mm</span>
                        </div>
                        <input 
                            type="range" name="paddingLeft" min="0" max="25" step="1" 
                            value={params.paddingLeft ?? params.paddingX} onChange={handleChange} 
                            className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </section>
                    <section>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Right Pad</label>
                            <span className="text-[10px] font-mono text-cyan-400">{params.paddingRight ?? params.paddingX} mm</span>
                        </div>
                        <input 
                            type="range" name="paddingRight" min="0" max="25" step="1" 
                            value={params.paddingRight ?? params.paddingX} onChange={handleChange} 
                            className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </section>
                </div>
                
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Base Thickness</label>
                        <span className="text-xs font-mono text-cyan-400">{params.baseThickness} mm</span>
                    </div>
                    <input 
                        type="range" name="baseThickness" min="1" max="10" step="0.5" 
                        value={params.baseThickness} onChange={handleChange} 
                        className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </section>
                
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Corner Smoothing</label>
                        <span className="text-xs font-mono text-cyan-400">{params.contourSmoothing} mm</span>
                    </div>
                    <input 
                        type="range" name="contourSmoothing" min="0" max="10" step="0.5" 
                        value={params.contourSmoothing} onChange={handleChange} 
                        className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </section>
            </Accordion>

            <Accordion title="Attachment Ring">
                <section>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Ring Type</label>
                    <select 
                        name="ringType" 
                        value={params.ringType || 'circle'} 
                        onChange={handleChange}
                        className="w-full bg-[#0a0c10] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner font-mono mb-2"
                    >
                        <option value="circle">Circle</option>
                        <option value="square">Rounded Square</option>
                        <option value="rounded_rectangle">Rounded Rectangle</option>
                    </select>
                </section>

                {params.ringType !== 'circle' && (
                    <section className="mt-2 mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Shape Rotation</label>
                            <span className="text-xs font-mono text-cyan-400">{params.ringRotation ?? 0}°</span>
                        </div>
                        <input 
                            type="range" name="ringRotation" min="0" max="360" step="1" 
                            value={params.ringRotation ?? 0} onChange={handleChange} 
                            className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between mt-3 gap-2">
                            {[0, 45, 90, 135].map(deg => (
                                <button
                                    key={deg}
                                    onClick={() => handleChange({ target: { name: 'ringRotation', value: deg.toString(), type: 'number' } } as any)}
                                    className="flex-1 py-1.5 bg-[#0a0c10] border border-white/5 hover:border-cyan-500/50 hover:bg-white/5 rounded-md text-[10px] font-mono text-slate-400 hover:text-cyan-400 transition-colors shadow-sm"
                                >
                                    {deg}°
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {params.ringType === 'rounded_rectangle' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Rectangle Width</label>
                                <span className="text-xs font-mono text-cyan-400">{params.ringRectWidth ?? 15} mm</span>
                            </div>
                            <input 
                                type="range" name="ringRectWidth" min="5" max="30" step="1" 
                                value={params.ringRectWidth ?? 15} onChange={handleChange} 
                                className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </section>
                        <section>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Rectangle Length</label>
                                <span className="text-xs font-mono text-cyan-400">{params.ringRectLength ?? 10} mm</span>
                            </div>
                            <input 
                                type="range" name="ringRectLength" min="5" max="30" step="1" 
                                value={params.ringRectLength ?? 10} onChange={handleChange} 
                                className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </section>
                    </div>
                )}

                {params.ringType !== 'rounded_rectangle' && (
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Ring Outer Radius</label>
                            <span className="text-xs font-mono text-cyan-400">{params.ringOuter} mm</span>
                        </div>
                        <input 
                            type="range" name="ringOuter" min="3" max="15" step="0.5" 
                            value={params.ringOuter} onChange={handleChange} 
                            className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </section>
                )}

                <section>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Ring Position</label>
                        <span className="text-xs font-mono text-cyan-400">{params.ringPosition}°</span>
                    </div>
                    <input 
                        type="range" name="ringPosition" min="0" max="360" step="1" 
                        value={params.ringPosition} onChange={handleChange} 
                        className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </section>

                <section>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Ring Depth</label>
                        <span className="text-xs font-mono text-cyan-400">{params.overlap} mm</span>
                    </div>
                    <input 
                        type="range" name="overlap" min="-5" max="10" step="0.5" 
                        value={params.overlap} onChange={handleChange} 
                        className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </section>

                <section>
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Ring Inner Radius</label>
                        <span className="text-xs font-mono text-cyan-400">{params.ringInner} mm</span>
                    </div>
                    <input 
                        type="range" name="ringInner" min="2" max="12" step="1" 
                        value={params.ringInner} onChange={handleChange} 
                        className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </section>
            </Accordion>

            <Accordion title="Colors">
                <section className={`grid gap-2 ${params.baseStyle === 'framed' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Base Color</label>
                        <input 
                            type="color" name="baseColor" 
                            value={params.baseColor} onChange={handleChange}
                            className="w-full h-8 bg-[#0a0c10] border border-white/10 rounded cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Text Color</label>
                        <input 
                            type="color" name="textColor" 
                            value={params.textColor} onChange={handleChange}
                            className="w-full h-8 bg-[#0a0c10] border border-white/10 rounded cursor-pointer"
                        />
                    </div>
                    {params.baseStyle === 'framed' && (
                        <div className="animate-in fade-in zoom-in duration-300">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Frame Color</label>
                            <input 
                                type="color" name="frameColor" 
                                value={params.frameColor} onChange={handleChange}
                                className="w-full h-8 bg-[#0a0c10] border border-white/10 rounded cursor-pointer"
                            />
                        </div>
                    )}
                </section>
            </Accordion>

            <Accordion title="Workspace">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Virtual Build Plate</label>
                        <input 
                            type="checkbox" 
                            name="showBuildPlate" 
                            checked={params.showBuildPlate} 
                            onChange={(e) => setParams({...params, showBuildPlate: e.target.checked})} 
                            className="w-4 h-4 rounded border-white/10 bg-[#0a0c10] text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-[#16191f] cursor-pointer"
                        />
                    </div>
                    {params.showBuildPlate && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex gap-2 mb-4">
                                <button 
                                    onClick={() => setParams({...params, buildPlateWidth: 180, buildPlateLength: 180})}
                                    className={`flex-1 py-2 text-xs uppercase font-bold rounded-lg transition-colors shadow-inner ${params.buildPlateWidth === 180 && params.buildPlateLength === 180 ? 'bg-cyan-500 text-black' : 'bg-[#16191f] text-slate-400 hover:text-white border border-cyan-500/30'}`}
                                >
                                    180 x 180
                                </button>
                                <button 
                                    onClick={() => setParams({...params, buildPlateWidth: 250, buildPlateLength: 250})}
                                    className={`flex-1 py-2 text-xs uppercase font-bold rounded-lg transition-colors shadow-inner ${params.buildPlateWidth === 250 && params.buildPlateLength === 250 ? 'bg-cyan-500 text-black' : 'bg-[#16191f] text-slate-400 hover:text-white border border-cyan-500/30'}`}
                                >
                                    250 x 250
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs uppercase font-bold text-slate-500">Width</label>
                                        <span className="text-xs font-mono text-cyan-400">{params.buildPlateWidth} mm</span>
                                    </div>
                                    <input type="range" name="buildPlateWidth" min="50" max="500" value={params.buildPlateWidth} onChange={handleChange} className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs uppercase font-bold text-slate-500">Length</label>
                                        <span className="text-xs font-mono text-cyan-400">{params.buildPlateLength} mm</span>
                                    </div>
                                    <input type="range" name="buildPlateLength" min="50" max="500" value={params.buildPlateLength} onChange={handleChange} className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </Accordion>
        </div>
    );
}
