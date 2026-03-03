import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const mockFlights = [
      { route: "GRU → LIS", date: "10 Jan", price: "R$ 3.240", airline: "TAP", trend: "▼" },
      { route: "GRU → MIA", date: "15 Jan", price: "R$ 4.100", airline: "LATAM", trend: "▲" },
      { route: "CGH → REC", date: "12 Jan", price: "R$ 580", airline: "GOL", trend: "▼" },
    ];
    
    return NextResponse.json({ message: "Flights data retrieved successfully", data: mockFlights }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve flights data" }, { status: 500 });
  }
}