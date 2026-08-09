import { CategoryGrid } from "../components/home/CategoryGrid";
import { FeaturedProducts } from "../components/home/FeaturedProducts";
import { Hero } from "../components/home/Hero";
import { ValueProps } from "../components/home/ValueProps";
import { getPublicEnv } from "../lib/env/env";

export default function HomePage() {
  const { siteName, siteTagline } = getPublicEnv();

  return (
    <>
      <Hero siteName={siteName} siteTagline={siteTagline} />
      <ValueProps />
      <CategoryGrid />
      <FeaturedProducts />
    </>
  );
}
