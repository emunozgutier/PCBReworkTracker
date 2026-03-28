import type { Project } from './store/storeProject';
import type { Pcb } from './store/storePcb';
import type { Owner } from './store/storeOwner';
import type { Rework } from './store/storeRework';
import type { Tag } from './store/storeTag';

export const demoProjects: Project[] = [
    {
        id: 4,
        name: 'Io',
        description: 'Jupiter Moon Project',
        pcb_count: 1,
        pcbs: ['IO-001'],
        revisions: ['A0'],
        project_key: 'IO',
        formfactors: [
            { name: 'Validation', revisions: ['1.0', '1.1', '2.0'] }
        ],
        silicon_corners: 'TT'
    },
    {
        id: 1,
        name: 'Titan',
        description: 'Saturn Moon Project',
        pcb_count: 5,
        pcbs: ['TIT-001', 'TIT-002', 'TIT-003', 'TIT-004', 'TIT-005'],
        revisions: ['A0', 'B0', 'A1', 'C0'],
        project_key: 'TIT',
        formfactors: [
            { name: 'Validation', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Demo', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Chamber', revisions: ['1.0', '1.1', '2.0'] }
        ],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 2,
        name: 'Atlas',
        description: 'Saturn Moon Project',
        pcb_count: 2,
        pcbs: ['ATL-001', 'ATL-002'],
        revisions: ['A0', 'B0', 'B1'],
        project_key: 'ATL',
        formfactors: [
            { name: 'Validation', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Demo', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Chamber', revisions: ['1.0', '1.1', '2.0'] }
        ],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 3,
        name: 'Ariel',
        description: 'Uranus Moon Project',
        pcb_count: 3,
        pcbs: ['ARI-001', 'ARI-002', 'ARI-003'],
        revisions: ['A0', 'B0', 'C0'],
        project_key: 'ARI',
        formfactors: [
            { name: 'Validation', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Demo', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Chamber', revisions: ['1.0', '1.1', '2.0'] }
        ],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 5,
        name: 'Leda',
        description: 'Jupiter Moon Project',
        pcb_count: 2,
        pcbs: ['LED-001', 'LED-002'],
        revisions: ['A0', 'B0', 'A1'],
        project_key: 'LED',
        formfactors: [
            { name: 'Validation', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Demo', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Chamber', revisions: ['1.0', '1.1', '2.0'] }
        ],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 6,
        name: 'Pan',
        description: 'Saturn Moon Project',
        pcb_count: 2,
        pcbs: ['PAN-001', 'PAN-002'],
        revisions: ['A0', 'B0', 'B1', 'C0'],
        project_key: 'PAN',
        formfactors: [
            { name: 'Validation', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Demo', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Chamber', revisions: ['1.0', '1.1', '2.0'] }
        ],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 7,
        name: 'Miranda',
        description: 'Uranus Moon Project',
        pcb_count: 2,
        pcbs: ['MIR-001', 'MIR-002'],
        revisions: ['A0', 'B0', 'A1', 'B1'],
        project_key: 'MIR',
        formfactors: [
            { name: 'Validation', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Demo', revisions: ['1.0', '1.1', '2.0'] },
            { name: 'Chamber', revisions: ['1.0', '1.1', '2.0'] }
        ],
        silicon_corners: 'TT, SS, FF'
    }
];

export const demoPcbs: Pcb[] = [
    { id: 4, board_number: 'IO-001', status: 'Working', project: 'Io', owner: 'Bob', product: 'Io - Rev A0' },
    { id: 1, board_number: 'TIT-001', status: 'Working', project: 'Titan', owner: 'Alice', product: 'Titan - Rev A0' },
    { id: 2, board_number: 'TIT-002', status: 'In Rework', project: 'Titan', owner: 'Bob', product: 'Titan - Rev B0' },
    { id: 3, board_number: 'ATL-001', status: 'Dead', project: 'Atlas', owner: 'Alice', product: 'Atlas - Rev A0' }
];

export const demoOwners: Owner[] = [
    { id: 1, name: 'Alice Smith', username: 'asmith', pcb_count: 2, rework_count: 5, tag_count: 1 },
    { id: 2, name: 'Bob Jones', username: 'bjones', pcb_count: 1, rework_count: 2, tag_count: 0 },
    { id: 3, name: 'Charlie Brown', username: 'cbrown', pcb_count: 0, rework_count: 1, tag_count: 2 },
    { id: 4, name: 'Diana Prince', username: 'dprince', pcb_count: 4, rework_count: 0, tag_count: 0 },
    { id: 5, name: 'Ethan Hunt', username: 'ehunt', pcb_count: 1, rework_count: 3, tag_count: 1 },
    { id: 6, name: 'Fiona Gallagher', username: 'fgallagher', pcb_count: 0, rework_count: 0, tag_count: 0 },
    { id: 7, name: 'George Costanza', username: 'gcostanza', pcb_count: 2, rework_count: 1, tag_count: 1 },
];

export const demoReworks: Rework[] = [
    { id: 1, pcb_id: 2, title: 'Replaced U12', description: 'Chip was overheating', timestamp: new Date().toISOString(), owner_id: 2, owner_name: 'Bob Jones', pcb_board_number: 'TIT-002' },
];

export const demoTags: Tag[] = [
    { id: 1, name: 'Team Alpha', color: '#3b82f6', owner_id: 1, pcb_count: 0 },
    { id: 2, name: 'Team Beta', color: '#8b5cf6', owner_id: 2, pcb_count: 0 },
    { id: 3, name: 'Broken', color: '#ef4444', owner_id: 1, pcb_count: 0 },
    { id: 4, name: 'Silicon Not Installed', color: '#f59e0b', owner_id: 2, pcb_count: 0 },
];
