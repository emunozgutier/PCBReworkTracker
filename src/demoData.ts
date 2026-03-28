import type { Project } from './store/storeProject';
import type { Pcb } from './store/storePcb';
import type { Owner } from './store/storeOwner';
import type { Rework } from './store/storeRework';
import type { Tag } from './store/storeTag';

export const demoProjects: Project[] = [
    {
        id: 1,
        name: 'Titan',
        description: 'Saturn Moon Project',
        pcb_count: 5,
        pcbs: ['TITAN-001', 'TITAN-002', 'TITAN-003', 'TITAN-004', 'TITAN-005'],
        revisions: ['A0', 'B0', 'A1', 'C0'],
        project_key: 'TITAN',
        formfactors: [{ name: 'ATX', revisions: ['A0'] }],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 2,
        name: 'Atlas',
        description: 'Saturn Moon Project',
        pcb_count: 2,
        pcbs: ['ATLAS-001', 'ATLAS-002'],
        revisions: ['A0', 'B0', 'B1'],
        project_key: 'ATLAS',
        formfactors: [],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 3,
        name: 'Ariel',
        description: 'Uranus Moon Project',
        pcb_count: 3,
        pcbs: ['ARIEL-001', 'ARIEL-002', 'ARIEL-003'],
        revisions: ['A0', 'B0', 'C0'],
        project_key: 'ARIEL',
        formfactors: [],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 4,
        name: 'Io',
        description: 'Jupiter Moon Project',
        pcb_count: 1,
        pcbs: ['IO-001'],
        revisions: ['A0'],
        project_key: 'IO',
        formfactors: [],
        silicon_corners: 'TT'
    },
    {
        id: 5,
        name: 'Leda',
        description: 'Jupiter Moon Project',
        pcb_count: 2,
        pcbs: ['LEDA-001', 'LEDA-002'],
        revisions: ['A0', 'B0', 'A1'],
        project_key: 'LEDA',
        formfactors: [],
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
        formfactors: [],
        silicon_corners: 'TT, SS, FF'
    },
    {
        id: 7,
        name: 'Miranda',
        description: 'Uranus Moon Project',
        pcb_count: 2,
        pcbs: ['MIRANDA-001', 'MIRANDA-002'],
        revisions: ['A0', 'B0', 'A1', 'B1'],
        project_key: 'MIRANDA',
        formfactors: [],
        silicon_corners: 'TT, SS, FF'
    }
];

export const demoPcbs: Pcb[] = [
    { id: 1, board_number: 'TITAN-001', status: 'Working', project: 'Titan', owner: 'Alice', product: 'Titan - Rev A0' },
    { id: 2, board_number: 'TITAN-002', status: 'In Rework', project: 'Titan', owner: 'Bob', product: 'Titan - Rev B0' },
    { id: 3, board_number: 'ATLAS-001', status: 'Dead', project: 'Atlas', owner: 'Alice', product: 'Atlas - Rev A0' },
    { id: 4, board_number: 'IO-001', status: 'Working', project: 'Io', owner: 'Bob', product: 'Io - Rev A0' }
];

export const demoOwners: Owner[] = [
    { id: 1, name: 'Alice Smith', username: 'asmith', pcb_count: 2, rework_count: 5, tag_count: 1 },
    { id: 2, name: 'Bob Jones', username: 'bjones', pcb_count: 1, rework_count: 2, tag_count: 0 },
];

export const demoReworks: Rework[] = [
    { id: 1, pcb_id: 2, title: 'Replaced U12', description: 'Chip was overheating', timestamp: new Date().toISOString(), owner_id: 2, owner_name: 'Bob Jones', pcb_board_number: 'TITAN-002' },
];

export const demoTags: Tag[] = [
    { id: 1, name: 'High Priority', color: '#ff0000', owner_id: null, pcb_count: 1 },
    { id: 2, name: 'Needs Testing', color: '#ffaa00', owner_id: null, pcb_count: 2 },
];
