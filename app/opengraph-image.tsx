import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#FAF9F7",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: "60px 80px",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          marginBottom: 20,
          boxShadow: "0 16px 48px rgba(124,58,237,0.25)",
        }}
      >
        🌱
      </div>

      {/* Brand name */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#1A1008",
          letterSpacing: "-0.02em",
          marginBottom: 48,
        }}
      >
        PDF Seeds
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: "#1A1008",
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
          marginBottom: 12,
        }}
      >
        Stop Googling.
      </div>
      <div
        style={{
          fontSize: 80,
          fontWeight: 900,
          color: "#7C3AED",
          lineHeight: 1.08,
          letterSpacing: "-0.04em",
          marginBottom: 48,
        }}
      >
        Describe your situation.
      </div>

      {/* URL */}
      <div
        style={{
          fontSize: 22,
          color: "#B0A89A",
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        pdfseeds.com
      </div>
    </div>,
    { ...size },
  );
}
