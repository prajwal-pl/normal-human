import { NextResponse } from "next/server";
import { db } from "~/server/db";

export const POST = async (req: NextResponse) => {
  const body = await req.json();
  const { accountId, userId } = body;
  if (!accountId || !userId)
    return NextResponse.json({ error: "INVALID REQUEST" }, { status: 400 });

  const dbAccount = await db.account.findUnique({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!dbAccount)
    return NextResponse.json({ error: "NOT FOUND" }, { status: 404 });
};
