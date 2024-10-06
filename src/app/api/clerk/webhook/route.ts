import { NextRequest, NextResponse } from "next/server";

export default async function POST(req: NextRequest) {
  const { data } = await req.json();
  console.log(data);

  return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}
