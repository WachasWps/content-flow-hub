import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, LayoutGrid, Users, Sparkles, ArrowRight, CheckCircle2, Zap } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    color: "text-pop-blue bg-pop-blue/15",
    title: "Visual Calendar",
    description: "Plan your content on a beautiful monthly calendar. Drag and drop posts to reschedule in seconds.",
  },
  {
    icon: LayoutGrid,
    color: "text-pop-purple bg-pop-purple/15",
    title: "Production Board",
    description: "Track every post from idea to published with a Kanban-style workflow your whole team can follow.",
  },
  {
    icon: Users,
    color: "text-pop-green bg-pop-green/15",
    title: "Team Collaboration",
    description: "Assign editors & managers, leave comments, and keep everyone aligned without the chaos.",
  },
  {
    icon: Sparkles,
    color: "text-pop-orange bg-pop-orange/15",
    title: "Multi-Platform",
    description: "Manage Instagram, YouTube, LinkedIn, and Twitter content all from one unified workspace.",
  },
];

const benefits = [
  { text: "Never miss a publish date again", color: "border-pop-pink/30" },
  { text: "See your whole month at a glance", color: "border-pop-blue/30" },
  { text: "Keep your team on the same page", color: "border-pop-green/30" },
  { text: "Track content from idea to posted", color: "border-pop-purple/30" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary pop-shadow">
            <CalendarDays className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">ContentCal</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Log in</Link>
          </Button>
          <Button size="sm" className="pop-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center md:pt-24 lg:pt-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full pop-border border-pop-orange/30 bg-pop-orange/10 px-4 py-1.5 text-sm font-semibold text-pop-orange">
          <Zap className="h-3.5 w-3.5" />
          Built for small creative teams
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          Your content,{" "}
          <span className="relative">
            <span className="text-primary">beautifully</span>
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
              <path d="M2 8c40-6 80-6 120-2s56 4 76 0" stroke="hsl(var(--pop-pink))" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>{" "}
          organized
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          The content calendar that brings your team together. Plan posts, track production, and publish with confidence — all in one fun, colorful workspace.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="gap-2 px-8 pop-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-base" asChild>
            <Link to="/auth">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8 pop-border text-base" asChild>
            <a href="#features">See how it works</a>
          </Button>
        </div>
      </section>

      {/* Calendar Preview */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="overflow-hidden rounded-2xl pop-border pop-shadow-lg bg-card">
          <div className="flex items-center gap-2 border-b pop-border px-5 py-3">
            <div className="h-3.5 w-3.5 rounded-full bg-pop-pink" />
            <div className="h-3.5 w-3.5 rounded-full bg-pop-yellow" />
            <div className="h-3.5 w-3.5 rounded-full bg-pop-green" />
            <span className="ml-3 text-sm font-semibold text-muted-foreground">ContentCal — February 2026</span>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-card px-3 py-2 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {d}
              </div>
            ))}
            {Array.from({ length: 28 }, (_, i) => (
              <div key={i} className="flex min-h-[72px] flex-col bg-card p-2">
                <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>
                {i === 2 && (
                  <div className="mt-1 rounded-lg bg-pop-blue/15 px-1.5 py-0.5 text-[10px] font-bold text-pop-blue">
                    📸 IG Reel draft
                  </div>
                )}
                {i === 7 && (
                  <div className="mt-1 rounded-lg bg-pop-yellow/15 px-1.5 py-0.5 text-[10px] font-bold text-pop-yellow">
                    🎬 YT Thumbnail
                  </div>
                )}
                {i === 11 && (
                  <div className="mt-1 rounded-lg bg-pop-purple/15 px-1.5 py-0.5 text-[10px] font-bold text-pop-purple">
                    💼 LinkedIn post
                  </div>
                )}
                {i === 17 && (
                  <div className="mt-1 rounded-lg bg-pop-green/15 px-1.5 py-0.5 text-[10px] font-bold text-pop-green">
                    🐦 Tweet thread
                  </div>
                )}
                {i === 23 && (
                  <div className="mt-1 rounded-lg bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    📤 IG Carousel
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-3 text-center text-3xl font-bold tracking-tight">Everything you need</h2>
        <p className="mx-auto mb-14 max-w-md text-center text-muted-foreground">
          Simple tools, thoughtfully designed to keep your content pipeline flowing.
        </p>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl pop-border bg-card p-6 transition-all hover:pop-shadow hover:-translate-x-[2px] hover:-translate-y-[2px]"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h2 className="mb-10 text-3xl font-bold tracking-tight">Why teams love it</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.text} className={`flex items-center gap-3 rounded-2xl pop-border ${b.color} bg-card px-5 py-4 text-left transition-all hover:pop-shadow hover:-translate-x-[1px] hover:-translate-y-[1px]`}>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-pop-green" />
              <span className="text-sm font-semibold">{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <div className="rounded-2xl pop-border pop-shadow-lg bg-card px-8 py-12">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">Ready to get organized?</h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Join small teams who plan smarter and publish with confidence.
          </p>
          <Button size="lg" className="gap-2 px-8 pop-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-base" asChild>
            <Link to="/auth">
              Get started free 🚀
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t pop-border px-6 py-8 text-center text-sm font-semibold text-muted-foreground">
        © 2026 ContentCal. Crafted with 💖
      </footer>
    </div>
  );
}
