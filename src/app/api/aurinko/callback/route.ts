import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getAccountDetails, getAurinkoToken } from "~/lib/aurinko";
import { db } from "~/server/db";
import { waitUntil } from "@vercel/functions";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status !== "success")
    return NextResponse.json(
      { error: "Account connection failed" },
      { status: 400 },
    );

  const code = params.get("code");

  if (!code)
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  const token = await getAurinkoToken(code as string);
  if (!token)
    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 400 },
    );
  const accountId = token.accountId.toString();
  console.log(accountId);
  const accountDetails = await getAccountDetails(token.accessToken);
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return new Response("No user found", { status: 404 });
  }
  await db.account.upsert({
    where: { id: token.accountId.toString() },
    create: {
      id: accountId,
      userId,
      token: token.accessToken,
      provider: "Aurinko",
      emailAddress: accountDetails.email,
      name: accountDetails.name,
    },
    update: {
      token: token.accessToken,
    },
  });

  waitUntil(
    axios
      .post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        accountId: token.accountId.toString(),
        userId,
      })
      .catch((err) => {
        console.log(err.response.data);
      }),
  );

  return NextResponse.redirect(new URL("/mail", req.url));
};
