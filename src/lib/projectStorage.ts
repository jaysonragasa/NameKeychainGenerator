import { KeychainParams } from './keychainLogic';

const STORAGE_KEY = 'keychainlab3d_projects';

interface ProjectStore {
    [name: string]: KeychainParams;
}

const getProjectsStore = (): ProjectStore => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error("Failed to parse projects from localStorage", e);
    }
    return {};
};

const saveProjectsStore = (store: ProjectStore): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
        console.error("Failed to save projects to localStorage", e);
    }
};

export const saveProject = (name: string, params: KeychainParams): void => {
    const store = getProjectsStore();
    store[name] = params;
    saveProjectsStore(store);
};

export const loadProject = (name: string): KeychainParams | null => {
    const store = getProjectsStore();
    return store[name] || null;
};

export const getSavedProjects = (): string[] => {
    const store = getProjectsStore();
    return Object.keys(store).sort();
};

export const deleteProject = (name: string): void => {
    const store = getProjectsStore();
    if (store[name]) {
        delete store[name];
        saveProjectsStore(store);
    }
};
