import { Box } from '@radix-ui/themes';
import Image from 'next/image';

interface Ad {
  imageUrl: string;
  href?: string;
  alt?: string;
}

interface DualAdSectionProps {
  ads: [Ad, Ad];
}

export function DualAdSection({ ads }: DualAdSectionProps) {
  return (
    <Box className="w-full">
      {/* Stack vertically on mobile, side by side on tablet+ */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
        {ads.map((ad, index) => {
          const content = (
            <div
              key={index}
              className="relative w-full overflow-hidden rounded-lg aspect-[16/9] sm:aspect-[892/500]"
            >
              <Image
                src={ad.imageUrl}
                alt={ad.alt || `Advertisement ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority={false}
              />
            </div>
          );

          if (ad.href) {
            return (
              <a
                key={index}
                href={ad.href}
                className="block no-underline flex-1"
              >
                {content}
              </a>
            );
          }

          return <div key={index} className="flex-1">{content}</div>;
        })}
      </div>
    </Box>
  );
}
