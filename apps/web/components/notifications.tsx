"use client";

import { useState, useRef, useEffect } from "react";
import Button from "./button";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Deployment successful",
    message: "Production build v2.4.1 deployed without errors.",
    time: "2m ago",
    read: false,
    type: "success",
  },
  {
    id: "2",
    title: "New comment on PR #84",
    message: "Alice left a review on your pull request.",
    time: "18m ago",
    read: false,
    type: "info",
  },
  {
    id: "3",
    title: "Storage limit at 90%",
    message: "You're approaching your storage quota. Consider upgrading.",
    time: "1h ago",
    read: false,
    type: "warning",
  },
  {
    id: "4",
    title: "Weekly report ready",
    message: "Your analytics summary for last week is available.",
    time: "3h ago",
    read: true,
    type: "info",
  },
  {
    id: "5",
    title: "Password changed",
    message: "Your account password was updated successfully.",
    time: "Yesterday",
    read: true,
    type: "success",
  },
];

const TYPE_COLORS: Record<Notification["type"], string> = {
  info: "#6b9fff",
  success: "#4ade80",
  warning: "#fbbf24",
};

export default function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <Button
        onClick={() => setOpen((o) => !o)}
        ariaLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#ef4444",
              border: "1.5px solid var(--background, #fff)",
            }}
          />
        )}
      </Button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 320,
            background: "var(--surface, #fff)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            zIndex: 100,
            overflow: "hidden",
            animation: "fadeSlideIn 0.15s ease",
          }}
        >
          {/* <style>{`
            @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(-6px); }
            to   { opacity: 1; transform: translateY(0); }
            }
        `}</style> */}

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px 10px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--foreground, #111)",
              }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: 20,
                    padding: "1px 6px",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  color: "var(--muted, #888)",
                  padding: 0,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--foreground, #111)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--muted, #888)")
                }
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "11px 14px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  background: n.read
                    ? "transparent"
                    : "var(--surface-subtle, rgba(0,0,0,0.02))",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "var(--surface-hover, rgba(0,0,0,0.04))")
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.background = n.read
                  ? "transparent"
                  : "var(--surface-subtle, rgba(0,0,0,0.02))")
                }
              >
                <div
                  style={{
                    marginTop: 4,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: TYPE_COLORS[n.type],
                    flexShrink: 0,
                    opacity: n.read ? 0.4 : 1,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: n.read ? 400 : 600,
                        color: "var(--foreground, #111)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {n.title}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--muted, #888)",
                        flexShrink: 0,
                      }}
                    >
                      {n.time}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "var(--muted, #888)",
                      lineHeight: 1.4,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "9px 14px" }}>
            <button
              style={{
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: "var(--muted, #888)",
                padding: 0,
                textAlign: "center",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--foreground, #111)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--muted, #888)")
              }
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BellIcon({ size = 18 }: { size?: number }) {
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}