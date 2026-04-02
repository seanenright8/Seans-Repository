import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Shield,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  Building2,
  Lock,
  Zap,
} from 'lucide-react'
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

const trustSignals = [
  { icon: Building2, text: 'Institutional Buyer' },
  { icon: Shield, text: 'NDA-Ready' },
  { icon: Clock, text: '24-Hour Quote' },
  { icon: Zap, text: '5-Day Close' },
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

const claimTypes = [
  'Reciprocal tariffs imposed under IEEPA §1702',
  'China tariffs (IEEPA-basis, 2025 escalations)',
  'EU, Canada, Mexico IEEPA-basis duties',
  'Country-specific IEEPA tariff orders',
  'Emergency tariffs on specific commodities',
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
      <section className="relative bg-navy-500 text-white overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(rgba(201,168,76,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="container relative py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-gold-400 text-sm font-medium mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
              Now buying IEEPA tariff claims — 24-hour quote
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-balance mb-6">
              Your IEEPA tariff payments may be{' '}
              <span className="text-gradient-gold">worth real money today.</span>
            </h1>
            <p className="text-xl text-white/70 leading-relaxed mb-10 max-w-2xl">
              If your company has paid tariffs under IEEPA authority, you may be sitting on a
              transferable financial claim. We buy these claims for immediate cash — you eliminate
              uncertainty and litigation risk, we assume it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="gold" size="xl" asChild>
                <Link href="/submit">
                  Get a Quote in 24 Hours <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline-gold"
                size="xl"
                asChild
              >
                <Link href="/learn/what-are-ieepa-tariff-claims">
                  Learn How It Works
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Signals Bar ────────────────────────────────── */}
      <section className="bg-navy-600 border-y border-white/10">
        <div className="container py-5">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 md:gap-0">
            {trustSignals.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/80">
                <Icon className="h-4 w-4 text-gold-400" />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
            <div className="hidden md:flex items-center gap-2 text-white/80">
              <Lock className="h-4 w-4 text-gold-400" />
              <span className="text-sm font-medium">NDA on Every Engagement</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/80">
              <DollarSign className="h-4 w-4 text-gold-400" />
              <span className="text-sm font-medium">AUM-Backed Capital</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Is an IEEPA Claim? ──────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold-500 text-sm font-semibold uppercase tracking-wider mb-3">
                Background
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-500 mb-6 text-balance">
                What is an IEEPA tariff claim?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The International Emergency Economic Powers Act (IEEPA) grants the President broad
                authority to impose tariffs in response to national emergencies. Beginning in 2025,
                the executive branch used IEEPA to impose sweeping "reciprocal tariffs" on imports
                from dozens of countries — in some cases as high as 145%.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These tariffs are being challenged in federal court — including before the Court of
                International Trade — on the grounds that the President exceeded his statutory
                authority. If courts ultimately agree and order refunds, importers who paid these
                duties would be entitled to restitution.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                That potential future recovery is what we buy today — at a discount that reflects the
                time value and litigation risk. You get cash now; we take on the uncertainty.
              </p>
              <Button variant="default" asChild>
                <Link href="/learn/what-are-ieepa-tariff-claims">
                  Read the full explainer <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Claim Types We Evaluate
                </p>
                <ul className="space-y-3">
                  {claimTypes.map((type) => (
                    <li key={type} className="flex items-start gap-3 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {type}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-navy-500 text-white p-6">
                <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  Who Should Submit?
                </p>
                <p className="text-sm text-white/80 leading-relaxed">
                  U.S. importers who paid IEEPA-basis tariffs since 2025, freight forwarders
                  holding claims on behalf of importers, customs brokers with documented client
                  exposure, or any company with significant duty payments under an IEEPA executive
                  order.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Sell? ────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-wider mb-3">
              The Case for Selling
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-500 mb-4">
              Why importers sell their claims
            </h2>
            <p className="text-muted-foreground">
              Litigation is slow, expensive, and uncertain. Selling offers a different calculus.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: 'Certainty over years of waiting',
                body: 'IEEPA litigation at the Court of International Trade moves slowly. A resolution — if one comes — could be years away. Selling today converts an uncertain future recovery into certain cash now.',
              },
              {
                icon: Shield,
                title: 'Eliminate litigation risk',
                body: 'Courts could rule against importers, or Congress could act to validate the tariffs. By selling, you transfer that outcome risk to us and lock in recovery regardless of how the legal landscape evolves.',
              },
              {
                icon: DollarSign,
                title: 'Immediate working capital',
                body: 'Recovered capital can be redeployed immediately — into operations, inventory, or debt reduction. The cost of waiting is the time value of money plus the uncertainty premium.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl bg-white border border-border p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-navy-500/5 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-navy-500" />
                </div>
                <h3 className="font-semibold text-navy-500 mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process Steps ────────────────────────────────────── */}
      <section className="py-20 bg-navy-500 text-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-3">
              The Process
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Three steps to getting paid
            </h2>
            <p className="text-white/60">
              From first contact to wire transfer in as little as 10 business days.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-gold-400/20" />
            {steps.map(({ number, title, description }) => (
              <div key={number} className="relative">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full border-2 border-gold-400/40 bg-gold-400/10 flex items-center justify-center">
                    <span className="text-gold-400 font-bold text-lg">{number}</span>
                  </div>
                  <div className="pt-3">
                    <h3 className="font-semibold text-lg">{title}</h3>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed pl-0 md:pl-0">
                  {description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Button variant="gold" size="xl" asChild>
              <Link href="/submit">
                Start Your Submission <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-gold-500 text-sm font-semibold uppercase tracking-wider">
                Why Us
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-navy-500 text-balance">
                The institutional buyer importers trust
              </h2>
              {[
                {
                  title: 'Committed Capital',
                  body: "We have dedicated AUM for IEEPA claim acquisitions. No fundraising delays. If we issue a term sheet, we can close.",
                },
                {
                  title: 'Trade Law Expertise',
                  body: "Our team has deep knowledge of IEEPA, Section 301, and CIT litigation. We know what makes a claim strong — and we price accordingly.",
                },
                {
                  title: 'Confidentiality First',
                  body: "We sign NDAs before substantive discussions. We never disclose counterparty information. Your competitors will not know you engaged with us.",
                },
                {
                  title: 'No Legal Fees, No Risk',
                  body: "You pay nothing to submit. If we don't transact, you've lost nothing. The process is non-binding until you execute a purchase agreement.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="flex gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-navy-500 mb-0.5">{title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-navy-500 p-8 text-white">
              <FileText className="h-8 w-8 text-gold-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Ready to find out what your claim is worth?</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                Submit your claim details in under 10 minutes. We'll review and come back
                to you within 24 hours with a preliminary assessment — no commitment required.
              </p>
              <Button variant="gold" size="lg" asChild className="w-full">
                <Link href="/submit">Submit a Claim →</Link>
              </Button>
              <p className="text-white/40 text-xs text-center mt-4">
                Confidential · No commitment · No legal fees
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30" id="faq">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm font-semibold uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy-500">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="bg-white rounded-xl border border-border px-6 shadow-sm">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-navy-500 font-medium text-left py-5">
                  {q}
                </AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="py-20 bg-navy-500 text-white text-center">
        <div className="container max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't leave money on the table.
          </h2>
          <p className="text-white/60 text-lg mb-8">
            IEEPA tariff payments are compounding daily. Get a no-obligation assessment
            of what your claim may be worth — in 24 hours.
          </p>
          <Button variant="gold" size="xl" asChild>
            <Link href="/submit">
              Get a Quote in 24 Hours <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-white/30 text-xs mt-4">
            Confidential · No commitment · Not legal advice
          </p>
        </div>
      </section>
    </>
  )
}
