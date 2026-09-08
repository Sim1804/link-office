"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Smartphone, ArrowRight } from "lucide-react";

export function MobileAccessQr() {
  const [src, setSrc] = useState("");
  const target = process.env.NEXT_PUBLIC_MOBILE_DOWNLOAD_URL || "/mobile";

  useEffect(() => {
    if (!target) return;
    QRCode.toDataURL(target, {
      width: 240,
      margin: 1,
      color: { dark: "#123D46", light: "#F4F1E8" },
      errorCorrectionLevel: "H",
    }).then(setSrc).catch(() => {});
  }, [target]);

  if (!target) return null;

  return (
    <section style={{ padding: "48px 0" }}>
      <div className="container">
        <div
          className="mobile-access-card card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            padding: 32,
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(0,169,157,.10), rgba(227,235,230,.8))",
          }}
        >
          <div style={{ flex: 1 }}>
            <span className="badge badge-cyan" style={{ marginBottom: 12 }}>
              <Smartphone size={13} /> Version mobile
            </span>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text-1)", marginBottom: 10 }}>
              Emportez Link Office avec vous
            </h2>
            <p style={{ color: "var(--text-2)", lineHeight: 1.65, maxWidth: 540, marginBottom: 18 }}>
              Scannez le QR code avec l'appareil photo de votre téléphone. Vous arriverez sur une page qui vous proposera automatiquement la meilleure option pour votre appareil : <strong>APK Android</strong> ou <strong>application web installable sur iPhone</strong>.
            </p>
            <a href={target} className="btn btn-primary" style={{ textDecoration: "none" }}>
              Ouvrir les options mobiles <ArrowRight size={16} />
            </a>
          </div>
          {src && (
            <div style={{ background: "#F4F1E8", padding: 12, borderRadius: 16, flexShrink: 0 }}>
              <img src={src} alt="QR code pour installer Link Office sur mobile" width={240} height={240} />
            </div>
          )}
        </div>
      </div>
      <style>{`@media(max-width:700px){.mobile-access-card{flex-direction:column!important;text-align:center}.mobile-access-card img{width:210px!important;height:210px!important}}`}</style>
    </section>
  );
}
