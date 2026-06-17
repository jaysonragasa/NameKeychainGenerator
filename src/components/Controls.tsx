import React from 'react';
import { KeychainParams } from '../lib/keychainLogic';

interface ControlsProps {
    params: KeychainParams;
    setParams: (params: KeychainParams) => void;
}

export default function Controls({ params, setParams }: ControlsProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setParams({
            ...params,
            [name]: type === 'number' || type === 'range' ? parseFloat(value) : value
        });
    };

    return (
        <div className="space-y-6 flex flex-col pt-2">
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
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Typography</label>
                <select 
                    name="fontUrl" 
                    value={params.fontUrl} 
                    onChange={handleChange}
                    className="w-full bg-[#0a0c10] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner font-mono"
                >
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
                </select>
            </section>

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

            <section>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Text</label>
                <input 
                    type="text" 
                    name="text" 
                    value={params.text} 
                    onChange={handleChange}
                    className="w-full bg-[#0a0c10] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner font-mono text-sm uppercase"
                    maxLength={15}
                />
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
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Base Style</label>
                <select 
                    name="baseStyle" 
                    value={params.baseStyle} 
                    onChange={handleChange}
                    className="w-full bg-[#0a0c10] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors shadow-inner font-mono mb-6"
                >
                    <option value="flat">Standard Edge (Flat)</option>
                    <option value="beveled">Beveled Edges</option>
                    <option value="framed">Raised Frame</option>
                </select>

                {params.baseType === 'pill' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Corner Radius</label>
                                <span className="text-xs font-mono text-cyan-400">{params.cornerRadius} mm</span>
                            </div>
                            <input 
                                type="range" name="cornerRadius" min="0" max="25" step="1" 
                                value={params.cornerRadius} onChange={handleChange} 
                                className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Vertical Padding</label>
                                <span className="text-xs font-mono text-cyan-400">{params.paddingY} mm</span>
                            </div>
                            <input 
                                type="range" name="paddingY" min="0" max="25" step="1" 
                                value={params.paddingY} onChange={handleChange} 
                                className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>
                    </div>
                )}
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

            <section>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {params.baseType === 'pill' ? 'Horizontal Padding' : 'Contour Padding'}
                    </label>
                    <span className="text-xs font-mono text-cyan-400">{params.paddingX} mm</span>
                </div>
                <input 
                    type="range" name="paddingX" min="1" max="15" step="0.5" 
                    value={params.paddingX} onChange={handleChange} 
                    className="w-full h-1 bg-[#0a0c10] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </section>
            
            <section>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Ring Outer Radius</label>
                    <span className="text-xs font-mono text-cyan-400">{params.ringOuter} mm</span>
                </div>
                <input 
                    type="range" name="ringOuter" min="5" max="15" step="1" 
                    value={params.ringOuter} onChange={handleChange} 
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
        </div>
    );
}
