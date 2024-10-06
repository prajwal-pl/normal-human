export default async function POST(req: Request) {
  const { data } = await req.json();
  console.log(data);

  return new Response("Webhook received", { status: 200 });
}
