import { Link } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export function SignupPage() {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
        <section className="motion-fade-up">
          <h1 className="max-w-2xl font-display text-5xl font-bold leading-none text-foreground md:text-6xl">

            Join the student network built for your campus.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Create an account to list products, report lost items, and chat with verified students.
          </p>
        </section>

        <section className="glass-card-strong motion-slide-in rounded-[2rem] p-7 md:p-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
            Create account
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            Sign up
          </h2>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <div className="sm:col-span-2">
              <Field label="Full Name" placeholder="Jane Doe" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Email" type="email" placeholder="you@college.edu" />
            </div>
            <Field label="Password" type="password" placeholder="Enter a password" />
            <Field label="Confirm Password" type="password" placeholder="Confirm password" />
            <Field label="College" placeholder="e.g. CDAC ACTS Pune" />
            <Field label="Department" placeholder="e.g. Computer Science" />
            <div className="sm:col-span-2">
              <Field label="Phone Number" type="tel" placeholder="+91 98765 43210" />
            </div>
            <button
              type="submit"
              className="orange-button sm:col-span-2 mt-2 w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5"
            >
              Register
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
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
