/**
 * OrganizationJsonLd Component
 * Server Component to render Organization and WebSite JSON-LD structured data
 */
import type { AppLocale } from '@/lib/locale';
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/utils/seo';
import { JsonLd } from './JsonLd';

interface OrganizationJsonLdProps {
  locale: AppLocale;
}

/**
 * Renders Organization and WebSite JSON-LD for site-wide structured data
 * Includes business info and site search action for Google
 */
export function OrganizationJsonLd({ locale }: OrganizationJsonLdProps) {
  const organizationSchema = buildOrganizationSchema();
  const webSiteSchema = buildWebSiteSchema(locale);

  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />
    </>
  );
}
