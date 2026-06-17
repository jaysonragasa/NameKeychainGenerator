import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export function exportToSTL(meshGroup: THREE.Group, filename: string) {
    const exporter = new STLExporter();
    // Ensure all matrices are updated
    meshGroup.updateMatrixWorld(true);
    
    const stlString = exporter.parse(meshGroup);
    
    const blob = new Blob([stlString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}
