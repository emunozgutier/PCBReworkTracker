const fs = require('fs');

function updateAddRework(file) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. imports
    content = content.replace(
        "import { useOwnerStore } from '../store/storeOwner';",
        "import { useOwnerStore } from '../store/storeOwner';\nimport { FormGroup } from '../forms/FormGroup';"
    );

    // 2. state
    const stateAnchor = "const [images, setImages] = useState<File[]>([]);";
    const stateAdd = `
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedRevision, setSelectedRevision] = useState('');
    const [siliconVersion, setSiliconVersion] = useState('');
    const [noPartYet, setNoPartYet] = useState(false);
`;
    content = content.replace(stateAnchor, stateAnchor + stateAdd);

    // 3. fetch
    const fetchAnchor = `    useEffect(() => {
        fetchOwners();
        fetch(\`\$\{API_BASE\}/pcbs\`)
            .then(res => res.json())
            .then(data => {
                setPcbs(data);
                if (selectedId) {
                    setSelectedPcb(selectedId.toString());
                } else if (data.length > 0) {
                    setSelectedPcb(data[0].id.toString());
                }
            })
            .catch(err => console.error('Failed to fetch PCBs:', err));
    }, []);`;
    const fetchReplace = `    useEffect(() => {
        fetchOwners();
        Promise.all([
            fetch(\`\$\{API_BASE\}/pcbs\`).then(res => res.json()),
            fetch(\`\$\{API_BASE\}/projects\`).then(res => res.json())
        ])
        .then(([data, projData]) => {
            setPcbs(data);
            setProjects(projData);
            if (selectedId) {
                setSelectedPcb(selectedId.toString());
            } else if (data.length > 0) {
                setSelectedPcb(data[0].id.toString());
            }
        })
        .catch(err => console.error('Failed to fetch:', err));
    }, []);

    const activePcb = pcbs.find(p => p.id.toString() === selectedPcb);
    const selectedProjData = projects.find(p => p.id === activePcb?.project_id);
    const availableSiliconVersions = selectedProjData?.silicon_corners ? selectedProjData.silicon_corners.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const availableSiliconRevisions = selectedProjData?.revisions || [];
`;
    content = content.replace(fetchAnchor, fetchReplace);

    // 4. handleSubmit
    const submitAnchor = "formData.append('rework_type', reworkType);";
    const submitReplace = `formData.append('rework_type', reworkType);
        
        if (reworkType === 'Silicon Swap' && activePcb && selectedProjData) {
            let rawProduct = activePcb.product || '';
            let foundFormfactor = '';
            let finalPcbRev = '';

            if (selectedProjData.formfactors && selectedProjData.formfactors.length > 0) {
                for (const ff of selectedProjData.formfactors) {
                    if (rawProduct.startsWith(ff.name)) {
                        foundFormfactor = ff.name;
                        rawProduct = rawProduct.slice(ff.name.length).trim();
                        for (const rev of ff.revisions) {
                            if (rawProduct.startsWith(rev)) {
                                finalPcbRev = rev;
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            if (!foundFormfactor && selectedProjData.revisions) {
                 // if no formfactor, just fallback
                 finalPcbRev = '';
            }

            const cornerPart = noPartYet ? "" : siliconVersion;
            const revPart = noPartYet ? "No part yet" : (selectedRevision ? selectedRevision : '');
            const new_product = [foundFormfactor, finalPcbRev, revPart, cornerPart].filter(Boolean).join(' ').trim();
            formData.append('new_product', new_product);
        }`;
    content = content.replace(submitAnchor, submitReplace);

    // 5. JSX
    const jsxAnchor = `<div className="form-group">
                    <label htmlFor="rework_type">Rework Type</label>
                    <select id="rework_type" value={reworkType} onChange={(e) => setReworkType(e.target.value)}>
                        <option value="Minor">Minor</option>
                        <option value="Major">Major</option>
                        <option value="Silicon Swap">Silicon Swap</option>
                    </select>
                </div>`;
    
    const jsxReplace = jsxAnchor + `
                {reworkType === 'Silicon Swap' && (
                    <FormGroup title="New Silicon Data">
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label htmlFor="revision">Rev</label>
                                <select 
                                    id="revision"
                                    value={selectedRevision}
                                    onChange={(e) => setSelectedRevision(e.target.value)} disabled={noPartYet}
                                >
                                    <option value="">N/A</option>
                                    {availableSiliconRevisions.map((rev: string) => (
                                        <option key={rev} value={rev}>{rev}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex-1">
                                <label htmlFor="silicon_version">Corner</label>
                                <select 
                                    id="silicon_version"
                                    value={siliconVersion}
                                    onChange={(e) => setSiliconVersion(e.target.value)} disabled={noPartYet}
                                >
                                    <option value="">N/A</option>
                                    {availableSiliconVersions.map((v: string) => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <input 
                                    type="checkbox" 
                                    checked={noPartYet} 
                                    onChange={(e) => {
                                        setNoPartYet(e.target.checked);
                                        if (e.target.checked) {
                                            setSelectedRevision('');
                                            setSiliconVersion('');
                                        }
                                    }} 
                                />
                                No part yet
                            </label>
                        </div>
                    </FormGroup>
                )}`;
    
    content = content.replace(jsxAnchor, jsxReplace);
    fs.writeFileSync(file, content);
}

// EditRework is similar but doesn't use FormData (it sends JSON)
function updateEditRework(file) {
    let content = fs.readFileSync(file, 'utf8');

    content = content.replace(
        "import { useOwnerStore } from '../store/storeOwner';",
        "import { useOwnerStore } from '../store/storeOwner';\nimport { FormGroup } from '../forms/FormGroup';"
    );

    const stateAnchor = "const [reworkType, setReworkType] = useState('Minor');";
    const stateAdd = `
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedRevision, setSelectedRevision] = useState('');
    const [siliconVersion, setSiliconVersion] = useState('');
    const [noPartYet, setNoPartYet] = useState(false);
`;
    content = content.replace(stateAnchor, stateAnchor + stateAdd);

    const fetchAnchor = `        Promise.all([
            fetch(\`\$\{API_BASE\}/pcbs\`).then(res => res.json()),
            fetch(\`\$\{API_BASE\}/reworks/\$\{id\}\`).then(res => res.json())
        ]).then(([pcbData, rework]) => {
            setPcbs(pcbData);`;
            
    const fetchReplace = `        Promise.all([
            fetch(\`\$\{API_BASE\}/pcbs\`).then(res => res.json()),
            fetch(\`\$\{API_BASE\}/reworks/\$\{id\}\`).then(res => res.json()),
            fetch(\`\$\{API_BASE\}/projects\`).then(res => res.json())
        ]).then(([pcbData, rework, projData]) => {
            setPcbs(pcbData);
            setProjects(projData);`;
    content = content.replace(fetchAnchor, fetchReplace);

    const activeHooksAnchor = `    }, [id]);`;
    const activeHooksReplace = `    }, [id]);

    const activePcb = pcbs.find(p => p.id.toString() === selectedPcb);
    const selectedProjData = projects.find(p => p.id === activePcb?.project_id);
    const availableSiliconVersions = selectedProjData?.silicon_corners ? selectedProjData.silicon_corners.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const availableSiliconRevisions = selectedProjData?.revisions || [];
`;
    content = content.replace(activeHooksAnchor, activeHooksReplace);

    const submitAnchor = `        const success = await updateRework(id, {
            pcb_id: selectedPcb ? parseInt(selectedPcb) : null,
            title,
            description,
            owner_id: ownerId,
            rework_type: reworkType
        });`;
        
    const submitReplace = `        let new_product = undefined;
        if (reworkType === 'Silicon Swap' && activePcb && selectedProjData) {
            let rawProduct = activePcb.product || '';
            let foundFormfactor = '';
            let finalPcbRev = '';

            if (selectedProjData.formfactors && selectedProjData.formfactors.length > 0) {
                for (const ff of selectedProjData.formfactors) {
                    if (rawProduct.startsWith(ff.name)) {
                        foundFormfactor = ff.name;
                        rawProduct = rawProduct.slice(ff.name.length).trim();
                        for (const rev of ff.revisions) {
                            if (rawProduct.startsWith(rev)) {
                                finalPcbRev = rev;
                                break;
                            }
                        }
                        break;
                    }
                }
            }

            const cornerPart = noPartYet ? "" : siliconVersion;
            const revPart = noPartYet ? "No part yet" : (selectedRevision ? selectedRevision : '');
            new_product = [foundFormfactor, finalPcbRev, revPart, cornerPart].filter(Boolean).join(' ').trim();
        }

        const success = await updateRework(id, {
            pcb_id: selectedPcb ? parseInt(selectedPcb) : null,
            title,
            description,
            owner_id: ownerId,
            rework_type: reworkType,
            new_product
        });`;
    content = content.replace(submitAnchor, submitReplace);

    const jsxAnchor = `<div className="form-group">
                    <label htmlFor="rework_type">Rework Type</label>
                    <select id="rework_type" value={reworkType} onChange={(e) => setReworkType(e.target.value)}>
                        <option value="Minor">Minor</option>
                        <option value="Major">Major</option>
                        <option value="Silicon Swap">Silicon Swap</option>
                    </select>
                </div>`;
                
    const jsxReplace = jsxAnchor + `
                {reworkType === 'Silicon Swap' && (
                    <FormGroup title="New Silicon Data">
                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label htmlFor="revision">Rev</label>
                                <select 
                                    id="revision"
                                    value={selectedRevision}
                                    onChange={(e) => setSelectedRevision(e.target.value)} disabled={noPartYet}
                                >
                                    <option value="">N/A</option>
                                    {availableSiliconRevisions.map((rev: string) => (
                                        <option key={rev} value={rev}>{rev}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex-1">
                                <label htmlFor="silicon_version">Corner</label>
                                <select 
                                    id="silicon_version"
                                    value={siliconVersion}
                                    onChange={(e) => setSiliconVersion(e.target.value)} disabled={noPartYet}
                                >
                                    <option value="">N/A</option>
                                    {availableSiliconVersions.map((v: string) => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal', fontSize: '1rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <input 
                                    type="checkbox" 
                                    checked={noPartYet} 
                                    onChange={(e) => {
                                        setNoPartYet(e.target.checked);
                                        if (e.target.checked) {
                                            setSelectedRevision('');
                                            setSiliconVersion('');
                                        }
                                    }} 
                                />
                                No part yet
                            </label>
                        </div>
                    </FormGroup>
                )}`;
    
    content = content.replace(jsxAnchor, jsxReplace);
    fs.writeFileSync(file, content);
}

updateAddRework('src/AddPages/AddRework.tsx');
updateEditRework('src/EditPages/EditRework.tsx');
