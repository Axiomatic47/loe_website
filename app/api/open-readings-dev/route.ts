// app/api/open-readings-dev/route.ts — LOCAL stand-in for Netlify Forms.
//
// Netlify Forms only exists on a Netlify deploy. For the local build the
// client form posts here instead (NEXT_PUBLIC_OPEN_READINGS_FORM_ENDPOINT set
// at build time), and the submission is logged to the console and appended to
// .cache/open-readings-dev-submissions.log (gitignored). In production this
// route answers 404 unless OPEN_READINGS_DEV_FORMS=1 is set on the server, so
// a deployed site never stores anything here.
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function enabled() {
  return process.env.NODE_ENV !== 'production' || process.env.OPEN_READINGS_DEV_FORMS === '1';
}

export async function POST(req: Request) {
  if (!enabled()) return new NextResponse('Not found', { status: 404 });
  const raw = await req.text();
  const params = new URLSearchParams(raw);
  const record: Record<string, string> = {};
  for (const [k, v] of params) record[k] = v;
  if (record['bot-field']) return new NextResponse('OK', { status: 200 }); // honeypot: swallow silently like Netlify does
  const line = JSON.stringify({ received: new Date().toISOString(), ...record });
  console.log('[open-readings dev form]', line);
  try {
    const dir = path.join(process.cwd(), '.cache');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'open-readings-dev-submissions.log'), line + '\n');
  } catch (e) {
    console.warn('[open-readings dev form] could not append log:', e);
  }
  return new NextResponse('OK', { status: 200 });
}

export async function GET() {
  return new NextResponse(enabled() ? 'open-readings dev form endpoint — POST only' : 'Not found', { status: enabled() ? 200 : 404 });
}
