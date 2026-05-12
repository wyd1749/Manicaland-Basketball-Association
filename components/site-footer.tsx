import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="font-sans text-lg font-bold text-primary-foreground">
                  M
                </span>
              </div>
              <div>
                <p className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
                  MBA
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {
                "The official home of the Manicaland Basketball Association. Promoting basketball excellence across Zimbabwe's Eastern Highlands."
              }
            </p>
          </div>

          <div>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
              League
            </h3>
            <nav className="mt-4 flex flex-col gap-2">
              <Link
                href="/teams"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Teams
              </Link>
              <Link
                href="/players"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Players
              </Link>
              <Link
                href="/standings"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Standings
              </Link>
              <Link
                href="/schedule"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Schedule
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
              About
            </h3>
            <nav className="mt-4 flex flex-col gap-2">
              <Link
                href="/news"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                News
              </Link>
              <Link
                href="/admin"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Admin Portal
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-foreground">
              Contact
            </h3>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Mutare, Manicaland Province</p>
              <p>Zimbabwe</p>
              <p>info@mba-basketball.co.zw</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            {"2026 Manicaland Basketball Association. All rights reserved."}
          </p>
          <p className="mt-1 text-orange-500">
            Developed by Tinashejmbanje13
          </p>
        </div>
      </div>
    </footer>
  )
}
