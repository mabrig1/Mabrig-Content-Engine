const samplePrompts = [
  '24mm anamorphic dawn rooftop reveal, Nigerian city skyline, restrained wind, heroic silhouette, motivated sunrise rim light, subtle haze, slow crane push.',
  '85mm intimate prayer close-up in a midnight war room, warm desk lamp, cool rain-window ambience, realistic skin texture, controlled micro-expressions.',
  '35mm rain-soaked street revival, wet pavement reflections, practical backlight through rain, emotionally specific crowd reactions, grounded camera movement.',
];

export default function FreePreviewPage() {
  return (
    <main className="publicShell">
      <nav><a href="/"><b>MABRIG <span>CINEMA</span></b></a><div className="navActions"><a href="/pricing">PRICING</a><a href="/register">REGISTER</a></div></nav>
      <section className="publicHero compactHero">
        <p className="eyebrow">FREE PREVIEW</p>
        <h1>Direct one scene before you join.</h1>
        <p>Sample lesson: turn emotion into camera language. Start with the character objective, then choose shot size, lens, movement and motivated light.</p>
      </section>
      <section className="previewLesson">
        <article>
          <small>LESSON 01 · DIRECTOR BRAIN</small>
          <h2>Do not ask AI for “cinematic.” Give the shot a reason.</h2>
          <p>A wide shot should reveal world or power distance. A close-up should reveal a decision, fear or contradiction. Camera movement should follow dramatic change, not decorate the frame.</p>
          <a className="heroMasterclass" href="/pricing">UNLOCK THE FULL MASTERCLASS →</a>
        </article>
        <div className="promptPreview">
          {samplePrompts.map((prompt, index) => (
            <div key={prompt}><b>PROMPT {index + 1}</b><p>{prompt}</p></div>
          ))}
        </div>
      </section>
    </main>
  );
}
