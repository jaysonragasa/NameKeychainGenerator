import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js';
import * as ClipperLib from 'clipper-lib';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Font loading cache
const fontCache = new Map<string, Font>();
const fontPromises = new Map<string, Promise<Font>>();

export const loadFont = async (url: string): Promise<Font> => {
    if (fontCache.has(url)) return fontCache.get(url)!;
    if (fontPromises.has(url)) return fontPromises.get(url)!;

    const promise = new Promise<Font>((resolve, reject) => {
        if (url.toLowerCase().endsWith('.ttf') || url.startsWith('blob:')) {
            new TTFLoader().load(url,
                (json) => {
                    const font = new Font(json);
                    fontCache.set(url, font);
                    resolve(font);
                },
                undefined,
                (error) => { fontPromises.delete(url); reject(error); }
            );
        } else {
            new FontLoader().load(url,
                (font) => { fontCache.set(url, font); resolve(font); },
                undefined,
                (error) => { fontPromises.delete(url); reject(error); }
            );
        }
    });
    fontPromises.set(url, promise);
    return promise;
};

export interface KeychainParams {
    text: string;
    textScale: number;
    textThickness: number;
    textAlign: 'left' | 'center' | 'right';
    textItalic: boolean;
    textBold: boolean;
    textUnderline: boolean;
    lineSpacing: number;
    baseThickness: number;
    paddingX: number; // Used for contour padding
    paddingY: number; // Legacy, keep for compatibility
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
    ringOuter: number;
    ringInner: number;
    overlap: number;
    cornerRadius: number;
    baseStyle: 'flat' | 'beveled' | 'framed';
    baseType: 'contour' | 'pill';
    ringPosition: number;
    ringType?: 'circle' | 'square' | 'rounded_rectangle';
    ringRectWidth?: number;
    ringRectLength?: number;
    fontUrl: string;
    baseColor: string;
    textColor: string;
    frameColor: string;
    contourSmoothing: number;
    frameHeight: number;
    frameThickness: number;
    showBuildPlate: boolean;
    buildPlateWidth: number;
    buildPlateLength: number;
}

export function generateKeychainGeometries(font: Font, params: KeychainParams) {
    const SCALE = 100;
    
    const lines = (params.text || ' ').split('\n');
    const lineDatas: any[] = [];
    let maxWidth = 0;

    lines.forEach(line => {
        const shapes = font.generateShapes(line || ' ', params.textScale);
        
        const geo = new THREE.ExtrudeGeometry(shapes, {
            depth: params.textThickness,
            bevelEnabled: params.textBold,
            bevelThickness: params.textBold ? 0.1 : 0,
            bevelSize: params.textBold ? params.textScale * 0.03 : 0,
            bevelSegments: params.textBold ? 2 : 0,
            curveSegments: 8
        });
        
        if (params.textItalic) {
            const shearMatrix = new THREE.Matrix4().makeShear(0, 0, 0.3, 0, 0, 0); // Correct shear for Y slanting X
            geo.applyMatrix4(shearMatrix);
        }

        geo.computeBoundingBox();
        const bb = geo.boundingBox || new THREE.Box3();
        const width = bb.max.x - bb.min.x;
        const height = bb.max.y - bb.min.y;
        if (width > maxWidth) maxWidth = width;
        
        lineDatas.push({ shapes, geo, width, height, bb });
    });

    const lineHeight = params.textScale * 1.5 * params.lineSpacing;
    const totalHeight = lineDatas.length * lineHeight;

    const geosToMerge: THREE.BufferGeometry[] = [];
    const underlineThickness = params.textScale * 0.08;
    const underlineOffset = params.textScale * 0.15;
    const allClipperPaths: any[] = [];

    lineDatas.forEach((data, i) => {
        let alignOffset = 0;
        if (params.textAlign === 'center') {
            alignOffset = (maxWidth - data.width) / 2;
        } else if (params.textAlign === 'right') {
            alignOffset = maxWidth - data.width;
        }

        const xOffset = alignOffset - maxWidth / 2;
        const yOffset = -i * lineHeight + totalHeight / 2 - (params.textScale / 2);

        data.geo.translate(xOffset, yOffset, 0);
        geosToMerge.push(data.geo);

        if (params.textUnderline && data.width > 0) {
            const underlineShape = new THREE.Shape();
            const ux = 0;
            const actualUy = data.bb.min.y - underlineOffset;
            underlineShape.moveTo(ux, actualUy);
            underlineShape.lineTo(ux + data.width, actualUy);
            underlineShape.lineTo(ux + data.width, actualUy - underlineThickness);
            underlineShape.lineTo(ux, actualUy - underlineThickness);
            underlineShape.lineTo(ux, actualUy);

            const underlineGeo = new THREE.ExtrudeGeometry(underlineShape, {
                depth: params.textThickness,
                bevelEnabled: false
            });
            if (params.textItalic) {
                const shearMatrix = new THREE.Matrix4().makeShear(0, 0, 0.3, 0, 0, 0);
                underlineGeo.applyMatrix4(shearMatrix);
            }
            underlineGeo.translate(xOffset, yOffset, 0);
            geosToMerge.push(underlineGeo);
            
            const pts = underlineShape.extractPoints(4).shape;
            const poly = pts.map(p => {
                let px = p.x;
                let py = p.y;
                if (params.textItalic) { px += py * 0.3; }
                return {
                    X: Math.round((px + xOffset) * SCALE),
                    Y: Math.round((py + yOffset) * SCALE)
                };
            });
            allClipperPaths.push(poly);
        }

        data.shapes.forEach((shape: THREE.Shape) => {
            const points = shape.extractPoints(4);
            const outerObj = points.shape.map((p: THREE.Vector2) => {
                let px = p.x;
                let py = p.y;
                if (params.textItalic) { px += py * 0.3; }
                return {
                    X: Math.round((px + xOffset) * SCALE),
                    Y: Math.round((py + yOffset) * SCALE)
                };
            });
            allClipperPaths.push(outerObj);
            
            points.holes.forEach((hole: THREE.Vector2[]) => {
                const holeObj = hole.map((p: THREE.Vector2) => {
                    let px = p.x;
                    let py = p.y;
                    if (params.textItalic) { px += py * 0.3; }
                    return {
                        X: Math.round((px + xOffset) * SCALE),
                        Y: Math.round((py + yOffset) * SCALE)
                    };
                });
                allClipperPaths.push(holeObj);
            });
        });
    });

    let textGeo = BufferGeometryUtils.mergeGeometries(geosToMerge);
    if (!textGeo) textGeo = new THREE.BufferGeometry();

    textGeo.computeBoundingBox();
    const bb = textGeo.boundingBox || new THREE.Box3();
    const textW = bb.max.x - bb.min.x;
    const textH = bb.max.y - bb.min.y;

    const extrudeSettings = {
        depth: params.baseThickness,
        bevelEnabled: params.baseStyle === 'beveled',
        bevelThickness: 0.8,
        bevelSize: 0.6,
        bevelSegments: 3,
        curveSegments: 12
    };

    let rawBasePaths = [];
    
    if (params.baseType === 'pill') {
        const pTop = params.paddingTop ?? params.paddingY;
        const pBottom = params.paddingBottom ?? params.paddingY;
        const pLeft = params.paddingLeft ?? params.paddingX;
        const pRight = params.paddingRight ?? params.paddingX;

        const w = textW + pLeft + pRight;
        const desiredH = textH + pTop + pBottom;
        const h = Math.max(desiredH, params.ringOuter * 2);
        const yOffset = (h - desiredH) / 2;

        const x = bb.min.x - pLeft;
        const y = bb.min.y - pBottom - yOffset;

        const r = Math.min(params.cornerRadius, w / 2, h / 2);

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
        const subj = [];
        allClipperPaths.forEach(path => subj.push(path));
        
        const co = new ClipperLib.ClipperOffset();
        co.AddPaths(subj, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        const baseOffset = (params.paddingX + (params.textBold ? params.textScale * 0.03 : 0)) * SCALE;
        co.Execute(rawBasePaths, baseOffset);
        
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
            const bridgePaths = [];
            outers.forEach(o => bridgePaths.push(o));

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
            rawBasePaths = [];
            c.Execute(ClipperLib.ClipType.ctUnion, rawBasePaths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
        } else {
            rawBasePaths = outers;
        }

        // Final pass: explicitly remove any inner holes to ensure the base is completely solid
        const solidBasePaths: any[] = [];
        rawBasePaths.forEach((path: any) => {
            if (ClipperLib.Clipper.Orientation(path)) solidBasePaths.push(path);
        });
        rawBasePaths = solidBasePaths;
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
    let normalX = dx;
    let normalY = dy;

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
                        normalX = -v2y;
                        normalY = v2x;
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
    const ringInnerPx = params.ringInner * SCALE;
    const overlapPx = params.overlap * SCALE;

    const isRect = params.ringType === 'rounded_rectangle';
    const rectLengthPx = (params.ringRectLength ?? 10) * SCALE;
    const rectWidthPx = (params.ringRectWidth ?? 15) * SCALE;

    const stickOutPx = isRect ? (rectLengthPx / 2) : ringOuterPx;

    const ringCx = anchorX + dx * (stickOutPx - overlapPx);
    const ringCy = anchorY + dy * (stickOutPx - overlapPx);

    const createRingPath = (cx: number, cy: number, radX: number, radY: number, type: 'circle' | 'square' | 'rounded_rectangle' | undefined, angle: number) => {
        const path: any[] = [];
        const rot = (x: number, y: number) => ({
            X: Math.round(cx + x * Math.cos(angle) - y * Math.sin(angle)),
            Y: Math.round(cy + x * Math.sin(angle) + y * Math.cos(angle))
        });

        if (type === 'square' || type === 'rounded_rectangle') {
            const cornerRad = Math.min(radX, radY) * 0.4;
            const halfX = radX;
            const halfY = radY;

            // Top-right
            for(let i=0; i<=16; i++) {
                const a = i/16 * Math.PI/2;
                path.push(rot((halfX - cornerRad) + Math.cos(a)*cornerRad, (halfY - cornerRad) + Math.sin(a)*cornerRad));
            }
            // Top-left
            for(let i=0; i<=16; i++) {
                const a = Math.PI/2 + i/16 * Math.PI/2;
                path.push(rot(-(halfX - cornerRad) + Math.cos(a)*cornerRad, (halfY - cornerRad) + Math.sin(a)*cornerRad));
            }
            // Bottom-left
            for(let i=0; i<=16; i++) {
                const a = Math.PI + i/16 * Math.PI/2;
                path.push(rot(-(halfX - cornerRad) + Math.cos(a)*cornerRad, -(halfY - cornerRad) + Math.sin(a)*cornerRad));
            }
            // Bottom-right
            for(let i=0; i<16; i++) {
                const a = 3*Math.PI/2 + i/16 * Math.PI/2;
                path.push(rot((halfX - cornerRad) + Math.cos(a)*cornerRad, -(halfY - cornerRad) + Math.sin(a)*cornerRad));
            }
        } else {
            const segments = 64;
            for (let i = 0; i < segments; i++) {
                const a = (i / segments) * Math.PI * 2;
                path.push({
                    X: Math.round(cx + Math.cos(a) * radX),
                    Y: Math.round(cy + Math.sin(a) * radY)
                });
            }
        }
        return path;
    };

    const ringAngle = Math.abs(normalY) > Math.abs(normalX) ? Math.PI / 2 : 0;
    
    let outerRadX = ringOuterPx;
    let outerRadY = ringOuterPx;
    let innerRadX = ringInnerPx;
    let innerRadY = ringInnerPx;

    if (isRect) {
        outerRadX = rectLengthPx / 2;
        outerRadY = rectWidthPx / 2;
        const thicknessPx = ringOuterPx - ringInnerPx;
        innerRadX = Math.max(0.1, outerRadX - thicknessPx);
        innerRadY = Math.max(0.1, outerRadY - thicknessPx);
    }

    // 3. Union Ring Outer
    const ringOuterPath = createRingPath(ringCx, ringCy, outerRadX, outerRadY, params.ringType, ringAngle);

    const clipperUnion = new ClipperLib.Clipper();
    clipperUnion.AddPaths(rawBasePaths, ClipperLib.PolyType.ptSubject, true);
    clipperUnion.AddPath(ringOuterPath, ClipperLib.PolyType.ptClip, true);
    const unionedPaths = [];
    clipperUnion.Execute(ClipperLib.ClipType.ctUnion, unionedPaths, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

    // 4. Apply Morphological Smoothing
    let smoothedPaths = unionedPaths;
    const smoothVal = params.contourSmoothing || 0;
    if (smoothVal > 0) {
        const inflateCo = new ClipperLib.ClipperOffset();
        inflateCo.AddPaths(unionedPaths, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        const inflated = [];
        inflateCo.Execute(inflated, smoothVal * SCALE);

        const deflateCo = new ClipperLib.ClipperOffset();
        deflateCo.AddPaths(inflated, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        smoothedPaths = [];
        deflateCo.Execute(smoothedPaths, -smoothVal * SCALE);
    }

    // Strip any unwanted internal holes created by overlapping contours or morphological operations
    const solidSmoothedPaths: any[] = [];
    smoothedPaths.forEach((path: any) => {
        if (ClipperLib.Clipper.Orientation(path)) solidSmoothedPaths.push(path);
    });
    smoothedPaths = solidSmoothedPaths;

    // 5. Subtract Holes
    const ringInnerPath = createRingPath(ringCx, ringCy, innerRadX, innerRadY, params.ringType, ringAngle);

    const clipperDiff = new ClipperLib.Clipper();
    clipperDiff.AddPaths(smoothedPaths, ClipperLib.PolyType.ptSubject, true);
    clipperDiff.AddPath(ringInnerPath, ClipperLib.PolyType.ptClip, true);
    const finalPaths = [];
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
        const frameSubj = [];
        finalPaths.forEach((p: any) => frameSubj.push(p));

        // 2. Create Shrunk Solid (Clip)
        const frameCo = new ClipperLib.ClipperOffset();
        frameCo.AddPaths(frameSubj, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        const shrunkSolid = [];
        frameCo.Execute(shrunkSolid, -params.frameThickness * SCALE);

        // 3. Difference: Original Solid - Shrunk Solid
        const clipperDiffFrame = new ClipperLib.Clipper();
        clipperDiffFrame.AddPaths(frameSubj, ClipperLib.PolyType.ptSubject, true);
        clipperDiffFrame.AddPaths(shrunkSolid, ClipperLib.PolyType.ptClip, true);
        const frameResult = [];
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
