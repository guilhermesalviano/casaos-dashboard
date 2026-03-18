'use client';

import { usePushNotification } from '@/hooks/usePushNotification';

export default function PushButton() {
  const { subscribe, unsubscribe, subscription, permission } = usePushNotification();

  if (permission === 'denied') {
    return <p>Notificações bloqueadas no navegador.</p>;
  }

  return (
    <button 
      onClick={subscription ? unsubscribe : subscribe}
      style={{
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "50%",
        width: 34,
        height: 34,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border-color 0.2s, opacity 0.2s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {subscription ? '🔕' : '🔔'}
    </button>
  );
}