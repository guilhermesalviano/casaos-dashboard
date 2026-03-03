"use client";

import { useEffect, useState } from "react";
import SectionTitle from "../sectionTitle";
import Card from "../card";

export default function FlightsCard() {
  const [flights, setFlights] = useState<any>(null);

  useEffect(() => {
    fetch("/api/flights")
      .then((res) => res.json())
      .then((data) => setFlights(data.data));
  }, []);

  return (
    <Card>
      <SectionTitle>✈️ Passagens Monitoradas</SectionTitle>
      <div className="flights-list">
        {flights?.map((f: any, i: any) => (
          <div key={i} className="flight-row">
            <div>
              <div className="flight-route">{f.route}</div>
              <div className="flight-meta">{f.date} · {f.airline}</div>
            </div>
            <div className="flight-price flex flex-col justify-center items-center">
              <div className="flight-title">
                lowest value
              </div>
              <div className="flight-value">
                {f.price}
              </div>
            </div>
            <div className="flight-price flex flex-col justify-center items-center">
              <div className="flight-title">
                actual value
              </div>
              <div className="flight-value flex gap-2">
                {f.price}
                <span style={{ opacity: 0.5 }}>{f.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
