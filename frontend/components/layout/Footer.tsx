"use client";

import { Box, Flex, Text, Link } from "@radix-ui/themes";
import Image from "next/image";
import { AppLocale } from "@/lib/locale";
import { useTranslations } from "next-intl";
import { FooterDesktopContactRow } from "./footer/FooterDesktopContactRow";
import { FooterLinksSection } from "./footer/FooterLinksSection";
import { FooterCopyright } from "./footer/FooterCopyright";
import { FooterMobileContactGrid } from "./footer/FooterMobileContactGrid";

interface FooterProps {
  locale: AppLocale;
}


function CChatLogo() {
  return (
    <Image
      src="/assets/images/logo.webp"
      alt="CCHAT Logo"
      width={180}
      height={48}
      className="h-8 w-auto md:h-10"
          />
  );
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations("footer");

  return (
    <Box className="bg-[#F5F5F5] text-black mt-auto">
      {/* Mobile Layout */}
      <Box className="md:hidden px-5 bg-[#F5F5F5]">
        <Flex direction="column" className="max-w-[1920px] mx-auto">
          {/* Logo */}
          <Flex justify="center" className="py-6">
            <CChatLogo />
          </Flex>

          {/* Store System Button */}
          <Box className="pb-4">
            <Link
              href={`/${locale}/locations`}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#FAA63E] to-[#9B5526] text-white text-center py-3 rounded-full font-medium text-sm no-underline"
            >
              {t("storeSystemButton")}
            </Link>
          </Box>

          {/* Contact Grid */}
          <FooterMobileContactGrid locale={locale} />

          {/* Collapsible Links */}
          <FooterLinksSection locale={locale} />

          {/* Company Info */}
          <Box className="py-4 text-center">
            <Text className="text-xs text-gray-600 leading-relaxed">
              {t("companyName")}. {t("address")}. {t("taxCode")}
            </Text>
          </Box>

          {/* Badge - Bộ Công Thương */}
          <Flex justify="center" className="pb-4">
            <a
              href="http://online.gov.vn/Home/WebDetails/139098"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/assets/images/badge.png"
                alt="Đã thông báo Bộ Công Thương"
                width={150}
                height={57}
                              />
            </a>
          </Flex>

          {/* Copyright */}
          <FooterCopyright />
        </Flex>
      </Box>

      {/* Desktop Layout */}
      <Box className="hidden md:block bg-[#F5F5F5] px-[60px]">
        <Flex direction="column" className="max-w-[1920px] mx-auto">
          {/* Row 1: Logo + Store System Button */}
          <Flex justify="between" align="center" className="py-5 pt-10">
            <CChatLogo />
            <Link
              href={`/${locale}/locations`}
              className="flex items-center gap-2 bg-gradient-to-r from-[#FAA63E] to-[#9B5526] text-white px-8 py-2 rounded-full font-medium text-lg no-underline hover:opacity-90 transition-opacity"
            >
              {t("storeSystemButton")}
            </Link>
          </Flex>

          {/* Row 2: Contact Row */}
          <Box className="border-b border-gray-300">
            <FooterDesktopContactRow />
          </Box>

          {/* Row 3: Links Section (6 columns) */}
          <Box>
            <FooterLinksSection locale={locale} />
          </Box>

          {/* Row 4: Company Info + Copyright + Badge */}
          <Flex justify="center" align="center" className="py-8 gap-3">
            {/* Left: Company Info + Copyright */}
            <Flex direction="column" justify="center" align="start" gap="4" className="flex-1">
              {/* Company Info with border bottom */}
              <Flex
                justify="center"
                align="center"
                className="py-4 gap-2.5 w-[454px] border-b border-[#AFAFAF]"
              >
                <Text className="text-xs leading-4 text-[#222222]">
                  {t("companyInfo")}
                </Text>
              </Flex>
              {/* Copyright */}
              <FooterCopyright />
            </Flex>
            {/* Right: Badge */}
            <a
              href="http://online.gov.vn/Home/WebDetails/139098"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/assets/images/badge.png"
                alt="Đã thông báo Bộ Công Thương"
                width={200}
                height={76}
                              />
            </a>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
