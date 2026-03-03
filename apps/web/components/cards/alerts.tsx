"use client";

import SectionTitle from "../sectionTitle";
import Card from "../card";

const mockAlerts = [
  { id: 1, type: "price_drop", msg: "iPhone 16 Pro caiu R$ 300 na Kabum!", icon: "🔔", time: "há 2h" },
  { id: 2, type: "flight", msg: "Passagem GRU→LIS abaixo de R$ 3.500 disponível", icon: "✈️", time: "há 5h" },
  { id: 3, type: "stock", msg: "PETR4 ultrapassou alvo de R$ 38,00", icon: "📈", time: "há 1h" },
];

export default function AlertsCard() {
  return (
    <Card className="alerts-card">
      <SectionTitle>🔔 Alertas</SectionTitle>
      <div className="alerts-list">
        {mockAlerts.map((a) => (
          <div key={a.id} className="alert-item">
            <span className="alert-icon">{a.icon}</span>
            <div className="alert-content">
              <div className="alert-msg">{a.msg}</div>
              <div className="alert-time">{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}