const ClipperLib = require('clipper-lib');
const subj = new ClipperLib.Paths();
const path = [
    {X: 10, Y: 10},
    {X: 110, Y: 10},
    {X: 110, Y: 110},
    {X: 10, Y: 110}
];
subj.push(path);
const co = new ClipperLib.ClipperOffset();
co.AddPaths(subj, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
const solution = new ClipperLib.Paths();
co.Execute(solution, 10.0);
console.log(JSON.stringify(solution));
