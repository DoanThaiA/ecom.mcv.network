/**
 * JsonLd Component
 * Server Component to render JSON-LD structured data
 */
import type { SchemaOrgSchema } from '@/lib/utils/seo';

interface JsonLdProps {
  data: SchemaOrgSchema;
}

/**
 * Renders a JSON-LD script tag for Schema.org structured data
 * Use this component to add structured data to your pages for better SEO
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
