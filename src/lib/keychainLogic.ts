import * as THREE from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import ClipperLib from 'clipper-lib';

const fontCache = new Map<string, Font>();
const fontPromises = new Map<string, Promise<Font>>();

export const loadFont = (url: string): Promise<Font> => {
    if (fontCache.has(url)) return Promise.resolve(fontCache.get(url)!);
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
    ringPosition: 'TopLeft' | 'TopCenter' | 'TopRight' | 'RightCenter' | 'BottomRight' | 'BottomCenter' | 'BottomLeft' | 'LeftCenter';
    fontUrl: string;
    baseColor: string;
    textColor: string;
    frameColor: string;
    contourSmoothing: number;
}

export function generateKeychainGeometries(font: Font, params: KeychainParams) {
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

    let baseGeo: THREE.ExtrudeGeometry;
    let borderGeo: THREE.ExtrudeGeometry | null = null;
    let minX = Infinity;

    if (params.baseType === 'pill') {
        const w = textW + params.paddingX * 2;
        const h = Math.max(textH + params.paddingY * 2, params.ringOuter * 2);
        const r = Math.min(params.cornerRadius, w / 2, h / 2);
        
        const x = -w / 2;
        const y = -h / 2;
        minX = x;

        const drawRoundedRect = (target: THREE.Shape | THREE.Path, bx: number, by: number, bw: number, bh: number, br: number) => {
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

        const baseShape = new THREE.Shape();
        drawRoundedRect(baseShape, x, y, w, h, r);
        baseGeo = new THREE.ExtrudeGeometry(baseShape, extrudeSettings);

        if (params.baseStyle === 'framed') {
            const borderGeoShape = new THREE.Shape();
            drawRoundedRect(borderGeoShape, x, y, w, h, r);
            
            const hole = new THREE.Path();
            const borderThickness = 1.5;
            const hx = x + borderThickness;
            const hy = y + borderThickness;
            const hw = w - borderThickness * 2;
            const hh = h - borderThickness * 2;
            const hr = Math.max(0, r - borderThickness);
            
            if (hw > 0 && hh > 0) {
                drawRoundedRect(hole, hx, hy, hw, hh, hr);
                borderGeoShape.holes.push(hole);

                borderGeo = new THREE.ExtrudeGeometry(borderGeoShape, {
                    depth: params.baseThickness + 1.2,
                    bevelEnabled: false,
                    curveSegments: 12
                });
            }
        }
    } else {
        // Contour offset logic via ClipperLib
        const SCALE = 100;
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
        
        const smoothVal = params.contourSmoothing || 0;
        let solution = new ClipperLib.Paths();
        
        if (smoothVal > 0) {
            const inflated = new ClipperLib.Paths();
            co.Execute(inflated, (params.paddingX + smoothVal) * SCALE);
            const co2 = new ClipperLib.ClipperOffset();
            co2.AddPaths(inflated, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
            co2.Execute(solution, -smoothVal * SCALE);
        } else {
            co.Execute(solution, params.paddingX * SCALE);
        }

        const outers: any[] = [];
        const holes: any[] = [];
        solution.forEach((path: any) => {
            if (ClipperLib.Clipper.Orientation(path)) {
                outers.push(path);
            } else {
                holes.push(path);
            }
        });

        // Bridge disconnected outers
        if (outers.length > 1) {
            // Compute bounds for each outer
            const bounds = outers.map(outer => {
                let minXx = Infinity, maxXx = -Infinity;
                let minYy = Infinity, maxYy = -Infinity;
                outer.forEach((p: any) => {
                    minXx = Math.min(minXx, p.X);
                    maxXx = Math.max(maxXx, p.X);
                    minYy = Math.min(minYy, p.Y);
                    maxYy = Math.max(maxYy, p.Y);
                });
                return { minXx, maxXx, minYy, maxYy, cy: (minYy + maxYy) / 2, outer };
            });

            bounds.sort((a, b) => a.minXx - b.minXx);

            const bridgePaths = new ClipperLib.Paths();
            // keep the original outers
            outers.forEach(o => bridgePaths.push(o));

            // Create a linking rectangle between adjacent outers
            for (let i = 0; i < bounds.length - 1; i++) {
                const b1 = bounds[i];
                const b2 = bounds[i+1];
                
                // If they are separated horizontally
                if (b2.minXx > b1.maxXx - 10) {
                    const bw = Math.max((b1.maxYy - b1.minYy) * 0.3, (b2.maxYy - b2.minYy) * 0.3); // Bridge height
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

            // Union them all together
            const c = new ClipperLib.Clipper();
            c.AddPaths(bridgePaths, ClipperLib.PolyType.ptSubject, true);
            const unionSolution = new ClipperLib.Paths();
            c.Execute(ClipperLib.ClipType.ctUnion, unionSolution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

            outers.length = 0;
            // The union might still have holes if the bridge created some, but typically we just grab the new outers
            unionSolution.forEach((path: any) => {
                if (ClipperLib.Clipper.Orientation(path)) {
                    outers.push(path);
                } else {
                    holes.push(path);
                }
            });
        }

        const baseShapes: THREE.Shape[] = [];
        outers.forEach((outerPath: any) => {
            const shape = new THREE.Shape();
            outerPath.forEach((p: any, idx: number) => {
                if (idx === 0) shape.moveTo(p.X / SCALE, p.Y / SCALE);
                else shape.lineTo(p.X / SCALE, p.Y / SCALE);
                if (p.X / SCALE < minX) {
                    minX = p.X / SCALE;
                }
            });
            shape.closePath();

            holes.forEach((holePath: any) => {
                const hole = new THREE.Path();
                holePath.forEach((p: any, idx: number) => {
                    if (idx === 0) hole.moveTo(p.X / SCALE, p.Y / SCALE);
                    else hole.lineTo(p.X / SCALE, p.Y / SCALE);
                });
                hole.closePath();
                shape.holes.push(hole);
            });
            baseShapes.push(shape);
        });

        baseGeo = new THREE.ExtrudeGeometry(baseShapes, extrudeSettings);

        if (params.baseStyle === 'framed') {
            const borderShapes: THREE.Shape[] = [];
            outers.forEach((outerPath: any) => {
                const borderShape = new THREE.Shape();
                outerPath.forEach((p: any, idx: number) => {
                    if (idx === 0) borderShape.moveTo(p.X / SCALE, p.Y / SCALE);
                    else borderShape.lineTo(p.X / SCALE, p.Y / SCALE);
                });
                borderShape.closePath();
                
                const frameSubj = new ClipperLib.Paths();
                frameSubj.push(outerPath);
                const frameCo = new ClipperLib.ClipperOffset();
                frameCo.AddPaths(frameSubj, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
                const frameSolution = new ClipperLib.Paths();
                frameCo.Execute(frameSolution, -1.5 * SCALE); 
                
                frameSolution.forEach((innerPath: any) => {
                    const innerHole = new THREE.Path();
                    innerPath.forEach((p: any, idx: number) => {
                        if (idx === 0) innerHole.moveTo(p.X / SCALE, p.Y / SCALE);
                        else innerHole.lineTo(p.X / SCALE, p.Y / SCALE);
                    });
                    innerHole.closePath();
                    borderShape.holes.push(innerHole);
                });
                borderShapes.push(borderShape);
            });

            borderGeo = new THREE.ExtrudeGeometry(borderShapes, {
                depth: params.baseThickness + 1.2,
                bevelEnabled: false,
                curveSegments: 12
            });
        }
    }

    // Ring Dimensions
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, params.ringOuter, 0, Math.PI * 2, false);
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, params.ringInner, 0, Math.PI * 2, true);
    Math.PI * 2;
    ringShape.holes.push(holePath);

    const ringGeo = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
    
    // Link ring dynamically based on ringPosition
    const posAttr = baseGeo.attributes.position;
    const dir = new THREE.Vector2(-1, 0); // default LeftCenter
    switch (params.ringPosition) {
        case 'TopLeft': dir.set(-1, 1).normalize(); break;
        case 'TopCenter': dir.set(0, 1); break;
        case 'TopRight': dir.set(1, 1).normalize(); break;
        case 'RightCenter': dir.set(1, 0); break;
        case 'BottomRight': dir.set(1, -1).normalize(); break;
        case 'BottomCenter': dir.set(0, -1); break;
        case 'BottomLeft': dir.set(-1, -1).normalize(); break;
        case 'LeftCenter': dir.set(-1, 0); break;
    }

    let maxDot = -Infinity;
    const anchor = new THREE.Vector2();

    for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const dot = vx * dir.x + vy * dir.y;
        if (dot > maxDot) {
            maxDot = dot;
            anchor.set(vx, vy);
        }
    }

    const cx = anchor.x + dir.x * (params.ringOuter - params.overlap);
    const cy = anchor.y + dir.y * (params.ringOuter - params.overlap);

    ringGeo.translate(cx, cy, 0);

    return { textGeo, baseGeo, ringGeo, borderGeo };
}
