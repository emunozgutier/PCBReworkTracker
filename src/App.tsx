import { useState } from 'react'
import './App.css'
import { NetworkQRCode } from './components/NetworkQRCode'
import { TabBar } from './components/TabBar'
import { CardList } from './components/CardList'
import { AddProject } from './add_pages/add_project'
import { AddPCB } from './add_pages/add_pcb'
import { AddUser } from './add_pages/add_user'
import { AddRework } from './add_pages/add_rework'
import { AddTab } from './add_pages/add_tab'

function App() {
  const [activeTab, setActiveTab] = useState('projects');
  const [isAdding, setIsAdding] = useState(false);

  const handleBack = () => setIsAdding(false);
  const handleSuccess = () => {
    setIsAdding(false);
    // Data will re-fetch automatically when CardList remounts or we can add a key refresh
  };

  const renderContent = () => {
    if (isAdding) {
      switch (activeTab) {
        case 'projects': return <AddProject onBack={handleBack} onSuccess={handleSuccess} />;
        case 'pcbs': return <AddPCB onBack={handleBack} onSuccess={handleSuccess} />;
        case 'reworks': return <AddRework onBack={handleBack} onSuccess={handleSuccess} />;
        case 'owners': return <AddUser onBack={handleBack} onSuccess={handleSuccess} />;
        case 'tags': return <AddTab onBack={handleBack} onSuccess={handleSuccess} />;
        default: return <AddProject onBack={handleBack} onSuccess={handleSuccess} />;
      }
    }

    switch (activeTab) {
      case 'projects':
        return <CardList type="projects" title="Projects" onAdd={() => setIsAdding(true)} />;
      case 'pcbs':
        return <CardList type="pcbs" title="PCB Boards" onAdd={() => setIsAdding(true)} />;
      case 'reworks':
        return <CardList type="reworks" title="Rework History" onAdd={() => setIsAdding(true)} />;
      case 'owners':
        return <CardList type="owners" title="Owners" onAdd={() => setIsAdding(true)} />;
      case 'tags':
        return <CardList type="tags" title="Tags" onAdd={() => setIsAdding(true)} />;
      default:
        return <CardList type="projects" title="Projects" onAdd={() => setIsAdding(true)} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>PCB Rework Tracker</h1>
      </header>
      
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="app-main">
        {renderContent()}
      </main>

      <NetworkQRCode />
    </div>
  )
}

export default App
