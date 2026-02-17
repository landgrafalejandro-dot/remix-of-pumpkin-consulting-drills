import React, { useState } from "react";
import NavHeader from "@/components/NavHeader";
import { useUserEmail } from "@/hooks/useUserEmail";
import { Settings, User, Bell, Monitor, Database } from "lucide-react";

const SettingsPage: React.FC = () => {
  const userEmail = useUserEmail();
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    newModules: true,
    newsletter: false,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavHeader />
      <main className="flex flex-1 flex-col items-center px-4 pb-16">
        <div className="w-full max-w-drill">
          <h1 className="mb-2 text-h2 text-foreground">⚙️ Einstellungen</h1>
          <p className="mb-8 text-body text-secondary-foreground">Verwalte dein Profil und deine Präferenzen.</p>

          {/* Profile */}
          <div className="mb-section-gap rounded-2xl border border-border bg-card p-card-padding">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="h-4 w-4 text-primary" /> Profil
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-label text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={userEmail || ""}
                  readOnly
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="mb-section-gap rounded-2xl border border-border bg-card p-card-padding">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bell className="h-4 w-4 text-primary" /> Benachrichtigungen
            </h3>
            <div className="space-y-3">
              {[
                { key: "dailyReminder" as const, label: "Tägliche Übungserinnerung" },
                { key: "newModules" as const, label: "Neue Module verfügbar" },
                { key: "newsletter" as const, label: "Newsletter" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      notifications[item.key] ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${
                      notifications[item.key] ? "translate-x-5" : "translate-x-0.5"
                    }`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          {/* Display */}
          <div className="mb-section-gap rounded-2xl border border-border bg-card p-card-padding">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Monitor className="h-4 w-4 text-primary" /> Anzeige
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-label text-muted-foreground">Sprache</label>
                <select className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none">
                  <option>Deutsch</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-label text-muted-foreground">Theme</label>
                <select className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none">
                  <option>Dunkel</option>
                  <option>Hell</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="rounded-2xl border border-border bg-card p-card-padding">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Database className="h-4 w-4 text-primary" /> Daten
            </h3>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent">
                Fortschritt exportieren
              </button>
              <button className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/20">
                Fortschritt zurücksetzen
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
