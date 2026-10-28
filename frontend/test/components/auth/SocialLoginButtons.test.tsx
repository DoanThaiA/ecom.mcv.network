import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialLoginButtons } from '@/components/auth/signin/SocialLoginButtons';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'signin.facebook': 'Facebook',
      'signin.google': 'Google',
      'signin.zalo': 'Zalo',
    };
    return translations[`signin.${key}`] || key;
  },
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

describe('SocialLoginButtons', () => {
  let onSocialSignIn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSocialSignIn = vi.fn();
  });

  describe('Mobile version', () => {
    it('renders Facebook icon button', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const facebookImages = screen.getAllByAltText('Facebook');
      const mobileFacebookImage = facebookImages.find((img) =>
        img.getAttribute('src')?.includes('fb_mobile.svg')
      );
      expect(mobileFacebookImage).toBeInTheDocument();
      expect(mobileFacebookImage).toHaveAttribute(
        'src',
        '/assets/svg/social/fb_mobile.svg'
      );
    });

    it('renders Google icon button', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const googleImages = screen.getAllByAltText('Google');
      const mobileGoogleImage = googleImages.find((img) =>
        img.getAttribute('src')?.includes('gg_mobile.svg')
      );
      expect(mobileGoogleImage).toBeInTheDocument();
    });

    it('renders Zalo icon button', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const zaloImages = screen.getAllByAltText('Zalo');
      const mobileZaloImage = zaloImages.find((img) =>
        img.getAttribute('src')?.includes('zalo_mobile.svg')
      );
      expect(mobileZaloImage).toBeInTheDocument();
    });

    it('calls onSocialSignIn with facebook when Facebook button clicked', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const facebookButtons = screen.getAllByRole('button');
      const facebookButton = facebookButtons.find((btn) =>
        btn.querySelector('img[alt="Facebook"]')
      );

      if (facebookButton) {
        await user.click(facebookButton);
        expect(onSocialSignIn).toHaveBeenCalledWith('facebook');
      }
    });

    it('calls onSocialSignIn with google when Google button clicked', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const buttons = screen.getAllByRole('button');
      const googleButton = buttons.find((btn) =>
        btn.querySelector('img[alt="Google"]')
      );

      if (googleButton) {
        await user.click(googleButton);
        expect(onSocialSignIn).toHaveBeenCalledWith('google');
      }
    });

    it('calls onSocialSignIn with zalo when Zalo button clicked', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const buttons = screen.getAllByRole('button');
      const zaloButton = buttons.find((btn) =>
        btn.querySelector('img[alt="Zalo"]')
      );

      if (zaloButton) {
        await user.click(zaloButton);
        expect(onSocialSignIn).toHaveBeenCalledWith('zalo');
      }
    });
  });

  describe('Desktop version', () => {
    it('renders Facebook button with text', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      // Desktop buttons also render, just hidden by CSS
      const facebookTexts = screen.getAllByText('Facebook');
      expect(facebookTexts.length).toBeGreaterThan(0);
    });

    it('renders Google button with text', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const googleTexts = screen.getAllByText('Google');
      expect(googleTexts.length).toBeGreaterThan(0);
    });

    it('renders Zalo button with text', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const zaloTexts = screen.getAllByText('Zalo');
      expect(zaloTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Disabled state', () => {
    it('disables all buttons when disabled prop is true', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} disabled />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('does not call onSocialSignIn when disabled button clicked', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} disabled />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];

      await user.click(firstButton);

      expect(onSocialSignIn).not.toHaveBeenCalled();
    });

    it('enables all buttons when disabled prop is false', () => {
      render(
        <SocialLoginButtons onSocialSignIn={onSocialSignIn} disabled={false} />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Images', () => {
    it('renders correct mobile Facebook image', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const images = screen.getAllByAltText('Facebook');
      const mobileImage = images.find((img) =>
        img.getAttribute('src')?.includes('fb_mobile.svg')
      );
      expect(mobileImage).toBeInTheDocument();
    });

    it('renders correct desktop Facebook image', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const images = screen.getAllByAltText('Facebook');
      const desktopImage = images.find((img) =>
        img.getAttribute('src')?.includes('facebook.svg')
      );
      expect(desktopImage).toBeInTheDocument();
    });

    it('renders images with correct dimensions for mobile', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const images = screen.getAllByAltText('Facebook');
      const mobileImage = images.find((img) =>
        img.getAttribute('src')?.includes('fb_mobile.svg')
      );

      expect(mobileImage).toHaveAttribute('width', '32');
      expect(mobileImage).toHaveAttribute('height', '32');
    });

    it('renders images with correct dimensions for desktop', () => {
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const images = screen.getAllByAltText('Facebook');
      const desktopImage = images.find((img) =>
        img.getAttribute('src')?.includes('facebook.svg')
      );

      expect(desktopImage).toHaveAttribute('width', '16');
      expect(desktopImage).toHaveAttribute('height', '16');
    });
  });

  describe('Callbacks', () => {
    it('calls onSocialSignIn only once per click', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons[0];

      await user.click(firstButton);

      expect(onSocialSignIn).toHaveBeenCalledTimes(1);
    });

    it('calls onSocialSignIn with correct provider for each button', async () => {
      const user = userEvent.setup();
      render(<SocialLoginButtons onSocialSignIn={onSocialSignIn} />);

      const buttons = screen.getAllByRole('button');

      // Find and click Facebook button
      const facebookButton = buttons.find((btn) =>
        btn.querySelector('img[alt="Facebook"]')
      );
      if (facebookButton) {
        await user.click(facebookButton);
        expect(onSocialSignIn).toHaveBeenLastCalledWith('facebook');
      }

      // Find and click Google button
      const googleButton = buttons.find((btn) =>
        btn.querySelector('img[alt="Google"]')
      );
      if (googleButton) {
        await user.click(googleButton);
        expect(onSocialSignIn).toHaveBeenLastCalledWith('google');
      }

      // Find and click Zalo button
      const zaloButton = buttons.find((btn) =>
        btn.querySelector('img[alt="Zalo"]')
      );
      if (zaloButton) {
        await user.click(zaloButton);
        expect(onSocialSignIn).toHaveBeenLastCalledWith('zalo');
      }

      expect(onSocialSignIn).toHaveBeenCalledTimes(3);
    });
  });
});
