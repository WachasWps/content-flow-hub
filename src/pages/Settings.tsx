import { useState } from "react";
import { User, Link2, Palette, Bell, CreditCard, Upload, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";

const sections = [
  { key: "account", label: "Account", icon: User },
  { key: "platforms", label: "Connected Platforms", icon: Link2 },
  { key: "brand", label: "Brand Kit", icon: Palette },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "billing", label: "Billing", icon: CreditCard },
];

const platforms = [
  { name: "Instagram", color: "bg-platform-instagram", connected: true },
  { name: "Twitter / X", color: "bg-platform-twitter", connected: false },
  { name: "YouTube", color: "bg-platform-youtube", connected: false },
  { name: "LinkedIn", color: "bg-platform-linkedin", connected: false },
];

const brandColors = [
  { name: "Terracotta", value: "#C4622D" },
  { name: "Blush", value: "#F2749A" },
  { name: "Sky", value: "#5BB4D8" },
  { name: "Sage", value: "#7A8C6E" },
  { name: "Ink", value: "#2B2118" },
  { name: "Parchment", value: "#F5EDD8" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className={cn("flex h-full overflow-hidden", isMobile && "flex-col")}>
      {/* Sub-navigation */}
      <div className={cn(
        "flex-shrink-0 border-border bg-card/50",
        isMobile ? "border-b p-3 overflow-x-auto" : "w-[220px] border-r p-5"
      )}>
        {!isMobile && <h2 className="font-serif-display text-[16px] font-semibold text-foreground mb-5">⚙️ Settings</h2>}
        <nav className={cn(isMobile ? "flex gap-1" : "space-y-1")}>
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={cn(
                "flex items-center gap-2 rounded-lg text-[13px] transition-all whitespace-nowrap",
                isMobile ? "px-3 py-2" : "w-full px-3.5 py-2.5 text-left",
                activeSection === s.key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <s.icon className="h-4 w-4" />
              {isMobile ? s.label.split(" ")[0] : s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main panel */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        {activeSection === "account" && (
          <div className="max-w-lg space-y-6">
            <div>
              <h3 className="font-serif-display text-[18px] font-semibold text-foreground mb-1">Account</h3>
              <p className="font-serif-body italic text-[13px] text-muted-foreground">Manage your personal information</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[12px]">Email</Label>
                <Input value={user?.email || ""} disabled className="bg-muted/30" />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px]">Display Name</Label>
                <Input placeholder="Your name" />
              </div>
            </div>
          </div>
        )}

        {activeSection === "platforms" && (
          <div className="max-w-lg space-y-6">
            <div>
              <h3 className="font-serif-display text-[18px] font-semibold text-foreground mb-1">Connected Platforms</h3>
              <p className="font-serif-body italic text-[13px] text-muted-foreground">Connect your social media accounts</p>
            </div>
            <div className="space-y-3">
              {platforms.map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-xl border border-border bg-[hsl(var(--warm-white))] p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", p.color)} />
                    <span className="text-[14px] font-medium text-foreground">{p.name}</span>
                  </div>
                  <Switch defaultChecked={p.connected} />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "brand" && (
          <div className="max-w-lg space-y-6">
            <div>
              <h3 className="font-serif-display text-[18px] font-semibold text-foreground mb-1">Brand Kit</h3>
              <p className="font-serif-body italic text-[13px] text-muted-foreground">Customize your brand identity</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-[12px] mb-3 block">Brand Colors</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {brandColors.map((c) => (
                    <div key={c.name} className="flex items-center gap-2.5 rounded-lg border border-border bg-[hsl(var(--warm-white))] p-3 cursor-pointer hover:border-primary/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg border border-border" style={{ background: c.value }} />
                      <div>
                        <p className="text-[12px] font-medium text-foreground">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-[12px] mb-3 block">Logo Upload</Label>
                <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.03] p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto text-primary/40 mb-2" />
                  <p className="text-[13px] text-muted-foreground">Drop your logo here or click to upload</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">SVG, PNG or JPG (max 2MB)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="max-w-lg space-y-6">
            <div>
              <h3 className="font-serif-display text-[18px] font-semibold text-foreground mb-1">Notifications</h3>
              <p className="font-serif-body italic text-[13px] text-muted-foreground">Choose what you get notified about</p>
            </div>
            <div className="space-y-3">
              {["Post scheduled", "Post published", "Comments on your posts", "Team member joined", "Weekly digest"].map((n) => (
                <div key={n} className="flex items-center justify-between rounded-xl border border-border bg-[hsl(var(--warm-white))] p-4">
                  <span className="text-[14px] text-foreground">{n}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "billing" && (
          <div className="max-w-lg space-y-6">
            <div>
              <h3 className="font-serif-display text-[18px] font-semibold text-foreground mb-1">Billing</h3>
              <p className="font-serif-body italic text-[13px] text-muted-foreground">Manage your subscription and payments</p>
            </div>
            <div className="rounded-xl border border-border bg-[hsl(var(--warm-white))] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-serif-display text-[16px] font-semibold text-foreground">Free Plan</h4>
                  <p className="text-[13px] text-muted-foreground">Basic features for personal use</p>
                </div>
                <span className="font-serif-display text-[24px] font-bold text-primary">$0</span>
              </div>
              <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-[13px] font-semibold transition-all hover:bg-primary/90">
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
