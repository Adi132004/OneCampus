import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, MessageSquare } from "lucide-react";
import { getCurrentAuthUser, logoutUser, subscribeToAuth } from "@/lib/firebase";

const links = [
  {
    to: "/",
    label: "Home",
  },
  {
    to: "/marketplace",
    label: "Marketplace",
  },
  {
    to: "/events",
    label: "Events",
  },
  {
    to: "/lost-found",
    label: "Lost & Found",
  },
  {
    to: "/about",
    label: "About",
  },
  {
    to: "/contact",
    label: "Contact",
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(setUser);
    return () => unsubscribe();
  }, []);

  // Import fetchConversations lazily to compute unread count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    import("@/lib/chatApi").then(({ fetchConversations }) => {
      fetchConversations()
        .then((convs) => {
          if (!cancelled) {
            const total = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
            setUnreadCount(total);
          }
        })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [user]);

  function handleLogout() {
    logoutUser();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 flex justify-center px-4 pt-2 md:pt-3">
      <style>{`@media (min-width: 1024px){
          nav ul li a.nav-active{position:relative;display:inline-block}
          /* use a fixed underline width so it appears consistent across items */
          nav ul li a.nav-active::after{content:'';position:absolute;left:50%;transform:translateX(-50%);bottom:-10px;width:40px;height:4px;background:rgba(255,122,0,1);border-radius:9999px}
        }`}</style>
      <nav
        className={`flex h-16 w-full max-w-7xl items-center justify-between gap-6 rounded-full px-6 transition-all duration-500 md:h-[68px] md:px-8 ${scrolled ? "border border-white/70 bg-white/70 shadow-[0_18px_58px_rgba(32,24,16,0.12)] backdrop-blur-2xl" : "border border-white/60 bg-white/78 shadow-[0_18px_48px_rgba(32,24,16,0.10)] backdrop-blur-xl"}`}
      >
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl"
        >
          oneCampus
        </Link>
        <ul className="hidden items-center gap-9 text-[15px] font-medium text-foreground/82 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="transition-colors duration-300 hover:text-foreground"
                activeProps={{
                  className: "text-foreground font-medium nav-active",
                }}
                activeOptions={{
                  exact: l.to === "/",
                }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-4 sm:flex">
          {user ? (
            <>
              {/* Messages icon button */}
              <button
                type="button"
                id="navbar-messages-btn"
                onClick={() => navigate({ to: "/chat" })}
                className="navbar-msg-btn"
                aria-label="Open messages"
              >
                <MessageSquare size={20} />
                {unreadCount > 0 && (
                  <span className="navbar-unread-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <span className="text-sm font-medium text-foreground/80">
                {user.name || user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/70 bg-white/50 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/70"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex h-10 items-center rounded-full px-4 text-[15px] font-medium text-foreground/82 transition-colors hover:text-foreground"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="orange-button flex h-11 items-center justify-center rounded-full px-6 text-[15px] font-semibold text-white transition duration-300 hover:-translate-y-0.5"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          aria-label="Toggle menu"
          className="rounded-full border border-white/70 bg-white/50 p-2 sm:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open && (
        <div className="glass-card-strong absolute left-4 right-4 top-20 z-50 rounded-[2rem] p-4 sm:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="block rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-white/60"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex gap-2 px-2">
              {user ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setOpen(false); navigate({ to: "/chat" }); }}
                    className="flex-1 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-center text-sm font-medium text-orange-600"
                  >
                    Messages {unreadCount > 0 && `(${unreadCount})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="flex-1 rounded-full border border-white/70 bg-white/50 px-4 py-2 text-center text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full border border-white/70 bg-white/50 px-4 py-2 text-center text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setOpen(false)}
                    className="orange-button flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
