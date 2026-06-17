import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import * as ClipperLib from 'clipper-lib';

// Font loading cache
const fontCache = new Map<string, Font>();
const fontPromises = new Map<string, Promise<Font>>();

export const loadFont = async (url: string): Promise<Font> => {
    if (fontCache.has(url)) return fontCache.get(url)!;
    if (fontPromises.has(url)) return fontPromises.get(url)!;

    const promise = new Promise<Font>((resolve, reject) => {
        new FontLoader().load(url,
            (font) => { fontCache.set(url, font); resolve(font); },
            undefined,
            (error) => { fontPromises.delete(url); reject(error); }
        );
    });
    fontPromises.set(url, promise);
    return promise;
};

export interface KeychainParams {
    text: string;
    textScale: number;
    textThickness: number;
    baseThickness: number;
    paddingX: number;
    paddingY: number;
    ringOuter: number;
    ringInner: number;
    overlap: number;
    cornerRadius: number;
    baseStyle: 'flat' | 'beveled' | 'framed';
    baseType: 'contour' | 'pill';
    ringPosition: number;
    fontUrl: string;
    baseColor: string;
    textColor: string;
    frameColor: string;
    contourSmoothing: number;
    frameHeight: number;
    frameThickness: number;
}

export function generateKeychainGeometries(font: Font, params: KeychainParams) {
    const SCALE = 100;
    const textShapes = font.generateShapes(params.text || ' ', params.textScale);

    const textGeo = new THREE.ExtrudeGeometry(textShapes, {
        depth: params.textThickness,
        bevelEnabled: false,
        curveSegments: 8
    });

    textGeo.computeBoundingBox();
    const bb = textGeo.boundingBox!;
    const textW = bb.max.x - bb.min.x;
    const textH = bb.max.y - bb.min.y;

    // Center text perfectly at 0,0
    const translateX = -bb.min.x - textW / 2;
    const translateY = -bb.min.y - textH / 2;
    textGeo.translate(translateX, translateY, 0);

    const extrudeSettings = {
        depth: params.baseThickness,
        bevelEnabled: params.baseStyle === 'beveled',
        bevelThickness: 0.8,
        bevelSize: 0.6,
        bevelSegments: 3,
        curveSegments: 12
    };

    let rawBasePaths = new ClipperLib.Paths();
    
    // 1. Generate Raw Base Paths
    if (params.baseType === 'pill') {
        const w = textW + params.paddingX * 2;
        const h = Math.max(textH + params.paddingY * 2, params.ringOuter * 2);
        const r = Math.min(params.cornerRadius, w / 2, h / 2);
        
        const x = -w / 2;
        const y = -h / 2;

        const baseShape = new THREE.Shape();
        const drawRoundedRect = (target: THREE.Shape, bx: number, by: number, bw: number, bh: number, br: number) => {
            target.moveTo(bx + br, by);
            target.lineTo(bx + bw - br, by);
            target.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
            target.lineTo(bx + bw, by + bh - br);
            target.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
            target.lineTo(bx + br, by + bh);
            target.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
            target.lineTo(bx, by + br);
            target.quadraticCurveTo(bx, by, bx + br, by);
        };
        drawRoundedRect(baseShape, x, y, w, h, r);
        
        const pts = baseShape.extractPoints(12).shape;
        const poly = pts.map(p => ({ X: Math.round(p.x * SCALE), Y: Math.round(p.y * SCALE) }));
        rawBasePaths.push(poly);
    } else {
        const subj = new ClipperLib.Paths();
        textShapes.forEach(shape => {
            const points = shape.extractPoints(4);
            const outerObj = points.shape.map(p => ({
                X: Math.round((p.x + translateX) * SCALE),
                Y: Math.round((p.y + translateY) * SCALE)
            }));
            subj.push(outerObj);
            points.holes.forEach(hole => {
                const holeObj = hole.map(p => ({
                    X: Math.round((p.x + translateX) * SCALE),
                    Y: Math.round((p.y + translateY) * SCALE)
                }));
                subj.push(holeObj);
            });
        });
        const co = new ClipperLib.ClipperOffset();
        co.AddPaths(subj, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        co.Execute(rawBasePaths, params.paddingX * SCALE);
        
        const outers: any[] = [];
        rawBasePaths.forEach((path: any) => {
            if (ClipperLib.Clipper.Orientation(path)) outers.push(path);
        });

        if (outers.length > 1) {
            const bounds = outers.map(outer => {
                let minXx = Infinity, maxXx = -Infinity;
                let minYy = Infinity, maxYy = -Infinity;
                outer.forEach((p: any) => {
                    minXx = Math.min(minXx, p.X); maxXx = Math.max(maxXx, p.X);
                    minYy = Math.min(minYy, p.Y); maxYy = Math.max(maxYy, p.Y);
                });
                return { minXx, maxXx, minYy, maxYy, cy: (minYy + maxYy) / 2, outer };
            });
            bounds.sort((a, b) => a.minXx - b.minXx);
            const bridgePaths = new ClipperLib.Paths();
            rawBasePaths.forEach(o => bridgePaths.push(o));

            for (let i = 0; i < bounds.length - 1; i++) {
                const b1 = bounds[i], b2 = bounds[i+1];
                if (b2.minXx > b1.maxXx - 10) {
                    const bw = Math.max((b1.maxYy - b1.minYy) * 0.3, (b2.maxYy - b2.minYy) * 0.3);
                    const cy = (b1.cy + b2.cy) / 2;
                    const bridgeRect = [
                        { X: b1.maxXx - 50, Y: Math.round(cy - bw / 2) },
                        { X: b2.minXx + 50, Y: Math.round(cy - bw / 2) },
                        { X: b2.minXx + 50, Y: Math.round(cy + bw / 2) },
                        { X: b1.maxXx - 50, Y: Math.round(cy + bw / 2) }
                    ];
                    bridgePaths.push(bridgeRect);
                }
            }
            const c = new ClipperLib.Clipper();
            c.AddPaths(bridgePaths, ClipperLib.PolyType.ptSubject, true);
            rawBasePaths = new ClipperLib.Paths();
            c.Execute(ClipperLib.ClipType.ctUnion, rawBasePaths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
        }
    }

    // 2. Calculate Ring Position
    let minXx = Infinity, maxXx = -Infinity, minYy = Infinity, maxYy = -Infinity;
    rawBasePaths.forEach((path: any) => {
        path.forEach((p: any) => {
            minXx = Math.min(minXx, p.X); maxXx = Math.max(maxXx, p.X);
            minYy = Math.min(minYy, p.Y); maxYy = Math.max(maxYy, p.Y);
        });
    });
    const cx = (minXx + maxXx) / 2;
    const cy = (minYy + maxYy) / 2;

    const rad = params.ringPosition * Math.PI / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    let maxT = -1;
    let anchorX = cx;
    let anchorY = cy;

    rawBasePaths.forEach((path: any) => {
        if (!ClipperLib.Clipper.Orientation(path)) return;
        for (let i = 0; i < path.length; i++) {
            const A = path[i];
            const B = path[(i + 1) % path.length];
            
            const v1x = cx - A.X;
            const v1y = cy - A.Y;
            const v2x = B.X - A.X;
            const v2y = B.Y - A.Y;
            const v3x = -dy;
            const v3y = dx;
            
            const dot = v2x * v3x + v2y * v3y;
            if (Math.abs(dot) > 0.000001) {
                const t = (v2x * v1y - v2y * v1x) / dot;
                const u = (v1x * v3x + v1y * v3y) / dot;
                if (t >= 0 && u >= 0 && u <= 1) {
                    if (t > maxT) {
                        maxT = t;
                        anchorX = cx + t * dx;
                        anchorY = cy + t * dy;
                    }
                }
            }
        }
    });

    if (maxT === -1) {
        let maxDot = -Infinity;
        rawBasePaths.forEach((path: any) => {
            if (!ClipperLib.Clipper.Orientation(path)) return;
            path.forEach((p: any) => {
                const d = p.X * dx + p.Y * dy;
                if (d > maxDot) {
                    maxDot = d;
                    anchorX = p.X;
                    anchorY = p.Y;
                }
            });
        });
    }

    const ringOuterPx = params.ringOuter * SCALE;
    const overlapPx = params.overlap * SCALE;
    const ringCx = anchorX + dx * (ringOuterPx - overlapPx);
    const ringCy = anchorY + dy * (ringOuterPx - overlapPx);

    // 3. Union Ring Outer
    const ringOuterPath: any[] = [];
    const segments = 64;
    for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        ringOuterPath.push({
            X: Math.round(ringCx + Math.cos(a) * ringOuterPx),
            Y: Math.round(ringCy + Math.sin(a) * ringOuterPx)
        });
    }

    const clipperUnion = new ClipperLib.Clipper();
    clipperUnion.AddPaths(rawBasePaths, ClipperLib.PolyType.ptSubject, true);
    clipperUnion.AddPath(ringOuterPath, ClipperLib.PolyType.ptClip, true);
    const unionedPaths = new ClipperLib.Paths();
    clipperUnion.Execute(ClipperLib.ClipType.ctUnion, unionedPaths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

    // 4. Apply Morphological Smoothing
    let smoothedPaths = unionedPaths;
    const smoothVal = params.contourSmoothing || 0;
    if (smoothVal > 0) {
        const inflateCo = new ClipperLib.ClipperOffset();
        inflateCo.AddPaths(unionedPaths, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        const inflated = new ClipperLib.Paths();
        inflateCo.Execute(inflated, smoothVal * SCALE);

        const deflateCo = new ClipperLib.ClipperOffset();
        deflateCo.AddPaths(inflated, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        smoothedPaths = new ClipperLib.Paths();
        deflateCo.Execute(smoothedPaths, -smoothVal * SCALE);
    }

    // 5. Subtract Holes
    const ringInnerPx = params.ringInner * SCALE;
    const ringInnerPath: any[] = [];
    for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        ringInnerPath.push({
            X: Math.round(ringCx + Math.cos(a) * ringInnerPx),
            Y: Math.round(ringCy + Math.sin(a) * ringInnerPx)
        });
    }

    const clipperDiff = new ClipperLib.Clipper();
    clipperDiff.AddPaths(smoothedPaths, ClipperLib.PolyType.ptSubject, true);
    clipperDiff.AddPath(ringInnerPath, ClipperLib.PolyType.ptClip, true);
    const finalPaths = new ClipperLib.Paths();
    clipperDiff.Execute(ClipperLib.ClipType.ctDifference, finalPaths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

    // 6. Generate Geometries
    const finalOuters: any[] = [];
    const finalHoles: any[] = [];
    finalPaths.forEach((path: any) => {
        if (ClipperLib.Clipper.Orientation(path)) {
            finalOuters.push(path);
        } else {
            finalHoles.push(path);
        }
    });

    const baseShapes: THREE.Shape[] = [];
    finalOuters.forEach((outerPath: any) => {
        const shape = new THREE.Shape();
        outerPath.forEach((p: any, idx: number) => {
            const x = p.X / SCALE;
            const y = p.Y / SCALE;
            if (idx === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        });
        shape.closePath();

        finalHoles.forEach((holePath: any) => {
            const hole = new THREE.Path();
            let isInside = ClipperLib.Clipper.PointInPolygon(holePath[0], outerPath) !== 0;
            if (isInside) {
                holePath.forEach((p: any, idx: number) => {
                    const x = p.X / SCALE;
                    const y = p.Y / SCALE;
                    if (idx === 0) hole.moveTo(x, y);
                    else hole.lineTo(x, y);
                });
                hole.closePath();
                shape.holes.push(hole);
            }
        });
        baseShapes.push(shape);
    });

    const baseGeo = new THREE.ExtrudeGeometry(baseShapes, extrudeSettings);
    let borderGeo: THREE.ExtrudeGeometry | null = null;

    if (params.baseStyle === 'framed') {
        // 1. Collect Original Solid paths (Subject)
        const frameSubj = new ClipperLib.Paths();
        finalPaths.forEach((p: any) => frameSubj.push(p));

        // 2. Create Shrunk Solid (Clip)
        const frameCo = new ClipperLib.ClipperOffset();
        frameCo.AddPaths(frameSubj, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        const shrunkSolid = new ClipperLib.Paths();
        frameCo.Execute(shrunkSolid, -params.frameThickness * SCALE);

        // 3. Difference: Original Solid - Shrunk Solid
        const clipperDiffFrame = new ClipperLib.Clipper();
        clipperDiffFrame.AddPaths(frameSubj, ClipperLib.PolyType.ptSubject, true);
        clipperDiffFrame.AddPaths(shrunkSolid, ClipperLib.PolyType.ptClip, true);
        const frameResult = new ClipperLib.Paths();
        clipperDiffFrame.Execute(ClipperLib.ClipType.ctDifference, frameResult, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

        // 4. Convert frameResult to THREE.Shapes
        const frameOuters: any[] = [];
        const frameHoles: any[] = [];
        frameResult.forEach((path: any) => {
            if (ClipperLib.Clipper.Orientation(path)) frameOuters.push(path);
            else frameHoles.push(path);
        });

        const borderShapes: THREE.Shape[] = [];
        frameOuters.forEach((outerPath: any) => {
            const borderShape = new THREE.Shape();
            outerPath.forEach((p: any, idx: number) => {
                const x = p.X / SCALE;
                const y = p.Y / SCALE;
                if (idx === 0) borderShape.moveTo(x, y);
                else borderShape.lineTo(x, y);
            });
            borderShape.closePath();

            frameHoles.forEach((holePath: any) => {
                if (ClipperLib.Clipper.PointInPolygon(holePath[0], outerPath) !== 0) {
                    // Check winding order to satisfy Three.js requirements
                    const isOuterClockwise = THREE.ShapeUtils.isClockWise(outerPath.map((p: any) => new THREE.Vector2(p.X, p.Y)));
                    const isInnerClockwise = THREE.ShapeUtils.isClockWise(holePath.map((p: any) => new THREE.Vector2(p.X, p.Y)));
                    
                    let pathToAdd = holePath;
                    if (isOuterClockwise === isInnerClockwise) {
                        pathToAdd = [...holePath].reverse();
                    }

                    const innerHole = new THREE.Path();
                    pathToAdd.forEach((p: any, idx: number) => {
                        const x = p.X / SCALE;
                        const y = p.Y / SCALE;
                        if (idx === 0) innerHole.moveTo(x, y);
                        else innerHole.lineTo(x, y);
                    });
                    innerHole.closePath();
                    borderShape.holes.push(innerHole);
                }
            });
            borderShapes.push(borderShape);
        });

        borderGeo = new THREE.ExtrudeGeometry(borderShapes, {
            depth: params.frameHeight,
            bevelEnabled: false,
            curveSegments: 12
        });
        borderGeo.translate(0, 0, params.baseThickness);
    }

    return { textGeo, baseGeo, borderGeo };
}
