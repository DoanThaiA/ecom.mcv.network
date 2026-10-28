"use client";

import { shopRepository } from "@/lib/repositories";
import { storageService } from "@/lib/services/storage.service";
import { PopupAds } from "@/types/gen/shared/shared/popup-ads/popup-ads";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * PopupAdsDialog
 *
 * Displays one advertising popup per visit in a prioritized round-robin order.
 * Tracking uses localStorage so dismissed popups are remembered across sessions.
 *
 * Algorithm:
 * 1. Fetch active popup ads from GET /shop/popup-ads (sorted by order ASC, createdAt ASC)
 * 2. Read previously shown popup IDs from localStorage
 * 3. Find the first popup whose ID is NOT in the shown list
 * 4. If all have been shown, do not display any popup
 * 5. Show that popup and mark its ID as shown in localStorage
 */
export function PopupAdsDialog() {
  const t = useTranslations("common");
  const [popup, setPopup] = useState<PopupAds | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPopup() {
      try {
        const popups = await shopRepository.getActivePopupAds();
        if (cancelled || !popups || popups.length === 0) return;

        const shownIds = storageService.getPopupAdsShownIds();

        // Find the first popup not yet shown
        const nextPopup = popups.find((p) => !shownIds.includes(p.id));

        // If all have been shown, do not show any popup
        if (!nextPopup) return;

        if (!cancelled && nextPopup) {
          // Mark as shown before displaying (prevents re-show on double render)
          const updatedShownIds = [
            ...storageService.getPopupAdsShownIds(),
            nextPopup.id,
          ];
          storageService.setPopupAdsShownIds(updatedShownIds);
          setPopup(nextPopup);
          setVisible(true);
        }
      } catch {
        // Fail silently - popup is not critical
      }
    }

    loadPopup();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible || !popup) return null;

  const imageContent = (
    <Image
      src={popup.image}
      alt={popup.name}
      width={0}
      height={0}
      sizes="90vw"
      unoptimized
      className="block max-w-full max-h-[90vh] w-auto h-auto"
    />
  );

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      {/* Popup */}
      <div
        className="relative z-10 w-auto max-w-[90vw] rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          aria-label={t("buttons.close")}
          onClick={handleClose}
          className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Image - clickable if link is provided */}
        {popup.link ? (
          <Link
            href={popup.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
          >
            {imageContent}
          </Link>
        ) : (
          imageContent
        )}
      </div>
    </div>
  );
}
