import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, LayoutGrid, Users, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Visual Calendar",
    description: "Plan your content on a beautiful monthly calendar. Drag and drop posts to reschedule in seconds.",
  },
  {
    icon: LayoutGrid,
    title: "Production Board",
    description: "Track every post from idea to published with a Kanban-style workflow your whole team can follow.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Assign editors & managers, leave comments, and keep everyone aligned without the chaos.",
  },
  {
    icon: Sparkles,
    title: "Multi-Platform",
    description: "Manage Instagram, YouTube, LinkedIn, and Twitter content all from one unified workspace.",
  },
];

const benefits = [
  "Never miss a publish date again",
  "See your whole month at a glance",
  "Keep your team on the same page",
  "Track content from idea to posted",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <CalendarDays className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ContentCal</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-20 pt-16 text-center md:pt-24 lg:pt-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Built for small creative teams
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          Your content,{" "}
          <span className="text-primary">beautifully</span>{" "}
          organized
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          The content calendar that brings your team together. Plan posts, track production, and publish with confidence — all in one warm, inviting workspace.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" className="gap-2 px-8" asChild>
            <Link to="/auth">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8" asChild>
            <a href="#features">See how it works</a>
          </Button>
        </div>
      </section>

      {/* Calendar Preview */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-lg shadow-primary/5">
          <div className="flex items-center gap-2 border-b px-5 py-3">
            <div className="h-3 w-3 rounded-full bg-destructive/60" />
            <div className="h-3 w-3 rounded-full bg-status-editing/60" />
            <div className="h-3 w-3 rounded-full bg-status-ready/60" />
            <span className="ml-3 text-sm text-muted-foreground">ContentCal — February 2026</span>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-card px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                {d}
              </div>
            ))}
            {Array.from({ length: 28 }, (_, i) => (
              <div key={i} className="flex min-h-[72px] flex-col bg-card p-2">
                <span className="text-xs text-muted-foreground">{i + 1}</span>
                {i === 2 && (
                  <div className="mt-1 rounded bg-status-idea/15 px-1.5 py-0.5 text-[10px] font-medium text-status-idea">
                    IG Reel draft
                  </div>
                )}
                {i === 7 && (
                  <div className="mt-1 rounded bg-status-editing/15 px-1.5 py-0.5 text-[10px] font-medium text-status-editing">
                    YT Thumbnail
                  </div>
                )}
                {i === 11 && (
                  <div className="mt-1 rounded bg-status-review/15 px-1.5 py-0.5 text-[10px] font-medium text-status-review">
                    LinkedIn post
                  </div>
                )}
                {i === 17 && (
                  <div className="mt-1 rounded bg-status-ready/15 px-1.5 py-0.5 text-[10px] font-medium text-status-ready">
                    Tweet thread
                  </div>
                )}
                {i === 23 && (
                  <div className="mt-1 rounded bg-status-posted/15 px-1.5 py-0.5 text-[10px] font-medium text-status-posted">
                    IG Carousel
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
              className="group rounded-xl border bg-card p-6 transition-shadow hover:shadow-md hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
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
            <div key={b} className="flex items-center gap-3 rounded-lg border bg-card px-5 py-4 text-left">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-status-ready" />
              <span className="text-sm font-medium">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <div className="rounded-2xl border bg-card px-8 py-12">
          <h2 className="mb-3 text-3xl font-bold tracking-tight">Ready to get organized?</h2>
          <p className="mx-auto mb-8 max-w-md text-muted-foreground">
            Join small teams who plan smarter and publish with confidence.
          </p>
          <Button size="lg" className="gap-2 px-8" asChild>
            <Link to="/auth">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        © 2026 ContentCal. Crafted with care.
      </footer>
    </div>
  );
}
