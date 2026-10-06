export type ToolCatalogItem={name:string;category:string;access:string;commercial:string;bestUse:string};
const names=[
'Runway','Pika','Luma Dream Machine','Kling AI','Hailuo AI','PixVerse','Vidu','Haiper','Adobe Firefly Video','Google Veo / Gemini',
'OpenAI Sora','Canva Magic Media','CapCut AI Video','InVideo AI','VEED AI','Descript','HeyGen','Synthesia','D-ID','Hedra',
'AKOOL','Captions','Tavus','DeepBrain AI','Colossyan','Elai','Hour One','Steve AI','Fliki','Pictory',
'LTX Studio','Krea','Leonardo Motion','Kaiber','Genmo','Pollo AI','Freepik AI Video','OpenArt Video','Tensor.Art','Hugging Face Spaces',
'ComfyUI','Stable Video Diffusion','Wan 2.1','Wan 2.2','HunyuanVideo','CogVideoX','LTX-Video','Mochi 1','AnimateDiff','ModelScope T2V',
'VideoCrafter2','Pyramid Flow','Open-Sora','Open-Sora-Plan','Latte','DynamiCrafter','I2VGen-XL','MagicAnimate','LivePortrait','SadTalker',
'Wav2Lip','MuseTalk','EchoMimic','Hallo','LatentSync','CodeFormer','GFPGAN','Real-ESRGAN','Topaz Video AI','DaVinci Resolve',
'Blender','Kdenlive','Shotcut','Olive','Flowframes','RIFE','FILM Frame Interpolation','FFmpeg','Remotion','OBS Studio',
'Audacity','Adobe Podcast','ElevenLabs','Suno','Udio','Stable Audio Open','Whisper','Demucs','RVC','VoiceCraft',
'Coqui XTTS','PlayHT','LALAL.AI','Clipchamp','FlexClip','Kapwing','Media.io','Filmora','Vmake','Wonder Studio'
];
const categoryFor=(i:number)=>i<40?'Generation':i<60?'Open Source / Local':i<66?'Lip Sync / Face':i<79?'Upscale / Edit':i<93?'Audio / Voice':'Edit / Utility';
export const VIDEO_TOOL_CATALOG:ToolCatalogItem[]=names.map((name,i)=>({
 name,category:categoryFor(i),
 access:i>=40&&i<79?'Free/open-source options; compute may be required':'Free tier or trial may exist; verify current quota before use',
 commercial:i>=40&&i<79?'Model/license dependent':'Plan/terms dependent',
 bestUse:i<40?'Fast hosted generation and creative iteration':i<60?'Self-hosted experimentation and model control':i<66?'Talking-head, facial animation and lip-sync':i<79?'Repair, upscale, interpolation and finishing':i<93?'Dialogue, music, stem and voice workflow':'Editing, compositing and production utility'
}));
