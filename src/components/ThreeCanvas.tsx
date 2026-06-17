import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Environment, Grid, Html, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { loadFont, generateKeychainGeometries, KeychainParams } from '../lib/keychainLogic';

interface ThreeCanvasProps {
    params: KeychainParams;
    onGroupReady: (group: THREE.Group) => void;
}

const KeychainModel: React.FC<{ params: KeychainParams, onGroupReady: (group: THREE.Group) => void }> = ({ params, onGroupReady }) => {
    const [font, setFont] = useState<Font | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        let active = true;
        setIsLoading(true);
        loadFont(params.fontUrl).then((f) => {
            if (active) {
                setFont(f);
                setIsLoading(false);
            }
        }).catch(err => {
            if (active) setIsLoading(false);
            console.error("Failed to load font:", err);
        });
        return () => { active = false; };
    }, [params.fontUrl]);

    useEffect(() => {
        if (groupRef.current) {
            onGroupReady(groupRef.current);
        }
    }, [font, params, onGroupReady]);

    const geometries = useMemo(() => {
        if (!font) return null;
        try {
            return generateKeychainGeometries(font, params);
        } catch (e) {
            console.error("Geometry generation error: ", e);
            return null;
        }
    }, [font, params]);

    if (!font || !geometries) return null;

    return (
        <group>
            {isLoading && (
                <Html center zIndexRange={[100, 0]}>
                    <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-[#0a0c10]/90 rounded-xl backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] w-48 pointer-events-none">
                        <div className="w-8 h-8 border-[3px] border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                        <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest animate-pulse">Loading Font...</p>
                    </div>
                </Html>
            )}
            <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Base Block */}
            <mesh geometry={geometries.baseGeo} castShadow receiveShadow>
                <meshStandardMaterial color={params.baseColor} roughness={0.6} />
            </mesh>
            
            {/* Border Block (Optional) */}
            {geometries.borderGeo && (
                <mesh geometry={geometries.borderGeo} castShadow receiveShadow>
                    <meshStandardMaterial color={params.frameColor} roughness={0.6} />
                </mesh>
            )}

            {/* Text Block - placed on top of base */}
            <mesh 
                geometry={geometries.textGeo} 
                position={[0, 0, params.baseThickness]} 
                castShadow 
                receiveShadow
            >
                <meshStandardMaterial color={params.textColor} roughness={0.2} metalness={0.1} />
            </mesh>
        </group>
        </group>
    );
};

export default function ThreeCanvas({ params, onGroupReady }: ThreeCanvasProps) {
    return (
        <Canvas 
            dpr={[1, 2]}
            gl={{ antialias: true }}
            onCreated={({ gl }) => {
                gl.shadowMap.enabled = true;
                gl.shadowMap.type = THREE.PCFShadowMap;
            }}
            camera={{ position: [0, 40, 60], fov: 40 }}
        >
            <ambientLight intensity={0.6} />
            <hemisphereLight args={['#ffffff', '#4fd1c5', 0.2]} />
            <directionalLight 
                position={[10, 20, 10]} 
                intensity={1} 
                castShadow 
                shadow-mapSize={[1024, 1024]}
            />
            <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={0.5} color="#4fd1c5" castShadow={false} />
            <Environment preset="city" />
            <Bounds fit margin={1.5}>
                <Center position={[0, 0, 0]}>
                    <KeychainModel params={params} onGroupReady={onGroupReady} />
                </Center>
            </Bounds>
            
            {params.showBuildPlate ? (
                <group position={[0, -1, 0]}>
                    <mesh receiveShadow>
                        <boxGeometry args={[params.buildPlateWidth, 2, params.buildPlateLength]} />
                        <meshStandardMaterial color="#1f2229" roughness={0.8} />
                    </mesh>
                    <Grid 
                        position={[0, 1.01, 0]} 
                        args={[params.buildPlateWidth, params.buildPlateLength]} 
                        cellSize={10} 
                        cellThickness={0.5} 
                        cellColor="#2a303c" 
                        sectionSize={50} 
                        sectionThickness={1.5} 
                        sectionColor="#4fd1c5" 
                        fadeDistance={Math.max(params.buildPlateWidth, params.buildPlateLength)} 
                        fadeStrength={1}
                        infiniteGrid={false}
                    />
                </group>
            ) : (
                <>
                    <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <planeGeometry args={[500, 500]} />
                        <shadowMaterial opacity={0.15} />
                    </mesh>
                    <Grid 
                        position={[0, -4.01, 0]} 
                        args={[100, 100]} 
                        cellSize={1} 
                        cellThickness={0.5} 
                        cellColor="#2a303c" 
                        sectionSize={5} 
                        sectionThickness={1} 
                        sectionColor="#3d4657" 
                        fadeDistance={80} 
                        fadeStrength={1.5}
                        infiniteGrid
                    />
                </>
            )}

            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} />
        </Canvas>
    );
}
