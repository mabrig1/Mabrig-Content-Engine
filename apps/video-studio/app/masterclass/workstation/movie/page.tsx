'use client';

import { useMemo, useState } from 'react';
import {
  MASTERCLASS_MODULES,
  type FilmBlueprint,
  type FilmProjectInput,
  type FilmScenePlan,
  type MovieGenre,
} from '../../../../lib/movie-masterclass';
import {
  SET_PRESETS,
  type ActorProfile,
  type SceneProductionPackage,
  type SetProfile,
} from '../../../../lib/cinematic-production';

type ScenePackageResponse = {
  ok: boolean;
  scenePackage: SceneProductionPackage;
  routing: {
    missionId: string;
    decision: {
      selectedProviderId: string | null;
      requiresHumanApproval: boolean;
      warnings: string[];
      candidates: Array<{ providerId: string; score: number }>;
    };
  };
  execution: string;
};

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

const defaultActor: ActorProfile = {
  id: 'lead',
  name: 'Mabrig Korie',
  role: 'Lead',
  appearance:
    'Bald, clean-shaven Nigerian man in his 30s, athletic build, expressive focused presence; preserve facial geometry, age and skin tone across every scene.',
  wardrobe:
    'Deep-blue shirt and dark trousers for contemporary scenes; changes must be motivated by the story.',
  performanceDNA:
    'Calm prophetic intensity, warm authority, precise eye focus, restrained gestures that rise into decisive conviction.',
  voice: 'Measured international English delivery with emotionally controlled emphasis.',
  referenceCount: 0,
};

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
    conflict:
      'limited resources, repeated failure and the pressure to abandon the assignment',
    ending:
      'He realizes the vision was always about serving people, and steps forward to build with courage.',
    aspectRatio: '2.39:1',
  });
  const [blueprint, setBlueprint] = useState<FilmBlueprint | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState('');
  const [screenplay, setScreenplay] = useState('');
  const [screenplaySource, setScreenplaySource] = useState('');
  const [writingScript, setWritingScript] = useState(false);
  const [actor, setActor] = useState<ActorProfile>(defaultActor);
  const [actorRefs, setActorRefs] = useState<Array<{ name: string; url: string }>>([]);
  const [filmSet, setFilmSet] = useState<SetProfile>(SET_PRESETS[0]);
  const [packagingId, setPackagingId] = useState('');
  const [scenePackage, setScenePackage] = useState<ScenePackageResponse | null>(null);

  const totalSeconds = useMemo(
    () =>
      blueprint?.scenes.reduce(
        (sum, scene) => sum + scene.durationSeconds,
        0,
      ) || 0,
    [blueprint],
  );

  function set<K extends keyof FilmProjectInput>(
    key: K,
    value: FilmProjectInput[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function actorSet<K extends keyof ActorProfile>(
    key: K,
    value: ActorProfile[K],
  ) {
    setActor((previous) => ({ ...previous, [key]: value }));
  }

  function setSet<K extends keyof SetProfile>(
    key: K,
    value: SetProfile[K],
  ) {
    setFilmSet((previous) => ({ ...previous, [key]: value }));
  }

  async function build() {
    setBuilding(true);
    setError('');
    setScreenplay('');
    setScenePackage(null);
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

  async function writeScreenplay() {
    if (!blueprint) return;
    setWritingScript(true);
    setError('');
    try {
      const response = await fetch('/api/masterclass/screenplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprint }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Screenplay failed.');
      setScreenplay(payload.screenplay || '');
      setScreenplaySource(payload.source || 'film-os');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Screenplay failed.');
    } finally {
      setWritingScript(false);
    }
  }

  async function packageScene(scene: FilmScenePlan) {
    if (!blueprint) return;
    setPackagingId(scene.id);
    setError('');
    try {
      const response = await fetch('/api/masterclass/scene-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprint,
          scene,
          actor: { ...actor, referenceCount: actorRefs.length },
          set: filmSet,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Scene packaging failed.');
      setScenePackage(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scene packaging failed.');
    } finally {
      setPackagingId('');
    }
  }

  function addActorReferences(files: FileList | null) {
    if (!files) return;
    const references = Array.from(files)
      .slice(0, 12)
      .map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setActorRefs((current) => [...current, ...references].slice(0, 12));
  }

  function exportText(name: string, content: string, type = 'text/plain') {
    const file = new Blob([content], { type });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportBlueprint() {
    if (!blueprint) return;
    exportText(
      `${blueprint.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-film-blueprint.json`,
      JSON.stringify(blueprint, null, 2),
      'application/json',
    );
  }

  return (
    <main className="masterclass">
      <nav>
        <a className="brandLink" href="/masterclass/workstation">
          <b>
            MABRIG <span>CINEMA</span>
          </b>
        </a>
        <div className="navActions">
          <a href="/masterclass/workstation">AI VIDEO STUDIO</a>
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
          A film school, screenplay room, actor library, virtual set department,
          AI director, continuity graph, model router, scene factory, soundstage
          and release room inside one production operating system.
        </p>
        <div className="mcHeroStats">
          <div>
            <strong>12</strong>
            <span>production modules</span>
          </div>
          <div>
            <strong>6</strong>
            <span>virtual departments</span>
          </div>
          <div>
            <strong>1</strong>
            <span>continuous film bible</span>
          </div>
          <div>
            <strong>∞</strong>
            <span>scene variants</span>
          </div>
        </div>
      </section>

      <section className="mcSwitch">
        <button
          className={tab === 'create' ? 'on' : ''}
          onClick={() => setTab('create')}
        >
          🎬 CREATE A MOVIE
        </button>
        <button
          className={tab === 'learn' ? 'on' : ''}
          onClick={() => setTab('learn')}
        >
          🎓 MASTERCLASS
        </button>
      </section>

      {tab === 'create' ? (
        <>
          <section className="mcGrid">
            <div className="panel">
              <h2>01 · GREENLIGHT ROOM</h2>
              <label>Film title</label>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
              <label>Logline</label>
              <textarea
                value={form.logline}
                onChange={(e) => set('logline', e.target.value)}
              />
              <div className="twoCol">
                <div>
                  <label>Genre</label>
                  <select
                    value={form.genre}
                    onChange={(e) =>
                      set('genre', e.target.value as MovieGenre)
                    }
                  >
                    {genres.map((genre) => (
                      <option key={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Length</label>
                  <select
                    value={form.durationMinutes}
                    onChange={(e) =>
                      set('durationMinutes', Number(e.target.value))
                    }
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
              <input
                value={form.audience}
                onChange={(e) => set('audience', e.target.value)}
              />
              <label>Visual DNA</label>
              <select
                value={form.visualStyle}
                onChange={(e) => set('visualStyle', e.target.value)}
              >
                {looks.map((look) => (
                  <option key={look}>{look}</option>
                ))}
              </select>
              <label>Master frame</label>
              <div className="chips">
                {['2.39:1', '16:9', '9:16', '4:5', '1:1'].map((ratio) => (
                  <button
                    type="button"
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
              <textarea
                value={form.conflict}
                onChange={(e) => set('conflict', e.target.value)}
              />
              <label>How must they change by the end?</label>
              <textarea
                value={form.ending}
                onChange={(e) => set('ending', e.target.value)}
              />
              <button className="generate" onClick={build} disabled={building}>
                {building
                  ? 'Compiling screenplay, camera & continuity…'
                  : '✦ BUILD COMPLETE FILM BLUEPRINT'}
              </button>
              <small className="hint">
                Blueprint first: story, character, world, camera, sound,
                continuity and QC are locked before generation.
              </small>
              {error && (
                <div className="render">
                  <b>Director notice</b>
                  <span>{error}</span>
                </div>
              )}
            </div>
          </section>

          <section className="output">
            <p className="eyebrow">CINEMA OPERATING SYSTEM</p>
            <h2>One film. Six AI production departments.</h2>
            <div className="filmOSGrid">
              {[
                ['Screenplay AI', 'Blueprint → scenes → action → dialogue → shooting script'],
                ['Actor Library', 'Reference identity, wardrobe, voice and performance DNA'],
                ['Virtual Set Designer', 'Locations, props, lighting, weather and production design'],
                ['Scene Factory', 'Reference frame + video prompt + continuity fingerprint'],
                ['Model Router', 'Route each shot to the safest eligible model automatically'],
                ['QC Repair Loop', 'Score → isolate failure → repair only the weak segment'],
                ['Director Brain', 'Lens, blocking, camera choreography and motivated light'],
                ['Continuity Graph', 'Carry face, wardrobe, props, geography and time through the film'],
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
                  <button
                    className="secondaryButton"
                    onClick={exportBlueprint}
                  >
                    EXPORT FILM BIBLE JSON
                  </button>
                </div>
                <div className="mcHeroStats compact">
                  <div>
                    <strong>{blueprint.scenes.length}</strong>
                    <span>scenes</span>
                  </div>
                  <div>
                    <strong>{Math.round(totalSeconds / 60)}</strong>
                    <span>planned minutes</span>
                  </div>
                  <div>
                    <strong>{blueprint.aspectRatio}</strong>
                    <span>master frame</span>
                  </div>
                  <div>
                    <strong>{blueprint.genre}</strong>
                    <span>genre</span>
                  </div>
                </div>
              </section>

              <section className="mcGrid">
                <div className="panel">
                  <h2>03 · SCREENPLAY AI</h2>
                  <p className="departmentIntro">
                    Turn the locked blueprint into a shooting script. When your
                    configured OpenRouter model is available, the Script Department
                    expands action, dialogue and transitions; otherwise the Film OS
                    produces a deterministic production draft.
                  </p>
                  <button
                    className="generate"
                    onClick={writeScreenplay}
                    disabled={writingScript}
                  >
                    {writingScript
                      ? 'Writing screenplay…'
                      : '✍ GENERATE SHOOTING SCREENPLAY'}
                  </button>
                  {screenplay && (
                    <>
                      <div className="departmentStatus">
                        <b>SCREENPLAY READY</b>
                        <span>Source: {screenplaySource}</span>
                      </div>
                      <textarea
                        className="screenplayBox"
                        value={screenplay}
                        onChange={(e) => setScreenplay(e.target.value)}
                      />
                      <button
                        className="secondaryButton fullButton"
                        onClick={() =>
                          exportText(
                            `${blueprint.title
                              .replace(/[^a-z0-9]+/gi, '-')
                              .toLowerCase()}-screenplay.txt`,
                            screenplay,
                          )
                        }
                      >
                        EXPORT SCREENPLAY
                      </button>
                    </>
                  )}
                </div>

                <div className="panel">
                  <h2>04 · ACTOR LIBRARY · IDENTITY LOCK</h2>
                  <label>Actor / character name</label>
                  <input
                    value={actor.name}
                    onChange={(e) => actorSet('name', e.target.value)}
                  />
                  <label>Appearance DNA</label>
                  <textarea
                    value={actor.appearance}
                    onChange={(e) => actorSet('appearance', e.target.value)}
                  />
                  <label>Wardrobe rule</label>
                  <textarea
                    value={actor.wardrobe}
                    onChange={(e) => actorSet('wardrobe', e.target.value)}
                  />
                  <label>Performance DNA</label>
                  <textarea
                    value={actor.performanceDNA}
                    onChange={(e) =>
                      actorSet('performanceDNA', e.target.value)
                    }
                  />
                  <label className="drop actorDrop">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => addActorReferences(e.target.files)}
                    />
                    <strong>+ Add approved identity references</strong>
                    <small>
                      Front, ¾, profile and expression plates · up to 12
                    </small>
                  </label>
                  <div className="refs">
                    {actorRefs.map((ref, index) => (
                      <img key={index} src={ref.url} alt={ref.name} />
                    ))}
                  </div>
                </div>
              </section>

              <section className="mcGrid">
                <div className="panel">
                  <h2>05 · VIRTUAL SET DESIGNER</h2>
                  <label>Set preset</label>
                  <select
                    value={filmSet.id}
                    onChange={(e) => {
                      const preset = SET_PRESETS.find(
                        (item) => item.id === e.target.value,
                      );
                      if (preset) setFilmSet(preset);
                    }}
                  >
                    {SET_PRESETS.map((preset) => (
                      <option value={preset.id} key={preset.id}>
                        {preset.name}
                      </option>
                    ))}
                  </select>
                  <label>Location</label>
                  <textarea
                    value={filmSet.location}
                    onChange={(e) => setSet('location', e.target.value)}
                  />
                  <label>Production design</label>
                  <textarea
                    value={filmSet.productionDesign}
                    onChange={(e) =>
                      setSet('productionDesign', e.target.value)
                    }
                  />
                  <label>Lighting</label>
                  <textarea
                    value={filmSet.lighting}
                    onChange={(e) => setSet('lighting', e.target.value)}
                  />
                  <div className="setSummary">
                    <b>{filmSet.name}</b>
                    <span>{filmSet.timeOfDay}</span>
                    <p>{filmSet.atmosphere}</p>
                    <small>Hero props: {filmSet.heroProps}</small>
                  </div>
                </div>

                <div className="panel">
                  <h2>06 · SCENE FACTORY · ONE-CLICK PACKAGE</h2>
                  <p className="departmentIntro">
                    Choose any scene below. The factory combines story purpose,
                    actor identity, set design, camera, continuity and sound into
                    a reference-frame prompt and a model-ready video prompt, then
                    routes the shot through the existing provider safety engine.
                  </p>
                  {scenePackage ? (
                    <>
                      <div className="departmentStatus">
                        <b>
                          {scenePackage.routing.decision.selectedProviderId
                            ? `ROUTED · ${scenePackage.routing.decision.selectedProviderId}`
                            : 'PACKAGED · ROUTE BLOCKED'}
                        </b>
                        <span>{scenePackage.execution}</span>
                      </div>
                      <div className="scenePackage">
                        <small>REFERENCE FRAME PROMPT</small>
                        <p>{scenePackage.scenePackage.referenceImagePrompt}</p>
                        <small>VIDEO PROMPT</small>
                        <p>{scenePackage.scenePackage.videoPrompt}</p>
                        <small>CONTINUITY FINGERPRINT</small>
                        <code>
                          {scenePackage.scenePackage.continuityFingerprint}
                        </code>
                      </div>
                      <button
                        className="secondaryButton fullButton"
                        onClick={() =>
                          exportText(
                            `${scenePackage.scenePackage.sceneId}-production-package.json`,
                            JSON.stringify(scenePackage, null, 2),
                            'application/json',
                          )
                        }
                      >
                        EXPORT SCENE PACKAGE
                      </button>
                    </>
                  ) : (
                    <div className="emptyFactory">
                      <b>NO SCENE PACKAGED YET</b>
                      <span>
                        Use “Package & Route Scene” in the Director Timeline.
                      </span>
                    </div>
                  )}
                </div>
              </section>

              <section className="output">
                <p className="eyebrow">DIRECTOR TIMELINE</p>
                <h2>Every scene becomes a production-ready shot package.</h2>
                <div className="timeline directorTimeline">
                  {blueprint.scenes.map((scene, index) => (
                    <article key={scene.id}>
                      <b>{String(index + 1).padStart(2, '0')}</b>
                      <div>
                        <strong>
                          ACT {scene.act} · {scene.title}
                        </strong>
                        <p>{scene.purpose}</p>
                        <p>
                          <em>CAMERA:</em> {scene.camera}
                        </p>
                        <p>
                          <em>SOUND:</em> {scene.sound}
                        </p>
                      </div>
                      <div className="sceneAction">
                        <span>{scene.durationSeconds}s</span>
                        <button
                          type="button"
                          disabled={packagingId === scene.id}
                          onClick={() => packageScene(scene)}
                        >
                          {packagingId === scene.id
                            ? 'Packaging…'
                            : 'Package & Route Scene'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="mcGrid">
                <div className="panel">
                  <h2>CINEMATIC QC GATES</h2>
                  <div className="qcList">
                    {blueprint.qualityGates.map((gate, index) => (
                      <p key={gate}>
                        <b>{String(index + 1).padStart(2, '0')}</b>
                        {gate}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="panel">
                  <h2>PRODUCTION ORDER</h2>
                  <div className="qcList">
                    {blueprint.productionOrder.map((step, index) => (
                      <p key={step}>
                        <b>{String(index + 1).padStart(2, '0')}</b>
                        {step}
                      </p>
                    ))}
                  </div>
                  <a className="generate masterLink" href="/masterclass/workstation">
                    OPEN AI VIDEO EXECUTION STUDIO →
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
            Every lesson creates a production asset that feeds the next stage.
            The learner’s film becomes the classroom.
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
        <p className="eyebrow">THE DIFFERENCE</p>
        <h2>Not prompt-to-video. Production intelligence.</h2>
        <div className="innovationStrip">
          <div>
            <b>Teach while building</b>
            <span>Every lesson modifies the actual film project.</span>
          </div>
          <div>
            <b>Actor memory</b>
            <span>Identity and performance DNA follow the character through scenes.</span>
          </div>
          <div>
            <b>Scene packages</b>
            <span>Every shot carries story, set, camera, sound and continuity state.</span>
          </div>
          <div>
            <b>Safe model routing</b>
            <span>Free-first routing stays separate from provider execution and spend.</span>
          </div>
        </div>
      </section>

      <footer>
        CINEMATIC MOVIE MASTERCLASS · MABRIG CINEMA · AI FILM OPERATING SYSTEM
      </footer>
    </main>
  );
}
