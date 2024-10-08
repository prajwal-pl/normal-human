import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getAurinkoUrl } from "~/lib/aurinko";

export default async function Home() {
  const authUrl = await getAurinkoUrl("Google");
  return (
    <Button>
      <Link href={authUrl}>Link Account</Link>
    </Button>
  );
}
