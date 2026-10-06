'use client';

import { useMemo, useState } from 'react';
import {
  MASTERCLASS_MODULES,
  type FilmBlueprint,
  type FilmProjectInput,
  type MovieGenre,
} from '../../lib/movie-masterclass';

const genres: MovieGenre[] = [
  'Faith Epic',
  'Drama',
  'Thriller',
  'Action',
  'Sci-Fi',
  'Romance',
  'Historical',
  'Documentary',
  'Afro-Futurist',
];

const looks = [
  'Hollywood epic realism · anamorphic highlights · controlled film grain',
  'Afro-cinematic prestige · rich skin tones · monumental natural light',
  'Neo-noir thriller · rain reflections · deep contrast · practical neon',
  'Warm faith drama · sunrise gold · intimate faces · luminous atmosphere',
  'Afro-futurist world · premium architecture · tactile technology · cinematic scale',
];

export default function MovieMasterclassPage() {
  const [tab, setTab] = useState<'create' | 'learn'>('create');
  const [form, setForm] = useState<FilmProjectInput>({
    title: 'THE CALL',
    logline:
      'A visionary builder discovers that his greatest assignment is not the platform he creates, but the lives transformed through his obedience.',
    genre: 'Faith Epic',
    durationMinutes: 3,
    audience: 'Global faith, purpose and innovation audience',
    visualStyle: looks[3],
    protagonist: 'A focused Nigerian visionary, builder and revivalist',
    conflict: 'limited resources, repeated failure and the pressure to abandon the assignment',
    ending:
      'He realizes the vision was always about serving people, and steps forward to build with courage.',
    aspectRatio: '2.39:1',
  });
  const [blueprint, setBlueprint] = useState<FilmBlueprint | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState('');

  const totalSeconds = useMemo(
    () => blueprint?.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0) || 0,
    [blueprint],
  );

  function set<K extends keyof FilmProjectInput>(key: K, value: FilmProjectInput[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function build() {
    setBuilding(true);
    setError('');
    try {
      const response = await fetch('/api/masterclass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Blueprint failed.');
      setBlueprint(payload.blueprint);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Blueprint failed.');
    } finally {
      setBuilding(false);
    }
  }

  function exportBlueprint() {
    if (!blueprint) return;
    const file = new Blob([JSON.stringify(blueprint, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${blueprint.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-film-blueprint.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="masterclass">
      <nav>
        <a className="brandLink" href="/">
          <b>MABRIG <span>CINEMA</span></b>
        </a>
        <div className="navActions">
          <a href="/">AI VIDEO STUDIO</a>
          <div className="pill">MOVIE MASTERCLASS · FILM OS</div>
        </div>
      </nav>

      <section className="mcHero">
        <p className="eyebrow">LEARN FILMMAKING BY MAKING THE FILM</p>
        <h1>
          Cinematic Movie
          <em> Masterclass.</em>
        </h1>
        <p>
          One platform where the course, screenplay room, character bible, AI director,
          continuity system, shot generator, soundstage, edit room and release pipeline
          become one production operating system.
        </p>
        <div className="mcHeroStats">
          <div><strong>12</strong><span>production modules</span></div>
          <div><strong>3</strong><span>acts compiled automatically</span></div>
          <div><strong>1</strong><span>continuous film bible</span></div>
          <div><strong>∞</strong><span>scene variants</span></div>
        </div>
      </section>

      <section className="mcSwitch">
        <button className={tab === 'create' ? 'on' : ''} onClick={() => setTab('create')}>
          🎬 CREATE A MOVIE
        </button>
        <button className={tab === 'learn' ? 'on' : ''} onClick={() => setTab('learn')}>
          🎓 MASTERCLASS
        </button>
      </section>

      {tab === 'create' ? (
        <>
          <section className="mcGrid">
            <div className="panel">
              <h2>01 · GREENLIGHT ROOM</h2>
              <label>Film title</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} />
              <label>Logline</label>
              <textarea value={form.logline} onChange={(e) => set('logline', e.target.value)} />
              <div className="twoCol">
                <div>
                  <label>Genre</label>
                  <select value={form.genre} onChange={(e) => set('genre', e.target.value as MovieGenre)}>
                    {genres.map((genre) => <option key={genre}>{genre}</option>)}
                  </select>
                </div>
                <div>
                  <label>Length</label>
                  <select
                    value={form.durationMinutes}
                    onChange={(e) => set('durationMinutes', Number(e.target.value))}
                  >
                    <option value={1}>60 sec short</option>
                    <option value={3}>3 min cinematic short</option>
                    <option value={8}>8 min short film</option>
                    <option value={12}>12 min festival short</option>
                    <option value={30}>30 min episode</option>
                    <option value={90}>90 min feature blueprint</option>
                  </select>
                </div>
              </div>
              <label>Audience</label>
              <input value={form.audience} onChange={(e) => set('audience', e.target.value)} />
              <label>Visual DNA</label>
              <select value={form.visualStyle} onChange={(e) => set('visualStyle', e.target.value)}>
                {looks.map((look) => <option key={look}>{look}</option>)}
              </select>
              <label>Master frame</label>
              <div className="chips">
                {['2.39:1', '16:9', '9:16', '4:5', '1:1'].map((ratio) => (
                  <button
                    key={ratio}
                    className={form.aspectRatio === ratio ? 'on' : ''}
                    onClick={() => set('aspectRatio', ratio)}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <h2>02 · STORY ENGINE</h2>
              <label>Who is the protagonist?</label>
              <textarea
                value={form.protagonist}
                onChange={(e) => set('protagonist', e.target.value)}
              />
              <label>What force opposes them?</label>
              <textarea value={form.conflict} onChange={(e) => set('conflict', e.target.value)} />
              <label>How must they change by the end?</label>
              <textarea value={form.ending} onChange={(e) => set('ending', e.target.value)} />
              <button className="generate" onClick={build} disabled={building}>
                {building ? 'Compiling screenplay, camera & continuity…' : '✦ BUILD COMPLETE FILM BLUEPRINT'}
              </button>
              <small className="hint">
                The compiler creates the story arc, character bible, world bible, shot grammar,
                sound intent, continuity inheritance and QC gates before generation begins.
              </small>
              {error && <div className="render"><b>Director notice</b><span>{error}</span></div>}
            </div>
          </section>

          <section className="output">
            <p className="eyebrow">CINEMA OPERATING SYSTEM</p>
            <h2>From idea to master, one connected production graph.</h2>
            <div className="filmOSGrid">
              {[
                ['Story Brain', 'Premise → beats → scene purpose → emotional arc'],
                ['Character DNA', 'Face, wardrobe, body, voice and performance continuity'],
                ['World Bible', 'Locations, props, palette, weather and geography'],
                ['Director Brain', 'Lens, blocking, camera choreography and motivated light'],
                ['Shot Forge', 'Text, image, video, first/last frame and reference generation'],
                ['Continuity Graph', 'Scene state inheritance and automatic drift warnings'],
                ['Performance Lab', 'Subtext, eyelines, dialogue, gesture and lip-sync'],
                ['Soundstage', 'Dialogue, ambience, foley, score, impacts and silence'],
                ['Edit Intelligence', 'Rhythm, reactions, J/L cuts, montage and retention'],
                ['QC Repair Loop', 'Score → isolate failure → regenerate only weak segments'],
                ['Trailer Engine', 'Trailer, teaser, vertical hooks and thumbnails'],
                ['Release Room', 'Cinema master + YouTube + TikTok + Reels + Facebook'],
              ].map(([title, copy], index) => (
                <article className="filmOSCard" key={title}>
                  <small>{String(index + 1).padStart(2, '0')}</small>
                  <b>{title}</b>
                  <span>{copy}</span>
                </article>
              ))}
            </div>
          </section>

          {blueprint && (
            <>
              <section className="output blueprintHead">
                <p className="eyebrow">GREENLIT BLUEPRINT</p>
                <div className="blueprintTitle">
                  <div>
                    <h2>{blueprint.title}</h2>
                    <p>{blueprint.logline}</p>
                  </div>
                  <button className="secondaryButton" onClick={exportBlueprint}>
                    EXPORT FILM BIBLE JSON
                  </button>
                </div>
                <div className="mcHeroStats compact">
                  <div><strong>{blueprint.scenes.length}</strong><span>scenes</span></div>
                  <div><strong>{Math.round(totalSeconds / 60)}</strong><span>planned minutes</span></div>
                  <div><strong>{blueprint.aspectRatio}</strong><span>master frame</span></div>
                  <div><strong>{blueprint.genre}</strong><span>genre</span></div>
                </div>
              </section>

              <section className="mcGrid">
                <div className="panel">
                  <h2>CHARACTER DNA</h2>
                  {blueprint.characterBible.map((character) => (
                    <div className="bibleBlock" key={character.role}>
                      <b>{character.role}</b>
                      <p>{character.identityLock}</p>
                      <small>{character.wardrobeRule}</small>
                    </div>
                  ))}
                </div>
                <div className="panel">
                  <h2>WORLD BIBLE</h2>
                  {blueprint.worldBible.map((world) => (
                    <div className="bibleBlock" key={world.location}>
                      <b>{world.location}</b>
                      <p>{world.lighting}</p>
                      <small>{world.continuityRule}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="output">
                <p className="eyebrow">DIRECTOR TIMELINE</p>
                <h2>Every scene knows why it exists.</h2>
                <div className="timeline">
                  {blueprint.scenes.map((scene, index) => (
                    <article key={scene.id}>
                      <b>{String(index + 1).padStart(2, '0')}</b>
                      <div>
                        <strong>ACT {scene.act} · {scene.title}</strong>
                        <p>{scene.purpose}</p>
                        <p><em>CAMERA:</em> {scene.camera}</p>
                        <p><em>SOUND:</em> {scene.sound}</p>
                      </div>
                      <span>{scene.durationSeconds}s</span>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mcGrid">
                <div className="panel">
                  <h2>CINEMATIC QC GATES</h2>
                  <div className="qcList">
                    {blueprint.qualityGates.map((gate, index) => (
                      <p key={gate}><b>{String(index + 1).padStart(2, '0')}</b>{gate}</p>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <h2>PRODUCTION ORDER</h2>
                  <div className="qcList">
                    {blueprint.productionOrder.map((step, index) => (
                      <p key={step}><b>{String(index + 1).padStart(2, '0')}</b>{step}</p>
                    ))}
                  </div>
                  <a className="generate masterLink" href="/">
                    SEND PROJECT TO AI VIDEO STUDIO →
                  </a>
                </div>
              </section>
            </>
          )}
        </>
      ) : (
        <section className="output masterModules">
          <p className="eyebrow">12-MODULE PROJECT-BASED COURSE</p>
          <h2>You graduate with a finished film, not just notes.</h2>
          <p>
            Every lesson creates a production asset that feeds the next stage. The learner’s
            film becomes the classroom.
          </p>
          <div className="moduleGrid">
            {MASTERCLASS_MODULES.map((module) => (
              <article key={module.id}>
                <small>MODULE {String(module.number).padStart(2, '0')}</small>
                <h3>{module.title}</h3>
                <p>{module.promise}</p>
                <div>
                  <b>SKILL</b>
                  <span>{module.skill}</span>
                </div>
                <div>
                  <b>DELIVERABLE</b>
                  <span>{module.deliverable}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="output">
        <p className="eyebrow">WHY THIS IS DIFFERENT</p>
        <h2>Not a generator. A film school + virtual studio + production OS.</h2>
        <div className="innovationStrip">
          <div><b>Teach-while-building</b><span>Each lesson changes the actual movie project.</span></div>
          <div><b>Model-agnostic router</b><span>Use the best eligible video model per shot.</span></div>
          <div><b>Continuity-first</b><span>Character and world state travel with every scene.</span></div>
          <div><b>Surgical regeneration</b><span>Repair failed shots instead of rebuilding the film.</span></div>
        </div>
      </section>

      <footer>CINEMATIC MOVIE MASTERCLASS · MABRIG CINEMA · AI FILM OPERATING SYSTEM</footer>
    </main>
  );
}
