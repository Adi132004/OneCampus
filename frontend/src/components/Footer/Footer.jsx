import { Link } from "@tanstack/react-router";
import { Github, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
export function Footer() {
  return (
    <footer className="relative z-10 px-4 pb-6">
      <div className="glass-card-strong mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
        <div className="grid gap-10 px-6 py-12 md:grid-cols-4 md:px-10">
          <div>
            <div className="font-display text-3xl font-bold text-foreground">oneCampus</div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your campus, one board. Buy, sell, find and connect - all in one place.
            </p>
            <a
              href="mailto:djpal1234570@gmail.com"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/56 px-4 py-2 text-sm font-medium text-foreground/78 transition duration-300 hover:-translate-y-0.5 hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
              djpal1234570@gmail.com
            </a>
          </div>

          <FooterCol
            title="Product"
            items={[
              {
                to: "/marketplace",
                label: "Marketplace",
              },
              {
                to: "/lost-found",
                label: "Lost & Found",
              },
              {
                to: "/chat",
                label: "Campus Chat",
              },
            ]}
          />
          <FooterCol
            title="Company"
            items={[
              {
                to: "/about",
                label: "About Us",
              },
              {
                to: "/contact",
                label: "Contact Us",
              },
              {
                to: "/about",
                label: "Privacy Policy",
              },
              {
                to: "/about",
                label: "Terms & Conditions",
              },
            ]}
          />

          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Follow
            </div>
            <div className="mt-4 flex gap-3">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
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

        <div className="border-t border-white/60 px-6 py-5 text-center text-xs text-muted-foreground">
          Copyright {new Date().getFullYear()} oneCampus. Built for students.
        </div>
      </div>
    </footer>
  );
}
function FooterCol({ title, items }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.label}>
            <Link to={i.to} className="text-foreground/74 transition-colors hover:text-foreground">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
