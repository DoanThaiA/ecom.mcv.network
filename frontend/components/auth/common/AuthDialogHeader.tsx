'use client';

import { ChevronLeftIcon, Cross2Icon } from '@radix-ui/react-icons';
import { Dialog, Flex, IconButton } from '@radix-ui/themes';
import Image from 'next/image';

interface AuthDialogHeaderProps {
  /** Show back button on the left */
  showBackButton?: boolean;
  /** Callback when back button is clicked */
  onBackClick?: () => void;
  /** Custom callback when close button is clicked (overrides default Dialog.Close behavior) */
  onClose?: () => void;
}

/**
 * AuthDialogHeader - Shared header for auth dialogs
 * Contains logo on the left and close button on the right
 * Optionally shows back button on the left (logo moves to center concept or stays left)
 */
export function AuthDialogHeader({
  showBackButton = false,
  onBackClick,
  onClose,
}: AuthDialogHeaderProps) {
  return (
    <Flex justify="between" align="center" mb="15px">
      {/* Left section: Back button or Logo */}
      {showBackButton ? (
        <Flex align="center" gap="2">
          <IconButton
            size="2"
            variant="ghost"
            onClick={onBackClick}
            className="hover:bg-gray-100 cursor-pointer"
          >
            <ChevronLeftIcon width="20" height="20" />
          </IconButton>
          <Image
            src="/assets/images/logo.webp"
            alt="CCHAT"
            width={128}
            height={32}
            style={{ objectFit: 'cover' }}
          />
        </Flex>
      ) : (
        <Image
          src="/assets/images/logo.webp"
          alt="CCHAT"
          width={128}
          height={32}
          style={{ objectFit: 'cover' }}
        />
      )}

      {/* Right section: Close button */}
      {onClose ? (
        <IconButton
          size="2"
          variant="ghost"
          onClick={onClose}
          className="hover:bg-gray-100 cursor-pointer"
        >
          <Cross2Icon width="20" height="20" color="#000000" />
        </IconButton>
      ) : (
        <Dialog.Close>
          <IconButton
            size="2"
            variant="ghost"
            className="hover:bg-gray-100 cursor-pointer"
          >
            <Cross2Icon width="20" height="20" color="#000000" />
          </IconButton>
        </Dialog.Close>
      )}
    </Flex>
  );
}
