import Link from 'next/link';
import { Check } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  isRecommended?: boolean;
  ctaText: string;
  ctaHref: string;
  priceSubtext?: string;
}

export function PricingCard({
  name,
  price,
  features,
  isRecommended,
  ctaText,
  ctaHref,
  priceSubtext = '/month',
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 shadow-sm ${
        isRecommended
          ? 'border-2 border-indigo-600 bg-white'
          : 'border border-gray-200 bg-white'
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
            Most popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-gray-900">{price}</span>
          <span className="text-sm text-gray-500">{priceSubtext}</span>
        </div>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
            <span className="text-sm text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
          isRecommended
            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
            : 'bg-gray-50 text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-gray-100'
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
}
