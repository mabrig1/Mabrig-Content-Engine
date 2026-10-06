import { requirePaidMember } from '../../lib/auth';

export default async function MasterclassLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePaidMember();
  return (
    <div className="memberShell">
      <header className="memberBar">
        <a href="/masterclass"><b>MABRIG <span>CINEMA</span></b></a>
        <nav className="memberNav">
          <a href="/masterclass/pro-film-lab">Pro Film Lab</a>
          <a href="/masterclass/storyboard-studio">Storyboard Studio</a>
          <a href="/masterclass/workstation">Workstation</a>
          <a href="/masterclass/tutorials">Tutorials</a>
          <a href="/masterclass/library">Prompts & Templates</a>
          <a href="/masterclass/tools">100 AI Tools</a>
          <a href="/masterclass/agents">Agentic Worker</a>
          <a href="/account">{user.name}</a>
        </nav>
      </header>
      {children}
    </div>
  );
}
