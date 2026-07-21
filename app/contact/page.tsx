// app/contact/page.tsx — contact form (interactive client body).
import type { Metadata } from 'next';
import { ContactBody } from './ContactBody';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Research inquiries, collaboration, media requests, and general questions for The Laws of Existence project.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return <ContactBody />;
}
