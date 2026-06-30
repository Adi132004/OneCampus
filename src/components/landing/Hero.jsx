import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = ["Browse", "Sell", "Lost & Found", "About"];

const Hero = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <section className="relative h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: [
            "radial-gradient(circle at 2% 2%, rgb(255 120 35 / 0.42) 0 13rem, transparent 34rem)",
            "radial-gradient(circle at 94% 12%, rgb(255 120 35 / 0.2) 0 12rem, transparent 34rem)",
            "radial-gradient(circle at 92% 92%, rgb(90 123 255 / 0.56) 0 18rem, transparent 42rem)",
            "radial-gradient(circle at 16% 86%, rgb(90 123 255 / 0.16) 0 13rem, transparent 34rem)",
            "radial-gradient(circle at 50% 48%, rgb(255 255 255 / 0.78) 0 20rem, transparent 42rem)",
          ].join(", "),
          filter: "blur(74px)",
          transform: "scale(1.04)",
        }}
      />

      <div className="absolute left-1/2 top-7 z-20 w-[calc(100%-48px)] max-w-[1180px] -translate-x-1/2 md:w-[90%] lg:w-[calc(100%-96px)]">
        <header
          className={`bg-surface/95 px-6 shadow-[0_14px_34px_rgba(20,16,12,0.08)] backdrop-blur-md md:h-[72px] md:rounded-full ${
            isMenuOpen ? "rounded-[2rem]" : "rounded-full"
          }`}
        >
          <nav className="flex h-[72px] items-center justify-between gap-4" aria-label="Primary">
            <a href="/" className="font-display text-2xl font-black tracking-[-0.03em] text-foreground">
              oneCampus
            </a>

            <div className="hidden items-center gap-10 md:flex">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replaceAll(" ", "-").replace("&", "and")}`}
                  className="font-sans text-base font-medium text-foreground transition-colors hover:text-primary"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="#login"
                className="hidden rounded-full px-3 py-2 font-sans text-base font-medium text-foreground transition-colors hover:text-primary md:inline-flex"
              >
                Login
              </a>
              <Button className="h-11 bg-primary bg-gradient-to-r from-[#ff4b00] to-[#ff6417] px-[22px] py-0 text-base text-primary-foreground shadow-[0_12px_28px_rgba(255,79,10,0.22)] hover:from-[#f04500] hover:to-[#f55b11]">
                Sign up
              </Button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-surface-2 md:hidden"
                aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {isMenuOpen ? (
            <div className="mt-4 grid gap-1 border-t border-border pt-4 md:hidden">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replaceAll(" ", "-").replace("&", "and")}`}
                  className="rounded-full px-4 py-2.5 font-sans text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <a
                href="#login"
                className="rounded-full px-4 py-2.5 font-sans text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </a>
            </div>
          ) : null}
        </header>
      </div>

      <main className="relative z-10 mx-auto flex h-full max-w-[1280px] items-center justify-center px-6 text-center md:px-10 lg:px-16">
        <div className="flex w-full max-w-[760px] flex-col items-center">
        <div className="mb-9 inline-flex h-[42px] w-fit items-center gap-4 rounded-full bg-surface/90 px-[18px] font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[#38404a] shadow-[0_14px_32px_rgba(28,22,14,0.12)] backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
          Campus Marketplace
        </div>

        <h1 className="mb-7 max-w-[760px] text-balance font-display text-[44px] font-bold leading-[0.95] tracking-[-0.05em] text-foreground sm:text-[56px] md:text-[64px] lg:text-[88px] 2xl:text-[96px]">
          Your campus, one board.
        </h1>

        <p className="mb-11 max-w-[620px] font-sans text-lg leading-7 text-muted-foreground md:text-2xl md:leading-9">
          Buy, sell, and find anything — scoped to your college.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-[18px] sm:w-auto sm:flex-row">
          <Button
            size="lg"
            className="h-[58px] w-full bg-gradient-to-r from-[#ff4b00] to-[#ff6417] px-9 py-0 text-lg shadow-[0_18px_36px_rgba(255,79,10,0.22)] hover:from-[#f04500] hover:to-[#f55b11] sm:w-auto"
          >
            Get started
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-[58px] w-full border-2 border-border bg-surface/25 px-[34px] py-0 text-lg text-foreground backdrop-blur-sm hover:bg-surface/50 sm:w-auto"
          >
            See how it works
          </Button>
        </div>
        </div>
      </main>
    </section>
  );
};

export default Hero;
