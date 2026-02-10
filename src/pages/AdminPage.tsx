import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminModuleTab from "@/components/admin/AdminModuleTab";
import pumpkinLogo from "@/assets/pumpkin-logo.jpg";

const AdminPage: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoggedIn(false);
      setIsAdmin(false);
      return;
    }
    setIsLoggedIn(true);
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(!!data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login fehlgeschlagen", description: error.message, variant: "destructive" });
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Registrierung fehlgeschlagen", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Registrierung erfolgreich", description: "Bitte bestätige deine E-Mail-Adresse." });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center gap-3">
            <img src={pumpkinLogo} alt="Logo" className="h-12 w-auto" />
            <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" /> Anmelden
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleSignUp} disabled={loading}>
              Registrieren
            </Button>
          </form>
          <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Laden…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-foreground">Kein Zugriff</h1>
        <p className="mb-6 text-muted-foreground">Du hast keine Admin-Berechtigung.</p>
        <Link to="/">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Zurück</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <img src={pumpkinLogo} alt="Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-bold text-foreground">Aufgaben verwalten</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => supabase.auth.signOut()}>Abmelden</Button>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="case_math">
          <TabsList className="mb-6">
            <TabsTrigger value="case_math">Case Math</TabsTrigger>
            <TabsTrigger value="mental_math">Mental Math</TabsTrigger>
          </TabsList>
          <TabsContent value="case_math">
            <AdminModuleTab module="case_math" />
          </TabsContent>
          <TabsContent value="mental_math">
            <AdminModuleTab module="mental_math" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
