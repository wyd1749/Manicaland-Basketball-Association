import Link from "next/link"
import { ChevronRight, Mail, MapPin, Phone, Smartphone, Users } from "lucide-react"

function BasketballIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20M2 12h20" />
      <path d="M4.5 4.5c3.5 3 3.5 12 0 15M19.5 4.5c-3.5 3-3.5 12 0 15" />
    </svg>
  )
}

const leagueLinks = [
  { href: "/teams", label: "Teams" },
  { href: "/players", label: "Players" },
  { href: "/standings", label: "Standings" },
  { href: "/schedule", label: "Schedule" },
]

const aboutLinks = [
  { href: "/news", label: "News" },
  { href: "/admin", label: "Admin Portal" },
]

function FooterLinks({ links }: { links: { href: string; label: string }[] }) {
  return (
    <nav className="mt-6 flex flex-col gap-4">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="group flex items-center gap-3 text-base text-foreground/80 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ChevronRight className="size-5 text-primary" aria-hidden />
          {l.label}
        </Link>
      ))}
    </nav>
  )
}

function ColumnHeading({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <Icon className="size-10 text-primary" aria-hidden />
      <h3 className="font-sans text-2xl font-bold uppercase tracking-wide text-foreground">{children}</h3>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden bg-background">
      {/* Top edge: orange line with slanted corner accents */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-primary/70" />
      <div
        aria-hidden
        className="absolute left-0 top-0 h-16 w-24 bg-primary/80 [clip-path:polygon(0_0,100%_0,0_100%)]"
      />
      <div
        aria-hidden
        className="absolute right-0 top-0 h-16 w-24 bg-primary/80 [clip-path:polygon(0_0,100%_0,100%_100%)]"
      />
      {/* Background picture: put the file at public/footer-bg.jpg (change the name here if different) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/footer-bg.webp')" }}
      />
      {/* Soft orange glow behind the content */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.75_0.17_55/0.12),transparent_55%),radial-gradient(ellipse_at_right,oklch(0.75_0.17_55/0.10),transparent_50%)]"
      />

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-0">
          {/* Brand */}
          <div className="lg:pr-10">
            <div className="flex items-center gap-5">
              <img src="/logo13.png" alt="MBA logo" className="h-20 w-20 shrink-0 object-contain" />
              <span aria-hidden className="hidden h-16 w-px bg-primary sm:block" />
              <p className="font-sans text-2xl font-bold uppercase leading-tight text-foreground">
                Manicaland
                <span className="block text-primary">Basketball Association</span>
              </p>
            </div>
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/80">
              The official home of the Manicaland Basketball Association. Promoting basketball excellence across
              Zimbabwe&apos;s Eastern Highlands.
            </p>
          </div>

          {/* League */}
          <div className="lg:border-l lg:border-primary/60 lg:px-10">
            <ColumnHeading icon={BasketballIcon}>League</ColumnHeading>
            <FooterLinks links={leagueLinks} />
          </div>

          {/* About */}
          <div className="lg:border-l lg:border-primary/60 lg:px-10">
            <ColumnHeading icon={Users}>About</ColumnHeading>
            <FooterLinks links={aboutLinks} />
          </div>

          {/* Contact */}
          <div className="lg:border-l lg:border-primary/60 lg:pl-10">
            <ColumnHeading icon={Mail}>Contact</ColumnHeading>
            <ul className="mt-6 flex flex-col gap-4 text-base text-foreground/80">
              <li className="flex items-start gap-4">
                <MapPin className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
                <span>
                  Mutare, Manicaland Province
                  <br />
                  Zimbabwe
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="size-6 shrink-0 text-primary" aria-hidden />
                <a href="mailto:info@mba-basketball.co.zw" className="break-all transition-colors hover:text-primary">
                  info@mba-basketball.co.zw
                </a>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="size-6 shrink-0 text-primary" aria-hidden />
                <span>DEV-0780501764</span>
              </li>
              <li className="flex items-center gap-4">
                <Smartphone className="size-6 shrink-0 text-primary" aria-hidden />
                <span>Admin-0773010925</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-primary/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-6 lg:px-8">
          <span aria-hidden className="hidden h-px w-56 bg-primary/80 md:block" />
          <div className="flex-1 text-center text-sm text-foreground/80">
            <p>© 2026 Manicaland Basketball Association. All rights reserved.</p>
            <p className="mt-2 text-base text-primary">Developed by Urban Tech Solutions</p>
          </div>
          <span aria-hidden className="hidden h-px w-56 bg-primary/80 md:block" />
        </div>
      </div>
    </footer>
  )
}