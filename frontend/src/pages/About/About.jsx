import { Eye, Sparkles, Target, Users } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SmartImage } from "@/components/SmartImage";
import { TEAM } from "@/lib/mock-data";

export function AboutPage() {
  return (
    <PageShell
      eyebrow="About"
      title="A campus community, built with care."
      subtitle="oneCampus brings marketplace, lost and found, and chat into one calm, college-scoped platform."
    >
      <div className="glass-card-strong rounded-[2rem] p-7 md:p-10">
        <p className="mx-auto max-w-4xl text-center text-lg leading-8 text-muted-foreground">
          Students should not have to search through scattered groups to find a calculator, recover
          an ID card, sell a textbook, or coordinate with classmates. oneCampus turns those everyday
          campus jobs into one focused board with beautiful, practical workflows.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          {
            icon: Target,
            title: "Our mission",
            desc: "Help every student find what they need on campus in seconds.",
          },
          {
            icon: Eye,
            title: "Our vision",
            desc: "Every Indian college connected by a useful campus board.",
          },
          {
            icon: Sparkles,
            title: "Our purpose",
            desc: "Replace noisy groups with one polished, trusted student space.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="glass-card rounded-[1.75rem] p-6 transition duration-300 hover:-translate-y-1"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-foreground text-white">
              <card.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.desc}</p>
          </article>
        ))}
      </div>

      <section className="mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass-card mx-auto inline-flex items-center gap-2 rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/72">
            <Users className="h-4 w-4 text-primary" />
            The team
          </div>
          <h2 className="section-title mt-5 font-display font-bold text-foreground">
            Five students building the platform they wanted.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {TEAM.map((member, index) => (
            <article
              key={member.name}
              className="glass-card group motion-fade-up rounded-[1.75rem] p-6 text-center transition duration-300 hover:-translate-y-2"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="mx-auto h-28 w-28 overflow-hidden rounded-full ring-4 ring-white/80 transition duration-500 group-hover:scale-105">
                <SmartImage
                  src={member.photo}
                  fallbackSeed={`team-${member.name}`}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold leading-tight text-foreground">
                {member.name}
              </h3>
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                {member.role}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{member.bio}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
