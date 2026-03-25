import { useState } from 'react'
import './App.css'
import { NetworkQRCode } from './components/NetworkQRCode'
import { TabBar } from './components/TabBar'
import { Dashboard } from './components/Dashboard'
import { CardList } from './components/CardList'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <CardList type="projects" title="Projects" />;
      case 'pcbs':
        return <CardList type="pcbs" title="PCB Boards" />;
      case 'reworks':
        return <CardList type="reworks" title="Rework History" />;
      case 'tags':
        return <CardList type="tags" title="Tags" />;
      default:
        return <Dashboard />;
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
