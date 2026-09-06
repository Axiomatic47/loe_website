// src/data/heroQuotes.ts — the rotating hero quotes, typed from
// src/data/hero-quotes.json (validated at build by
// scripts/validate-quotes.mjs). Words of others only — see the JSON _readme.
import raw from './hero-quotes.json';

export interface HeroQuote {
  id: string;
  text: string;
  attribution: string;
  source: string;
  cited_in: string;
  href?: string;
  submitted_by: string;
  added: string;
}

export const HERO_QUOTES: HeroQuote[] = (raw as { quotes: HeroQuote[] }).quotes;
