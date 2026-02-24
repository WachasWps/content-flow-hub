import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CalendarDays, LayoutGrid, Users, Zap, ArrowRight, Check, Instagram,
  Youtube, Linkedin, Twitter, Share2, MessageSquare, BarChart3, Clock,
  Sparkles, Eye, Heart, Send, TrendingUp, Globe, Mail,
} from "lucide-react";
import calyLogo from "@/assets/caly-logo.png";

const platforms = [
  { icon: Instagram, label: "Instagram", color: "from-[hsl(342,84%,70%)] to-[hsl(18,63%,47%)]" },
  { icon: Youtube, label: "YouTube", color: "from-[hsl(345,78%,59%)] to-[hsl(345,78%,45%)]" },
  { icon: Linkedin, label: "LinkedIn", color: "from-[hsl(226,64%,65%)] to-[hsl(226,64%,50%)]" },
  { icon: Twitter, label: "Twitter/X", color: "from-[hsl(197,60%,60%)] to-[hsl(197,60%,45%)]" },
];

const features = [
  {
    icon: CalendarDays,
    gradient: "from-[hsl(var(--pop-pink))] to-[hsl(var(--pop-purple))]",
    title: "Visual Content Calendar",
    description: "See your entire month at a glance. Drag posts, reschedule in seconds, and never double-book a publish slot again.",
    detail: "Color-coded by platform • Drag & drop • Month / week views",
  },
  {
    icon: LayoutGrid,
    gradient: "from-[hsl(var(--pop-blue))] to-[hsl(var(--pop-purple))]",
    title: "Production Pipeline",
    description: "Track every piece of content from raw idea → editing → review → published. Your Kanban board, built for creators.",
    detail: "5-stage workflow • Assign team members • File attachments",
  },
  {
    icon: Users,
    gradient: "from-[hsl(var(--pop-green))] to-[hsl(var(--pop-blue))]",
    title: "Team Collaboration",
    description: "Invite editors, social media managers, and strategists. Comment on posts, assign tasks, and stay in sync.",
    detail: "Role-based access • Comments • Activity feed",
  },
  {
    icon: Share2,
    gradient: "from-[hsl(var(--pop-orange))] to-[hsl(var(--pop-pink))]",
    title: "Share & Export",
    description: "Share your calendar with clients via a public link. Export screenshots to WhatsApp with one click.",
    detail: "Public calendar links • WhatsApp sharing • Screenshot export",
  },
  {
    icon: BarChart3,
    gradient: "from-[hsl(var(--pop-purple))] to-[hsl(var(--primary))]",
    title: "Analytics Dashboard",
    description: "Track posting frequency, content mix, and team productivity. Data-driven decisions, not guesswork.",
    detail: "Platform breakdown • Status tracking • Team metrics",
  },
  {
    icon: Zap,
    gradient: "from-[hsl(var(--pop-yellow))] to-[hsl(var(--pop-orange))]",
    title: "Multi-Platform Power",
    description: "Manage Instagram, YouTube, LinkedIn, and Twitter from one beautiful workspace. No more tab-switching chaos.",
    detail: "4 platforms • Unified view • Platform-specific tags",
  },
];

const stats = [
  { value: "4", label: "Platforms supported", icon: Globe },
  { value: "5", label: "Workflow stages", icon: TrendingUp },
  { value: "∞", label: "Posts per month", icon: Send },
  { value: "24/7", label: "Calendar access", icon: Clock },
];

const testimonialSteps = [
  { step: "01", title: "Plan your content", desc: "Map out posts on a visual calendar. See what's going where and when." },
  { step: "02", title: "Assign & collaborate", desc: "Bring in your editor, SM manager, or entire team. Everyone knows their role." },
  { step: "03", title: "Track production", desc: "Move posts through idea → editing → review → ready → posted. Nothing falls through." },
  { step: "04", title: "Share & publish", desc: "Share calendars with clients, export to WhatsApp, and hit publish with confidence." },
];

export default function Landing() {
  const [email, setEmail] = useState("");

  const handleWaitlist = () => {
    const subject = encodeURIComponent("Request Access to Caly");
    const body = encodeURIComponent(`Hi! I'd love to get early access to Caly.\n\nMy email: ${email}\n\nLooking forward to it!`);
    window.open(`mailto:digicontentcalendar@gmail.com?subject=${subject}&body=${body}`, "_self");
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <img src={calyLogo} alt="Caly" className="h-8 w-auto dark:invert" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="#how-it-works">How it works</a>
            </Button>
            <Button size="sm" className="shadow-md shadow-primary/20" asChild>
              <a href="#waitlist">
                Join Waitlist
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 md:pb-24 md:pt-24 lg:pt-32">
        {/* Floating social icons - decorative */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[5%] top-[15%] animate-bounce text-[hsl(var(--pop-pink))]/20">
            <Heart className="h-8 w-8" />
          </div>
          <div className="absolute right-[8%] top-[20%] animate-pulse text-[hsl(var(--pop-blue))]/20">
            <Eye className="h-10 w-10" />
          </div>
          <div className="absolute left-[12%] bottom-[25%] animate-pulse text-[hsl(var(--pop-purple))]/20">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div className="absolute right-[15%] bottom-[30%] animate-bounce text-[hsl(var(--pop-green))]/15">
            <TrendingUp className="h-9 w-9" />
          </div>
        </div>

        <div className="relative text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-4 w-4 text-[hsl(var(--pop-yellow))]" />
            Invite-only • Built for content creators
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your social media,{" "}
            <span className="bg-gradient-to-r from-primary via-[hsl(var(--pop-pink))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
              one calendar
            </span>
          </h1>

          <p className="font-serif-body mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Plan Instagram reels, YouTube uploads, LinkedIn posts, and tweets — all in one beautiful workspace.
            Track production, collaborate with your team, and never miss a publish date.
          </p>

          {/* Platform pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {platforms.map((p) => (
              <div
                key={p.label}
                className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${p.color} px-4 py-2 text-sm font-semibold text-white shadow-md`}
              >
                <p.icon className="h-4 w-4" />
                {p.label}
              </div>
            ))}
          </div>

          {/* Waitlist CTA */}
          <div id="waitlist" className="mx-auto mt-10 max-w-md">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-lg border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25" onClick={handleWaitlist}>
                Join Waitlist
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              🔒 Invite-only access. We'll send you a link when your spot is ready.
            </p>
          </div>
        </div>
      </section>

      {/* Mock Preview - bigger and more detailed */}
      <section className="mx-auto max-w-5xl px-5 pb-20 md:pb-28">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10">
          <div className="flex items-center gap-2 border-b px-4 py-3 bg-card">
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--pop-pink))]/80" />
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--pop-yellow))]/80" />
            <div className="h-3 w-3 rounded-full bg-[hsl(var(--pop-green))]/80" />
            <span className="ml-2 text-xs font-medium text-muted-foreground">Caly — Content Calendar</span>
          </div>
          <div className="grid grid-cols-7 gap-px bg-border">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="bg-card px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-3">
                {d}
              </div>
            ))}
            {Array.from({ length: 28 }, (_, i) => (
              <div key={i} className="flex min-h-[44px] sm:min-h-[64px] flex-col bg-card p-1 sm:p-1.5">
                <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground">{i + 1}</span>
                {i === 1 && <div className="mt-0.5 rounded border border-[hsl(var(--pop-pink))]/20 bg-[hsl(var(--pop-pink))]/10 px-1 py-0.5 text-[8px] sm:text-[9px] font-medium text-[hsl(var(--pop-pink))]">IG Reel 🎬</div>}
                {i === 3 && <div className="mt-0.5 rounded border border-[hsl(var(--pop-blue))]/20 bg-[hsl(var(--pop-blue))]/10 px-1 py-0.5 text-[8px] sm:text-[9px] font-medium text-[hsl(var(--pop-blue))]">Tweet 🐦</div>}
                {i === 6 && <div className="mt-0.5 rounded border border-[hsl(var(--destructive))]/20 bg-[hsl(var(--destructive))]/10 px-1 py-0.5 text-[8px] sm:text-[9px] font-medium text-[hsl(var(--destructive))]">YT Upload 🎥</div>}
                {i === 9 && <div className="mt-0.5 rounded border border-[hsl(var(--pop-purple))]/20 bg-[hsl(var(--pop-purple))]/10 px-1 py-0.5 text-[8px] sm:text-[9px] font-medium text-[hsl(var(--pop-purple))]">LI Article ✍️</div>}
                {i === 12 && <div className="mt-0.5 rounded border border-[hsl(var(--pop-pink))]/20 bg-[hsl(var(--pop-pink))]/10 px-1 py-0.5 text-[8px] sm:text-[9px] font-medium text-[hsl(var(--pop-pink))]">IG Story 📸</div>}
                {i === 15 && <div className="mt-0.5 rounded border border-[hsl(var(--pop-green))]/20 bg-[hsl(var(--pop-green))]/10 px-1 py-0.5 text-[8px] sm:text-[9px] font-medium text-[hsl(var(--pop-green))]">TW Thread 🧵</div>}
                {i === 19 && <div className="mt-0.5 rounded border border-[hsl(var(--pop-yellow))]/20 bg-[hsl(var(--pop-yellow))]/10 px-1 py-0.5 text-[8px] sm:text-[9px] font-medium text-[hsl(var(--pop-yellow))]">YT Short ⚡</div>}
                {i === 22 && <div className="mt-0.5 rounded border border-[hsl(var(--pop-purple))]/20 bg-[hsl(var(--pop-purple))]/10 px-1 py-0.5 text-[8px] sm:text-[9px] font-medium text-[hsl(var(--pop-purple))]">LI Post 💼</div>}
                {i === 25 && <div className="mt-0.5 rounded border border-[hsl(var(--pop-pink))]/20 bg-[hsl(var(--pop-pink))]/10 px-1 py-0.5 text-[8px] sm:text-[9px] font-medium text-[hsl(var(--pop-pink))]">IG Carousel 🎠</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-5xl grid-cols-2 divide-x divide-border md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 px-4 py-8 text-center">
              <s.icon className="mb-2 h-5 w-5 text-primary" />
              <span className="font-serif-display text-3xl font-bold text-foreground">{s.value}</span>
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-5 py-20 md:py-28">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest">How it works</span>
        </div>
        <h2 className="mb-4 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">From idea to posted in 4 steps</h2>
        <p className="mx-auto mb-14 max-w-lg text-center font-serif-body text-muted-foreground">
          A streamlined workflow designed for creators and small teams who juggle multiple platforms.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonialSteps.map((s) => (
            <div key={s.step} className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
              <span className="font-serif-display text-4xl font-bold text-primary/15 group-hover:text-primary/30 transition-colors">{s.step}</span>
              <h3 className="mt-2 text-base font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-card/50 border-y">
        <div className="mx-auto max-w-5xl px-5 py-20 md:py-28">
          <div className="mb-4 text-center">
            <span className="inline-block rounded-full bg-[hsl(var(--pop-blue))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--pop-blue))] uppercase tracking-widest">Features</span>
          </div>
          <h2 className="mb-4 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Everything your content team needs</h2>
          <p className="mx-auto mb-14 max-w-lg text-center font-serif-body text-muted-foreground">
            Built specifically for social media managers, content creators, and creative teams.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient} shadow-sm`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-1.5 text-base font-bold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                <p className="mt-3 text-[11px] font-medium text-primary/70">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / benefits */}
      <section className="mx-auto max-w-5xl px-5 py-20 md:py-28">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-[hsl(var(--pop-green))]/10 px-3 py-1 text-xs font-semibold text-[hsl(var(--pop-green))] uppercase tracking-widest">Why Caly</span>
        </div>
        <h2 className="mb-4 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Built for the way you actually work</h2>
        <p className="mx-auto mb-14 max-w-lg text-center font-serif-body text-muted-foreground">
          No bloated enterprise tools. No spreadsheet chaos. Just a clean, focused workspace.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Never miss a publish date",
            "See your whole month at a glance",
            "Keep your team perfectly aligned",
            "Track content from idea to posted",
            "Share calendars with clients instantly",
            "One workspace for all platforms",
          ].map((b) => (
            <div key={b} className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 transition-all hover:shadow-md">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--pop-green))] to-[hsl(var(--pop-blue))]">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-card/50">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
          <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/[0.06] px-6 py-14 shadow-xl shadow-primary/5 sm:px-12">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Want early access?</h2>
            <p className="mx-auto mb-8 max-w-md font-serif-body text-muted-foreground">
              Caly is invite-only. Drop your email and we'll get you set up with your own workspace.
            </p>
            <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25" onClick={handleWaitlist}>
                Request Access
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Or email us directly at{" "}
              <a href="mailto:digicontentcalendar@gmail.com" className="font-medium text-primary underline underline-offset-2 hover:text-primary/80">
                digicontentcalendar@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-5 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4">
            <img src={calyLogo} alt="Caly" className="h-6 w-auto dark:invert" />
            <span className="text-sm text-muted-foreground">© 2026 Caly. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:digicontentcalendar@gmail.com" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-4 w-4" />
              Contact
            </a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
