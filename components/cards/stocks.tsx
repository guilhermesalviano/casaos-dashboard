"use client";

import { useEffect, useState } from "react";
import SectionTitle from "../sectionTitle";
import Card from "../card";
import { useStatus } from "@/contexts/statusContext";

export default function StocksCard() {
  const [stocks, setStocks] = useState<any>(null);
  const { reportStatus } = useStatus();
  
  useEffect(() => {
    fetch("/api/stocks")
      .then((res) => res.json())
      .then((data) => {
        setStocks(data.data);
        reportStatus("stocks", "success");
      }).catch(() => {
        reportStatus("stocks", "error");
      });
  }, []);

  return (
    <Card>
      <SectionTitle>📊 Ativos Hoje</SectionTitle>
      <div className="stocks-list">
        <div className="stock-row">
          <span className="w-10 text-sm">Ticker</span>
          <span className="w-26 text-center text-sm">
            Price Opened
          </span>
          <span className="w-18 text-center text-sm">
            Price
          </span>
          <span className="w-18 text-center text-sm">
            Percent
          </span>
        </div>
        {stocks?.map((s: any) => (
          <div key={s.ticker} className="stock-row">
            <span className="stock-ticker">{s.ticker}</span>
            <span className="stock-price">
              {`R$ ${s.priceOpened?.toFixed(2)}`}
            </span>
            <span className="stock-price">
              {`R$ ${s.price.toFixed(2)}`}
            </span>
            <span className={`stock-change ${s.change >= 0 ? "pos" : "neg"}`}>
              {s.change >= 0 ? "+" : ""}{s.pct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}