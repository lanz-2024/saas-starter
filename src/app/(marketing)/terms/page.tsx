import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — SaaS Starter',
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mt-4 text-gray-600">
        This is a portfolio demo. No real terms apply.
      </p>
    </main>
  );
}
