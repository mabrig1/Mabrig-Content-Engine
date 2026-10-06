import { genericCollection, usersCollection, projectsCollection } from '../../lib/db';

export default async function PersonalStudioPage() {
  let members=0, active=0, projects=0;
  try {
    const users=await usersCollection();
    members=await users.countDocuments({});
    active=await users.countDocuments({ 'subscription.status': { $in: ['active','trialing'] } });
    const projectStore=await projectsCollection();
    projects=await projectStore.countDocuments({});
  } catch {}
  const providers=[
    ['MongoDB',Boolean(process.env.MONGODB_URI)],
    ['Paystack',Boolean(process.env.PAYSTACK_SECRET_KEY)],
    ['Flutterwave',Boolean(process.env.FLW_SECRET_KEY)],
    ['Stripe',Boolean(process.env.STRIPE_SECRET_KEY)],
    ['Runway',Boolean(process.env.RUNWAYML_API_SECRET||process.env.RUNWAY_API_KEY)],
    ['Gemini / Veo',Boolean(process.env.GEMINI_API_KEY)],
    ['GPU Worker',Boolean(process.env.GPU_WORKER_URL)],
    ['R2 Artifact Store',Boolean(process.env.R2_ENDPOINT||process.env.R2_BUCKET)],
  ];
  return (
    <main className="memberMain">
      <section className="memberHero"><p className="eyebrow">ADMIN ONLY</p><h1>MABRIG Personal <em>Studio.</em></h1><p>Private projects, master identity locks, member operations, provider controls and publishing CMS stay isolated from the paid member area.</p></section>
      <section className="adminStats"><div><b>{members}</b><span>accounts</span></div><div><b>{active}</b><span>active subscriptions</span></div><div><b>{projects}</b><span>saved projects</span></div><div><b>{providers.filter(x=>x[1]).length}/{providers.length}</b><span>provider systems configured</span></div></section>
      <section className="memberGrid">
        <article className="memberCard"><small>PRIVATE</small><h2>Unreleased Projects</h2><p>Keep ministry music videos, films and unreleased campaign assets separate from member projects.</p><b>ADMIN SPACE</b></article>
        <article className="memberCard"><small>IDENTITY</small><h2>Master Brand Locks</h2><p>Your approved face, voice, wardrobe, visual language and continuity packs.</p><b>ADMIN SPACE</b></article>
        <article className="memberCard"><small>CMS</small><h2>Publishing Control</h2><p>Publish templates, lessons, prompt packs and featured tool records to the member experience.</p><b>ADMIN SPACE</b></article>
      </section>
      <section className="output"><p className="eyebrow">PROVIDER CONFIGURATION STATUS</p><h2>Keys remain server-side.</h2><div className="providerStatusGrid">{providers.map(([name,ok])=><div key={String(name)}><b>{ok?'●':'○'} {name}</b><span>{ok?'configured':'not configured'}</span></div>)}</div></section>
    </main>
  );
}
