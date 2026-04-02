// Apollo.io contact enrichment integration
// Docs: https://apolloio.github.io/apollo-api-docs/

const APOLLO_BASE = 'https://api.apollo.io/v1'

interface ApolloPersonResult {
  id: string
  first_name: string
  last_name: string
  name: string
  email: string | null
  title: string | null
  phone_numbers: Array<{ raw_number: string }>
  linkedin_url: string | null
  organization: {
    name: string
    website_url: string | null
    linkedin_url: string | null
  } | null
}

interface ApolloSearchResponse {
  people: ApolloPersonResult[]
  pagination: {
    page: number
    per_page: number
    total_entries: number
    total_pages: number
  }
}

export interface EnrichedContact {
  name: string
  email: string | null
  title: string | null
  phone: string | null
  linkedinUrl: string | null
}

// Find contacts at a company by domain or name
export async function enrichContactsForCompany(
  companyName: string,
  domain?: string,
  targetTitles: string[] = ['CFO', 'Chief Financial Officer', 'VP Finance', 'Treasurer', 'VP Supply Chain', 'Head of Trade Compliance', 'General Counsel', 'VP Logistics']
): Promise<EnrichedContact[]> {
  const apiKey = process.env.APOLLO_API_KEY
  if (!apiKey) {
    console.warn('[enrichment] APOLLO_API_KEY not set — skipping enrichment')
    return []
  }

  try {
    const body: Record<string, unknown> = {
      api_key: apiKey,
      q_organization_name: companyName,
      titles: targetTitles,
      per_page: 10,
      page: 1,
    }

    if (domain) {
      body.q_organization_domains = [domain]
    }

    const response = await fetch(`${APOLLO_BASE}/mixed_people/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('[enrichment] Apollo API error:', response.status, text)
      return []
    }

    const data: ApolloSearchResponse = await response.json()

    return data.people.map((person) => ({
      name: person.name,
      email: person.email,
      title: person.title,
      phone: person.phone_numbers?.[0]?.raw_number ?? null,
      linkedinUrl: person.linkedin_url,
    }))
  } catch (err) {
    console.error('[enrichment] Apollo request failed:', err)
    return []
  }
}

// Enrich a single person by email
export async function enrichPersonByEmail(email: string): Promise<EnrichedContact | null> {
  const apiKey = process.env.APOLLO_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch(`${APOLLO_BASE}/people/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        api_key: apiKey,
        email,
        reveal_personal_emails: false,
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    const person: ApolloPersonResult = data.person

    if (!person) return null

    return {
      name: person.name,
      email: person.email,
      title: person.title,
      phone: person.phone_numbers?.[0]?.raw_number ?? null,
      linkedinUrl: person.linkedin_url,
    }
  } catch (err) {
    console.error('[enrichment] Apollo person match failed:', err)
    return null
  }
}
