import { MASTERCLASS_MODULES } from '../../../lib/movie-masterclass';

const pathFor=(n:number)=>n<=4?'BEGINNER':n<=8?'DIRECTOR':'AGENTIC PRODUCER';

export default function TutorialsPage(){
  return (
    <main className="memberMain">
      <section className="memberHero compactHero"><p className="eyebrow">AGENTIC TUTORIALS</p><h1>Beginner → Director → Agentic Producer.</h1><p>Every module creates an asset for the film, then opens the relevant production mode in the Workstation.</p></section>
      <section className="moduleGrid memberModules">
        {MASTERCLASS_MODULES.map((m)=>(
          <article key={m.id}>
            <small>{pathFor(m.number)} · MODULE {String(m.number).padStart(2,'0')}</small>
            <h3>{m.title}</h3><p>{m.promise}</p>
            <div><b>SKILL</b><span>{m.skill}</span></div>
            <div><b>DELIVERABLE</b><span>{m.deliverable}</span></div>
            <a className="secondaryButton fullButton" href={'/masterclass/workstation?brief='+encodeURIComponent(m.promise)}>OPEN IN WORKSTATION</a>
          </article>
        ))}
      </section>
      <section className="output"><p className="eyebrow">PROGRESS & CERTIFICATES</p><h2>Progress tracking is account-based.</h2><p>Completion records are stored against the member account; certificate issuance unlocks after the required learning path is completed.</p></section>
    </main>
  );
}
