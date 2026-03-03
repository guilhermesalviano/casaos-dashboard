"use client";

import { useEffect, useState } from "react";
import SectionTitle from "../sectionTitle";
import Card from "../card";
import { useRouter } from "next/navigation";
import { useStatus } from "@/contexts/statusContext";


export default function NewsCard() {
  const [news, setNews] = useState<any>(null);
  const { reportStatus } = useStatus();
  
  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data.data);
        reportStatus("news", "success");
      }).catch(() => {
        reportStatus("news", "error");
      });
  }, []);

  return (
    <Card>
      <SectionTitle>📰 Últimas Notícias</SectionTitle>
      <div className="news-list">
        {news?.map((n: any) => (
          <div key={n.id} className="news-item cursor-pointer" onClick={() => window.open(n.url, "_blank")}>
            <span className="news-tag">{n.tag}</span>
            <div>
              <div className="news-title">{n.title}</div>
              <div className="news-source">{n.source}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}