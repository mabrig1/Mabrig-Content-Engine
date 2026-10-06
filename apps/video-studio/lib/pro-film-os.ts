import type { FilmBlueprint, FilmScenePlan } from './movie-masterclass';

export type CinemaKnowledgeCard = {
  id: string;
  title: string;
  department: 'Story' | 'Directing' | 'Camera' | 'Continuity' | 'Performance' | 'Edit' | 'Sound' | 'Production';
  principle: string;
  failureMode: string;
  correctiveAction: string;
  masterclassModule: string;
  tags: string[];
};

export type ProfessionalShot = {
  id: string;
  sceneId: string;
  sceneTitle: string;
  sceneIndex: number;
  shotIndex: number;
  purpose: string;
  durationSeconds: number;
  shotSize: 'EWS' | 'WS' | 'MS' | 'MCU' | 'CU' | 'ECU';
  lensMm: number;
  movement: string;
  axis: string;
  blocking: string;
  dialogue: string;
  sfx: string;
  lighting: string;
  generationPrompt: string;
  firstFrameSource: string;
  lastFrameHandoff: string;
  continuityState: {
    identity: string;
    wardrobe: string;
    props: string;
    environment: string;
    eyeline: string;
    screenDirection: string;
  };
  cacheKey: string;
  cacheState: 'new' | 'hit' | 'dirty';
  rerunReason?: string;
  floorPlan: {
    subjectX: number;
    subjectY: number;
    cameraX: number;
    cameraY: number;
    cameraAngleDeg: number;
    fieldOfViewDeg: number;
  };
  knowledgeRefs: string[];
};

export type DebateProposal = {
  agent: 'Director' | 'Cinematographer' | 'Continuity Supervisor' | 'Editor';
  recommendation: string;
  risk: string;
  score: number;
};

export type DebateResult = {
  shotId: string;
  proposals: DebateProposal[];
  judge: {
    decision: 'APPROVE' | 'REVISE';
    winningApproach: string;
    mandatoryChanges: string[];
    score: number;
  };
};

export type ProfessionalFilmPackage = {
  title: string;
  shots: ProfessionalShot[];
  continuityGraph: Array<{
    from: string | null;
    to: string;
    transfer: string[];
    firstFrameStrategy: string;
  }>;
  rerunQueue: string[];
  knowledgeCoverage: Array<{
    id: string;
    title: string;
    department: string;
    usedByShots: number;
  }>;
  exports: {
    edl: string;
    fcpxml: string;
    csv: string;
  };
};

export const CINEMA_KNOWLEDGE: CinemaKnowledgeCard[] = [
  {
    id: 'story-objective',
    title: 'Every Scene Needs an Objective',
    department: 'Story',
    principle: 'A scene exists because somebody wants something and resistance makes that want costly.',
    failureMode: 'Beautiful images without dramatic direction.',
    correctiveAction: 'State the character objective, obstacle and irreversible change before designing shots.',
    masterclassModule: 'story-architecture',
    tags: ['story','objective','scene','conflict'],
  },
  {
    id: 'shot-reason',
    title: 'Every Shot Needs a Reason',
    department: 'Directing',
    principle: 'Shot size and movement must reveal story information, power, emotion or change.',
    failureMode: 'Random cinematic camera motion.',
    correctiveAction: 'Name the dramatic reason for the shot before naming the lens or movement.',
    masterclassModule: 'director-brain',
    tags: ['director','camera','shot','motivation'],
  },
  {
    id: 'axis-180',
    title: 'Protect the 180° Axis',
    department: 'Camera',
    principle: 'Screen direction remains readable when coverage respects the established line of action.',
    failureMode: 'Characters appear to change position or direction between cuts.',
    correctiveAction: 'Keep cameras on one side of the axis unless the crossing is deliberately motivated on screen.',
    masterclassModule: 'director-brain',
    tags: ['axis','180','screen direction','continuity'],
  },
  {
    id: 'coverage-triad',
    title: 'Build Coverage as Wide → Medium → Emotional Detail',
    department: 'Camera',
    principle: 'Coverage should establish geography, action and emotion instead of producing unrelated angles.',
    failureMode: 'An edit with no spatial orientation or emotional escalation.',
    correctiveAction: 'Generate an anchor wide, story medium and emotional close/detail for each dramatic beat.',
    masterclassModule: 'shot-forge',
    tags: ['coverage','wide','medium','close-up','edit'],
  },
  {
    id: 'identity-anchor',
    title: 'Identity Is a Production Asset',
    department: 'Continuity',
    principle: 'Recurring characters need approved references and immutable identity traits.',
    failureMode: 'Face, age, body or wardrobe drift between generations.',
    correctiveAction: 'Pass the same approved identity set and continuity state into every dependent shot.',
    masterclassModule: 'character-dna',
    tags: ['identity','character','reference','continuity'],
  },
  {
    id: 'last-frame-chain',
    title: 'Chain Motion Through Last Frames',
    department: 'Continuity',
    principle: 'A previous accepted last frame is the strongest handoff for adjacent motion continuity.',
    failureMode: 'Action restarts, body position jumps or environment changes between shots.',
    correctiveAction: 'Use the preceding accepted last frame as the next first-frame anchor whenever the cut continues physical action.',
    masterclassModule: 'continuity-graph',
    tags: ['last frame','first frame','match cut','continuity'],
  },
  {
    id: 'state-ledger',
    title: 'Maintain a Continuity State Ledger',
    department: 'Continuity',
    principle: 'Wardrobe, props, weather, time, geography and eyelines must be explicit state, not memory.',
    failureMode: 'Subtle continuity errors that make AI footage feel synthetic.',
    correctiveAction: 'Persist state per shot and inherit it unless a story event explicitly changes it.',
    masterclassModule: 'continuity-graph',
    tags: ['state','wardrobe','props','weather','eyeline'],
  },
  {
    id: 'performance-subtext',
    title: 'Direct Subtext, Not Emotion Labels',
    department: 'Performance',
    principle: 'Actors become believable when they pursue an objective while hiding, resisting or reframing emotion.',
    failureMode: 'Generic smiling, staring, crying or exaggerated gesturing.',
    correctiveAction: 'Give the performer objective, obstacle, subtext, eyeline and one physical behavior.',
    masterclassModule: 'performance',
    tags: ['acting','subtext','performance','dialogue'],
  },
  {
    id: 'lip-sync-coverage',
    title: 'Design Coverage for Lip Sync',
    department: 'Performance',
    principle: 'Visible speech works best with stable facial geometry, readable jaw motion and limited occlusion.',
    failureMode: 'Great shot composition but unusable dialogue sync.',
    correctiveAction: 'Use frontal or three-quarter dialogue coverage and reserve profile/extreme motion for cutaways.',
    masterclassModule: 'performance',
    tags: ['lip sync','dialogue','face','coverage'],
  },
  {
    id: 'motivated-light',
    title: 'Motivated Light Creates Believability',
    department: 'Camera',
    principle: 'The audience accepts stylization more readily when key light direction has a believable source.',
    failureMode: 'Light direction changes across shots or faces glow without environmental cause.',
    correctiveAction: 'Name the practical/source, direction, contrast and skin separation in every scene handoff.',
    masterclassModule: 'world-building',
    tags: ['lighting','practical','cinematography','continuity'],
  },
  {
    id: 'edit-on-change',
    title: 'Cut on Information or Emotion Change',
    department: 'Edit',
    principle: 'A cut earns its place when something changes: information, power, emotion, direction or rhythm.',
    failureMode: 'Shot changes feel arbitrary and lower retention.',
    correctiveAction: 'Attach every cut to a story beat, reaction, reveal, impact or movement handoff.',
    masterclassModule: 'edit-room',
    tags: ['edit','cut','rhythm','retention'],
  },
  {
    id: 'reaction-value',
    title: 'Reactions Carry Meaning',
    department: 'Edit',
    principle: 'The audience often understands an event through the person receiving it.',
    failureMode: 'The edit shows events but not their emotional consequence.',
    correctiveAction: 'Generate reaction coverage for reveals, decisions, conflict and payoff.',
    masterclassModule: 'edit-room',
    tags: ['reaction','edit','emotion','coverage'],
  },
  {
    id: 'sound-bridge',
    title: 'Sound Can Glue Impossible Visual Cuts',
    department: 'Sound',
    principle: 'Ambience, J/L cuts and recurring motifs can preserve continuity across visually different generations.',
    failureMode: 'Every shot feels like a new clip rather than one film.',
    correctiveAction: 'Carry ambience before and after the picture cut; use recurring sonic motifs for story continuity.',
    masterclassModule: 'soundstage',
    tags: ['sound','j-cut','l-cut','ambience','continuity'],
  },
  {
    id: 'selective-rerun',
    title: 'Regenerate Only What Changed',
    department: 'Production',
    principle: 'AI film iteration becomes economical when shot dependencies and cache keys are explicit.',
    failureMode: 'A small creative change forces the whole sequence to be regenerated.',
    correctiveAction: 'Hash story, identity, set and camera dependencies per shot and rerun only dirty nodes.',
    masterclassModule: 'qc',
    tags: ['cache','rerun','workflow','cost','production'],
  },
  {
    id: 'qc-gates',
    title: 'Separate Beauty from Usability',
    department: 'Production',
    principle: 'A visually impressive shot can still fail continuity, physics, lip sync or edit requirements.',
    failureMode: 'Weak footage enters the timeline because it looks attractive in isolation.',
    correctiveAction: 'Score identity, continuity, motion, performance, lip sync, sound and edit fitness before approval.',
    masterclassModule: 'qc',
    tags: ['qc','score','approval','repair'],
  },
  {
    id: 'professional-export',
    title: 'Finish in a Real Editing Pipeline',
    department: 'Production',
    principle: 'AI filmmaking should hand clean structure to professional NLE and production tools.',
    failureMode: 'A generation app becomes a dead-end island.',
    correctiveAction: 'Export shot tables, EDL/FCPXML and production metadata alongside rendered media.',
    masterclassModule: 'release',
    tags: ['edl','fcpxml','nle','export','professional'],
  },
];

function hash(input: string) {
  let value = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(16).padStart(8, '0');
}

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
  })[char] || char);
}

function tc(seconds: number, fps = 24) {
  const frames = Math.max(0, Math.round(seconds * fps));
  const ff = frames % fps;
  const totalSeconds = Math.floor(frames / fps);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);
  return [hh, mm, ss, ff].map((part) => String(part).padStart(2, '0')).join(':');
}

function shotGrammar(index: number) {
  const grammar = [
    { shotSize: 'WS' as const, lensMm: 24, movement: 'slow motivated push', fov: 74 },
    { shotSize: 'MS' as const, lensMm: 50, movement: 'controlled lateral dolly', fov: 40 },
    { shotSize: 'CU' as const, lensMm: 85, movement: 'near-static emotional drift', fov: 24 },
  ];
  return grammar[index % grammar.length];
}

function knowledgeForShot(shotIndex: number) {
  if (shotIndex === 1) return ['shot-reason','axis-180','coverage-triad','motivated-light','state-ledger'];
  if (shotIndex === 2) return ['shot-reason','axis-180','performance-subtext','edit-on-change','state-ledger'];
  return ['shot-reason','identity-anchor','performance-subtext','lip-sync-coverage','reaction-value','edit-on-change'];
}

function buildShot(
  blueprint: FilmBlueprint,
  scene: FilmScenePlan,
  sceneIndex: number,
  shotIndex: number,
  previousShot: ProfessionalShot | null,
  previousCache: Map<string, ProfessionalShot>,
): ProfessionalShot {
  const grammar = shotGrammar(shotIndex - 1);
  const perShot = Math.max(2, scene.durationSeconds / 3);
  const id = `${scene.id}-shot-${String(shotIndex).padStart(2, '0')}`;
  const sameScenePrevious = previousShot?.sceneId === scene.id;
  const axis = sceneIndex % 2 === 0 ? 'A→B / camera stays north of axis' : 'B→A / camera stays south of axis';
  const screenDirection = sceneIndex % 2 === 0 ? 'lead movement left-to-right' : 'lead movement right-to-left';
  const firstFrameSource = sameScenePrevious
    ? `${previousShot?.id}:accepted-last-frame`
    : previousShot
      ? `character-reference + set-keyframe; preserve state from ${previousShot.id}`
      : 'approved character reference + approved set keyframe';
  const lastFrameHandoff = `${id}:accepted-last-frame → next dependent shot`;
  const purpose =
    shotIndex === 1
      ? `Anchor geography and establish the dramatic conditions of: ${scene.purpose}`
      : shotIndex === 2
        ? `Advance the action and visible objective inside: ${scene.purpose}`
        : `Capture the reaction, decision or emotional consequence of: ${scene.purpose}`;

  const continuityState = {
    identity: blueprint.characterBible[0]?.identityLock || 'approved lead identity',
    wardrobe: blueprint.characterBible[0]?.wardrobeRule || 'inherit wardrobe',
    props: 'Carry hero props and hand occupancy from the previous accepted shot.',
    environment: `${blueprint.worldBible[0]?.continuityRule || 'preserve set geography'} | ${scene.continuity}`,
    eyeline: shotIndex === 3 ? 'match eyeline to the preceding action source' : 'maintain established eyeline axis',
    screenDirection,
  };

  const generationPrompt = [
    blueprint.visualStyle,
    purpose,
    `Shot: ${grammar.shotSize}, ${grammar.lensMm}mm, ${grammar.movement}.`,
    `Axis: ${axis}.`,
    `Blocking: lead subject remains spatially consistent; ${screenDirection}.`,
    `Continuity: ${Object.values(continuityState).join(' ')}`,
    `First-frame strategy: ${firstFrameSource}.`,
    'Physically believable motion, intentional performance, motivated practical lighting, premium feature-film realism.',
  ].join(' ');

  const cacheKey = hash([
    blueprint.title,
    blueprint.visualStyle,
    scene.id,
    scene.purpose,
    grammar.shotSize,
    grammar.lensMm,
    grammar.movement,
    JSON.stringify(continuityState),
    firstFrameSource,
  ].join('|'));
  const previous = previousCache.get(id);
  const cacheState: ProfessionalShot['cacheState'] = !previous
    ? 'new'
    : previous.cacheKey === cacheKey
      ? 'hit'
      : 'dirty';

  return {
    id,
    sceneId: scene.id,
    sceneTitle: scene.title,
    sceneIndex,
    shotIndex,
    purpose,
    durationSeconds: Number(perShot.toFixed(2)),
    shotSize: grammar.shotSize,
    lensMm: grammar.lensMm,
    movement: grammar.movement,
    axis,
    blocking:
      shotIndex === 1
        ? 'Lead occupies the primary third; environment and entrances remain readable.'
        : shotIndex === 2
          ? 'Lead advances objective; supporting action crosses only within the established axis.'
          : 'Hold the face and eyeline long enough for the audience to read the decision.',
    dialogue: shotIndex === 3 ? 'Dialogue/reaction coverage if speech occurs in this beat.' : 'Prefer action or short playable dialogue.',
    sfx: scene.sound,
    lighting: blueprint.worldBible[0]?.lighting || 'Motivated scene lighting',
    generationPrompt,
    firstFrameSource,
    lastFrameHandoff,
    continuityState,
    cacheKey,
    cacheState,
    ...(cacheState === 'dirty' ? { rerunReason: 'One or more story / camera / continuity dependencies changed.' } : {}),
    floorPlan: {
      subjectX: 50,
      subjectY: 50,
      cameraX: shotIndex === 1 ? 18 : shotIndex === 2 ? 28 : 36,
      cameraY: sceneIndex % 2 === 0 ? 78 - shotIndex * 7 : 22 + shotIndex * 7,
      cameraAngleDeg: sceneIndex % 2 === 0 ? 325 + shotIndex * 8 : 35 - shotIndex * 8,
      fieldOfViewDeg: grammar.fov,
    },
    knowledgeRefs: knowledgeForShot(shotIndex),
  };
}

export function buildShotPlan(
  blueprint: FilmBlueprint,
  previousShots: ProfessionalShot[] = [],
) {
  const previousCache = new Map(previousShots.map((shot) => [shot.id, shot]));
  const shots: ProfessionalShot[] = [];
  let previousShot: ProfessionalShot | null = null;

  blueprint.scenes.forEach((scene, sceneOffset) => {
    for (let shotIndex = 1; shotIndex <= 3; shotIndex += 1) {
      const shot = buildShot(
        blueprint,
        scene,
        sceneOffset + 1,
        shotIndex,
        previousShot,
        previousCache,
      );
      shots.push(shot);
      previousShot = shot;
    }
  });

  return shots;
}

export function buildDeterministicDebate(shot: ProfessionalShot): DebateResult {
  const proposals: DebateProposal[] = [
    {
      agent: 'Director',
      recommendation: `Keep the shot only if ${shot.purpose.toLowerCase()} remains readable without explanation. Preserve the performance objective before adding spectacle.`,
      risk: 'Visual ambition could overpower the dramatic beat.',
      score: 9,
    },
    {
      agent: 'Cinematographer',
      recommendation: `Use ${shot.shotSize} on ${shot.lensMm}mm with ${shot.movement}; maintain ${shot.axis} and motivated light direction.`,
      risk: 'Changing lens or crossing the axis will weaken spatial continuity.',
      score: 9,
    },
    {
      agent: 'Continuity Supervisor',
      recommendation: `Honor first-frame source "${shot.firstFrameSource}" and carry identity, wardrobe, props, eyeline and screen direction unchanged unless scripted.`,
      risk: 'Identity or state drift will make the cut unusable even if the frame is attractive.',
      score: 10,
    },
    {
      agent: 'Editor',
      recommendation: 'Enter on action or information change, hold the reaction long enough to read, and protect ambience across the cut.',
      risk: 'A decorative cut can destroy rhythm or emotional causality.',
      score: 9,
    },
  ];

  return {
    shotId: shot.id,
    proposals,
    judge: {
      decision: 'APPROVE',
      winningApproach: 'Continuity-first directing with motivated camera and edit-aware coverage.',
      mandatoryChanges: [
        'Do not cross the established axis unless the crossing is visible and motivated.',
        'Preserve the continuity state ledger and first-frame handoff.',
        'Reject any generated take with identity, hand, physics or light-direction drift.',
      ],
      score: 9.25,
    },
  };
}

function buildEdl(title: string, shots: ProfessionalShot[]) {
  const lines = [`TITLE: ${title}`, 'FCM: NON-DROP FRAME', ''];
  let record = 0;
  shots.forEach((shot, index) => {
    const sourceIn = 0;
    const sourceOut = shot.durationSeconds;
    const recordIn = record;
    const recordOut = record + shot.durationSeconds;
    lines.push(
      `${String(index + 1).padStart(3, '0')}  AX       V     C        ${tc(sourceIn)} ${tc(sourceOut)} ${tc(recordIn)} ${tc(recordOut)}`,
    );
    lines.push(`* FROM CLIP NAME: ${shot.id}.mp4`);
    lines.push(`* COMMENT: ${shot.purpose.replace(/\n/g, ' ')}`);
    lines.push('');
    record = recordOut;
  });
  return lines.join('\n');
}

function buildFcpxml(title: string, shots: ProfessionalShot[]) {
  let offset = 0;
  const assets = shots
    .map((shot, index) => `<asset id="r${index + 2}" name="${escapeXml(shot.id)}" src="file:///${escapeXml(shot.id)}.mp4" start="0s" duration="${shot.durationSeconds}s" hasVideo="1" hasAudio="1"/>`)
    .join('');
  const clips = shots
    .map((shot, index) => {
      const clip = `<asset-clip ref="r${index + 2}" name="${escapeXml(shot.id)}" offset="${offset}s" start="0s" duration="${shot.durationSeconds}s"><note>${escapeXml(shot.purpose)}</note></asset-clip>`;
      offset += shot.durationSeconds;
      return clip;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><fcpxml version="1.10"><resources><format id="r1" name="FFVideoFormat1080p24" frameDuration="1/24s" width="1920" height="1080"/>${assets}</resources><library><event name="${escapeXml(title)}"><project name="${escapeXml(title)}"><sequence format="r1" tcStart="0s" tcFormat="NDF"><spine>${clips}</spine></sequence></project></event></library></fcpxml>`;
}

function csvCell(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(shots: ProfessionalShot[]) {
  const header = ['Shot','Scene','Purpose','Duration','Size','Lens','Movement','Axis','Blocking','Dialogue','SFX','First Frame','Cache'];
  const rows = shots.map((shot) => [
    shot.id,
    shot.sceneTitle,
    shot.purpose,
    shot.durationSeconds,
    shot.shotSize,
    `${shot.lensMm}mm`,
    shot.movement,
    shot.axis,
    shot.blocking,
    shot.dialogue,
    shot.sfx,
    shot.firstFrameSource,
    shot.cacheState,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}

export function compileProfessionalFilm(
  blueprint: FilmBlueprint,
  previousShots: ProfessionalShot[] = [],
): ProfessionalFilmPackage {
  const shots = buildShotPlan(blueprint, previousShots);
  const continuityGraph = shots.map((shot, index) => ({
    from: index === 0 ? null : shots[index - 1].id,
    to: shot.id,
    transfer: ['identity','wardrobe','props','environment','eyeline','screenDirection'],
    firstFrameStrategy: shot.firstFrameSource,
  }));
  const rerunQueue = shots
    .filter((shot) => shot.cacheState !== 'hit')
    .map((shot) => shot.id);
  const knowledgeCoverage = CINEMA_KNOWLEDGE.map((card) => ({
    id: card.id,
    title: card.title,
    department: card.department,
    usedByShots: shots.filter((shot) => shot.knowledgeRefs.includes(card.id)).length,
  })).filter((card) => card.usedByShots > 0);

  return {
    title: blueprint.title,
    shots,
    continuityGraph,
    rerunQueue,
    knowledgeCoverage,
    exports: {
      edl: buildEdl(blueprint.title, shots),
      fcpxml: buildFcpxml(blueprint.title, shots),
      csv: buildCsv(shots),
    },
  };
}

export function searchCinemaKnowledge(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return CINEMA_KNOWLEDGE;
  return CINEMA_KNOWLEDGE.filter((card) =>
    [
      card.title,
      card.department,
      card.principle,
      card.failureMode,
      card.correctiveAction,
      card.tags.join(' '),
    ].join(' ').toLowerCase().includes(needle),
  );
}
