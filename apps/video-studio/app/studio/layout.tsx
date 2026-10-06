import { requireAdmin } from '../../lib/auth';

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="adminShell">
      <link rel="stylesheet" href="/owner.css" />
      <header className="memberBar adminBar ownerTopbar">
        <a href="/studio"><b>MABRIG <span>OWNER STUDIO</span></b></a>
        <nav className="memberNav">
          <a href="/studio">Command</a>
          <a href="/masterclass/pro-film-lab">Pro Film OS</a>
          <a href="/masterclass/storyboard-studio">Storyboard</a>
          <a href="/masterclass/workstation">Workstation</a>
          <a href="/studio/members">Members</a>
          <a href="/studio/content">CMS</a>
          <a href="/account">{user.name}</a>
        </nav>
      </header>
      {children}
    </div>
  );
}
