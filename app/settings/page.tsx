"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/translations";
import { FaGithub, FaLinkedin, FaGoogle } from "react-icons/fa";

interface Profile {
  id: string;
  display_name: string;
  email: string;
  preferences?: {
    language: "pt" | "en";
    notifications: boolean;
  };
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const supabase = createClient();
  const { language: contextLanguage, setLanguage: contextSetLanguage } = useLanguage();
  const t = translations[contextLanguage];

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
        setEmail(data.email || "");
        if (data.preferences) {
          contextSetLanguage(data.preferences.language || "pt");
          setNotifications(data.preferences.notifications !== false);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          preferences: { language: contextLanguage, notifications },
        })
        .eq("id", profile.id);

      if (error) throw error;

      await contextSetLanguage(contextLanguage as "pt" | "en");
      alert(t.settings.successMessage);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  // Função para conectar redes sociais
  const handleConnect = (service: "linkedin" | "github" | "gmail") => {
    switch (service) {
      case "linkedin":
        window.open(
          "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=SEU_CLIENT_ID&redirect_uri=SUA_REDIRECT_URI&scope=r_liteprofile%20r_emailaddress",
          "_blank"
        );
        break;
      case "github":
        window.open(
          "https://github.com/login/oauth/authorize?client_id=SEU_CLIENT_ID&scope=user",
          "_blank"
        );
        break;
      case "gmail":
        window.open(
          "https://accounts.google.com/o/oauth2/v2/auth?client_id=SEU_CLIENT_ID&redirect_uri=SUA_REDIRECT_URI&response_type=code&scope=email%20profile",
          "_blank"
        );
        break;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <p>{contextLanguage === "pt" ? "Carregando..." : "Loading..."}</p>
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "linear-gradient(135deg, #a8d8ff 0%, #d4c4f9 100%)" }}
    >
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">{t.settings.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">{t.settings.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl">
                  <img src="/eu.jpeg" alt="Imagem Perfil" className="w-20 h-20 rounded-full" />
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">{t.settings.name}</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-2 bg-gray-50"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">{t.settings.email}</Label>
                <Input value={email} disabled className="mt-2 bg-gray-100" />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {saving ? t.settings.saving : t.settings.saveProfile}
              </Button>
            </CardContent>
          </Card>

          {/* Preferências */}
          <Card className="bg-white rounded-2xl shadow-lg max-h-50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">{t.settings.preferences}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-700 font-medium">{t.settings.language}</Label>
                <select
                  value={contextLanguage}
                  onChange={(e) => contextSetLanguage(e.target.value as "pt" | "en")}
                  className="mt-2 w-full border border-gray-200 rounded-lg p-2 bg-gray-50"
                >
                  <option value="pt">{t.settings.portuguese}</option>
                  <option value="en">{t.settings.english}</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Integrações */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">{t.settings.integrations}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* LinkedIn */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaLinkedin />
                  <div>
                    <p className="font-semibold text-gray-800">LinkedIn</p>
                    <p className="text-sm text-gray-600">{t.settings.notConnected}</p>
                  </div>
                </div>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleConnect("linkedin")}>
                  {t.settings.connect}
                </Button>
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaGithub />
                  <div>
                    <p className="font-semibold text-gray-800">GitHub</p>
                    <p className="text-sm text-gray-600">{t.settings.notConnected}</p>
                  </div>
                </div>
                <Button className="bg-gray-800 hover:bg-gray-900 text-white" onClick={() => handleConnect("github")}>
                  {t.settings.connect}
                </Button>
              </div>

              {/* Gmail */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaGoogle />
                  <div>
                    <p className="font-semibold text-gray-800">Gmail</p>
                    <p className="text-sm text-gray-600">{t.settings.notConnected}</p>
                  </div>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleConnect("gmail")}>
                  {t.settings.connect}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}