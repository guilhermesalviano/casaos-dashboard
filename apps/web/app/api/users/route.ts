import { NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db";
import { User } from "@/entities/User";

export async function GET() {
  try {
    const db = await getDatabaseConnection();
    const userRepository = db.getRepository(User);
    await userRepository.insert({ firstName: "John", lastName: "Doe", email: "john.doe@gmail.com" });

    const users = await userRepository.find();
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}