import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { articles } from '../articles'

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const article = articles.find((a) => a.slug === params.slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
    },
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find((a) => a.slug === params.slug)
  if (!article) notFound()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-navy-500 text-white py-14">
        <div className="container max-w-3xl">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Articles
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-3.5 w-3.5 text-white/40" />
            <span className="text-white/50 text-xs">{article.readTime} read</span>
            <span className="text-white/20">·</span>
            <span className="text-white/50 text-xs">{article.publishedAt}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight">{article.title}</h1>
          <p className="text-white/60 mt-4 text-lg leading-relaxed">{article.description}</p>
        </div>
      </div>

      {/* Article body */}
      <div className="container max-w-3xl py-12">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.html }} />

        {/* Inline CTA */}
        <div className="my-10 rounded-2xl bg-navy-500 text-white p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Ready to get a quote on your claim?</h2>
          <p className="text-white/60 text-sm mb-5">
            No commitment. No legal fees. We respond within 24 hours.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link href="/submit">Submit Your Claim →</Link>
          </Button>
        </div>

        {/* Related articles */}
        <div className="border-t border-border pt-10">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Continue Reading
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {articles
              .filter((a) => a.slug !== params.slug)
              .slice(0, 2)
              .map((related) => (
                <Link
                  key={related.slug}
                  href={`/learn/${related.slug}`}
                  className="group block rounded-xl border border-border p-4 hover:border-gold-400/50 transition-all"
                >
                  <p className="font-medium text-sm text-navy-500 group-hover:text-gold-500 transition-colors leading-snug mb-1">
                    {related.title}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {related.readTime} read <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
