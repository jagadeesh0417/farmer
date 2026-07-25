import { NextResponse } from "next/server";

export async function POST(request) {
  const body = await request.json();
  // In production, send email or store in DB
  console.log("Contact form submission:", body);
  return NextResponse.json({ success: true, message: "Thank you for reaching out! We'll get back to you soon." });
}
