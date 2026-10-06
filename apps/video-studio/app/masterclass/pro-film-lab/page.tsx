'use client';

import { useMemo, useState } from 'react';
import type { FilmBlueprint, FilmProjectInput, MovieGenre } from '../../../lib/movie-masterclass';
import {
  CINEMA_KNOWLEDGE,
  type DebateResult,
  type ProfessionalFilmPackage,
  type ProfessionalShot,
} from '../../../lib/pro-film-os';

const genres: MovieGenre[] = [
  'Faith Epic','Drama','Thriller','Action','Sci-Fi','Romance','Historical','Documentary','Afro-Futurist'
];

const visualDNA = [
  'Afro-cinematic prestige · rich skin tones · anamorphic highlights · controlled film grain',
  'Hollywood epic realism · monumental natural light · premium production design',
  'Neo-noir thriller · rain reflections · practical neon · deep contrast',
  'Warm faith drama · sunrise gold · intimate faces · luminous atmosphere',
  'Afro-futurist world · tactile technology · bold architecture · cinematic scale',
];

export default function ProFilmLabPage() {
  const [input, setInput] = useState<FilmProjectInput>({
    title: 'THE CALL',
    logline: 'A visionary builder must turn private conviction into public service before repeated failure convinces him to abandon the assignment.',
    genre: 'Faith Epic',
    durationMinutes: 3,
    audience: 'Global faith, purpose and innovation audience',
    visualStyle: visualDNA[0],
    protagonist: 'A focused Nigerian visionary, builder and revivalist',
    conflict: 'limited resources, repeated failure and pressure to abandon the assignment',
    ending: 'He chooses service over recognition and builds what the next generation needs.',
    aspectRatio: '2.39:1',
  });
  const [blueprint, setBlueprint] = useState<FilmBlueprint | null>(null);
  const [film, setFilm] = useState<ProfessionalFilmPackage | null>(null);
  const [previousShots, setPreviousShots] = useState<ProfessionalShot[]>([]);
  const [selectedShot, setSelectedShot] = useState<ProfessionalShot | null>(null);
  const [debate, setDebate] = useState<DebateResult | null>(null);
  const [debateSource, setDebateSource] = useState('');
  const [knowledgeQuery, setKnowledgeQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [debating, setDebating] = useState(false);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<'shots'|'graph'|'knowledge'>('shots');

  const knowledge = useMemo(() => {
    const q = knowledgeQuery.trim().toLowerCase();
    if (!q) return CINEMA_KNOWLEDGE;
    return CINEMA_KNOWLEDGE.filter((card) =>
      [card.title, card.department, card.principle, card.failureMode, card.correctiveAction, card.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [knowledgeQuery]);

  function set<K extends keyof FilmProjectInput>(key: K, value: FilmProjectInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function compile() {
    setBusy(true);
    setNotice('');
    setDebate(null);
    try {
      const blueprintResponse = await fetch('/api/masterclass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const blueprintPayload = await blueprintResponse.json();
      if (!blueprintResponse.ok) throw new Error(blueprintPayload?.error || 'Blueprint failed.');
      const nextBlueprint = blueprintPayload.blueprint as FilmBlueprint;

      const compileResponse = await fetch('/api/cinema-os/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprint: nextBlueprint,
          previousShots,
        }),
      });
      const compilePayload = await compileResponse.json();
      if (!compileResponse.ok) throw new Error(compilePayload?.error || 'Film OS compilation failed.');

      setBlueprint(nextBlueprint);
      setFilm(compilePayload.professional);
      setPreviousShots(compilePayload.professional.shots);
      setSelectedShot(compilePayload.professional.shots[0] || null);
      const hits = compilePayload.professional.shots.filter((shot: ProfessionalShot) => shot.cacheState === 'hit').length;
      const dirty = compilePayload.professional.rerunQueue.length;
      setNotice(
        previousShots.length
          ? `Recompiled: ${hits} shots reused from cache; ${dirty} shot nodes need generation or rerun.`
          : `Professional package compiled: ${compilePayload.professional.shots.length} shots across ${nextBlueprint.scenes.length} scenes.`,
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Compilation failed.');
    } finally {
      setBusy(false);
    }
  }

  async function runDebate(shot: ProfessionalShot) {
    setSelectedShot(shot);
    setDebating(true);
    setNotice('');
    try {
      const response = await fetch('/api/cinema-os/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shot }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Department debate failed.');
      setDebate(payload.debate);
      setDebateSource(payload.source || 'film-os');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Department debate failed.');
    } finally {
      setDebating(false);
    }
  }

  function download(name: string, content: string, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="memberMain proLab">
      <section className="memberHero">
        <p className="eyebrow">MABRIG CINEMA OS · PROFESSIONAL FILM LAB</p>
        <h1>From AI prompts to a <em>shootable film plan.</em></h1>
        <p>
          Professional shot tables, continuity state, last-frame chaining, edit-aware coverage,
          debate-and-judge agents, selective reruns and exports into real post-production workflows.
        </p>
      </section>

      <section className="benchmarkStrip">
        <div><b>KNOWLEDGE ENGINE</b><span>Film principles actively drive shot decisions.</span></div>
        <div><b>DEBATE / JUDGE</b><span>Director, camera, continuity and edit departments challenge each shot.</span></div>
        <div><b>CONTINUITY GRAPH</b><span>Identity, wardrobe, props, eyelines and frames inherit forward.</span></div>
        <div><b>NLE EXPORT</b><span>EDL, FCPXML and CSV shot tables leave the platform cleanly.</span></div>
      </section>

      <section className="mcGrid proInputs">
        <div className="panel">
          <h2>01 · GREENLIGHT</h2>
          <label>Film title</label>
          <input value={input.title} onChange={(e) => set('title', e.target.value)} />
          <label>Logline</label>
          <textarea value={input.logline} onChange={(e) => set('logline', e.target.value)} />
          <div className="twoCol">
            <div>
              <label>Genre</label>
              <select value={input.genre} onChange={(e) => set('genre', e.target.value as MovieGenre)}>
                {genres.map((genre) => <option key={genre}>{genre}</option>)}
              </select>
            </div>
            <div>
              <label>Length</label>
              <select value={input.durationMinutes} onChange={(e) => set('durationMinutes', Number(e.target.value))}>
                <option value={1}>60 sec</option>
                <option value={3}>3 min</option>
                <option value={8}>8 min</option>
                <option value={12}>12 min</option>
                <option value={30}>30 min</option>
                <option value={90}>90 min blueprint</option>
              </select>
            </div>
          </div>
          <label>Visual DNA</label>
          <select value={input.visualStyle} onChange={(e) => set('visualStyle', e.target.value)}>
            {visualDNA.map((style) => <option key={style}>{style}</option>)}
          </select>
        </div>

        <div className="panel">
          <h2>02 · DRAMA ENGINE</h2>
          <label>Protagonist</label>
          <textarea value={input.protagonist} onChange={(e) => set('protagonist', e.target.value)} />
          <label>Opposition</label>
          <textarea value={input.conflict} onChange={(e) => set('conflict', e.target.value)} />
          <label>Transformation</label>
          <textarea value={input.ending} onChange={(e) => set('ending', e.target.value)} />
          <button className="generate" onClick={compile} disabled={busy}>
            {busy ? 'Compiling professional production graph…' : '✦ COMPILE PROFESSIONAL FILM OS'}
          </button>
          <small className="hint">
            Recompile after a change. Unchanged shot nodes become cache hits; only dirty dependencies enter the rerun queue.
          </small>
          {notice && <div className="render"><b>Film OS</b><span>{notice}</span></div>}
        </div>
      </section>

      {film && blueprint && (
        <>
          <section className="proStats">
            <div><strong>{blueprint.scenes.length}</strong><span>dramatic scenes</span></div>
            <div><strong>{film.shots.length}</strong><span>professional shots</span></div>
            <div><strong>{film.shots.filter((shot) => shot.cacheState === 'hit').length}</strong><span>cache hits</span></div>
            <div><strong>{film.rerunQueue.length}</strong><span>rerun nodes</span></div>
            <div><strong>{film.knowledgeCoverage.length}</strong><span>knowledge rules active</span></div>
          </section>

          <section className="proToolbar">
            <div>
              <button className={view === 'shots' ? 'on' : ''} onClick={() => setView('shots')}>SHOT TABLE</button>
              <button className={view === 'graph' ? 'on' : ''} onClick={() => setView('graph')}>CONTINUITY GRAPH</button>
              <button className={view === 'knowledge' ? 'on' : ''} onClick={() => setView('knowledge')}>KNOWLEDGE ENGINE</button>
            </div>
            <div className="exportButtons">
              <button onClick={() => download(`${film.title}-shot-list.csv`, film.exports.csv, 'text/csv')}>CSV SHOT LIST</button>
              <button onClick={() => download(`${film.title}.edl`, film.exports.edl)}>EDL</button>
              <button onClick={() => download(`${film.title}.fcpxml`, film.exports.fcpxml, 'application/xml')}>FCPXML</button>
            </div>
          </section>

          {view === 'shots' && (
            <section className="professionalShotTable">
              <div className="shotTableHeader">
                <span>SHOT</span><span>SIZE / LENS</span><span>CAMERA</span><span>PURPOSE</span><span>HANDOFF</span><span>STATE</span><span>REVIEW</span>
              </div>
              {film.shots.map((shot) => (
                <div className={`shotTableRow ${selectedShot?.id === shot.id ? 'selected' : ''}`} key={shot.id}>
                  <button className="shotId" onClick={() => setSelectedShot(shot)}>{shot.id}</button>
                  <span>{shot.shotSize} · {shot.lensMm}mm</span>
                  <span>{shot.movement}<small>{shot.axis}</small></span>
                  <span>{shot.purpose}</span>
                  <span>{shot.firstFrameSource}</span>
                  <span className={`cacheState ${shot.cacheState}`}>{shot.cacheState}</span>
                  <button onClick={() => runDebate(shot)} disabled={debating}>
                    {debating && selectedShot?.id === shot.id ? 'DEBATING…' : 'DEBATE / JUDGE'}
                  </button>
                </div>
              ))}
            </section>
          )}

          {view === 'graph' && (
            <section className="continuityBoard">
              <div className="continuityColumn">
                <p className="eyebrow">DEPENDENCY GRAPH</p>
                {film.continuityGraph.map((edge, index) => (
                  <div className="graphNode" key={edge.to}>
                    <small>{String(index + 1).padStart(2, '0')}</small>
                    <b>{edge.to}</b>
                    <span>{edge.from ? `inherits from ${edge.from}` : 'root reference package'}</span>
                    <p>{edge.firstFrameStrategy}</p>
                    <em>{edge.transfer.join(' · ')}</em>
                  </div>
                ))}
              </div>
              <div className="continuityColumn">
                <p className="eyebrow">SELECTED SHOT FLOOR PLAN</p>
                {selectedShot ? (
                  <>
                    <div className="floorPlan">
                      <div className="axisLine" />
                      <div
                        className="subjectMark"
                        style={{ left: `${selectedShot.floorPlan.subjectX}%`, top: `${selectedShot.floorPlan.subjectY}%` }}
                      >ACTOR</div>
                      <div
                        className="cameraMark"
                        style={{ left: `${selectedShot.floorPlan.cameraX}%`, top: `${selectedShot.floorPlan.cameraY}%` }}
                      >CAM</div>
                    </div>
                    <div className="floorFacts">
                      <p><b>Axis</b>{selectedShot.axis}</p>
                      <p><b>Blocking</b>{selectedShot.blocking}</p>
                      <p><b>Eyeline</b>{selectedShot.continuityState.eyeline}</p>
                      <p><b>Screen direction</b>{selectedShot.continuityState.screenDirection}</p>
                      <p><b>Last-frame handoff</b>{selectedShot.lastFrameHandoff}</p>
                    </div>
                  </>
                ) : <div className="emptyFactory"><b>SELECT A SHOT</b><span>Floor-plan state will appear here.</span></div>}
              </div>
            </section>
          )}

          {view === 'knowledge' && (
            <section className="knowledgeEngine">
              <div className="knowledgeSearch">
                <input placeholder="Search directing, continuity, lighting, edit…" value={knowledgeQuery} onChange={(e) => setKnowledgeQuery(e.target.value)} />
                <span>{knowledge.length} methodology cards</span>
              </div>
              <div className="knowledgeGrid">
                {knowledge.map((card) => {
                  const coverage = film.knowledgeCoverage.find((item) => item.id === card.id)?.usedByShots || 0;
                  return (
                    <article key={card.id}>
                      <small>{card.department} · used by {coverage} shots</small>
                      <h3>{card.title}</h3>
                      <p>{card.principle}</p>
                      <div><b>FAILURE MODE</b><span>{card.failureMode}</span></div>
                      <div><b>CORRECTIVE ACTION</b><span>{card.correctiveAction}</span></div>
                      <a href="/masterclass/tutorials">OPEN RELATED LESSON →</a>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {selectedShot && (
            <section className="mcGrid debateSection">
              <div className="panel">
                <h2>SELECTED SHOT · {selectedShot.id}</h2>
                <div className="scenePackage">
                  <small>GENERATION PROMPT</small>
                  <p>{selectedShot.generationPrompt}</p>
                  <small>CONTINUITY STATE</small>
                  <p>{Object.entries(selectedShot.continuityState).map(([key,value]) => `${key}: ${value}`).join(' · ')}</p>
                  <small>CACHE KEY</small>
                  <code>{selectedShot.cacheKey}</code>
                </div>
                <button className="generate" onClick={() => runDebate(selectedShot)} disabled={debating}>
                  {debating ? 'Departments debating…' : 'RUN DIRECTOR / CAMERA / CONTINUITY / EDIT DEBATE'}
                </button>
              </div>
              <div className="panel">
                <h2>DEBATE / JUDGE</h2>
                {debate ? (
                  <>
                    <div className="departmentStatus">
                      <b>{debate.judge.decision} · {debate.judge.score.toFixed(1)}/10</b>
                      <span>{debateSource}</span>
                    </div>
                    <div className="debateCards">
                      {debate.proposals.map((proposal) => (
                        <article key={proposal.agent}>
                          <div><b>{proposal.agent}</b><span>{proposal.score}/10</span></div>
                          <p>{proposal.recommendation}</p>
                          <small>RISK: {proposal.risk}</small>
                        </article>
                      ))}
                    </div>
                    <div className="judgeCard">
                      <small>SENIOR JUDGE</small>
                      <b>{debate.judge.winningApproach}</b>
                      {debate.judge.mandatoryChanges.map((change) => <p key={change}>• {change}</p>)}
                    </div>
                  </>
                ) : (
                  <div className="emptyFactory">
                    <b>NO DEBATE YET</b>
                    <span>Run the departments against the selected shot before generation.</span>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="output">
            <p className="eyebrow">SELECTIVE RERUN QUEUE</p>
            <h2>Do not regenerate the whole movie.</h2>
            <div className="rerunQueue">
              {film.rerunQueue.map((id) => <span key={id}>{id}</span>)}
              {!film.rerunQueue.length && <b>All shot dependencies are cache hits.</b>}
            </div>
            <p className="departmentIntro">
              A shot enters this queue only when it is new or a story/camera/continuity dependency changes.
              This is the foundation for LTX-style selective reruns while keeping MABRIG Cinema model-agnostic.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
