'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Popover, Text } from '@radix-ui/themes';

interface PromotionTagPopoverProps {
  label: string;
  ariaLabel: string;
  children: ReactNode;
  emphasis?: 'default' | 'more';
}

const POINTER_CLOSE_DELAY_MS = 120;

export function PromotionTagPopover({
  label,
  ariaLabel,
  children,
  emphasis = 'default',
}: PromotionTagPopoverProps) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextFocusOpenRef = useRef(false);

  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), POINTER_CLOSE_DELAY_MS);
  }, [cancelScheduledClose]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Box
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') {
            cancelScheduledClose();
            setOpen(true);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') {
            scheduleClose();
          }
        }}
      >
        <Popover.Trigger>
          <Button
            type="button"
            size="1"
            variant="soft"
            aria-label={ariaLabel}
            onClick={(event) => {
              event.preventDefault();
              cancelScheduledClose();
              setOpen(true);
            }}
            onFocus={(event) => {
              if (suppressNextFocusOpenRef.current) {
                suppressNextFocusOpenRef.current = false;
                return;
              }
              if (event.currentTarget.matches(':focus-visible')) setOpen(true);
            }}
            className={
              emphasis === 'more'
                ? 'h-7 cursor-pointer rounded-md bg-gray-100 px-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-200'
                : 'h-7 cursor-pointer rounded-md bg-orange-50 px-2.5 text-xs font-semibold text-orange-800 hover:bg-orange-100'
            }
          >
            <Text size="1" weight="bold">
              {label}
            </Text>
          </Button>
        </Popover.Trigger>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className={`z-50 w-[min(360px,calc(100vw-24px))] rounded-lg p-0 shadow-lg ${
            emphasis === 'more'
              ? 'max-h-[min(26rem,var(--radix-popover-content-available-height))] overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]'
              : ''
          }`}
          onEscapeKeyDown={() => {
            suppressNextFocusOpenRef.current = true;
            cancelScheduledClose();
            setOpen(false);
          }}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') {
              cancelScheduledClose();
            }
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') {
              scheduleClose();
            }
          }}
        >
          <Box className="p-3">{children}</Box>
        </Popover.Content>
      </Box>
    </Popover.Root>
  );
}
