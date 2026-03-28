import type { Project } from './store/storeProject';
import type { Pcb } from './store/storePcb';
import type { Owner } from './store/storeOwner';
import type { Rework } from './store/storeRework';
import type { Tag } from './store/storeTag';

export const demoProjects: Project[] = [
    {
        id: 1,
        name: 'Alpha Board',
        description: 'Next generation compute module',
        pcb_count: 5,
        pcbs: ['AB-001', 'AB-002', 'AB-003', 'AB-004', 'AB-005'],
        revisions: ['A', 'B', 'C'],
        project_key: 'ALPHA',
        formfactors: [{ name: 'ATX', revisions: ['A'] }],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 2,
        name: 'Beta Controller',
        description: 'Industrial control unit',
        pcb_count: 2,
        pcbs: ['BC-001', 'BC-002'],
        revisions: ['1.0', '1.1'],
        project_key: 'BETA',
        formfactors: [],
        silicon_corners: ''
    }
];

export const demoPcbs: Pcb[] = [
    { id: 1, board_number: 'AB-001', status: 'Working', project: 'Alpha Board', owner: 'Alice', product: 'Alpha Board - Rev A' },
    { id: 2, board_number: 'AB-002', status: 'In Rework', project: 'Alpha Board', owner: 'Bob', product: 'Alpha Board - Rev B' },
    { id: 3, board_number: 'BC-001', status: 'Dead', project: 'Beta Controller', owner: 'Alice', product: 'Beta Controller - Rev 1.0' },
];

export const demoOwners: Owner[] = [
    { id: 1, name: 'Alice Smith', username: 'asmith', pcb_count: 2, rework_count: 5, tag_count: 1 },
    { id: 2, name: 'Bob Jones', username: 'bjones', pcb_count: 1, rework_count: 2, tag_count: 0 },
];

export const demoReworks: Rework[] = [
    { id: 1, pcb_id: 2, title: 'Replaced U12', description: 'Chip was overheating', timestamp: new Date().toISOString(), owner_id: 2, owner_name: 'Bob Jones', pcb_board_number: 'AB-002' },
];

export const demoTags: Tag[] = [
    { id: 1, name: 'High Priority', color: '#ff0000', owner_id: null, pcb_count: 1 },
    { id: 2, name: 'Needs Testing', color: '#ffaa00', owner_id: null, pcb_count: 2 },
];
