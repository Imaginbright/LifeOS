import Link from "next/link";
import { ArrowUpRight, CheckCheck, CreditCard, Flag, ChartNoAxesCombined } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "A little more intentional",
  description: "LifeOS brings personal planning, subscriptions, and creator growth into one calm workspace.",
};

const features = [
  { title: "Tasks", description: "Plan your day and keep track of monthly priorities.", icon: CheckCheck },
  { title: "Goals", description: "Track progress toward the things you actually want to accomplish.", icon: Flag },
  { title: "Subscriptions", description: "Keep renewal dates, recurring costs and upcoming payments visible.", icon: CreditCard },
  { title: "Creator", description: "Connect supported TikTok and YouTube accounts and follow audience growth over time.", icon: ChartNoAxesCombined },
];

export default async function HomePage() {
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  } catch {
    // The public explanation remains available if authentication is unavailable.
  }
  const href = signedIn ? "/dashboard" : "/login";
  const label = signedIn ? "Open dashboard" : "Sign in";

  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <p className="eyebrow">Your personal space</p>
        <h1 id="landing-title">Life, a little more intentional.</h1>
        <p className="landing-lead">A personal dashboard for your day, goals, subscriptions and creator growth.</p>
        <p className="landing-support">Bring personal planning and creator statistics into one calm workspace, with room to focus on what matters to you.</p>
        <Link href={href} className="button primary landing-cta">{label}<ArrowUpRight size={17} /></Link>
      </section>
      <section className="landing-features" aria-labelledby="landing-features-title">
        <div className="landing-section-heading"><p className="eyebrow">What you can keep in view</p><h2 id="landing-features-title">A place for the everyday.</h2></div>
        <div className="landing-feature-grid">
          {features.map(({ title, description, icon: Icon }) => (
            <article className="card landing-feature" key={title}>
              <span className="soft-icon"><Icon size={21} strokeWidth={1.6} /></span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
