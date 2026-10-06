import type { FilmBlueprint, FilmScenePlan } from './movie-masterclass';

export type ActorProfile = {
  id: string;
  name: string;
  role: string;
  appearance: string;
  wardrobe: string;
  performanceDNA: string;
  voice: string;
  referenceCount: number;
};

export type SetProfile = {
  id: string;
  name: string;
  location: string;
  timeOfDay: string;
  productionDesign: string;
  lighting: string;
  heroProps: string;
  atmosphere: string;
};

export type SceneProductionPackage = {
  sceneId: string;
  title: string;
  slugline: string;
  storyPurpose: string;
  directorIntent: string;
  actorBrief: string;
  setBrief: string;
  referenceImagePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
  dialogueDirection: string;
  continuityFingerprint: string;
  camera: string;
  sound: string;
  durationSeconds: number;
  aspectRatio: string;
};

const clean = (value: string | undefined, fallback: string) =>
  value?.trim() || fallback;

export const SET_PRESETS: SetProfile[] = [
  {
    id: 'rooftop-dawn',
    name: 'Rooftop at Dawn',
    location: 'High rooftop overlooking a contemporary Nigerian city',
    timeOfDay: 'Blue hour moving into sunrise',
    productionDesign:
      'Concrete roof, subtle antennas, distant skyline, restrained modern realism',
    lighting:
      'Warm sunrise rim light against cool ambient city fill; motivated haze',
    heroProps: 'Notebook, phone, minimal practical objects',
    atmosphere: 'Wind, distant city movement, thin cloud layers, cinematic scale',
  },
  {
    id: 'war-room',
    name: 'Midnight War Room',
    location: 'Private study that feels half prayer room, half creative command center',
    timeOfDay: 'Midnight during rain',
    productionDesign:
      'Open Bible, laptop, handwritten plans, maps, desk lamp, tactile wood and paper',
    lighting:
      'Single warm practical key, cool rain-window ambience, deep controlled shadows',
    heroProps: 'Bible, notebook, laptop, wall maps',
    atmosphere: 'Rain, quiet tension, distant thunder, concentrated stillness',
  },
  {
    id: 'revival-street',
    name: 'Rain Revival Street',
    location: 'Wet urban street transformed into an intimate public gathering',
    timeOfDay: 'Night',
    productionDesign:
      'Wet asphalt, practical street lights, simple crowd barriers, authentic wardrobe',
    lighting:
      'Strong backlight through rain, warm faces, reflective pavement and controlled haze',
    heroProps: 'Handheld microphone optional; umbrellas kept outside hero interaction',
    atmosphere: 'Rain, breath, crowd emotion, reflected light, urgent humanity',
  },
  {
    id: 'innovation-command',
    name: 'Innovation Command Center',
    location: 'Premium modern African technology studio',
    timeOfDay: 'Night',
    productionDesign:
      'Large display surfaces, clean desks, tactile prototypes, elegant practical screens',
    lighting:
      'Soft motivated display light with warm skin separation and controlled contrast',
    heroProps: 'Presentation display, laptop, prototype device, strategy notes',
    atmosphere: 'Focused team energy, quiet technological confidence',
  },
  {
    id: 'auditorium-finale',
    name: 'Auditorium Finale',
    location: 'Large conference and worship auditorium',
    timeOfDay: 'Night',
    productionDesign:
      'Deep stage, practical beams, audience depth, minimal prestige scenic elements',
    lighting:
      'Single hero spotlight expanding into warm audience reveal and volumetric beams',
    heroProps: 'Stage monitor, handheld microphone optional',
    atmosphere: 'Expectation, scale, cheering payoff, emotional release',
  },
];

export function buildDeterministicScreenplay(blueprint: FilmBlueprint) {
  const lines: string[] = [];
  lines.push(blueprint.title.toUpperCase());
  lines.push('');
  lines.push(`Genre: ${blueprint.genre} | Audience: ${blueprint.audience}`);
  lines.push(`Logline: ${blueprint.logline}`);
  lines.push('');
  lines.push('FADE IN:');
  lines.push('');

  blueprint.scenes.forEach((scene, index) => {
    const location = scene.act === 1 ? 'PRIMARY WORLD' : scene.act === 2 ? 'CONFRONTATION SPACE' : 'CLIMACTIC WORLD';
    const time = scene.act === 1 ? 'DAWN / DAY' : scene.act === 2 ? 'NIGHT / PRESSURE' : 'NIGHT INTO LIGHT';
    lines.push(`SCENE ${String(index + 1).padStart(2, '0')} — INT./EXT. ${location} — ${time}`);
    lines.push('');
    lines.push(scene.purpose);
    lines.push('');
    lines.push(`DIRECTOR: ${scene.camera}. ${scene.continuity}`);
    lines.push(`VISUAL: ${scene.visualPrompt}`);
    lines.push(`SOUND: ${scene.sound}`);
    lines.push('');
    if (index === 0) {
      lines.push('MABRIG (V.O.)');
      lines.push('There comes a moment when vision becomes responsibility.');
    } else if (index === blueprint.scenes.length - 1) {
      lines.push('MABRIG');
      lines.push('Build what the future is waiting for.');
    } else {
      lines.push('ACTION / DIALOGUE BEAT');
      lines.push('Performance and dialogue are generated from the scene objective, conflict and transformation while preserving the character bible.');
    }
    lines.push('');
  });

  lines.push('FADE OUT.');
  return lines.join('\n');
}

export function buildSceneProductionPackage(input: {
  blueprint: Pick<
    FilmBlueprint,
    'title' | 'genre' | 'visualStyle' | 'aspectRatio' | 'storyEngine'
  >;
  scene: FilmScenePlan;
  actor?: Partial<ActorProfile>;
  set?: Partial<SetProfile>;
}): SceneProductionPackage {
  const actorName = clean(input.actor?.name, 'Lead character');
  const actorAppearance = clean(
    input.actor?.appearance,
    'Use the approved identity reference plates without changing facial geometry, age, skin tone or body proportions.',
  );
  const wardrobe = clean(
    input.actor?.wardrobe,
    'Inherit wardrobe state from the preceding accepted scene.',
  );
  const performanceDNA = clean(
    input.actor?.performanceDNA,
    'Restrained, emotionally specific, intention-first performance with natural micro-expressions.',
  );
  const setName = clean(input.set?.name, 'Primary cinematic set');
  const location = clean(input.set?.location, 'Story-appropriate cinematic environment');
  const timeOfDay = clean(input.set?.timeOfDay, 'Motivated story time');
  const design = clean(input.set?.productionDesign, 'Premium realistic production design');
  const lighting = clean(input.set?.lighting, 'Motivated cinematic practical lighting');
  const props = clean(input.set?.heroProps, 'Only story-motivated props');
  const atmosphere = clean(input.set?.atmosphere, 'Controlled cinematic atmosphere');

  const fingerprint = [
    actorName,
    actorAppearance,
    wardrobe,
    setName,
    location,
    timeOfDay,
    design,
    lighting,
  ]
    .join('|')
    .toLowerCase()
    .replace(/[^a-z0-9|]+/g, '-')
    .slice(0, 420);

  const referenceImagePrompt = [
    `REFERENCE FRAME FOR "${input.blueprint.title}" — ${input.scene.title}.`,
    `Genre: ${input.blueprint.genre}. Visual DNA: ${input.blueprint.visualStyle}.`,
    `Character: ${actorName}. ${actorAppearance} Wardrobe: ${wardrobe}.`,
    `Set: ${setName}, ${location}, ${timeOfDay}. Production design: ${design}.`,
    `Lighting: ${lighting}. Atmosphere: ${atmosphere}. Hero props: ${props}.`,
    `Story purpose: ${input.scene.purpose}`,
    `Camera anchor: ${input.scene.camera}.`,
    'Premium feature-film still, physically believable space, realistic skin texture, coherent hands and anatomy, controlled depth of field, no text, no watermark.',
  ].join(' ');

  const videoPrompt = [
    `SCENE: ${input.scene.title}.`,
    `INTENT: ${input.scene.purpose}`,
    `ACTOR: ${actorName}; ${performanceDNA}`,
    `IDENTITY: ${actorAppearance}`,
    `WARDROBE: ${wardrobe}`,
    `SET: ${location}; ${design}; ${atmosphere}`,
    `LIGHT: ${lighting}`,
    `CAMERA: ${input.scene.camera}`,
    `CONTINUITY: ${input.scene.continuity}`,
    `SOUND INTENT: ${input.scene.sound}`,
    'Motion must be purposeful, subtle and physically plausible. Preserve face, body, wardrobe, set geography and light direction across the entire shot.',
  ].join(' ');

  return {
    sceneId: input.scene.id,
    title: input.scene.title,
    slugline: `INT./EXT. ${setName.toUpperCase()} — ${timeOfDay.toUpperCase()}`,
    storyPurpose: input.scene.purpose,
    directorIntent:
      'Every visual choice must clarify story, performance or emotional escalation; spectacle is rejected when it weakens narrative clarity.',
    actorBrief: `${actorName}: ${performanceDNA} Identity: ${actorAppearance} Wardrobe: ${wardrobe}`,
    setBrief: `${location}. ${design}. ${lighting}. ${atmosphere}. Props: ${props}`,
    referenceImagePrompt,
    videoPrompt,
    negativePrompt:
      'identity drift, different actor, face morphing, age change, wardrobe mutation, duplicate limbs, broken hands, floating objects, rubber motion, temporal warping, random camera movement, inconsistent light direction, unreadable text, watermark',
    dialogueDirection:
      'Write dialogue from objective + obstacle + subtext. Keep lines speakable, concise and emotionally playable. For visible speech, prefer frontal or three-quarter coverage suitable for lip-sync.',
    continuityFingerprint: fingerprint,
    camera: input.scene.camera,
    sound: input.scene.sound,
    durationSeconds: input.scene.durationSeconds,
    aspectRatio: input.blueprint.aspectRatio,
  };
}
