import type { FilmBlueprint } from './movie-masterclass';
import type { ProfessionalFilmPackage, ProfessionalShot } from './pro-film-os';

export type StoryboardFrame = {
  shotId: string;
  sceneTitle: string;
  caption: string;
  prompt: string;
  svgDataUrl: string;
  firstFrameSource: string;
  lastFrameHandoff: string;
  continuityChecklist: string[];
};

export type TimelineClip = {
  shotId: string;
  startSeconds: number;
  durationSeconds: number;
  endSeconds: number;
  track: 'V1';
  audioTrack: 'A1';
  transition: 'cut' | 'dissolve';
  sourceUrl?: string;
};

export type TimelinePlan = {
  title: string;
  durationSeconds: number;
  clips: TimelineClip[];
  ffmpegConcatManifest: string;
  missingSources: string[];
};

export type QCScore = {
  identity: number;
  continuity: number;
  anatomyPhysics: number;
  performance: number;
  lighting: number;
  editFitness: number;
  overall: number;
  decision: 'PASS' | 'REPAIR' | 'RESHOOT';
  issues: string[];
  repairPrompt: string;
};

function esc(value:string){
  return value.replace(/[&<>"']/g,(c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;' }[c]||c));
}

function svgForShot(shot: ProfessionalShot){
  const w=1280,h=720;
  const camX=Math.round((shot.floorPlan.cameraX/100)*w);
  const camY=Math.round((shot.floorPlan.cameraY/100)*h);
  const subX=Math.round((shot.floorPlan.subjectX/100)*w);
  const subY=Math.round((shot.floorPlan.subjectY/100)*h);
  const title=esc(shot.id.toUpperCase());
  const purpose=esc(shot.purpose.slice(0,145));
  const camera=esc(`${shot.shotSize} · ${shot.lensMm}mm · ${shot.movement}`);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#0a0a0d"/>
  <rect x="26" y="26" width="1228" height="668" rx="20" fill="#111216" stroke="#6f542f" stroke-width="2"/>
  <line x1="120" y1="360" x2="1160" y2="360" stroke="#5f4b31" stroke-width="2" stroke-dasharray="14 14"/>
  <circle cx="${subX}" cy="${subY}" r="58" fill="#7c5728" stroke="#d9a960" stroke-width="5"/>
  <text x="${subX}" y="${subY+6}" text-anchor="middle" fill="#fff1cf" font-size="18" font-family="Arial" font-weight="700">ACTOR</text>
  <polygon points="${camX},${camY-46} ${camX-42},${camY+36} ${camX+42},${camY+36}" fill="#1f4763" stroke="#6aa7d0" stroke-width="4"/>
  <text x="${camX}" y="${camY+64}" text-anchor="middle" fill="#a9d9fb" font-size="16" font-family="Arial" font-weight="700">CAM</text>
  <text x="60" y="82" fill="#d9ad68" font-size="28" font-family="Georgia" font-weight="700">${title}</text>
  <text x="60" y="118" fill="#8c8478" font-size="18" font-family="Arial">${camera}</text>
  <foreignObject x="60" y="560" width="1160" height="110"><div xmlns="http://www.w3.org/1999/xhtml" style="color:#c4bcb0;font-family:Arial;font-size:18px;line-height:1.45">${purpose}</div></foreignObject>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function buildStoryboard(film: ProfessionalFilmPackage): StoryboardFrame[] {
  return film.shots.map((shot)=>({
    shotId:shot.id,
    sceneTitle:shot.sceneTitle,
    caption:`${shot.shotSize} · ${shot.lensMm}mm · ${shot.movement}`,
    prompt:shot.generationPrompt,
    svgDataUrl:svgForShot(shot),
    firstFrameSource:shot.firstFrameSource,
    lastFrameHandoff:shot.lastFrameHandoff,
    continuityChecklist:[
      'Same approved character identity and age',
      'Wardrobe and hero props match continuity ledger',
      'Camera remains on approved side of axis',
      'Eyeline and screen direction match adjacent shots',
      'Lighting direction and time-of-day remain coherent',
      'Last frame can hand off cleanly to the next dependent shot',
    ],
  }));
}

export function buildTimeline(
  title:string,
  shots:ProfessionalShot[],
  sourceUrls:Record<string,string> = {},
):TimelinePlan{
  let cursor=0;
  const clips=shots.map((shot,index)=>{
    const clip:TimelineClip={
      shotId:shot.id,
      startSeconds:Number(cursor.toFixed(3)),
      durationSeconds:shot.durationSeconds,
      endSeconds:Number((cursor+shot.durationSeconds).toFixed(3)),
      track:'V1',
      audioTrack:'A1',
      transition:index===0?'cut':'cut',
      ...(sourceUrls[shot.id]?{sourceUrl:sourceUrls[shot.id]}:{}),
    };
    cursor+=shot.durationSeconds;
    return clip;
  });
  const missingSources=clips.filter((clip)=>!clip.sourceUrl).map((clip)=>clip.shotId);
  const ffmpegConcatManifest=clips
    .filter((clip)=>clip.sourceUrl)
    .map((clip)=>`file '${String(clip.sourceUrl).replace(/'/g,"'\\''")}'`)
    .join('\n');
  return {
    title,
    durationSeconds:Number(cursor.toFixed(3)),
    clips,
    ffmpegConcatManifest,
    missingSources,
  };
}

function clamp(n:number){return Math.max(0,Math.min(10,n));}

export function deterministicQC(
  shot:ProfessionalShot,
  evidence?:{
    previousShot?:ProfessionalShot|null;
    hasReferenceFrame?:boolean;
    hasGeneratedVideo?:boolean;
    notes?:string;
  }
):QCScore{
  const issues:string[]=[];
  let identity=9;
  let continuity=9;
  let anatomyPhysics=8.5;
  let performance=8.5;
  let lighting=9;
  let editFitness=9;

  if(!evidence?.hasReferenceFrame){identity-=1;issues.push('No approved visual reference frame was supplied for this QC pass.');}
  if(!evidence?.hasGeneratedVideo){anatomyPhysics-=1;performance-=.5;issues.push('No rendered video evidence was supplied; motion and performance checks are provisional.');}
  if(evidence?.previousShot && shot.firstFrameSource.includes('accepted-last-frame')===false){
    continuity-=1;
    issues.push('Adjacent action does not explicitly inherit the previous accepted last frame.');
  }
  if(shot.cacheState==='dirty'){
    continuity-=.5;
    issues.push('Shot dependencies changed and require a fresh continuity check.');
  }
  if(shot.shotSize==='CU' && !shot.dialogue.toLowerCase().includes('dialogue')){
    performance-=.3;
  }

  const scores=[identity,continuity,anatomyPhysics,performance,lighting,editFitness].map(clamp);
  const overall=Number((scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(2));
  const decision:QCScore['decision']=overall>=8.5?'PASS':overall>=7?'REPAIR':'RESHOOT';
  const repairPrompt=[
    `Repair ${shot.id} without changing story intent.`,
    `Preserve identity: ${shot.continuityState.identity}`,
    `Preserve wardrobe: ${shot.continuityState.wardrobe}`,
    `Preserve screen direction: ${shot.continuityState.screenDirection}`,
    `Preserve eyeline: ${shot.continuityState.eyeline}`,
    `Camera remains ${shot.shotSize} ${shot.lensMm}mm with ${shot.movement}.`,
    issues.length?`Fix these QC issues: ${issues.join(' ')}`:'No mandatory repair detected.',
    'Do not introduce new props, people, wardrobe, geography, weather, lighting direction or camera-axis changes.',
  ].join(' ');

  return {
    identity:scores[0],continuity:scores[1],anatomyPhysics:scores[2],
    performance:scores[3],lighting:scores[4],editFitness:scores[5],
    overall,decision,issues,repairPrompt
  };
}
