import { Button, Container } from "@stackleo/ui";
import Link from "next/link";

interface HeroProps {
  siteName: string;
  siteTagline: string;
}

export function Hero({ siteName, siteTagline }: HeroProps) {
  return (
    <section className="border-b border-neutral-200 bg-neutral-900">
      <Container className="flex flex-col items-start gap-6 py-20 sm:py-28">
        <span className="bg-primary-500/10 text-primary-400 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
          Everything Tech, One Marketplace
        </span>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Welcome to <span className="text-primary-500">{siteName}</span>
        </h1>

        <p className="max-w-xl text-lg text-neutral-300">{siteTagline}</p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/shop">
            <Button size="lg">Shop Now</Button>
          </Link>
          <Link href="/deals">
            <Button
              size="lg"
              variant="outline"
              className="border-neutral-600 text-white hover:bg-white/10"
            >
              Explore Deals
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
