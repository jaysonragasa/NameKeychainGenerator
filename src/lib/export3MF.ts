import * as THREE from 'three';
import { exportTo3MF } from 'three-3mf-exporter';

export async function exportTo3MFFile(meshGroup: THREE.Group, filename: string) {
    // Ensure all matrices are updated
    meshGroup.updateMatrixWorld(true);
    
    try {
        const blob = await exportTo3MF(meshGroup);
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
    } catch (e) {
        console.error("Failed to export 3MF:", e);
        throw e;
    }
}
