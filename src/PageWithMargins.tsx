import { NetworkQRCode } from './Pages/ViewPages/Cards/NetworkQRCode';
import { TabBar } from './components/TabBar';
import { TopButtons } from './components/TopButtons';
import { ProjectView } from './Pages/ViewPages/ProjectView';
import { PcbView } from './Pages/ViewPages/PcbView';
import { ReworkView } from './Pages/ViewPages/ReworkView';
import { UserView } from './Pages/ViewPages/UserView';
import { TabView } from './Pages/ViewPages/TabView';
import { SettingsView } from './Pages/ViewPages/SettingsView';
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
import { UrlManager } from './components/UrlManager';
import { TestBoardTypo } from './components/UrlManager/TestBoardTypo';
import { WrongUrl } from './Pages/WrongPage/WrongUrl';
import { FixedUrl } from './Pages/WrongPage/FixedUrl';
import { GithubLink } from './components/GithubLink';
import { SetupResendEmail } from './Pages/SetupResendEmail';
import { GlobalResendWarningModal, ResendTopBarBadge } from './components/GlobalResendWarningModal';

import { useAppState } from './store/useAppState';
import { useGlobalSettings } from './store/useGlobalSettings';
import { PermissionDenied } from './components/PermissionDenied';
import { useAuthStore } from './login/client';
import { LoginView } from './login/LoginView';
import { useEffect } from 'react';
import { LogOut, LogIn, User } from 'lucide-react';

export function PageWithMargins() {
  const { page, selectedId, editItem, addItem, goBack, isMobile } = useAppState();
  const { hasPermission, activeRole } = useGlobalSettings();
  const { token, owner, verifySession, logout } = useAuthStore();

  useEffect(() => {
    if (token) {
      verifySession();
    }
  }, [token, verifySession]);

  const handleSuccess = () => {
    // Refresh data and go back
    goBack();
  };

  const renderContent = () => {
    switch (page) {
      case 'projects_add': 
        if (!hasPermission('projects', 'create')) return <PermissionDenied pageLabel="Create Projects" />;
        return <AddProject onBack={goBack} onSuccess={handleSuccess} />;
      case 'pcbs_add': 
        if (!hasPermission('pcbs', 'create')) return <PermissionDenied pageLabel="Create PCBs" />;
        return <AddPCB onBack={goBack} onSuccess={handleSuccess} />;
      case 'reworks_add': 
        if (!hasPermission('reworks', 'create')) return <PermissionDenied pageLabel="Create Reworks" />;
        return <AddRework onBack={goBack} onSuccess={handleSuccess} />;
      case 'owners_add': 
        if (!hasPermission('owners', 'create')) return <PermissionDenied pageLabel="Create Owners/Users" />;
        return <AddUser onBack={goBack} onSuccess={handleSuccess} />;
      case 'tags_add': 
        if (!hasPermission('tags', 'create')) return <PermissionDenied pageLabel="Create Tags" />;
        return <AddTab onBack={goBack} onSuccess={handleSuccess} />;
      
      case 'projects_edit': 
        if (!hasPermission('projects', 'edit')) return <PermissionDenied pageLabel="Edit Projects" />;
        return <EditProject id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'pcbs_edit': 
        if (!hasPermission('pcbs', 'edit')) return <PermissionDenied pageLabel="Edit PCBs" />;
        return <EditPCB id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'reworks_edit': 
        if (!hasPermission('reworks', 'edit')) return <PermissionDenied pageLabel="Edit Reworks" />;
        return <EditRework id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'owners_edit': 
        if (!hasPermission('owners', 'edit')) return <PermissionDenied pageLabel="Edit Owners/Users" />;
        return <EditUser id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'tags_edit': 
        if (!hasPermission('tags', 'edit')) return <PermissionDenied pageLabel="Edit Tags" />;
        return <EditTab id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      
      case 'wrong_url': return <WrongUrl />;
      case 'fixed_url': return <FixedUrl />;
      case 'sandbox': return <TestBoardTypo />;
      
      case 'projects':
        if (!hasPermission('projects', 'view')) return <PermissionDenied pageLabel="Projects" />;
        return <ProjectView title="Projects" onAdd={() => addItem('projects_add')} />;
      case 'pcbs':
        if (!hasPermission('pcbs', 'view')) return <PermissionDenied pageLabel="PCBs" />;
        return <PcbView title="PCB Boards" onAdd={() => addItem('pcbs_add')} />;
      case 'reworks':
        if (!hasPermission('reworks', 'view')) return <PermissionDenied pageLabel="Reworks" />;
        return <ReworkView title="Rework History" onAdd={() => addItem('reworks_add')} />;
      case 'owners':
        if (!hasPermission('owners', 'view')) return <PermissionDenied pageLabel="Owners/Users" />;
        return <UserView title="Owners" onAdd={() => addItem('owners_add')} onEdit={(id) => editItem('owners_edit', id)} />;
      case 'tags':
        if (!hasPermission('tags', 'view')) return <PermissionDenied pageLabel="Tags" />;
        return <TabView title="Tags" onAdd={() => addItem('tags_add')} onEdit={(id) => editItem('tags_edit', id)} />;
      case 'settings':
        if (!hasPermission('settings', 'view')) return <PermissionDenied pageLabel="Settings" />;
        return <SettingsView />;
      case 'login':
        return <LoginView />;
      case 'setup_resend':
        return <SetupResendEmail />;
      default:
        if (!hasPermission('projects', 'view')) return <PermissionDenied pageLabel="Projects" />;
        return <ProjectView title="Projects" onAdd={() => addItem('projects_add')} />;
    }
  };

  if (token && !owner) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', gap: '16px', background: 'var(--bg-app)', color: 'var(--text-main)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 1s linear infinite' }}></div>
        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Restoring session...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className={`app-container ${isMobile ? 'mobile-state' : ''}`} style={{ position: 'relative' }}>
      <GlobalResendWarningModal />
      <UrlManager />
      <GithubLink />

      {/* User Login & Role Status Badge */}
      <div className="user-profile-badge" style={{ position: 'absolute', top: '16px', right: '20px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 900 }}>
        <ResendTopBarBadge />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          color: 'var(--text-main)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <User size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600 }}>
            {owner ? (
              <>
                {owner.name} <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 400 }}>({activeRole.charAt(0).toUpperCase() + activeRole.slice(1)})</span>
              </>
            ) : (
              `Guest (${activeRole.charAt(0).toUpperCase() + activeRole.slice(1)})`
            )}
          </span>
        </div>
        {owner ? (
          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--bg-panel)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <LogOut size={14} />
          </button>
        ) : (
          <button
            onClick={() => useAppState.getState().setPage('login')}
            title="Log In"
            style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--accent-glow)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--accent-glow)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--bg-panel)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <LogIn size={14} />
          </button>
        )}
      </div>

      <header className="app-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Rework Tracker</h1>
          {typeof window !== 'undefined' && window.location.hostname.includes('github.io') && (
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
