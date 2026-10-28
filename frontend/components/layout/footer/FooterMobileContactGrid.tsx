'use client';

import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface FooterMobileContactGridProps {
  locale: string;
}

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

function PhoneIcon() {
  return (
    <Image
      src="/assets/svg/footer/phone.svg"
      alt="Phone"
      width={24}
      height={24}
          />
  );
}

function EmailIcon() {
  return (
    <Image
      src="/assets/svg/footer/email.svg"
      alt="Email"
      width={24}
      height={24}
          />
  );
}

function FacebookIcon() {
  return (
    <Image
      src="/assets/svg/footer/facebook.svg"
      alt="Facebook"
      width={24}
      height={24}
          />
  );
}

function ShopeeIcon() {
  return (
    <Image
      src="/assets/svg/footer/shopee.svg"
      alt="Shopee"
      width={24}
      height={24}
          />
  );
}

function TiktokIcon() {
  return (
    <Image
      src="/assets/svg/footer/titok.svg"
      alt="Tiktok"
      width={24}
      height={24}
          />
  );
}

function ContactItem({ icon, label, value, href, external }: ContactItemProps) {
  const content = (
    <Flex align="start" gap="2" className="py-3">
      <Box className="flex-shrink-0">{icon}</Box>
      <Flex direction="column" gap="0">
        <Text className="text-sm text-black leading-tight whitespace-nowrap">{label}</Text>
        <Text className="text-sm font-medium text-black leading-tight whitespace-nowrap">{value}</Text>
      </Flex>
    </Flex>
  );

  if (href) {
    return (
      <a
        href={href}
        className="no-underline block"
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {content}
      </a>
    );
  }

  return <Box>{content}</Box>;
}

export function FooterMobileContactGrid({ locale: _locale }: FooterMobileContactGridProps) {
  const t = useTranslations('footer');

  return (
    <Box className="py-4">
      <Flex gap="6">
        {/* Left Column */}
        <Flex direction="column">
          <ContactItem
            icon={<PhoneIcon />}
            label={t('hotline')}
            value={t('phoneNumber')}
            href={`tel:${t('phoneNumber')}`}
          />
          <ContactItem
            icon={<EmailIcon />}
            label={t('emailLabel')}
            value={t('emailAddress')}
            href={`mailto:${t('emailAddress')}`}
          />
          <ContactItem
            icon={<FacebookIcon />}
            label={t('fanpageLabel')}
            value={t('onFacebook')}
            href="https://www.facebook.com/share/14W4gr2XzGb/?mibextid=wwXIfr"
            external
          />
        </Flex>

        {/* Right Column */}
        <Flex direction="column">
          <ContactItem
            icon={<ShopeeIcon />}
            label={t('shopeeStoreLabel')}
            value={t('onShopee')}
            href="https://s.shopee.vn/9pR6K7IBhE"
            external
          />
          <ContactItem
            icon={<TiktokIcon />}
            label={t('tiktokStoreLabel')}
            value={t('onTiktok')}
            href="https://www.tiktok.com/@cchatclothes"
            external
          />
        </Flex>
      </Flex>
    </Box>
  );
}
