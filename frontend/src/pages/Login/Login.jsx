import { Link } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export function LoginPage() {
  
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
            Use your email and password to sign in.
          </p>

          

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Email Login" type="email" placeholder="Enter Email" />
            <Field label="Password Login" type="password" placeholder="Enter Password" />
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
        className="w-full rounded-full border border-white/70 bg-white/58 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 shadow-inner shadow-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

