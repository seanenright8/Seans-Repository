import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Institutional Buyer of IEEPA Tariff Claims — Get a Quote in 24 Hours',
  description:
    'If your company has paid tariffs under IEEPA authority, you may be sitting on a transferable financial claim worth real money. We buy IEEPA claims for immediate cash. 24-hour quote. 5-day close.',
}

const stats = [
  { number: '$2B+', label: 'Claims Evaluated' },
  { number: '200+', label: 'Importers Served' },
  { number: '24 hrs', label: 'Quote Turnaround' },
  { number: '5 days', label: 'Average Close' },
]

const claimTypes = [
  'Reciprocal tariffs imposed under IEEPA §1702',
  'China tariffs (IEEPA-basis, 2025 escalations)',
  'EU, Canada, Mexico IEEPA-basis duties',
  'Country-specific IEEPA tariff orders',
  'Emergency tariffs on specific commodities',
]

const whySell = [
  {
    number: '01',
    title: 'Certainty over years of waiting',
    body: 'IEEPA litigation at the Court of International Trade moves slowly. A resolution — if one comes — could be years away. Selling today converts an uncertain future recovery into certain cash now.',
  },
  {
    number: '02',
    title: 'Eliminate litigation risk entirely',
    body: 'Courts could rule against importers, or Congress could act to validate the tariffs. By selling, you transfer that outcome risk to us and lock in recovery regardless of how the legal landscape evolves.',
  },
  {
    number: '03',
    title: 'Immediate working capital',
    body: 'Recovered capital can be redeployed immediately — into operations, inventory, or debt reduction. The cost of waiting is the time value of money plus the uncertainty premium.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Submit Your Claim',
    description:
      'Complete our secure online form in under 10 minutes. Share basic details about your tariff payments and upload supporting documentation. Your information is protected under NDA.',
  },
  {
    number: '02',
    title: 'We Evaluate',
    description:
      'Our team reviews your submission within 24 hours. We assess the claim amount, documentation quality, legal basis, and current market conditions to arrive at a competitive offer.',
  },
  {
    number: '03',
    title: 'You Get Paid',
    description:
      'If we move forward, you receive a term sheet within 2–3 business days. Upon agreement, we close and wire funds in as little as 5 business days. No litigation wait. No uncertainty.',
  },
]

const whyUs = [
  {
    title: 'Committed Capital',
    body: 'We have dedicated AUM for IEEPA claim acquisitions. No fundraising delays. If we issue a term sheet, we can close.',
  },
  {
    title: 'Trade Law Expertise',
    body: 'Our team has deep knowledge of IEEPA, Section 301, and CIT litigation. We know what makes a claim strong — and we price accordingly.',
  },
  {
    title: 'Confidentiality First',
    body: 'We sign NDAs before substantive discussions. We never disclose counterparty information. Your competitors will not know you engaged with us.',
  },
  {
    title: 'No Legal Fees, No Risk',
    body: "You pay nothing to submit. If we don't transact, you've lost nothing. The process is non-binding until you execute a purchase agreement.",
  },
]

const faqs = [
  {
    q: 'What types of IEEPA claims do you buy?',
    a: "We purchase claims arising from duties imposed under IEEPA authority — this includes the 2025 reciprocal tariff program, country-specific emergency tariffs, and sector-based IEEPA actions. If your company has paid duties under an executive order citing IEEPA, we want to hear from you. We evaluate claims of $250,000 and above, though we will consider smaller claims from companies with documented patterns of exposure.",
  },
  {
    q: 'How is my claim priced? What discount should I expect?',
    a: "We don't publish pricing publicly, as it varies based on claim size, documentation quality, legal basis strength, and current market conditions. Our pricing is competitive relative to the litigation alternative — which typically takes years and carries outcome risk. Our value proposition is certainty and speed, not face value. We will give you a specific, no-obligation offer within 24 hours of reviewing your submission.",
  },
  {
    q: 'How long does the process take?',
    a: "From submission to closing, the typical process is: 24–48 hours for preliminary assessment, 2–3 business days for a term sheet, and 5 business days to wire funds after execution. Total elapsed time from first contact to payment is typically under 3 weeks for well-documented claims.",
  },
  {
    q: 'Is this confidential?',
    a: "Yes. We operate under strict confidentiality. Before any substantive discussions, we will execute a mutual NDA. We do not publish information about counterparties, transaction sizes, or claim details. Your competitors will not know you engaged with us.",
  },
  {
    q: 'What documentation do I need?',
    a: "Helpful documentation includes: entry summaries (CBP Form 7501), CF-28/CF-29 notices, customs broker statements, protest filings, and any correspondence with CBP regarding your tariff payments. The more documentation you can provide, the faster we can evaluate. We can work with partial documentation at the preliminary stage.",
  },
  {
    q: 'Do you provide legal advice?',
    a: "No. IEEPA Claims Fund is not a law firm and does not provide legal advice. We recommend that importers consult with qualified trade counsel before selling a claim. We can work alongside your existing trade attorney.",
  },
  {
    q: 'Who are you? Are you a legitimate buyer?',
    a: "We are an institutional distressed credit fund with dedicated capital for IEEPA claim acquisitions. We are AUM-backed, meaning we have committed capital and do not need to raise funds to close. We will provide a reference letter and proof of funds to serious counterparties at the appropriate stage of diligence.",
  },
  {
    q: 'Can intermediaries (customs brokers, trade lawyers) refer clients?',
    a: "Yes. We actively seek referral relationships with customs brokers, trade attorneys, freight forwarders, and trade compliance professionals. We pay referral fees for introductions that lead to completed transactions. Please contact us directly to discuss our referral program.",
  },
]

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="bg-navy-500 text-white">
        <div className="container py-24 md:py-36">
          <div className="max-w-4xl">
            <div className="w-10 h-0.5 bg-gold-400 mb-8" />
            <p className="text-gold-400/80 text-xs font-medium uppercase tracking-[0.2em] mb-6">
              Institutional Buyer · IEEPA Tariff Claims
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-normal leading-[1.05] text-balance mb-8">
              Your IEEPA tariff payments may be worth real money today.
            </h1>
            <p className="text-white/55 text-lg leading-relaxed mb-12 max-w-2xl">
              If your company has paid tariffs under IEEPA authority, you may be sitting on a
              transferable financial claim. We buy these claims for immediate cash — you eliminate
              uncertainty and litigation risk, we assume it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="gold" size="lg" asChild>
                <Link href="/submit">
                  Get a Quote in 24 Hours <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild className="text-white/70 hover:text-white hover:bg-white/10">
                <Link href="/learn/what-are-ieepa-tariff-claims">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="border-t border-white/10">
          <div className="container py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(({ number, label }) => (
                <div key={label}>
                  <p className="font-display text-3xl md:text-4xl font-normal text-white mb-1">{number}</p>
                  <p className="text-white/40 text-xs uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What Is an IEEPA Claim? ──────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="w-8 h-0.5 bg-gold-400 mb-6" />
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-500 mb-4">Background</p>
              <h2 className="font-display text-4xl md:text-5xl font-normal text-navy-500 mb-8 leading-tight">
                What is an IEEPA tariff claim?
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
                <p>
                  The International Emergency Economic Powers Act (IEEPA) grants the President broad
                  authority to impose tariffs in response to national emergencies. Beginning in 2025,
                  the executive branch used IEEPA to impose sweeping "reciprocal tariffs" on imports
                  from dozens of countries — in some cases as high as 145%.
                </p>
                <p>
                  These tariffs are being challenged in federal court — including before the Court of
                  International Trade — on the grounds that the President exceeded his statutory
                  authority. If courts ultimately agree and order refunds, importers who paid these
                  duties would be entitled to restitution.
                </p>
                <p>
                  That potential future recovery is what we buy today — at a discount that reflects the
                  time value and litigation risk. You get cash now; we take on the uncertainty.
                </p>
              </div>
              <Link
                href="/learn/what-are-ieepa-tariff-claims"
                className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-navy-500 border-b border-navy-500/30 pb-0.5 hover:border-navy-500 transition-colors"
              >
                Read the full explainer <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4 pt-2">
              <div className="border border-gray-200 border-t-2 border-t-gold-400 p-6">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 mb-5">
                  Claim Types We Evaluate
                </p>
                <ul className="space-y-3">
                  {claimTypes.map((type) => (
                    <li key={type} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="mt-2 h-1 w-1 rounded-full bg-gold-400 shrink-0" />
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-6">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 mb-3">
                  Who Should Submit
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  U.S. importers who paid IEEPA-basis tariffs since 2025, freight forwarders
                  holding claims on behalf of importers, customs brokers with documented client
                  exposure, or any company with significant duty payments under an IEEPA executive order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Sell ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="container">
          <div className="max-w-xl mb-14">
            <div className="w-8 h-0.5 bg-gold-400 mb-6" />
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-500 mb-4">The Case for Selling</p>
            <h2 className="font-display text-4xl md:text-5xl font-normal text-navy-500 leading-tight">
              Why importers sell their claims
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-gray-200">
            {whySell.map(({ number, title, body }) => (
              <div key={number} className="bg-white p-8 group hover:bg-gray-50 transition-colors">
                <p className="font-display text-4xl font-normal text-gray-100 group-hover:text-gold-400/30 transition-colors mb-6">
                  {number}
                </p>
                <h3 className="font-semibold text-navy-500 mb-3 leading-snug text-sm">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────── */}
      <section className="py-24 bg-navy-500 text-white">
        <div className="container">
          <div className="max-w-xl mb-16">
            <div className="w-8 h-0.5 bg-gold-400 mb-6" />
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-400/70 mb-4">The Process</p>
            <h2 className="font-display text-4xl md:text-5xl font-normal leading-tight">
              Three steps to getting paid
            </h2>
            <p className="text-white/50 mt-4 text-sm">
              From first contact to wire transfer in as little as 10 business days.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            {steps.map(({ number, title, description }) => (
              <div key={number} className="bg-navy-500 p-8 border-t-2 border-t-gold-400/20 hover:border-t-gold-400 transition-colors">
                <p className="font-display text-5xl font-normal text-white/10 mb-6">{number}</p>
                <h3 className="font-semibold text-white mb-3 text-sm">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Button variant="gold" size="lg" asChild>
              <Link href="/submit">
                Start Your Submission <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="w-8 h-0.5 bg-gold-400 mb-6" />
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-500 mb-4">Why Us</p>
              <h2 className="font-display text-4xl md:text-5xl font-normal text-navy-500 mb-10 leading-tight">
                The institutional buyer importers trust
              </h2>
              <div className="space-y-7">
                {whyUs.map(({ title, body }) => (
                  <div key={title} className="border-l-2 border-gold-400/30 pl-5 hover:border-gold-400 transition-colors">
                    <p className="font-semibold text-navy-500 mb-1 text-sm">{title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-gray-200 border-t-2 border-t-gold-400 p-8">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 mb-6">Start Here</p>
              <h3 className="font-display text-2xl font-normal text-navy-500 mb-4 leading-snug">
                Find out what your claim is worth
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">
                Submit your claim details in under 10 minutes. We'll review and come back
                to you within 24 hours with a preliminary assessment — no commitment required.
              </p>
              <Button variant="default" size="lg" asChild className="w-full justify-center">
                <Link href="/submit">Submit a Claim</Link>
              </Button>
              <div className="flex items-center justify-center gap-5 mt-5">
                {['Confidential', 'No commitment', 'No legal fees'].map((item) => (
                  <span key={item} className="text-xs text-gray-400 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-gold-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50" id="faq">
        <div className="container max-w-3xl">
          <div className="mb-12">
            <div className="w-8 h-0.5 bg-gold-400 mb-6" />
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-500 mb-4">FAQ</p>
            <h2 className="font-display text-4xl md:text-5xl font-normal text-navy-500">
              Frequently asked questions
            </h2>
          </div>
          <div className="bg-white border border-gray-200 divide-y divide-gray-100">
            <Accordion type="single" collapsible>
              {faqs.map(({ q, a }, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-0 px-6">
                  <AccordionTrigger className="text-navy-500 font-medium text-left py-5 text-sm hover:no-underline">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-sm leading-relaxed pb-5">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="py-24 bg-navy-500 text-white">
        <div className="container max-w-3xl">
          <div className="w-8 h-0.5 bg-gold-400 mb-8" />
          <h2 className="font-display text-4xl md:text-6xl font-normal mb-6 leading-tight">
            Don't leave money on the table.
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl leading-relaxed">
            IEEPA tariff payments are compounding daily. Get a no-obligation assessment
            of what your claim may be worth — in 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Button variant="gold" size="lg" asChild>
              <Link href="/submit">
                Get a Quote in 24 Hours <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <p className="text-white/25 text-xs">
              Confidential · No commitment · Not legal advice
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
