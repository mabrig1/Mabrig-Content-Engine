import { requireLogin, hasPaidAccess } from '../../lib/auth';

export default async function AccountPage() {
  const user = await requireLogin('/account');
  return (
    <main className="memberShell">
      <nav><a href="/masterclass"><b>MABRIG <span>CINEMA</span></b></a><a href="/masterclass">MASTERCLASS</a></nav>
      <section className="accountCard">
        <p className="eyebrow">ACCOUNT</p>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <div className="accountFacts">
          <div><b>Role</b><span>{user.role}</span></div>
          <div><b>Subscription</b><span>{user.subscription.status}</span></div>
          <div><b>Plan</b><span>{user.subscription.plan}</span></div>
          <div><b>Masterclass</b><span>{hasPaidAccess(user) ? 'Unlocked' : 'Locked'}</span></div>
        </div>
        {!hasPaidAccess(user) && <a className="generate masterLink" href="/pricing">CHOOSE A PLAN</a>}
        <form action="/api/auth/logout" method="post"><button className="secondaryButton fullButton">LOG OUT</button></form>
      </section>
    </main>
  );
}
