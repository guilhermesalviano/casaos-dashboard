import { NextRequest, NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db";
import { FlightCrawled } from "@/entities/FlightCrawled";

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabaseConnection();
    const flightCrawledRepository = db.getRepository(FlightCrawled);
    const flights = await flightCrawledRepository.find();

    const mockFlights = flights.map(flight => ({
      route: `${flight.origin} → ${flight.destination}`,
      airline: flight.airline,
      date: flight.flightDate,
      price: flight.price,
      trend: "▼",
    }));
    
    return NextResponse.json({ message: "Flights data retrieved successfully", data: mockFlights }, { status: 200 })
  } catch (error: unknown) {
    console.error(error)
    return NextResponse.json({ error: "Failed to retrieve flights data" }, { status: 500 });
  }
}