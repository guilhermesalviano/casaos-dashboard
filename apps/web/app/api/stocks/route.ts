import { fetchBrapiAPI } from "@/services/brapi-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const stocks = await fetchBrapiAPI();

    const stocksMap = stocks.results.map((stock) => {
      return {
        ticker: stock.symbol,
        price: stock.regularMarketPrice,
        priceOpened: stock.regularMarketDayHigh,
        change: stock.regularMarketChange,
        pct: stock.regularMarketChangePercent,
      }
    })

    return NextResponse.json({ message: "Stocks data retrieved successfully", data: stocksMap }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve stocks data" }, { status: 500 });
  }
}