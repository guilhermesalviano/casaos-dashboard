import { fetchMediastackAPI } from "@/services/mediastack-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const newsApiReturn = await fetchMediastackAPI();

    const news = newsApiReturn.data.map((article, index) => {
      return {
        id: index,
        source: article.source,
        title: article.title,
        tag: article.category,
        url: article.url,
      }
    });
    
    return NextResponse.json({ message: "News data retrieved successfully", data: news }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve news data" }, { status: 500 });
  }
}