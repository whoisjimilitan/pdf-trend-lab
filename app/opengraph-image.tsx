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
        alignItems: "flex-start",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        padding: "80px 96px",
      }}
    >
      {/* Logo row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 52 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          🌱
        </div>
        <span style={{ fontSize: 26, fontWeight: 800, color: "#1A1008", letterSpacing: "-0.02em" }}>
          PDF Seeds
        </span>
      </div>

      {/* Eyebrow */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#9B8AF0",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        Specific to your country. Specific to your situation.
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: 76,
          fontWeight: 900,
          color: "#1A1008",
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          marginBottom: 32,
        }}
      >
        Stop Googling.
      </div>
      <div
        style={{
          fontSize: 76,
          fontWeight: 900,
          color: "#7C3AED",
          lineHeight: 1.05,
          letterSpacing: "-0.04em",
          marginBottom: 40,
        }}
      >
        Describe your situation.
      </div>

      {/* Sub */}
      <div
        style={{
          fontSize: 24,
          color: "#8C7D6E",
          lineHeight: 1.6,
          maxWidth: 720,
        }}
      >
        You get a step-by-step guide — not ten links and a rabbit hole.
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: "linear-gradient(90deg, #7C3AED, #4F46E5)",
        }}
      />
    </div>,
    { ...size },
  );
}
