import { genericCollection, usersCollection, projectsCollection } from '../../lib/db';

export default async function PersonalStudioPage() {
  let members=0, active=0, projects=0, agentRuns=0, qcReviews=0;
  let recentProjects:any[]=[];
  try {
    const users=await usersCollection();
    members=await users.countDocuments({});
    active=await users.countDocuments({ 'subscription.status': { $in: ['active','trialing'] } });

    const projectStore=await projectsCollection();
    projects=await projectStore.countDocuments({});
    recentProjects=await projectStore.find({}).sort({updatedAt:-1}).limit(5).toArray();

    const runs=await genericCollection('agent_runs');
    agentRuns=await runs.countDocuments({});

    const qc=await genericCollection('qc_reviews');
    qcReviews=await qc.countDocuments({});
  } catch {}

  const providers=[
    ['MongoDB',Boolean(process.env.MONGODB_URI)],
    ['Paystack',Boolean(process.env.PAYSTACK_SECRET_KEY)],
    ['Flutterwave',Boolean(process.env.FLW_SECRET_KEY)],
    ['Stripe',Boolean(process.env.STRIPE_SECRET_KEY)],
    ['OpenRouter',Boolean(process.env.OPENROUTER_API_KEY)],
    ['Runway',Boolean(process.env.RUNWAYML_API_SECRET||process.env.RUNWAY_API_KEY)],
    ['Gemini / Veo',Boolean(process.env.GEMINI_API_KEY)],
    ['GPU Worker',Boolean(process.env.GPU_WORKER_URL&&process.env.GPU_WORKER_TOKEN)],
    ['R2 Artifact Store',Boolean(process.env.R2_ENDPOINT||process.env.R2_BUCKET)],
  ];

  const launch=[
    ['DIRECT','Professional Film OS','Shot tables, continuity graph, debate/judge departments, selective reruns and NLE export.','/masterclass/pro-film-lab'],
    ['BOARD','Storyboard Studio','Storyboard, visual QC, auto repair/reshoot, timeline and final movie assembly.','/masterclass/storyboard-studio'],
    ['VIDEO','AI Video Workstation','Music video production, provider routing, scene variants and render profiles.','/masterclass/workstation'],
    ['MOVIE','Cinematic Movie Builder','Screenplay AI, actor identity, virtual sets and scene packaging.','/masterclass/workstation/movie'],
    ['AGENTS','Agentic Worker AI','Executive Producer, Director, Continuity, Editor and QC mission control.','/masterclass/agents'],
    ['PROJECTS','My Cloud Projects','Saved workflows and production state across devices.','/masterclass/workstation/projects'],
  ];

  const operations=[
    ['MEMBERS','Members & subscriptions','Review accounts, roles and plan status.','/studio/members'],
    ['CMS','Content publishing','Publish tutorials, templates, prompts and tools.','/studio/content'],
    ['ACCOUNT','Owner account','Review your role, plan and access state.','/account'],
    ['ACADEMY','Tutorial curriculum','Inspect the full training journey.','/masterclass/tutorials'],
    ['LIBRARY','Prompt & template library','Open reusable directing assets.','/masterclass/library'],
    ['TOOLS','100 AI tools','Inspect the current provider/tool universe.','/masterclass/tools'],
  ];

  return (
    <main className="memberMain ownerWorkstation">
      <section className="ownerHero">
        <div>
          <p className="eyebrow">ADMIN OWNER WORKSTATION</p>
          <h1>MABRIG Personal <em>Command Studio.</em></h1>
          <p>Your private operating dashboard for films, music videos, AI agents, members, publishing, continuity, provider readiness and release workflows.</p>
        </div>
        <div className="ownerBadge"><b>OWNER ACCESS</b><span>Admin · all member areas unlocked</span></div>
      </section>

      <section className="adminStats ownerStats">
        <div><b>{members}</b><span>accounts</span></div>
        <div><b>{active}</b><span>active subscriptions</span></div>
        <div><b>{projects}</b><span>cloud projects</span></div>
        <div><b>{agentRuns}</b><span>agent runs</span></div>
        <div><b>{qcReviews}</b><span>QC reviews</span></div>
        <div><b>{providers.filter(x=>x[1]).length}/{providers.length}</b><span>systems configured</span></div>
      </section>

      <section className="ownerSection">
        <div className="ownerSectionHead"><div><p className="eyebrow">PRODUCTION LAUNCHPAD</p><h2>Start work without leaving your dashboard.</h2></div><span>PRIVATE OWNER WORKSPACE</span></div>
        <div className="ownerLaunchGrid">
          {launch.map(([code,title,copy,href])=>(
            <a className="ownerLaunchCard" href={href} key={title}>
              <small>{code}</small><h3>{title}</h3><p>{copy}</p><b>OPEN WORKSPACE →</b>
            </a>
          ))}
        </div>
      </section>

      <section className="ownerSplit">
        <div className="ownerPanel">
          <p className="eyebrow">SYSTEM READINESS</p>
          <h2>Production infrastructure</h2>
          <div className="ownerProviderList">
            {providers.map(([name,ok])=>(
              <div key={String(name)}><b className={ok?'ready':'offline'}>{ok?'●':'○'} {name}</b><span>{ok?'configured':'not configured'}</span></div>
            ))}
          </div>
          <small className="hint">Provider keys remain server-side. A green system means configuration is present; it does not guarantee external quota or billing availability.</small>
        </div>

        <div className="ownerPanel">
          <p className="eyebrow">RECENT PROJECTS</p>
          <h2>Continue production</h2>
          <div className="recentProjectList">
            {recentProjects.map((project:any)=>(
              <div key={project._id?.toHexString?.()||String(project._id)}>
                <span><b>{project.title}</b><small>{project.kind}</small></span>
                <em>{project.updatedAt?new Date(project.updatedAt).toLocaleString():'recent'}</em>
              </div>
            ))}
            {!recentProjects.length&&<div className="emptyFactory"><b>NO SAVED PROJECTS</b><span>Save a workflow from the Workstation and it will appear here.</span></div>}
          </div>
          <a className="secondaryButton fullButton" href="/masterclass/workstation/projects">OPEN ALL PROJECTS</a>
        </div>
      </section>

      <section className="ownerSection">
        <div className="ownerSectionHead"><div><p className="eyebrow">ADMIN OPERATIONS</p><h2>Run the platform from one place.</h2></div></div>
        <div className="ownerOpsGrid">
          {operations.map(([code,title,copy,href])=>(
            <a href={href} key={title}><small>{code}</small><b>{title}</b><span>{copy}</span></a>
          ))}
        </div>
      </section>

      <section className="ownerSection">
        <div className="ownerSectionHead"><div><p className="eyebrow">OWNER PRODUCTION FLOW</p><h2>Your fastest route from idea to master.</h2></div></div>
        <div className="ownerPipeline">
          {['Idea / Music','Screenplay / Blueprint','Pro Film OS','Storyboard','Generate','Vision QC','Auto Repair','Timeline','Final Master','Publish'].map((step,index)=>(
            <div key={step}><small>{String(index+1).padStart(2,'0')}</small><b>{step}</b></div>
          ))}
        </div>
      </section>
    </main>
  );
}
