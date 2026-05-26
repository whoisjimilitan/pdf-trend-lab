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
          width: 80,
          height: 80,
          borderRadius: 20,
          background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          marginBottom: 52,
          boxShadow: "0 12px 40px rgba(124,58,237,0.22)",
        }}
      >
        🌱
      </div>

      {/* Three beats */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          marginBottom: 56,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#1A1008",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
          }}
        >
          10 tabs. 3 hours.
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#7C3AED",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
          }}
        >
          0 guides.
        </div>
      </div>

      {/* URL */}
      <div
        style={{
          fontSize: 22,
          color: "#B0A89A",
          fontWeight: 500,
          letterSpacing: "0.04em",
        }}
      >
        pdfseeds.com
      </div>
    </div>,
    { ...size },
  );
}
