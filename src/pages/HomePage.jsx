import { BannerBoard } from '../components/sections/BannerBoard';
import { BrandDirectory } from '../components/sections/BrandDirectory';
import { BrandPanel } from '../components/sections/brand-panel/BrandPanel';
import { CommunityPick } from '../components/sections/CommunityPick';
import { Faq } from '../components/sections/Faq';
import { Featured } from '../components/sections/featured/Featured';
import { Hero } from '../components/sections/Hero';
import { HowItWorks } from '../components/sections/how-it-works/HowItWorks';
import { JoinWaitlist } from '../components/sections/JoinWaitlist';
import { LiveTraffic } from '../components/sections/LiveTraffic';
import { Pricing } from '../components/sections/Pricing';
import { QuoteBuilder } from '../components/sections/QuoteBuilder';

/** The full Spot On Top landing page, in the order of the design file. */
export function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Featured />
      <LiveTraffic />
      <BannerBoard />
      <BrandDirectory />
      <BrandPanel />
      <CommunityPick />
      <Pricing />
      <QuoteBuilder />
      <Faq />
      <JoinWaitlist />
    </>
  );
}
