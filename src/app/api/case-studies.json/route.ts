import { NextResponse } from "next/server";
import { getAllCaseStudies } from "@/lib/data";

export async function GET() {
  const caseStudies = getAllCaseStudies();
  return NextResponse.json(caseStudies);
}
