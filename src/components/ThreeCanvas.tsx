import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { loadFont, generateKeychainGeometries, KeychainParams } from '../lib/keychainLogic';

interface ThreeCanvasProps {
    params: KeychainParams;
    onGroupReady: (group: THREE.Group) => void;
}

const KeychainModel: React.FC<{ params: KeychainParams, onGroupReady: (group: THREE.Group) => void }> = ({ params, onGroupReady }) => {
    const [font, setFont] = useState<Font | null>(null);
    const groupRef = useRef<THREE.Group>(null);

    useEffect(() => {
        let active = true;
        loadFont(params.fontUrl).then((f) => {
            if (active) setFont(f);
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
    );
};

export default function ThreeCanvas({ params, onGroupReady }: ThreeCanvasProps) {
    return (
        <Canvas 
            shadows 
            dpr={[1, 2]}
            gl={{ antialias: true }}
            onCreated={({ gl }) => {
                gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }}
            camera={{ position: [0, 40, 60], fov: 40 }}
        >
            <ambientLight intensity={0.6} />
            <hemisphereLight skyColor="#ffffff" groundColor="#4fd1c5" intensity={0.2} />
            <directionalLight 
                position={[10, 20, 10]} 
                intensity={1} 
                castShadow 
                shadow-mapSize={[1024, 1024]}
            />
            <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={0.5} color="#4fd1c5" castShadow={false} />
            <Environment preset="city" />
            <Center position={[0, 0, 0]}>
                <KeychainModel params={params} onGroupReady={onGroupReady} />
            </Center>
            
            {/* Floor for shadow catching */}
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

            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} />
        </Canvas>
    );
}
