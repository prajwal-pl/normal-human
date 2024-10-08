import { db } from "~/server/db";

export const POST = async (req: Request) => {
  const { data } = await req.json();
  const emailAddress = data.email_addresses[0].email_address;
  const firstName = data.first_name;
  const lastName = data.last_name;
  const imageUrl = data.image_url;
  const id = data.id;
  console.log(data);

  await db.user.upsert({
    where: { id },
    update: { emailAddress, firstName, lastName, imageUrl },
    create: { id, emailAddress, firstName, lastName, imageUrl },
  });
  console.log("user created");
  return new Response("Webhook received", { status: 200 });
};
