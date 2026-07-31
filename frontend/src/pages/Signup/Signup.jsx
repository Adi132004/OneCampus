import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { getCurrentAuthUser, registerWithEmailPassword } from "@/lib/firebase";

export function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
  });
  const campuses = [
    "Cdac Acts Pune",
    "Cdac Kharghar Mumbai",
    "Sunbeam Hinjewadi",
    "IACSD Pune",
    "Sunbeam Kharad",
    "VITA Mumbai",
  ];
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordsMatch = form.password === form.confirmPassword;
  const canSubmit =
    form.name &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    passwordsMatch &&
    // College/Institute is required — must be selected before submitting.
    // This mirrors the @NotBlank constraint on the backend RegisterRequest.
    form.college.trim().length > 0;

  useEffect(() => {
    if (getCurrentAuthUser()) {
      window.location.href = "/";
    }
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await registerWithEmailPassword({
        name: form.name,
        email: form.email,
        password: form.password,
        campusName: form.college,
      });
      setSuccessMessage("Registration successful! Redirecting to home...");
      setTimeout(() => window.location.href = "/", 1800);
    } catch (err) {
      setError(err.message || "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-2">
              <Field
                label="Full Name"
                placeholder="Enter Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Email"
                type="email"
                placeholder="Enter Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <Field
              label="Password"
              type="password"
              placeholder="Enter Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Field
              label="Confirm Password"
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {form.confirmPassword ? (
              <div className="sm:col-span-2">
                {!passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
                {passwordsMatch && form.password && (
                  <p className="mt-1 text-xs text-green-600">Passwords match</p>
                )}
              </div>
            ) : null}
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-foreground">
                College / Institute <span className="text-red-500" aria-hidden="true">*</span>
              </span>
              <select
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                required
                className="w-full rounded-full border border-white/70 bg-white/58 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 shadow-inner shadow-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select your college</option>
                {campuses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {isSubmitting && !form.college && (
                <p className="mt-1 text-xs text-red-600">Please select your college before submitting.</p>
              )}
            </label>

            {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}
            {successMessage ? <p className="sm:col-span-2 text-sm text-green-600">{successMessage}</p> : null}
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`orange-button sm:col-span-2 mt-2 w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 ${
                !canSubmit || isSubmitting ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {isSubmitting ? "Creating account..." : "Register"}
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
function Field({ label, type = "text", placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-full border border-white/70 bg-white/58 px-4 py-3 text-sm text-foreground placeholder:text-foreground/60 shadow-inner shadow-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
