import Link from "next/link";
import { Leaf } from "lucide-react";
import { signIn } from "./actions";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="login-page">
      <section className="login-card card">
        <div className="login-brand"><span className="brand-mark"><Leaf size={21} /></span>LifeOS<span className="wordmark-dot">.</span></div>
        <p className="eyebrow">Private personal workspace</p>
        <h1>Welcome back.</h1>
        <p className="section-subtitle">Sign in to return to your personal space.</p>
        {params.error && <p className="form-error" role="alert">{params.error}</p>}
        <form action={signIn} className="entry-form login-form">
          <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="button primary" type="submit">Sign in</button>
        </form>
        <nav aria-label="Legal links"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav>
      </section>
    </main>
  );
}
