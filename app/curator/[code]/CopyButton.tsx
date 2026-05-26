"use client";

import { useState } from "react";

export default function CopyButton({ text, label, small }: { text: string; label: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pad = small ? "7px 14px" : "10px 20px";
  const size = small ? "0.75rem" : "0.83rem";

  return (
    <button
      onClick={copy}
      style={{
        background: copied ? "#F0FDF4" : "#F5F3FF",
        color: copied ? "#15803D" : "#7C3AED",
        border: `1.5px solid ${copied ? "#BBF7D0" : "#DDD6FE"}`,
        borderRadius: 999,
        padding: pad,
        fontSize: size,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "✓ Copied!" : label}
    </button>
  );
}
