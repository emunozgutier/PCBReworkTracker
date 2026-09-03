import { useEffect, lazy, Suspense } from 'react';
import { NetworkQRCode } from './Pages/ViewPages/Cards/NetworkQRCode';
import { TabBar } from './components/TabBar';
import { usePermissionsStore } from './store/clientDataBase/usePermissionsStore';
import { usePriorityStore } from './store/clientDataBase/usePriorityStore';
import { TopButtons } from './components/TopButtons';
import { UrlManager } from './components/UrlManager';
import { TitleBar } from './components/TitleBar';
import { useAppState } from './store/useAppState';

// ── Always-loaded (core views shown on first paint) ───────────────────────────
import { ProjectView } from './Pages/ViewPages/ProjectView';
import { PcbView } from './Pages/ViewPages/PcbView';
import { ReworkView } from './Pages/ViewPages/ReworkView';
import { UserView } from './Pages/ViewPages/UserView';
import { TabView } from './Pages/ViewPages/TabView';

// ── Lazily-loaded chunks ──────────────────────────────────────────────────────
// Board viewer — contains the entire Allegro BRD parser (largest chunk)
const BoardViewer = lazy(() =>
  import('./Pages/BoardViewer').then(m => ({ default: m.BoardViewer }))
);

// PDF / Doc viewer
const DocViewer = lazy(() =>
  import('./DocViewer').then(m => ({ default: m.DocViewer }))
);

// Settings pages
const TopSettingPage = lazy(() =>
  import('./Pages/SettingPage/TopSettingPage').then(m => ({ default: m.TopSettingPage }))
);
const SettingsTest = lazy(() =>
  import('./Pages/SettingPage/SettingsTest').then(m => ({ default: m.SettingsTest }))
);
const SettingsSecrets = lazy(() =>
  import('./Pages/SettingPage/SettingsSecrets').then(m => ({ default: m.SettingsSecrets }))
);
const QrPrintPage = lazy(() =>
  import('./Pages/SettingPage/QrPrintPage').then(m => ({ default: m.QrPrintPage }))
);

// Add / Edit forms (rarely on the critical path)
const AddProject  = lazy(() => import('./Pages/AddPages/AddProject').then(m => ({ default: m.AddProject })));
const AddPCB      = lazy(() => import('./Pages/AddPages/AddPcb').then(m => ({ default: m.AddPCB })));
const AddUser     = lazy(() => import('./Pages/AddPages/AddUser').then(m => ({ default: m.AddUser })));
const AddRework   = lazy(() => import('./Pages/AddPages/AddRework').then(m => ({ default: m.AddRework })));
const AddTab      = lazy(() => import('./Pages/AddPages/AddTab').then(m => ({ default: m.AddTab })));

const EditProject = lazy(() => import('./Pages/EditPages/EditProject').then(m => ({ default: m.EditProject })));
const EditPCB     = lazy(() => import('./Pages/EditPages/EditPcb').then(m => ({ default: m.EditPCB })));
const EditUser    = lazy(() => import('./Pages/EditPages/EditUser').then(m => ({ default: m.EditUser })));
const EditRework  = lazy(() => import('./Pages/EditPages/EditRework').then(m => ({ default: m.EditRework })));
const EditTab     = lazy(() => import('./Pages/EditPages/EditTab').then(m => ({ default: m.EditTab })));
const ResetOtp    = lazy(() => import('./Pages/EditPages/ResetOtp').then(m => ({ default: m.ResetOtp })));

// Error/utility pages
const WrongUrl = lazy(() => import('./Pages/WrongPage/WrongUrl').then(m => ({ default: m.WrongUrl })));
const FixedUrl = lazy(() => import('./Pages/WrongPage/FixedUrl').then(m => ({ default: m.FixedUrl })));

// ── Fallback shown while a lazy chunk is loading ──────────────────────────────
function PageLoader() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
      Loading…
    </div>
  );
}

export function PageWithMargins() {
  const { page, selectedId, editItem, addItem, goBack, isMobile } = useAppState();
  const fetchPermissions = usePermissionsStore(state => state.fetchPermissions);
  const fetchPriorities  = usePriorityStore(state => state.fetchPriorities);

  useEffect(() => {
    fetchPermissions();
    fetchPriorities();
  }, [fetchPermissions, fetchPriorities]);

  // Lock body overflow when BoardViewer or DocViewer is active to prevent window scrolling
  useEffect(() => {
    if (page === 'board_viewer' || page === 'doc_viewer') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [page]);

  const handleSuccess = () => {
    goBack();
  };

  const renderContent = () => {
    switch (page) {
      // ── Add forms ──────────────────────────────────────────────────────────
      case 'projects_add': return <AddProject onBack={goBack} onSuccess={handleSuccess} />;
      case 'pcbs_add':     return <AddPCB     onBack={goBack} onSuccess={handleSuccess} />;
      case 'reworks_add':  return <AddRework  onBack={goBack} onSuccess={handleSuccess} />;
      case 'owners_add':   return <AddUser    onBack={goBack} onSuccess={handleSuccess} />;
      case 'tags_add':     return <AddTab     onBack={goBack} onSuccess={handleSuccess} />;

      // ── Edit forms ─────────────────────────────────────────────────────────
      case 'projects_edit': return <EditProject id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'pcbs_edit':     return <EditPCB     id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'reworks_edit':  return <EditRework  id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'owners_edit':   return <EditUser    id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;
      case 'tags_edit':     return <EditTab     id={selectedId!} onBack={goBack} onSuccess={handleSuccess} />;

      // ── Utility pages ──────────────────────────────────────────────────────
      case 'wrong_url': return <WrongUrl />;
      case 'fixed_url': return <FixedUrl />;
      case 'reset_otp': {
        const searchParams = new URLSearchParams(window.location.search);
        const resetToken = searchParams.get('token');
        return <ResetOtp token={resetToken} onBack={goBack} />;
      }

      // ── Main views ─────────────────────────────────────────────────────────
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
      case 'settings_secrets':
        return <SettingsSecrets onBack={goBack} />;
      case 'settings_qr_print':
        return <QrPrintPage onBack={goBack} />;

      // ── Heavy viewers ──────────────────────────────────────────────────────
      case 'board_viewer':
        return <BoardViewer docId={selectedId!} onBack={goBack} />;
      case 'doc_viewer':
        return <DocViewer docId={selectedId!} onBack={goBack} />;

      default:
        return <ProjectView title="Projects" onAdd={() => addItem('projects_add')} />;
    }
  };

  const isViewerActive = page === 'board_viewer' || page === 'doc_viewer';

  return (
    <div className={`app-container ${isMobile ? 'mobile-state' : ''} ${isViewerActive ? 'board-viewer-active' : ''}`} style={{ position: 'relative' }}>
      {!isViewerActive && <TitleBar />}
      <UrlManager />

      {!isViewerActive && <TabBar />}
      {['projects', 'pcbs', 'reworks', 'owners', 'tags', 'settings'].includes(page) && <TopButtons />}

      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
          {renderContent()}
        </Suspense>
      </main>

      <NetworkQRCode />
    </div>
  );
}
