import { NextResponse } from "next/server";
import { getCategoriesWithCounts } from "@/lib/data";

export async function GET() {
  const categories = getCategoriesWithCounts();
  return NextResponse.json(categories);
}
