import { useEffect } from 'react';
import { NetworkQRCode } from './Pages/ViewPages/Cards/NetworkQRCode';
import { TabBar } from './components/TabBar';
import { usePermissionsStore } from './store/clientDataBase/usePermissionsStore';
import { usePriorityStore } from './store/clientDataBase/usePriorityStore';
import { TopButtons } from './components/TopButtons';
import { ProjectView } from './Pages/ViewPages/ProjectView';
import { PcbView } from './Pages/ViewPages/PcbView';
import { ReworkView } from './Pages/ViewPages/ReworkView';
import { UserView } from './Pages/ViewPages/UserView';
import { TabView } from './Pages/ViewPages/TabView';
import { TopSettingPage } from './Pages/SettingPage/TopSettingPage';
import { SettingsTest } from './Pages/SettingPage/SettingsTest';
import { AddProject } from './Pages/AddPages/AddProject';
import { AddPCB } from './Pages/AddPages/AddPcb';
import { AddUser } from './Pages/AddPages/AddUser';
import { AddRework } from './Pages/AddPages/AddRework';
import { AddTab } from './Pages/AddPages/AddTab';
import { EditProject } from './Pages/EditPages/EditProject';
import { EditPCB } from './Pages/EditPages/EditPcb';
import { EditUser } from './Pages/EditPages/EditUser';
import { EditRework } from './Pages/EditPages/EditRework';
import { EditTab } from './Pages/EditPages/EditTab';
import { ResetOtp } from './Pages/EditPages/ResetOtp';
import { UrlManager } from './components/UrlManager';
import { WrongUrl } from './Pages/WrongPage/WrongUrl';
import { FixedUrl } from './Pages/WrongPage/FixedUrl';
import { GithubLink } from './components/GithubLink';

import { UserLoginButton } from './login/UserLoginButton';

import { BoardViewer } from './BoardViewer';
import { useAppState } from './store/useAppState';

export function PageWithMargins() {
  const { page, selectedId, editItem, addItem, goBack, isMobile } = useAppState();
  const fetchPermissions = usePermissionsStore(state => state.fetchPermissions);
  const fetchPriorities = usePriorityStore(state => state.fetchPriorities);

  useEffect(() => {
    fetchPermissions();
    fetchPriorities();
  }, [fetchPermissions, fetchPriorities]);

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
      
      case 'wrong_url': return <WrongUrl />;
      case 'fixed_url': return <FixedUrl />;
      case 'reset_otp': {
        const searchParams = new URLSearchParams(window.location.search);
        const resetToken = searchParams.get('token');
        return <ResetOtp token={resetToken} onBack={goBack} />;
      }
      
      case 'projects':
        return <ProjectView title="Projects" onAdd={() => addItem('projects_add')} />;
      case 'pcbs':
        return <PcbView title="PCB Boards" onAdd={() => addItem('pcbs_add')} />;
      case 'reworks':
        return <ReworkView title="Rework History" onAdd={() => addItem('reworks_add')} />;
      case 'owners':
        return <UserView title="Owners" onAdd={() => addItem('owners_add')} onEdit={(id) => editItem('owners_edit', id)} />;
      case 'tags':
        return <TabView title="Tags" onAdd={() => addItem('tags_add')} onEdit={(id) => editItem('tags_edit', id)} />;
      case 'settings':
        return <TopSettingPage />;
      case 'settings_test':
        return <SettingsTest onBack={goBack} />;
      case 'board_viewer':
        return <BoardViewer docId={selectedId!} onBack={goBack} />;
      default:
        return <ProjectView title="Projects" onAdd={() => addItem('projects_add')} />;
    }
  };

  const isDemoMode = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  const appTitle = isDemoMode ? 'Demo Tracker' : 'Rework Tracker';

  return (
    <div className={`app-container ${isMobile ? 'mobile-state' : ''}`} style={{ position: 'relative' }}>
      <GithubLink />
      <UrlManager />
      
      <header className="app-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center', padding: '16px 20px', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>{appTitle}</h1>
          {isDemoMode && (
            <div 
              className="demo-indicator"
              title="Running in Demo Data Mode"
              style={{
                background: 'var(--accent)',
                color: 'var(--bg-panel)',
                border: '1px solid var(--accent)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              DEMO MODE
            </div>
          )}
        </div>
        <UserLoginButton />
      </header>
      
      <TabBar />
      {['projects', 'pcbs', 'reworks', 'owners', 'tags', 'settings'].includes(page) && <TopButtons />}
      
      <main className="app-main">
        {renderContent()}
      </main>

      <NetworkQRCode />
    </div>
  );
}
