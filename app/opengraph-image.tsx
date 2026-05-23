import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #FAF9F7 0%, #F0EDFF 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          marginBottom: 32,
          boxShadow: "0 16px 48px rgba(124,58,237,0.3)",
        }}
      >
        🌱
      </div>
      <div
        style={{
          fontSize: 68,
          fontWeight: 900,
          color: "#1A1008",
          letterSpacing: "-3px",
          marginBottom: 16,
          textAlign: "center",
          padding: "0 80px",
          lineHeight: 1.1,
        }}
      >
        Stop Googling.
      </div>
      <div
        style={{
          fontSize: 48,
          fontWeight: 900,
          color: "#7C3AED",
          letterSpacing: "-2px",
          marginBottom: 36,
          textAlign: "center",
        }}
      >
        There&apos;s a PDF guide for that.
      </div>
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
