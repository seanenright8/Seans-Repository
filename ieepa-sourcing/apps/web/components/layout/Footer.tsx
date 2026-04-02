import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-navy-500 text-white/60 border-t border-white/10">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gold-400">
              <span className="text-navy-500 font-bold text-sm">IC</span>
            </div>
            <span className="text-white font-semibold text-lg">IEEPA Claims Fund</span>
          </div>
          <p className="text-sm leading-relaxed max-w-sm">
            Institutional buyer of IEEPA tariff claims. We provide immediate liquidity
            to U.S. importers holding claims arising from IEEPA-imposed duties.
          </p>
          <p className="text-xs mt-4 text-white/40">
            24-hour quote. 5-day close. NDA-ready.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <p className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Pages</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/submit" className="hover:text-white transition-colors">Submit a Claim</Link></li>
            <li><Link href="/learn" className="hover:text-white transition-colors">Learn</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            <li><Link href="/about#contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <p className="text-white text-xs font-semibold uppercase tracking-wider mb-4">Resources</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/learn/what-are-ieepa-tariff-claims" className="hover:text-white transition-colors">
                What Are IEEPA Claims?
              </Link>
            </li>
            <li>
              <Link href="/learn/how-to-sell-your-ieepa-trade-claim" className="hover:text-white transition-colors">
                How to Sell a Claim
              </Link>
            </li>
            <li>
              <Link href="/learn/ieepa-vs-section-301-vs-section-232" className="hover:text-white transition-colors">
                IEEPA vs Section 301 / 232
              </Link>
            </li>
            <li>
              <Link href="/learn/legal-basis-for-ieepa-tariff-challenges" className="hover:text-white transition-colors">
                Legal Basis
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} IEEPA Claims Fund. All rights reserved.
          </p>
          <p className="text-xs max-w-2xl leading-relaxed">
            <strong className="text-white/40">Disclaimer:</strong>{' '}
            IEEPA Claims Fund is not a law firm and does not provide legal advice.
            Nothing on this website constitutes legal, tax, or financial advice.
            Claim purchases are subject to due diligence, documentation review, and
            execution of definitive agreements. Past transactions are not indicative
            of future results. All engagements are governed by separate written agreements.
          </p>
        </div>
      </div>
    </footer>
  )
}
