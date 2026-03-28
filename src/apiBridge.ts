import { useDemoStore } from './store/useDemoStore';
import demoData from './demoData.json';

let internalProjects = [...demoData.demoProjects] as any[];
let internalPcbs = [...demoData.demoPcbs] as any[];
let internalOwners = [...demoData.demoOwners] as any[];
let internalReworks = [...demoData.demoReworks] as any[];
let internalTags = [...demoData.demoTags] as any[];
let internalPcbTags = { ...demoData.demoPcbTags } as any;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function createResponse(data: any, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => data
    } as Response;
}

export async function apiFetch(fullUrl: string, options?: RequestInit): Promise<Response> {
    const isDemoMode = useDemoStore.getState().isDemoMode;
    
    if (!isDemoMode) {
        return fetch(fullUrl, options);
    }
    
    // DEMO MODE MOCK LOGIC
    await delay(300); // Simulate network latency
    
    // Extract just the path from fullUrl (e.g. "http://localhost:5002/api/projects" -> "/projects")
    let localPath = fullUrl;
    if (fullUrl.includes('/api/')) {
        localPath = '/' + fullUrl.split('/api/')[1];
    }
    
    const method = options?.method || 'GET';
    let body: any = null;
    if (options?.body) {
        if (typeof options.body === 'string') {
            body = JSON.parse(options.body);
        } else if (options.body instanceof FormData) {
            body = Object.fromEntries(options.body.entries());
        } else {
            body = options.body;
        }
    }
    
    // Route matching
    if (localPath.startsWith('/projects')) {
        if (method === 'GET') return createResponse(internalProjects);
        if (method === 'POST') {
            const newProject = { id: Date.now(), ...body, pcb_count: 0, pcbs: [] };
            internalProjects.push(newProject);
            return createResponse(newProject, 201);
        }
        if (method === 'PUT') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalProjects = internalProjects.map(p => p.id === id ? { ...p, ...body } : p);
            return createResponse({ message: 'Project updated' });
        }
        if (method === 'DELETE') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalProjects = internalProjects.filter(p => p.id !== id);
            return createResponse({ message: 'Project deleted' });
        }
    }
    
    if (localPath.startsWith('/pcbs')) {
        if (method === 'GET') {
            const parts = localPath.split('/');
            // Check for /pcbs/:id/tags
            if (parts.length === 4 && parts[3] === 'tags') {
                const pcbId = parseInt(parts[2]);
                const tagIds = internalPcbTags[pcbId] || [];
                const tagsForPcb = internalTags
                    .filter(t => tagIds.includes(t.id))
                    .map(tag => {
                        const owner = internalOwners.find(o => o.id === tag.owner_id);
                        return owner ? { ...tag, owner_name: owner.name, owner_username: owner.username } : tag;
                    });
                return createResponse(tagsForPcb);
            }
            // Return internalPcbs with tag_ids joined
            const pcbsWithTags = internalPcbs.map(pcb => ({
                ...pcb,
                tag_ids: internalPcbTags[pcb.id] || []
            }));
            return createResponse(pcbsWithTags);
        }
        if (method === 'POST') {
            const newPcb = { id: Date.now(), ...body };
            internalPcbs.push(newPcb);
            return createResponse(newPcb, 201);
        }
        if (method === 'PUT') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalPcbs = internalPcbs.map(p => p.id === id ? { ...p, ...body } : p);
            return createResponse({ message: 'PCB updated' });
        }
        if (method === 'DELETE') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalPcbs = internalPcbs.filter(p => p.id !== id);
            return createResponse({ message: 'PCB deleted' });
        }
    }
    
    if (localPath.startsWith('/owners')) {
        if (method === 'GET') return createResponse(internalOwners);
        if (method === 'POST') {
            const newOwner = { id: Date.now(), ...body, pcb_count: 0, rework_count: 0, tag_count: 0 };
            internalOwners.push(newOwner);
            return createResponse(newOwner, 201);
        }
        if (method === 'PUT') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalOwners = internalOwners.map(p => p.id === id ? { ...p, ...body } : p);
            return createResponse({ message: 'Owner updated' });
        }
        if (method === 'DELETE') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalOwners = internalOwners.filter(p => p.id !== id);
            return createResponse({ message: 'Owner deleted' });
        }
    }
    
    if (localPath.startsWith('/reworks')) {
        if (method === 'GET') return createResponse(internalReworks);
        if (method === 'POST') {
            const newRework = { id: Date.now(), timestamp: new Date().toISOString(), ...body };
            internalReworks.push(newRework);
            return createResponse(newRework, 201);
        }
        if (method === 'PUT') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalReworks = internalReworks.map(p => p.id === id ? { ...p, ...body } : p);
            return createResponse({ message: 'Rework updated' });
        }
        if (method === 'DELETE') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalReworks = internalReworks.filter(p => p.id !== id);
            return createResponse({ message: 'Rework deleted' });
        }
    }
    
    if (localPath.startsWith('/tags')) {
        if (method === 'GET') {
            const tagsWithOwners = internalTags.map(tag => {
                const owner = internalOwners.find(o => o.id === tag.owner_id);
                return owner ? { ...tag, owner_name: owner.name, owner_username: owner.username } : tag;
            });
            return createResponse(tagsWithOwners);
        }
        if (method === 'POST') {
            const newTag = { id: Date.now(), ...body, pcb_count: 0 };
            internalTags.push(newTag);
            return createResponse(newTag, 201);
        }
        if (method === 'PUT') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalTags = internalTags.map(p => p.id === id ? { ...p, ...body } : p);
            return createResponse({ message: 'Tag updated' });
        }
        if (method === 'DELETE') {
            const id = parseInt(localPath.split('/').pop() || '0');
            internalTags = internalTags.filter(p => p.id !== id);
            return createResponse({ message: 'Tag deleted' });
        }
    }

    return createResponse({ error: 'Not found in demo mode' }, 404);
}
