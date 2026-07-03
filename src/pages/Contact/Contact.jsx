import { Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Get in touch"
      subtitle="Questions, feedback, or partnership ideas - we would love to hear from you."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr]">
        <form
          className="glass-card-strong rounded-[2rem] p-7 md:p-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid gap-4">
            <Field label="Your name" placeholder="Jane Doe" />
            <Field label="Email" type="email" placeholder="you@college.edu" />
            <Field label="Subject" placeholder="How can we help?" />
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Message</span>
              <textarea
                rows={6}
                placeholder="Tell us a bit more..."
                className="w-full rounded-[1.5rem] border border-white/70 bg-white/58 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-inner shadow-white/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>
            <button
              type="submit"
              className="orange-button mt-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5"
            >
              Send message
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <a href="mailto:djpal1234570@gmail.com" className="block">
            <InfoCard
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value="djpal1234570@gmail.com"
            />
          </a>
          <InfoCard icon={<Phone className="h-4 w-4" />} label="Phone" value="+91 98765 43210" />
          <InfoCard
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value="CDAC ACTS Pune, India"
          />

          <div className="glass-card overflow-hidden rounded-[2rem]">
            <iframe
              title="CDAC ACTS Pune Map"
              src="https://www.google.com/maps?q=CDAC+ACTS+Pune&output=embed"
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="glass-card rounded-[1.75rem] p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Follow us
            </div>
            <div className="mt-3 flex gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social profile"
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/56 text-foreground/70 transition duration-300 hover:-translate-y-0.5 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
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
function InfoCard({ icon, label, value }) {
  return (
    <div className="glass-card flex items-center gap-3 rounded-[1.75rem] p-4 transition duration-300 hover:-translate-y-0.5">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-foreground text-white">
        {icon}
      </div>
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}
