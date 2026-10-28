'use client';

import { useEffect } from 'react';

const STYLE_ELEMENT_ID = 'cchat-widget-offset';
const OFFSET_VARIABLE = '--cchat-widget-bottom-offset';

/** Gap kept between a bottom bar and the lifted chat launcher */
const CHAT_WIDGET_GAP_PX = 12;

/** The fchat launcher and panel sit at these offsets by default */
const FABS_DEFAULT_BOTTOM_PX = 16;
const PANEL_DEFAULT_BOTTOM_PX = 20;

/** How long to keep looking for the lazily injected widget */
const LOOKUP_INTERVAL_MS = 400;
const LOOKUP_TIMEOUT_MS = 30_000;

/**
 * The fchat webchat script appends a `<chat-widget>` custom element to the body
 * and renders its launcher (`.fabs`) and panel (`.chat`) inside an open shadow
 * root, both `position: fixed` near the bottom right. Stylesheets outside the
 * shadow tree cannot reach those rules, so we inject one stylesheet into the
 * shadow root that offsets them by a custom property. Custom properties do
 * inherit across the shadow boundary, which lets React drive the offset by
 * setting the variable on the document root.
 */
function injectOffsetStyle(shadowRoot: ShadowRoot): void {
  if (shadowRoot.getElementById(STYLE_ELEMENT_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  style.textContent = `
    .fabs {
      bottom: calc(${FABS_DEFAULT_BOTTOM_PX}px + var(${OFFSET_VARIABLE}, 0px)) !important;
      transition: bottom 200ms ease;
    }
    .chat {
      bottom: calc(${PANEL_DEFAULT_BOTTOM_PX}px + var(${OFFSET_VARIABLE}, 0px)) !important;
    }
  `;
  shadowRoot.appendChild(style);
}

/**
 * Lift the floating chat widget above a bottom bar, the way Coolmate does, so
 * the launcher never covers the purchase buttons.
 *
 * @param offsetPx - height of the bar currently covering the bottom of the
 * screen, or 0 when nothing is covering it
 */
export function useChatWidgetBottomOffset(offsetPx: number): void {
  // The widget script is lazily loaded and upgrades the element asynchronously,
  // so poll for the shadow root instead of assuming it exists on mount.
  useEffect(() => {
    const tryInject = (): boolean => {
      const host = document.querySelector('chat-widget');
      if (!host?.shadowRoot) return false;

      injectOffsetStyle(host.shadowRoot);
      return true;
    };

    if (tryInject()) return;

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      if (tryInject() || Date.now() - startedAt > LOOKUP_TIMEOUT_MS) {
        window.clearInterval(timer);
      }
    }, LOOKUP_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const offset = offsetPx > 0 ? offsetPx + CHAT_WIDGET_GAP_PX : 0;

    root.style.setProperty(OFFSET_VARIABLE, `${offset}px`);

    return () => {
      root.style.removeProperty(OFFSET_VARIABLE);
    };
  }, [offsetPx]);
}
