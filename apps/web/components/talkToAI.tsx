"use client";

import { useRouter } from "next/navigation";

export default function TalkToAI() {
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => router.push("/ai")}
        aria-label="Open AI assistant"
        style={{
          // backgroundHover: "var(--border)",
          border: "1px solid var(--border)",
          borderRadius: "50%",
          width: 34,
          height: 34,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "border-color 0.2s, background 0.2s",
          flexShrink: 0,
          position: "relative",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <SparkleIcon />
      </button>
    </>
  );
}


function SparkleIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--muted)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
    </svg>
  );
}
