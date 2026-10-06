import { requireAdmin } from '../../lib/auth';

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="adminShell">
      <header className="memberBar adminBar">
        <a href="/studio"><b>MABRIG <span>PERSONAL STUDIO</span></b></a>
        <nav className="memberNav">
          <a href="/masterclass">Member Area</a>
          <a href="/studio">Admin</a>
          <a href="/account">{user.name}</a>
        </nav>
      </header>
      {children}
    </div>
  );
}
