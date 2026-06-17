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
    fontUrl: string;
    baseColor: string;
    textColor: string;
    frameColor: string;
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
    let ringCy = 0;

    if (params.baseType === 'pill') {
        const w = textW + params.paddingX * 2;
        const h = Math.max(textH + params.paddingY * 2, params.ringOuter * 2);
        const r = Math.min(params.cornerRadius, w / 2, h / 2);
        
        const x = -w / 2;
        const y = -h / 2;
        minX = x;
        ringCy = 0;

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
        
        const solution = new ClipperLib.Paths();
        co.Execute(solution, params.paddingX * SCALE);

        const outers: any[] = [];
        const holes: any[] = [];
        solution.forEach((path: any) => {
            if (ClipperLib.Clipper.Orientation(path)) {
                outers.push(path);
            } else {
                holes.push(path);
            }
        });

        const baseShapes: THREE.Shape[] = [];
        outers.forEach((outerPath: any) => {
            const shape = new THREE.Shape();
            outerPath.forEach((p: any, idx: number) => {
                if (idx === 0) shape.moveTo(p.X / SCALE, p.Y / SCALE);
                else shape.lineTo(p.X / SCALE, p.Y / SCALE);
                if (p.X / SCALE < minX) {
                    minX = p.X / SCALE;
                    ringCy = p.Y / SCALE;
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
    
    // Link ring to the left side
    const cx = minX - params.ringOuter + params.overlap;
    ringGeo.translate(cx, ringCy, 0);

    return { textGeo, baseGeo, ringGeo, borderGeo };
}
