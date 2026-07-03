import { Navbar } from "../Navbar";
import { Footer } from "../Footer";
import Background from "../Background/Background";

export function PageShell({ children, eyebrow, title, subtitle }) {
  return (
    <div className="relative min-h-screen">
      <Background />
      <Navbar />
      <main className="relative z-10">
        {(title || eyebrow) && (
          <header className="mx-auto max-w-7xl px-6 pb-8 pt-16 text-center md:pt-24">
            {false && eyebrow && null}

            {title && (
              <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.02] tracking-tight text-foreground md:text-6xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                {subtitle}
              </p>
            )}
          </header>
        )}
        <div className="mx-auto max-w-7xl px-6 pb-24">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
