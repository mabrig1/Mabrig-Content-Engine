import { ObjectId } from 'mongodb';
import { requirePaidMember } from '../../../lib/auth';
import { genericCollection } from '../../../lib/db';

export default async function CertificatePage(){
  const user=await requirePaidMember();
  const progress=await genericCollection('progress');
  const count=await progress.countDocuments({userId:new ObjectId(user.id)});
  const eligible=count>=12;
  const verification=eligible?'MCM-'+user.id.slice(-8).toUpperCase()+'-'+new Date().getFullYear():'';
  return <main className="memberMain">
    <section className="memberHero compactHero"><p className="eyebrow">CERTIFICATE</p><h1>{eligible?'Completion verified.':'Complete the learning path.'}</h1><p>{eligible?'You have completed the 12-module Cinematic Movie Masterclass learning path.':'Finish all 12 modules to unlock your completion certificate.'}</p></section>
    <section className="certificateCard">
      {eligible?<>
        <small>CINEMATIC MOVIE MASTERCLASS</small>
        <h2>Certificate of Completion</h2>
        <p>This certifies that</p>
        <h3>{user.name}</h3>
        <p>completed the MABRIG CINEMA project-based AI filmmaking curriculum.</p>
        <div><b>Verification</b><span>{verification}</span></div>
        <div><b>Modules</b><span>12 / 12</span></div>
        <div className="certificatePrint">Use your browser Print / Save as PDF to keep a copy.</div>
      </>:<>
        <h2>{count} / 12 modules completed</h2>
        <a className="generate masterLink" href="/masterclass/tutorials">CONTINUE LEARNING</a>
      </>}
    </section>
  </main>
}
