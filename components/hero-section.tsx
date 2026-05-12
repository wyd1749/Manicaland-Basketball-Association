import Image from "next/image"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <Image
src="/hero2.png"
        alt="Basketball action in the Manicaland Basketball Association"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 flex items-end">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 lg:px-8">
          <p className="font-sans text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            {new Date().getFullYear()} Season
          </p>
          <h1 className="mt-2 font-sans text-5xl font-bold uppercase leading-tight tracking-tight text-foreground md:text-7xl lg:text-8xl">
            <span className="text-balance">
              Manicaland
              <br />
              <span className="text-primary">Basketball</span>
            </span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
            {"Zimbabwe's premier provincial basketball league. Follow all the action from the Eastern Highlands."}
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              href="/schedule"
              className="rounded-md bg-primary px-6 py-3 font-sans text-sm font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View Schedule
            </Link>
            <Link
              href="/standings"
              className="rounded-md border border-border bg-secondary px-6 py-3 font-sans text-sm font-bold uppercase tracking-wider text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              Standings
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
