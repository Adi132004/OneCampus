import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  PenTool,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SmartImage } from "@/components/SmartImage";


const pinnedFeatures = [
  {
    tag: "Marketplace",
    tagColor: "primary",
    title: "Sell what you're done with",
    desc: "List your old textbooks, cycles, calculators, hostel gear. Buyers in your own university, no shipping, no strangers from across the country.",
    icon: ShoppingBag,
    to: "/marketplace",
  },
  {
    tag: "Lost & Found",
    tagColor: "secondary",
    title: "Lost it on campus? Look here first",
    desc: "Report what you lost or found. Items stay marked as open until they're actually back with their owner — nothing gets deleted and forgotten.",
    icon: Search,
    to: "/lost-found",
  },
  {
    tag: "AI Chat",
    tagColor: "primary",
    title: "Ask AI, skip the search",
    desc: "Get instant answers about listings, lost items, or how oneCampus works — powered by AI, right inside the app, any time.",
    icon: Sparkles,
    to: "/chat",
  },
  {
    tag: "Notifications",
    tagColor: "secondary",
    title: "Know the moment it matters",
    desc: "Someone messaged you about your listing, or found your lost ID — you'll know instantly, right inside the app.",
    icon: Bell,
    to: "/chat",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Pick your campus",
    desc: "Sign in and tell us which university you're at. Everything you see after this is scoped to your campus only.",
  },
  {
    step: "02",
    title: "List, lose, or look",
    desc: "Post something to sell, report something lost or found, or just browse what's already up.",
  },
  {
    step: "03",
    title: "Message directly",
    desc: "Found a buyer or the owner of a lost item? Chat with them right inside the app — no phone numbers exchanged in comments.",
  },
  {
    step: "04",
    title: "Get notified, not buried",
    desc: "A reply, a match, a found item — it reaches you the moment it happens, inside the app you already have open.",
  },
];

const searchDemoResults = [
  {
    title: "Calculus, Early Transcendentals — 3rd edn",
    price: "\u20b9450",
    meta: "Hostel C \u00b7 2 days ago",
  },
  {
    title: "Scientific calculator, fx-991ES",
    price: "\u20b9300",
    meta: "Hostel C \u00b7 5 days ago",
  },
  {
    title: "Calc + Linear Algebra bundle",
    price: "\u20b9600",
    meta: "Block D \u00b7 1 week ago",
  },
];

const stats = [
  {
    label: "Active Students",
    value: 12400,
    suffix: "+",
  },
  {
    label: "Lost Items Found",
    value: 860,
    suffix: "+",
  },
  {
    label: "Marketplace Listings",
    value: 3100,
    suffix: "+",
  },
  {
    label: "Messages Exchanged",
    value: 98400,
    suffix: "+",
  },
];
const testimonials = [
  {
    name: "Aarav Sharma",
    college: "IIT Bombay",
    quote:
      "I sold my old laptop and found a graphing calculator in the same afternoon. It finally feels organized.",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Meera Kulkarni",
    college: "SPPU Pune",
    quote:
      "My ID card was back with me before the next lecture. The photo reports make lost and found painless.",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Rohan Patil",
    college: "BITS Pilani",
    quote:
      "The chat is much calmer than huge groups. We coordinate project work without losing messages.",
    photo: "https://randomuser.me/api/portraits/men/46.jpg",
  },
];
const faqs = [
  [
    "What is oneCampus?",
    "A campus community platform for marketplace listings, lost and found reports, and student chat.",
  ],
  [
    "Who can join?",
    "Students can create an account and participate in campus-scoped listings, reports, and conversations.",
  ],
  ["Is it free?", "Yes. The current student experience is free to use."],
  [
    "How does the marketplace work?",
    "Create a listing with images, price, category, and contact details, then chat with interested students.",
  ],
  [
    "How does Lost & Found work?",
    "Report a lost or found item with photos, date, location, and contact details so students can identify it quickly.",
  ],
  ["How do I contact support?", "Use the contact section or email djpal1234570@gmail.com."],
];
export function HomePage() {
  return (
    <div className="relative min-h-[780px]">
      <Navbar />

      <main className="relative z-10">
        <Hero />

        {/* <Section eyebrow="What's pinned up" title="Everything Your Campus Needs">
          <div className="glass-card-strong grid gap-px overflow-hidden rounded-[2rem] bg-white/40 sm:grid-cols-2">
            {pinnedFeatures.map((feature, index) => (
              <PinnedFeatureCard key={feature.tag} feature={feature} index={index} />
            ))}
          </div>
        </Section> */}

<Section eyebrow="What's pinned up" title="Everything Your Campus Needs">
  <div className="grid gap-6 md:grid-cols-2">
    {pinnedFeatures.map((feature, index) => (
      <PinnedFeatureCard
        key={feature.tag}
        feature={feature}
        index={index}
      />
    ))}
  </div>
</Section>

        <Section eyebrow="Live campus pulse" title="Real activity, beautifully organized">
          <div className="glass-card-strong grid gap-4 rounded-[2rem] p-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </Section>

        <SearchShowcase />

        <HowItWorks />

        <Section eyebrow="Student voices" title="Loved by students">
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <article
                key={testimonial.name}
                className="glass-card motion-fade-up rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 90}ms`,
                }}
              >
                <p className="text-base leading-7 text-foreground/84">"{testimonial.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <SmartImage
                    src={testimonial.photo}
                    fallbackSeed={`testimonial-${testimonial.name}`}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white/80"
                  />
                  <div>
                    <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.college}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section eyebrow="FAQ" title="Questions students ask">
          <div className="glass-card-strong mx-auto max-w-3xl rounded-[2rem] px-6">
            <Accordion type="single" collapsible>
              {faqs.map(([q, a]) => (
                <AccordionItem key={q} value={q} className="border-white/70">
                  <AccordionTrigger className="text-left text-base font-semibold">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
function Hero() {
  return (
    <section className="hero-section">
      <div className="motion-fade-up hero-content">
        <h1 className="hero-title font-display font-bold text-foreground">
          Everything
          <br />
          happening
          <br />
          on campus,
          <br />
          <span className="text-primary">in one place.</span>
        </h1>

        <p className="hero-description">
          Buy and sell with students around you. Find lost items before
          they're gone. Chat instantly with buyers and sellers—all inside
          oneCampus.
        </p>

        <div className="hero-buttons">
          <Link
            to="/signup"
            className="orange-button flex h-16 items-center justify-center rounded-full px-10 text-base font-semibold text-white"
          >
            Get Started
          </Link>

          <a
            href="#how-it-works"
            className="rounded-full border border-[#d9c7ad] bg-white/50 px-8 py-4 font-semibold"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
function Section({ eyebrow, title, children }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 className="section-title font-display font-bold text-foreground">{title}</h2>
      </div>

      {children}
    </section>
  );
}
function PinnedFeatureCard({ feature, index }) {
  const Icon = feature.icon;
  const isPrimary = feature.tagColor === "primary";
  return (
    <Link
      to={feature.to}
//       className="
// motion-fade-up
// group
// bg-white/60
// border
// border-[#E7D8C5]
// p-8
// transition
// duration-300
// hover:bg-white/80
// "

className="
glass-card
motion-fade-up
group
rounded-[2rem]
min-h-[260px]
p-8
flex
flex-col
justify-between
transition-all
duration-300
hover:-translate-y-2
hover:shadow-2xl
"

      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[11px] font-semibold uppercase tracking-[0.16em] ${isPrimary ? "text-primary" : "text-secondary"}`}
        >
          {feature.tag}
        </span>
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${isPrimary ? "bg-primary/12 text-primary" : "bg-secondary/12 text-secondary"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-foreground md:text-2xl">
        {feature.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.desc}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/70 opacity-0 transition group-hover:opacity-100">
        Explore <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
function StatCard({ label, value, suffix }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const startedAt = performance.now();
        const duration = 1400;
        const animate = (now) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      },
      {
        threshold: 0.35,
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="rounded-[1.5rem] border border-white/70 bg-white/48 p-6 text-center">
      <div className="font-display text-4xl font-bold text-foreground">
        {display.toLocaleString("en-IN")}
        {suffix}
      </div>
      <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}
function SearchShowcase() {
  const [query, setQuery] = useState("cheap calc textbook near hostel C");
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="motion-fade-up min-w-0 text-center lg:text-left">
          <h2 className="section-title font-display font-bold text-foreground">

            Search like you'd ask a friend, not a database.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground lg:mx-0">
            Type what you actually mean &mdash; "cheap calc textbook" or "lost black backpack near
            library" &mdash; and oneCampus understands the intent. No match? It falls back to a
            plain keyword search, so you're never stuck with zero results.
          </p>
          <ul className="mx-auto mt-6 max-w-xl space-y-3 text-left">
            {[
              "Every listing is scoped to the campus you picked at sign-up",
              "No browsing items from a university three states away",
              "Built for how students actually phrase what they need",
            ].map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-foreground/80">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card-strong motion-fade-up motion-delay-1 min-w-0 rounded-[2rem] p-6 md:p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Try it (demo, not connected)
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-full border border-white/70 bg-white/60 px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="cheap calc textbook near hostel C"
            />
            <button
              type="button"
              className="orange-button rounded-full px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5"
            >
              Search
            </button>
          </div>

          <div className="mt-5 space-y-2.5">
            {searchDemoResults.map((r) => (
              <div
                key={r.title}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/50 px-4 py-3"
              >
                <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                  {r.title}
                </span>
                <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                  {r.price} &middot; {r.meta}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            preview only &mdash; real search ships with the app
          </p>
        </div>
      </div>
    </section>
  );
}
function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <div className="mb-12 max-w-2xl">
        <h2 className="section-title font-display font-bold text-foreground">
          Four steps. One sign-in.
        </h2>

      </div>
      <div className="glass-card-strong grid gap-8 rounded-[2rem] p-8 sm:grid-cols-2 md:p-10 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/70">
        {howItWorks.map((item, index) => (
          <div
            key={item.step}
            className="motion-fade-up lg:px-8 lg:first:pl-0 lg:last:pr-0"
            style={{
              animationDelay: `${index * 80}ms`,
            }}
          >
            <span className="font-mono text-sm text-muted-foreground">{item.step}</span>
            <h3 className="mt-3 font-display text-xl font-semibold text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
