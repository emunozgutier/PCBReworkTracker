import './App.css'
import { NetworkQRCode } from './components/NetworkQRCode'
import { TabBar } from './components/TabBar'
import { CardList } from './components/CardList'
import { AddProject } from './AddPages/AddProject'
import { AddPCB } from './AddPages/AddPcb'
import { AddUser } from './AddPages/AddUser'
import { AddRework } from './AddPages/AddRework'
import { AddTab } from './AddPages/AddTab'
import { EditProject } from './EditPages/EditProject'
import { EditPCB } from './EditPages/EditPcb'
import { EditUser } from './EditPages/EditUser'
import { EditRework } from './EditPages/EditRework'
import { EditTab } from './EditPages/EditTab'

import { useStore } from './store/useStore'

function App() {
  const { page, selectedId, editItem, addItem, goBack, isMobile } = useStore();

  const handleSuccess = () => {
    // Refresh data and go back
    goBack();
  };

  const renderContent = () => {
    switch (page) {
      case 'projects_add': return <AddProject onBack={goBack} onSuccess={handleSuccess} />;
      case 'pcbs_add': return <AddPCB onBack={goBack} onSuccess={handleSuccess} />;
      case 'reworks_add': return <AddRework onBack={goBack} onSuccess={handleSuccess} />;
      case 'owners_add': return <AddUser onBack={goBack} onSuccess={handleSuccess} />;
      case 'tags_add': return <AddTab onBack={goBack} onSuccess={handleSuccess} />;
      
      case 'projects_edit': return <EditProject id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'pcbs_edit': return <EditPCB id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'reworks_edit': return <EditRework id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'owners_edit': return <EditUser id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'tags_edit': return <EditTab id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      
      case 'projects':
        return <CardList type="projects" title="Projects" onAdd={() => addItem('projects_add')} onEdit={(id) => editItem('projects_edit', id)} />;
      case 'pcbs':
        return <CardList type="pcbs" title="PCB Boards" onAdd={() => addItem('pcbs_add')} onEdit={(id) => editItem('pcbs_edit', id)} />;
      case 'reworks':
        return <CardList type="reworks" title="Rework History" onAdd={() => addItem('reworks_add')} onEdit={(id) => editItem('reworks_edit', id)} />;
      case 'owners':
        return <CardList type="owners" title="Owners" onAdd={() => addItem('owners_add')} onEdit={(id) => editItem('owners_edit', id)} />;
      case 'tags':
        return <CardList type="tags" title="Tags" onAdd={() => addItem('tags_add')} onEdit={(id) => editItem('tags_edit', id)} />;
      default:
        return <CardList type="projects" title="Projects" onAdd={() => addItem('projects_add')} onEdit={(id) => editItem('projects_edit', id)} />;
    }
  };

  return (
    <div className={`app-container ${isMobile ? 'mobile-state' : ''}`}>
      <header className="app-header">
        <h1>PCB Rework Tracker</h1>
      </header>
      
      <TabBar />
      
      <main className="app-main">
        {renderContent()}
      </main>

      <NetworkQRCode />
    </div>
  )
}

export default App
