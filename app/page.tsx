import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HeroSection } from "@/components/hero-section"
import { ScoresTicker } from "@/components/scores-ticker"
import { StandingsPreview } from "@/components/standings-preview"
import { FeaturedPlayers } from "@/components/featured-players"
import { NewsSection } from "@/components/news-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <ScoresTicker />
        <StandingsPreview />
        <FeaturedPlayers />
        <NewsSection />
      </main>
      <SiteFooter />
    </div>
  )
}
