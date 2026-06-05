import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string; id: string }> }
) {
  const { id } = await params;
  await prisma.courseFile.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
