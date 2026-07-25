import { prisma } from "@/lib/prisma";
import { signToken, comparePassword } from "@/lib/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request) {
  const body = await request.json();
  const admin = await prisma.admin.findUnique({ where: { username: body.username } });

  if (!admin || !(await comparePassword(body.password, admin.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ id: admin.id, username: admin.username });
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ success: true });
}
