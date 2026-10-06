export default function MasterclassHome() {
  const areas = [
    ['PRO','Professional Film OS','Shot tables, continuity graph, debate/judge departments, selective reruns, floor plans and NLE exports.','/masterclass/pro-film-lab'],
    ['II','Workstation Playground','Media, identity, production controls, scene timeline, variants, render profiles and cloud projects.','/masterclass/workstation'],
    ['III','Agentic Tutorials','Beginner → Director → Agentic Producer. Lessons open directly inside the workstation.','/masterclass/tutorials'],
    ['IV','Prompts & Templates','Director templates plus camera, lighting, lip-sync and continuity prompt packs.','/masterclass/library'],
    ['V','100 Free AI Video Tools','Searchable production directory feeding the Video Wallet and Router.','/masterclass/tools'],
    ['VI','Agentic Worker AI','Mission Control, autonomous production jobs, run history and quota status.','/masterclass/agents'],
    ['FILM OS','Cinematic Movie Builder','Screenplay AI, actor identity, virtual sets and one-click scene packaging.','/masterclass/workstation/movie'],
  ];
  return (
    <main className="memberMain">
      <section className="memberHero">
        <p className="eyebrow">PAID MEMBER WORKSPACE</p>
        <h1>Cinematic Movie <em>Masterclass.</em></h1>
        <p>Learn filmmaking, compile professional shot plans, direct an AI crew, route generation, preserve continuity and finish in real post-production workflows.</p>
      </section>
      <section className="memberGrid">
        {areas.map(([num,title,copy,href])=>(
          <a className="memberCard" href={href} key={title}>
            <small>{num}</small><h2>{title}</h2><p>{copy}</p><b>OPEN →</b>
          </a>
        ))}
      </section>
    </main>
  );
}
