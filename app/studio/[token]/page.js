import { notFound } from 'next/navigation'
import { isValidStudioToken } from '@/lib/studio-auth'
import StudioApp from '@/components/studio/StudioApp'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Studio',
  robots: { index: false, follow: false },
  referrer: 'no-referrer', // keep the secret link out of Referer headers
}

export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default async function StudioPage({ params }) {
  const { token } = await params
  if (!isValidStudioToken(token)) notFound()
  return <StudioApp token={token} />
}
