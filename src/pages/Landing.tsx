import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, LayoutGrid, Users, Zap, ArrowRight, Check } from "lucide-react";
import calyLogo from "@/assets/caly-logo.png";

const features = [
  {
    icon: CalendarDays,
    gradient: "from-pop-pink to-pop-purple",
    title: "Visual Calendar",
    description: "Plan your content on a beautiful monthly calendar. Drag and drop to reschedule instantly.",
  },
  {
    icon: LayoutGrid,
    gradient: "from-pop-blue to-pop-purple",
    title: "Production Board",
    description: "Track every post from idea to published with a Kanban workflow your team will love.",
  },
  {
    icon: Users,
    gradient: "from-pop-green to-pop-blue",
    title: "Team Collaboration",
    description: "Assign editors & managers, leave comments, and keep everyone in sync effortlessly.",
  },
  {
    icon: Zap,
    gradient: "from-pop-orange to-pop-pink",
    title: "Multi-Platform",
    description: "Manage Instagram, YouTube, LinkedIn, and Twitter content from one workspace.",
  },
];

const benefits = [
  "Never miss a publish date",
  "See your whole month at a glance",
  "Keep your team aligned",
  "Track content end-to-end",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-16">
        <div className="flex items-center gap-2.5">
          <img src={calyLogo} alt="Caly logo" className="h-9 w-auto dark:invert" />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Log in</Link>
          </Button>
          <Button size="sm" className="shadow-md shadow-primary/20" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-20 text-center md:pt-28 lg:pt-36">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-pop-pink to-pop-blue text-[10px] text-white font-bold">✦</span>
          Built for creative teams — Caly
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
          Your content,{" "}
          <span className="bg-gradient-to-r from-primary via-pop-purple to-accent bg-clip-text text-transparent">
            beautifully
          </span>{" "}
          organized
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
          Plan posts, track production, and publish with confidence — all in one workspace your team will actually enjoy using.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25" asChild>
            <Link to="/auth">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8" asChild>
            <a href="#features">How it works</a>
          </Button>
        </div>
      </section>

      {/* Mock preview */}
      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="overflow-hidden rounded-xl border bg-card shadow-2xl shadow-primary/10">
          <div className="flex items-center gap-2 border-b px-4 py-2.5">
            <div className="h-3 w-3 rounded-full bg-pop-pink/80" />
            <div className="h-3 w-3 rounded-full bg-pop-yellow/80" />
            <div className="h-3 w-3 rounded-full bg-pop-green/80" />
            <span className="ml-2 text-xs text-muted-foreground">Caly</span>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-card px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
            {Array.from({ length: 21 }, (_, i) => (
              <div key={i} className="flex min-h-[56px] flex-col bg-card p-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">{i + 1}</span>
                {i === 2 && <div className="mt-0.5 rounded border border-pop-blue/20 bg-pop-blue/10 px-1 py-0.5 text-[9px] font-medium text-pop-blue">IG Reel</div>}
                {i === 7 && <div className="mt-0.5 rounded border border-pop-yellow/20 bg-pop-yellow/10 px-1 py-0.5 text-[9px] font-medium text-pop-yellow">YT Edit</div>}
                {i === 11 && <div className="mt-0.5 rounded border border-pop-purple/20 bg-pop-purple/10 px-1 py-0.5 text-[9px] font-medium text-pop-purple">LI Post</div>}
                {i === 15 && <div className="mt-0.5 rounded border border-pop-green/20 bg-pop-green/10 px-1 py-0.5 text-[9px] font-medium text-pop-green">TW Thread</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-5xl px-6 pb-28">
        <h2 className="mb-3 text-center text-3xl font-extrabold tracking-tight">Everything you need</h2>
        <p className="mx-auto mb-14 max-w-md text-center text-muted-foreground">
          Simple tools designed to keep your content pipeline flowing smoothly.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5">
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${f.gradient} shadow-sm`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-1.5 text-base font-bold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-3xl px-6 pb-28">
        <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight">Why teams love it</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-3 rounded-lg border bg-card px-5 py-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pop-green to-pop-blue">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-6 pb-28 text-center">
        <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/[0.03] px-8 py-14 shadow-xl shadow-primary/5">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight">Ready to get organized?</h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Join creative teams who plan smarter and publish with confidence.
          </p>
          <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25" asChild>
            <Link to="/auth">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        © 2026 Caly
      </footer>
    </div>
  );
}
