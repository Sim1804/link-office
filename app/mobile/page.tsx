"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, Smartphone, ShieldCheck, Apple, Chrome } from "lucide-react";

const mobileWebUrl = process.env.NEXT_PUBLIC_MOBILE_WEB_URL || "";
const androidApkUrl = process.env.NEXT_PUBLIC_ANDROID_APK_URL || "";
const iosAppUrl = process.env.NEXT_PUBLIC_IOS_APP_URL || "";

export default function MobileDownloadPage() {
  const [platform, setPlatform] = useState<"android" | "ios" | "other">("other");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) setPlatform("android");
    else if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
  }, []);

  const title = platform === "android"
    ? "Installez Link Office sur Android"
    : platform === "ios"
      ? "Ajoutez Link Office sur votre iPhone"
      : "Link Office sur votre téléphone";

  return (
    <main style={{ minHeight: "100vh", background: "#F4F1E8", color: "#123D46", padding: "40px 20px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, margin: "0 auto 18px", borderRadius: 22, background: "#123D46", display: "grid", placeItems: "center", color: "#F4F1E8", fontWeight: 800, fontSize: 26, letterSpacing: 2 }}>
            LiNK
          </div>
          <div style={{ color: "#00A99D", fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Laboratoire du lien humain
          </div>
          <h1 style={{ fontSize: "clamp(30px, 7vw, 48px)", lineHeight: 1.1, margin: 0, fontWeight: 800 }}>{title}</h1>
          <p style={{ margin: "16px auto 0", maxWidth: 560, lineHeight: 1.65, color: "#46636A" }}>
            Le QR code du site vous amène ici. Aucun passage par Expo Go n'est nécessaire.
          </p>
        </div>

        {platform === "android" && (
          <section style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: "0 12px 40px rgba(18,61,70,.10)", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(0,169,157,.12)", display: "grid", placeItems: "center", flexShrink: 0 }}><Download size={23} color="#00A99D" /></div>
              <div>
                <h2 style={{ margin: 0, fontSize: 21 }}>Installer l'APK Android</h2>
                <p style={{ color: "#46636A", lineHeight: 1.6, margin: "8px 0 18px" }}>
                  Téléchargez l'application, ouvrez le fichier APK puis confirmez l'installation si Android affiche un avertissement de sécurité.
                </p>
                {androidApkUrl ? (
                  <a href={androidApkUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 18px", borderRadius: 12, background: "#00A99D", color: "white", textDecoration: "none", fontWeight: 800 }}>
                    Télécharger l'APK <Download size={17} />
                  </a>
                ) : (
                  <div style={{ padding: 14, borderRadius: 12, background: "#E3EBE6", color: "#123D46", fontSize: 14 }}>
                    L'APK n'est pas encore publié. Configurez <code>NEXT_PUBLIC_ANDROID_APK_URL</code> avec l'URL de votre APK EAS.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {platform === "ios" && (
          <section style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: "0 12px 40px rgba(18,61,70,.10)", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(89,101,232,.10)", display: "grid", placeItems: "center", flexShrink: 0 }}><Apple size={23} color="#5965E8" /></div>
              <div>
                <h2 style={{ margin: 0, fontSize: 21 }}>L'utiliser comme une application</h2>
                <p style={{ color: "#46636A", lineHeight: 1.6, margin: "8px 0 12px" }}>
                  Sur iPhone, un APK Android ne peut pas être installé. Ouvrez la version mobile dans Safari, puis choisissez <strong>Partager → Sur l’écran d’accueil</strong> et activez <strong>Ouvrir comme application Web</strong> si iOS propose cette option. Le raccourci doit être créé depuis la version mobile Expo, pas depuis cette page d’installation.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {(iosAppUrl || mobileWebUrl) ? (
                    <a href={iosAppUrl || mobileWebUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 18px", borderRadius: 12, background: "#5965E8", color: "white", textDecoration: "none", fontWeight: 800 }}>
                      Ouvrir Link Office <ExternalLink size={17} />
                    </a>
                  ) : (
                    <div style={{ padding: 14, borderRadius: 12, background: "#E3EBE6", color: "#123D46", fontSize: 14 }}>
                      La version web mobile n'est pas encore configurée. Définissez <code>NEXT_PUBLIC_MOBILE_WEB_URL</code> sur l'URL publique de l'application mobile Expo.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {platform === "other" && (
          <section style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: "0 12px 40px rgba(18,61,70,.10)", marginBottom: 18 }}>
            <h2 style={{ marginTop: 0 }}>Choisissez votre appareil</h2>
            <p style={{ color: "#46636A", lineHeight: 1.6 }}>Android peut recevoir directement l'APK. Sur iPhone, utilisez la version web installable ou TestFlight/App Store.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {androidApkUrl && <a href={androidApkUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 18px", borderRadius: 12, background: "#00A99D", color: "white", textDecoration: "none", fontWeight: 800 }}><Download size={17}/> APK Android</a>}
              <a href={mobileWebUrl} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 18px", borderRadius: 12, background: "#123D46", color: "white", textDecoration: "none", fontWeight: 800 }}><Chrome size={17}/> Version web mobile</a>
            </div>
          </section>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", color: "#46636A", fontSize: 13 }}>
          <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><Smartphone size={15}/> iOS & Android</span>
          <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><ShieldCheck size={15}/> Connexion sécurisée</span>
        </div>
      </div>
    </main>
  );
}
