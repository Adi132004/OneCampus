import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { signInWithGoogle } from "@/lib/firebase";

export function LoginPage() {
  const [googleStatus, setGoogleStatus] = useState(null);
  async function onGoogleSignIn() {
    setGoogleStatus("Opening Google Sign-In...");
    try {
      await signInWithGoogle();
      setGoogleStatus("Signed in with Google.");
    } catch (error) {
      setGoogleStatus(error instanceof Error ? error.message : "Google Sign-In could not start.");
    }
  }
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-[1fr_460px] md:py-24">
        <section className="motion-fade-up hidden md:block">
          <h1 className="max-w-2xl font-display text-6xl font-bold leading-none text-foreground">

            Welcome back to your campus board.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Continue conversations, recover lost items, and manage your student marketplace listings
            in one place.
          </p>
        </section>

        <section className="glass-card-strong motion-slide-in rounded-[2rem] p-7 md:p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Welcome back
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            Log in
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose Google, or use your email and password.
          </p>

          <button
            type="button"
            onClick={onGoogleSignIn}
            className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-md border border-[#dadce0] bg-white px-4 text-[14px] font-medium text-[#3c4043] shadow-sm transition hover:bg-[#f8fafd] focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <GoogleMark />
            Continue with Google
          </button>
          {googleStatus && <p className="mt-3 text-xs text-muted-foreground">{googleStatus}</p>}

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/70" />
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              or
            </span>
            <span className="h-px flex-1 bg-white/70" />
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Email Login" type="email" placeholder="you@college.edu" />
            <Field label="Password Login" type="password" placeholder="Enter your password" />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
                Remember me
              </label>
              <a href="#" className="font-medium text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="orange-button mt-2 w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5"
            >
              Log in
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to oneCampus?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
function Field({ label, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-full border border-white/70 bg-white/58 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-inner shadow-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
