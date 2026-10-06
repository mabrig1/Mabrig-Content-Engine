export type MovieGenre =
  | 'Faith Epic'
  | 'Drama'
  | 'Thriller'
  | 'Action'
  | 'Sci-Fi'
  | 'Romance'
  | 'Historical'
  | 'Documentary'
  | 'Afro-Futurist';

export type FilmProjectInput = {
  title: string;
  logline: string;
  genre: MovieGenre;
  durationMinutes: number;
  audience: string;
  visualStyle: string;
  protagonist: string;
  conflict: string;
  ending: string;
  aspectRatio: string;
};

export type MasterclassModule = {
  id: string;
  number: number;
  title: string;
  promise: string;
  skill: string;
  deliverable: string;
};

export type FilmScenePlan = {
  id: string;
  act: 1 | 2 | 3;
  title: string;
  purpose: string;
  visualPrompt: string;
  camera: string;
  continuity: string;
  sound: string;
  durationSeconds: number;
};

export type FilmBlueprint = {
  title: string;
  logline: string;
  genre: MovieGenre;
  audience: string;
  visualStyle: string;
  aspectRatio: string;
  durationMinutes: number;
  storyEngine: {
    theme: string;
    protagonist: string;
    desire: string;
    opposition: string;
    transformation: string;
  };
  characterBible: Array<{
    role: string;
    identityLock: string;
    wardrobeRule: string;
    performanceRule: string;
  }>;
  worldBible: Array<{
    location: string;
    lighting: string;
    palette: string;
    continuityRule: string;
  }>;
  scenes: FilmScenePlan[];
  qualityGates: string[];
  productionOrder: string[];
};

export const MASTERCLASS_MODULES: MasterclassModule[] = [
  {
    id: 'idea-to-premise',
    number: 1,
    title: 'Idea → Irresistible Premise',
    promise: 'Turn one sentence into a film people immediately want to watch.',
    skill: 'High-concept loglines, theme, audience promise and emotional stakes.',
    deliverable: 'One-page greenlight brief.',
  },
  {
    id: 'story-architecture',
    number: 2,
    title: 'Story Architecture',
    promise: 'Design a 3-act story engine that can survive scene-by-scene generation.',
    skill: 'Act turns, escalation, reversals, payoff and short-form retention.',
    deliverable: 'Beat sheet + scene purpose map.',
  },
  {
    id: 'character-dna',
    number: 3,
    title: 'Character DNA & Identity Lock',
    promise: 'Keep one believable actor identity across changing locations and shots.',
    skill: 'Reference plates, wardrobe rules, facial continuity and performance traits.',
    deliverable: 'Character bible + reference pack.',
  },
  {
    id: 'world-building',
    number: 4,
    title: 'World Bible',
    promise: 'Make every set feel like it belongs to the same movie.',
    skill: 'Location grammar, props, palette, weather, architecture and recurring motifs.',
    deliverable: 'World bible + location continuity matrix.',
  },
  {
    id: 'director-brain',
    number: 5,
    title: 'AI Director Brain',
    promise: 'Translate emotion into camera, blocking, light and shot size.',
    skill: 'Coverage, lenses, camera choreography and directorial intent.',
    deliverable: 'Director treatment + shot grammar.',
  },
  {
    id: 'performance',
    number: 6,
    title: 'Performance & Dialogue',
    promise: 'Direct believable acting instead of generic AI motion.',
    skill: 'Subtext, eyelines, gestures, timing, dialogue rhythm and lip-sync planning.',
    deliverable: 'Performance notes + dialogue shot plan.',
  },
  {
    id: 'shot-forge',
    number: 7,
    title: 'Shot Forge',
    promise: 'Generate production-ready shots with reusable prompt structure.',
    skill: 'Text-to-video, image-to-video, first/last frame and reference-driven generation.',
    deliverable: 'Prompt stack + scene variants.',
  },
  {
    id: 'continuity-graph',
    number: 8,
    title: 'Continuity Graph',
    promise: 'Stop wardrobe, prop, time-of-day and geography drift before it ruins the edit.',
    skill: 'State tracking, reference inheritance and scene-to-scene continuity.',
    deliverable: 'Continuity graph + exception list.',
  },
  {
    id: 'soundstage',
    number: 9,
    title: 'AI Soundstage',
    promise: 'Build emotional sound that makes generated images feel like cinema.',
    skill: 'Dialogue, ambience, foley, impact design, score maps and silence.',
    deliverable: 'Sound cue sheet + mix map.',
  },
  {
    id: 'edit-room',
    number: 10,
    title: 'Edit Room Intelligence',
    promise: 'Turn disconnected generations into a film with pace and meaning.',
    skill: 'J/L cuts, match cuts, rhythm, reaction shots, compression and montage.',
    deliverable: 'Assembly edit + retention pass.',
  },
  {
    id: 'qc',
    number: 11,
    title: 'Cinematic QC & Repair',
    promise: 'Repair only the weak frames instead of regenerating an entire movie.',
    skill: 'Identity, motion, physics, lip-sync, artifact and continuity scoring.',
    deliverable: 'QC report + surgical repair queue.',
  },
  {
    id: 'release',
    number: 12,
    title: 'Master, Trailer & Release',
    promise: 'Finish one film into multiple platform-native versions.',
    skill: 'Color, captions, 4K master, trailer, teaser, Shorts/Reels and campaign packaging.',
    deliverable: 'Cinema master + trailer + vertical campaign kit.',
  },
];

const cameraByAct = {
  1: ['24mm establishing push', '50mm eye-level dolly', '85mm emotional close-up'],
  2: ['35mm handheld pursuit', '50mm lateral tracking', '85mm compressed tension'],
  3: ['24mm heroic wide', '50mm circular dolly', '85mm final truth close-up'],
};

function secondsFor(durationMinutes: number) {
  const total = Math.max(1, Math.min(180, durationMinutes)) * 60;
  const sceneCount = durationMinutes <= 3 ? 8 : durationMinutes <= 12 ? 12 : 15;
  return Math.max(5, Math.round(total / sceneCount));
}

export function buildFilmBlueprint(input: FilmProjectInput): FilmBlueprint {
  const title = input.title.trim() || 'Untitled Cinematic Film';
  const logline =
    input.logline.trim() ||
    `${input.protagonist || 'A determined protagonist'} must overcome ${input.conflict || 'an impossible obstacle'} before everything they value is lost.`;
  const protagonist = input.protagonist.trim() || 'A determined protagonist';
  const conflict = input.conflict.trim() || 'an escalating force that attacks the hero’s deepest weakness';
  const ending = input.ending.trim() || 'The hero acts with courage and becomes who the story demanded.';
  const sceneDuration = secondsFor(input.durationMinutes);
  const sceneCount = input.durationMinutes <= 3 ? 8 : input.durationMinutes <= 12 ? 12 : 15;

  const purposes = [
    'Cold open: reveal a striking image, unresolved danger or emotional question.',
    'Establish the hero’s ordinary world and the internal wound beneath it.',
    'Inciting incident: make the old life impossible to continue.',
    'First decision: the hero chooses a path and crosses the threshold.',
    'Escalation: introduce a costly obstacle and a visible failure.',
    'Discovery: reveal information that changes the meaning of the mission.',
    'Midpoint: force a bold action that raises the stakes.',
    'Pressure: make the external problem attack the hero personally.',
    'Loss: remove the easy option and expose the hero’s deepest fear.',
    'Revelation: the hero understands what must change internally.',
    'Final plan: convert belief into decisive action.',
    'Climax: resolve the core conflict through the hero’s transformed choice.',
    'Aftermath: show the immediate consequence of the climax.',
    'Emotional payoff: echo the opening image with a changed meaning.',
    'Final image: leave one unforgettable visual statement.',
  ];

  const scenes: FilmScenePlan[] = Array.from({ length: sceneCount }, (_, index) => {
    const progress = index / Math.max(1, sceneCount - 1);
    const act: 1 | 2 | 3 = progress < 0.27 ? 1 : progress < 0.76 ? 2 : 3;
    const purpose = purposes[Math.min(index, purposes.length - 1)];
    const cameraList = cameraByAct[act];
    const camera = cameraList[index % cameraList.length];

    return {
      id: `scene-${String(index + 1).padStart(2, '0')}`,
      act,
      title: `Scene ${String(index + 1).padStart(2, '0')} · ${act === 1 ? 'Setup' : act === 2 ? 'Confrontation' : 'Resolution'}`,
      purpose,
      visualPrompt:
        `${input.visualStyle}. ${purpose} Character: ${protagonist}. Core conflict: ${conflict}. Cinematic production design, intentional blocking, motivated practical lighting, realistic skin texture, controlled depth of field, premium feature-film composition.`,
      camera,
      continuity:
        'Inherit approved character face, wardrobe state, prop state, location geography, weather and time-of-day from the previous accepted shot.',
      sound:
        act === 1
          ? 'Natural ambience + restrained motif; leave room for story information.'
          : act === 2
            ? 'Layer tension pulse, specific foley and dynamic environmental sound.'
            : 'Expand score, preserve dialogue clarity, then resolve into a memorable sonic button.',
      durationSeconds: sceneDuration,
    };
  });

  return {
    title,
    logline,
    genre: input.genre,
    audience: input.audience.trim() || 'Global digital audience',
    visualStyle: input.visualStyle.trim() || 'Premium cinematic realism',
    aspectRatio: input.aspectRatio || '2.39:1',
    durationMinutes: Math.max(1, Math.min(180, input.durationMinutes || 3)),
    storyEngine: {
      theme: `Transformation under pressure: ${ending}`,
      protagonist,
      desire: 'Achieve the external goal while confronting the internal lie that keeps the hero small.',
      opposition: conflict,
      transformation: ending,
    },
    characterBible: [
      {
        role: 'Lead',
        identityLock:
          'Use the same approved face reference set for every shot. Preserve age, facial geometry, skin tone, hair, body proportions and signature expression language.',
        wardrobeRule:
          'Track wardrobe by story beat. A wardrobe change must be motivated and explicitly declared before generation.',
        performanceRule:
          'Performance is intention-first: define objective, obstacle, subtext, eyeline and gesture before camera movement.',
      },
      {
        role: 'Supporting cast',
        identityLock:
          'Create named reference plates before first appearance and reuse them across every later generation.',
        wardrobeRule:
          'Give every recurring character one hero silhouette and a controlled variation set.',
        performanceRule:
          'Reaction shots must reflect the scene objective rather than generic smiling, staring or random motion.',
      },
    ],
    worldBible: [
      {
        location: 'Primary world',
        lighting: 'Motivated light sources; maintain direction and time-of-day continuity.',
        palette: input.visualStyle,
        continuityRule:
          'Lock architecture, hero props, entrances/exits and screen direction before generating coverage.',
      },
      {
        location: 'Climactic world',
        lighting: 'Increase contrast and scale while preserving the established visual grammar.',
        palette: 'A heightened version of the primary palette, not a different movie.',
        continuityRule:
          'Every visual escalation must serve the story climax, not spectacle alone.',
      },
    ],
    scenes,
    qualityGates: [
      'Identity score: reject visible face drift before edit.',
      'Continuity score: wardrobe, props, geography, eyelines and time-of-day must agree.',
      'Motion score: reject broken anatomy, impossible physics and temporal warping.',
      'Performance score: gestures and facial emotion must match dramatic intention.',
      'Lip-sync score: spoken or sung close-ups must pass phoneme timing review.',
      'Cinematography score: every shot must have a narrative reason for lens, movement and light.',
      'Sound score: dialogue intelligibility, ambience continuity and impact timing must pass.',
      'Edit score: remove beautiful shots that weaken pace, clarity or emotional escalation.',
    ],
    productionOrder: [
      'Greenlight premise',
      'Lock screenplay beats',
      'Build character reference plates',
      'Build world/location bible',
      'Generate keyframes and storyboard',
      'Generate anchor shots first',
      'Generate coverage and reaction shots',
      'Run continuity graph',
      'Record/generate dialogue and sound',
      'Assemble edit',
      'QC and surgical repair',
      'Master cinema + social versions',
    ],
  };
}
