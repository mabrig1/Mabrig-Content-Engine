export default function LandingPage() {
  const templates = [
    ['Epic Performance','Arena scale, heroic camera and beat-driven coverage.'],
    ['Gospel Worship','Warm congregation energy, intimate vocals and radiant light.'],
    ['Storyteller','Narrative scenes, recurring motifs and selective performance.'],
    ['Faith & Victory','Adversity to breakthrough with cinematic escalation.'],
    ['Prophetic Fire','Prayer, scripture, atmosphere and intense close-ups.'],
    ['Afro-Cinematic','Contemporary African identity with premium global polish.'],
  ];
  return (
    <main className="publicShell">
      <nav>
        <a href="/"><b>MABRIG <span>CINEMA</span></b></a>
        <div className="navActions"><a href="/free-preview">FREE PREVIEW</a><a href="/pricing">PRICING</a><a href="/login">LOGIN</a></div>
      </nav>
      <section className="publicHero">
        <p className="eyebrow">AI FILM SCHOOL + PRODUCTION OPERATING SYSTEM</p>
        <h1>Learn cinema.<br/><em>Make the movie.</em></h1>
        <p>Cinematic Movie Masterclass combines screenplay intelligence, actor identity lock, virtual sets, scene generation, model routing, continuity, editing and agentic production in one platform.</p>
        <div className="heroCtas"><a className="generate" href="/register">START CREATING</a><a className="secondaryButton" href="/free-preview">WATCH FREE PREVIEW</a></div>
      </section>
      <section className="demoBand">
        <div><small>DEMO REEL</small><b>IDEA → SCREENPLAY → SCENE → MASTER</b><span>Preview-only public experience. Production controls unlock with membership.</span></div>
        <div className="demoFrame"><span>▶</span><p>Demo reel slot · upload the finished MABRIG CINEMA showreel when ready.</p></div>
      </section>
      <section className="output publicTemplates">
        <p className="eyebrow">DIRECTOR TEMPLATE PREVIEWS</p>
        <h2>See the visual language before you enter the workstation.</h2>
        <div className="templateGrid">{templates.map(([name,copy])=><article className="templateCard" key={name}><b>{name}</b><span>{copy}</span><small>VIEW ONLY · MEMBERS CAN LOAD INTO WORKSTATION</small></article>)}</div>
      </section>
      <section className="publicSplit">
        <div><p className="eyebrow">MASTERCLASS</p><h2>Beginner → Director → Agentic Producer</h2><p>Project-based tutorials create real production assets that flow directly into the workstation.</p></div>
        <div><p className="eyebrow">WORKSTATION</p><h2>Your virtual film crew</h2><p>Media, identity, scenes, variants, render profiles, model routing, agent runs and project history under one paid account.</p></div>
      </section>
      <footer>MABRIG CINEMA · CINEMATIC MOVIE MASTERCLASS</footer>
    </main>
  );
}
