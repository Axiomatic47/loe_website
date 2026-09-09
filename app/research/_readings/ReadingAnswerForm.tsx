'use client';
// app/research/_readings/ReadingAnswerForm.tsx — the answer form on an Open
// Readings item page (plan §4, revised 2026-09-08). PRODUCTION: a native POST to
// FormSubmit — the same relay the contact form uses — which emails the answer
// to the site's contact mailbox and redirects back to the item page with
// ?sent=1 (Netlify Forms needs a per-site opt-in the owner declined). LOCAL
// BUILD: when NEXT_PUBLIC_OPEN_READINGS_FORM_ENDPOINT is set, the same fields
// are sent by fetch to the dev stub instead. Nothing here is published
// automatically: the mailbox is the moderation queue; contact is never published.
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { HEBREW_FACE, renderBidi } from './bidi';

const DEV_ENDPOINT = process.env.NEXT_PUBLIC_OPEN_READINGS_FORM_ENDPOINT || '';
const RELAY_ACTION = 'https://formsubmit.co/contact@lawsofexistence.com';
const NOTE_MAX = 1000;

interface Props {
  collection: string;
  itemId: string;
  ourReading: string;
  comparisonReading: string;
  language: string;
  resolved?: boolean;
  contactEmail: string;
}

type Letter = 'A' | 'B' | 'C' | 'D';
type Publish = 'publish' | 'author_only';

export function ReadingAnswerForm({ collection, itemId, ourReading, comparisonReading, language, resolved, contactEmail }: Props) {
  const [letter, setLetter] = useState<Letter | ''>('');
  const [reading, setReading] = useState('');
  const [note, setNote] = useState('');
  const [name, setName] = useState('');
  const [credentials, setCredentials] = useState('');
  const [contact, setContact] = useState('');
  const [noContact, setNoContact] = useState(false);
  const [publish, setPublish] = useState<Publish>('publish');
  const [anonymous, setAnonymous] = useState(false);
  const [credPublic, setCredPublic] = useState(true);
  const [ack, setAck] = useState(true);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // the relay redirects back here with ?sent=1 after a successful submission
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('sent') === '1') setState('sent');
  }, []);

  const rtl = language === 'he' || language === 'ar' || language === 'syc';

  function validate(): string | null {
    if (!letter) return 'Choose one of the four answers.';
    if (letter === 'C' && !reading.trim()) return 'Answer C needs your own reading.';
    if (!noContact && !contact.trim()) return 'Give a way to reach you, or tick "no contact".';
    if (contact.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.trim())) return 'That does not look like an email address.';
    if (note.length > NOTE_MAX) return `The note is limited to ${NOTE_MAX} characters.`;
    return null;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const problem = validate();
    if (problem) { e.preventDefault(); setError(problem); return; }
    setError(null);
    if (!DEV_ENDPOINT) {
      // production: let the browser POST the form to the relay; it redirects back with ?sent=1
      setState('sending');
      return;
    }
    e.preventDefault();
    setState('sending');
    const body = new URLSearchParams({
      'form-name': 'open-reading',
      item_id: itemId,
      collection,
      letter,
      reading: letter === 'C' ? reading.trim() : '',
      note: note.trim(),
      name: anonymous ? '' : name.trim(),
      credentials: credentials.trim(),
      contact: noContact ? '' : contact.trim(),
      no_contact: noContact ? 'on' : '',
      publish_choice: publish,
      anonymous: anonymous ? 'on' : '',
      credentials_public: credPublic ? 'on' : '',
      ack_consent: ack ? 'on' : '',
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      'bot-field': (e.currentTarget.elements.namedItem('bot-field') as HTMLInputElement | null)?.value ?? '',
    });
    try {
      const res = await fetch(DEV_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState('sent');
    } catch {
      setState('failed');
    }
  }

  if (state === 'sent') {
    return (
      <div className="bg-secondary border border-border border-l-2 border-l-primary rounded-md px-5 py-4 text-sm font-sans text-foreground/85 leading-relaxed">
        <span style={{ fontWeight: 600 }}>Received.</span> Your answer is with the author for review. Nothing appears on this
        page until it has been read; answers marked for the author only stay private. Thank you for reading closely.
      </div>
    );
  }

  const choice = (value: Letter, title: string, body: React.ReactNode) => (
    <label
      key={value}
      className={`flex gap-3 items-start rounded-md border p-3 cursor-pointer transition-colors ${letter === value ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-secondary/60'}`}
    >
      <input type="radio" name="letter_ui" value={value} checked={letter === value} onChange={() => setLetter(value)} className="mt-1.5 accent-[hsl(var(--primary))]" />
      <span className="grid gap-0.5">
        <span className="font-sans text-sm text-foreground" style={{ fontWeight: 600 }}>
          <span className="font-serif text-primary mr-2" style={{ fontSize: '1.1rem' }}>{value}</span>{title}
        </span>
        <span className="text-sm text-foreground/80">{body}</span>
      </span>
    </label>
  );

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-6"
      noValidate
      method="POST"
      action={DEV_ENDPOINT ? undefined : RELAY_ACTION}
      acceptCharset="UTF-8"
    >
      {/* relay routing (FormSubmit): subject, table layout, no captcha page, return to this item with ?sent=1 */}
      <input type="hidden" name="_subject" value={`Open reading answer — ${collection} / ${itemId}`} />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_next" value={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?sent=1` : `https://www.lawsofexistence.com/research/${collection}/readings/${itemId}?sent=1`} />
      {/* the answer, as the mailbox receives it */}
      <input type="hidden" name="item_id" value={itemId} />
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="letter" value={letter} />
      <input type="hidden" name="publish_choice" value={publish} />
      <input type="hidden" name="anonymous" value={anonymous ? 'yes' : 'no'} />
      <input type="hidden" name="credentials_public" value={credPublic ? 'yes' : 'no'} />
      <input type="hidden" name="ack_consent" value={ack ? 'yes' : 'no'} />
      <input type="hidden" name="no_contact" value={noContact ? 'yes' : 'no'} />
      {/* honeypot — hidden from people, present for bots; the relay and the stub both drop submissions that fill it */}
      <div className="hidden" aria-hidden="true">
        <label>Leave this field empty <input type="text" name="_honey" tabIndex={-1} autoComplete="off" /></label>
        <input type="text" name="bot-field" tabIndex={-1} autoComplete="off" />
      </div>

      {resolved && (
        <p className="text-sm font-sans text-muted-foreground m-0">
          This reading has been resolved. Answers are still welcome and go to the author.
        </p>
      )}

      <fieldset className="grid gap-2 border-0 p-0 m-0">
        <legend className="text-sm font-sans text-foreground mb-2" style={{ fontWeight: 600 }}>Your answer</legend>
        {choice('A', 'Our reading is right', <span className="font-serif" style={{ fontSize: '1rem' }}>{renderBidi(ourReading)}</span>)}
        {choice('B', 'The comparison reading is right', <span className="font-serif" style={{ fontSize: '1rem' }}>{renderBidi(comparisonReading)}</span>)}
        {choice('C', 'I read it differently', 'Give your reading below.')}
        {choice('D', 'The image cannot decide it', 'A higher resolution or the original is needed.')}
      </fieldset>

      {letter === 'C' && (
        <div>
          <Label htmlFor="or-reading" className="text-foreground mb-2 block font-medium">Your reading</Label>
          <Input
            id="or-reading"
            name="reading"
            value={reading}
            onChange={e => setReading(e.target.value)}
            dir={rtl ? 'rtl' : 'ltr'}
            lang={rtl ? language : undefined}
            style={rtl ? { fontFamily: HEBREW_FACE, fontSize: '1.25rem' } : undefined}
            className="bg-card"
            placeholder={rtl ? 'הקריאה שלך' : 'Your reading'}
          />
        </div>
      )}

      <div>
        <Label htmlFor="or-note" className="text-foreground mb-2 block font-medium">Note <span className="text-muted-foreground font-normal">(optional, {NOTE_MAX} characters)</span></Label>
        <Textarea id="or-note" name="note" value={note} onChange={e => setNote(e.target.value.slice(0, NOTE_MAX))} rows={4} className="bg-card" placeholder="What the letter forms, the ink, or a parallel elsewhere in the manuscript tell you." />
        <div className="text-xs font-sans text-muted-foreground mt-1 text-right">{note.length}/{NOTE_MAX}</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="or-name" className="text-foreground mb-2 block font-medium">Name</Label>
          <Input id="or-name" name="name" value={name} onChange={e => setName(e.target.value)} disabled={anonymous} className="bg-card" placeholder={anonymous ? 'Published as "anonymous reader"' : 'As you would like to be credited'} />
        </div>
        <div>
          <Label htmlFor="or-cred" className="text-foreground mb-2 block font-medium">Credentials</Label>
          <Input id="or-cred" name="credentials" value={credentials} onChange={e => setCredentials(e.target.value)} className="bg-card" placeholder="Degree, position, institution" />
        </div>
      </div>

      <div>
        <Label htmlFor="or-contact" className="text-foreground mb-2 block font-medium">Email <span className="text-muted-foreground font-normal">(never published; for questions and acknowledgement)</span></Label>
        <Input id="or-contact" name="contact" type="email" value={contact} onChange={e => setContact(e.target.value)} disabled={noContact} className="bg-card" placeholder="you@example.org" />
        <label className="flex items-center gap-2 mt-2 text-sm font-sans text-foreground/85">
          <Checkbox checked={noContact} onCheckedChange={v => setNoContact(v === true)} /> I would rather not be contacted.
        </label>
      </div>

      <fieldset className="grid gap-2 border-0 p-0 m-0">
        <legend className="text-sm font-sans text-foreground mb-2" style={{ fontWeight: 600 }}>Where your answer goes</legend>
        <label className="flex items-center gap-2 text-sm font-sans text-foreground/85">
          <input type="radio" name="publish_ui" checked={publish === 'publish'} onChange={() => setPublish('publish')} /> Publish it on this page, after the author has read it.
        </label>
        <label className="flex items-center gap-2 text-sm font-sans text-foreground/85">
          <input type="radio" name="publish_ui" checked={publish === 'author_only'} onChange={() => setPublish('author_only')} /> Send it to the author only.
        </label>
      </fieldset>

      <div className="grid gap-2 text-sm font-sans text-foreground/85">
        <label className="flex items-center gap-2"><Checkbox checked={anonymous} onCheckedChange={v => setAnonymous(v === true)} /> Publish me as "anonymous reader".</label>
        <label className="flex items-center gap-2"><Checkbox checked={credPublic} onCheckedChange={v => setCredPublic(v === true)} /> My credentials may be shown in summary with my answer.</label>
        <label className="flex items-center gap-2"><Checkbox checked={ack} onCheckedChange={v => setAck(v === true)} /> I may be named in the acknowledgements.</label>
      </div>

      {error && <p className="text-sm font-sans text-destructive m-0" role="alert">{error}</p>}
      {state === 'failed' && (
        <p className="text-sm font-sans text-destructive m-0" role="alert">
          The answer could not be sent. Try again, or email it to <a href={`mailto:${contactEmail}`} className="underline">{contactEmail}</a> quoting the item id <code>{itemId}</code>.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={state === 'sending'} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          {state === 'sending' ? 'Sending…' : 'Send answer'}
        </Button>
        <span className="text-xs font-sans text-muted-foreground">Your answer is emailed to the author. Your email address stays with the author. See the Privacy Policy.</span>
      </div>
    </form>
  );
}
