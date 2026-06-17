import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import ClipperLib from 'clipper-lib';
import * as fs from 'fs';

const fontJson = JSON.parse(fs.readFileSync('node_modules/three/examples/fonts/helvetiker_bold.typeface.json', 'utf8'));
const font = new FontLoader().parse(fontJson);

const shapes = font.generateShapes('ADVENTURE', 10);
const SCALE = 100;
const subj = [];

shapes.forEach(shape => {
    const points = shape.extractPoints(4);
    const outer = points.shape.map(p => ({X: Math.round(p.x * SCALE), Y: Math.round(p.y * SCALE)}));
    subj.push(outer);
});

const co = new ClipperLib.ClipperOffset();
co.AddPaths(subj, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
const solution = [];
co.Execute(solution, 3 * SCALE);

solution.forEach((path, idx) => {
    console.log(`Path ${idx}: length=${path.length}, isOuter=${ClipperLib.Clipper.Orientation(path)}`);
});
