import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  revalidatePath('/')
  revalidatePath('/gallery')
  revalidatePath('/painting/[id]', 'page')
  return NextResponse.json({ revalidated: true })
}
