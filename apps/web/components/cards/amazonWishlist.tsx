"use client";

import { useEffect, useState } from "react";
import SectionTitle from "../sectionTitle";
import Card from "../card";
import Link from "next/link";

export default function WishlistCard() {
  const [products, setProducts] = useState<any>(null);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => setProducts(data.data));
  }, []);

  return (
    <Card>
      <SectionTitle>📖 Promoções Wishlist de Hoje</SectionTitle>
      <div className="products-list">
        {products?.map((p: any, i: any) => (
          <Link key={i} href={p.link} target="_blank">
            <div className="product-row">
              <div>
                <div className="product-name">{p.name}</div>
                <div className="product-store">{p.store}</div>
              </div>
              <div className="product-right">
                <div className="product-price">{p.price}</div>
                {p.alert && <div className="product-alert">🔔 alerta ativo</div>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
