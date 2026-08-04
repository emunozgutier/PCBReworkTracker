import { GithubLink } from './GithubLink';
import { UserLoginButton } from '../login/UserLoginButton';

export function TitleBar() {
  const isDemoMode = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  const appTitle = isDemoMode ? 'Demo Tracker' : 'Rework Tracker';

  return (
    <>
      <GithubLink />
      <header className="app-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', alignItems: 'center', padding: '16px 20px', textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>{appTitle}</h1>
        </div>
        <UserLoginButton />
      </header>
    </>
  );
}
