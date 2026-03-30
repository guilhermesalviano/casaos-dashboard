import Card from "../card";

export default function StocksCard({ data }: { data: any }) {
  return (
    <Card>
      <h2 className="section-title">📊 Ativos Hoje</h2>
      <div className="stocks-list">
        <div className="stock-row">
          <span className="w-10 text-sm">Ticker</span>
          <span className="w-18 text-center text-sm">
            Price
          </span>
          <span className="w-26 text-center text-sm">
            Price Change
          </span>
          <span className="w-18 text-center text-sm">
            Percent
          </span>
        </div>
        {data.map((s: any) => (
          <div key={s.ticker} className="stock-row">
            <span className="stock-ticker">{s.ticker}</span>
            <span className="stock-price">
              {`R$ ${s.price.toFixed(2)}`}
            </span>
            <span className="stock-price">
              {`R$ ${s.change?.toFixed(2)}`}
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