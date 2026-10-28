/* eslint-disable no-console */
import { useShopWebSocket } from '@/hooks/useShopWebSocket';
import { safeLength } from '@/lib/helpers/arrayHelper';
import { showErrorToast, showSuccessToast, showWarningToast } from '@/lib/helpers/toastHelper';
import { formatPrice } from '@/lib/utils/format';
import { AppLocale } from '@/lib/locale';
import {
  City,
  District,
  Ward,
  getCities,
  getDistricts,
  getWards,
} from '@/lib/repositories/address.repository';
import { cartRepository } from '@/lib/repositories/cart.repository';
import { promotionRepository } from '@/lib/repositories/promotion.repository';
import { storageService } from '@/lib/services/storage.service';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setCart, refreshCartRequest } from '@/lib/store/slices/cartSlice';
import { AuthStatus } from '@/lib/store/slices/authSlice';
import { isValidEmail, isValidVNPhone } from '@/lib/utils/validation';
import {
  CheckoutSession,
  CheckoutSessionAddress,
} from '@/types/gen/shop/shared/checkout-sessions/checkout-session';
import { PaymentMethod } from '@/types/gen/shop/shared/orders/order';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ShippingFormData, initialShippingFormData } from '../CartShippingInfo';
import { useConfirmOrderAddress } from './useConfirmOrderAddress';

/**
 * Builds shipping address payload with progressive enhancement
 * - Sends partial data if available (e.g., city + street without district/ward)
 * - Uses hierarchical validation (district requires city, ward requires district)
 * - Gracefully handles location name fetch failures
 */
async function buildPartialShippingAddress(
  formData: ShippingFormData,
): Promise<CheckoutSessionAddress | undefined> {
  const cityId = formData.city ? parseInt(formData.city) : NaN;
  const districtId = formData.district ? parseInt(formData.district) : NaN;
  const wardId = formData.ward ? parseInt(formData.ward) : NaN;
  const street = formData.street?.trim();

  // Check if we have ANY address data to send
  const hasAnyAddressData =
    !isNaN(cityId) || !isNaN(districtId) || !isNaN(wardId) || street;

  if (!hasAnyAddressData) {
    return undefined; // No address data at all
  }

  // Initialize address payload
  const address: CheckoutSessionAddress = {};

  // Always include street if provided (independent of location IDs)
  if (street) {
    address.address = street;
  }

  // Level 1: City (independent - can exist alone)
  if (!isNaN(cityId) && cityId > 0) {
    address.cityId = cityId;

    try {
      const cities = await getCities();
      const city = cities.find((c) => c.id === cityId);
      if (city) {
        address.city = city.name;
      }
    } catch (error) {
      // Failed to fetch city name - send ID only
      console.warn('Failed to fetch city name, sending cityId only', error);
    }
  }

  // Level 2: District (requires valid city)
  if (!isNaN(districtId) && districtId > 0 && !isNaN(cityId) && cityId > 0) {
    address.districtId = districtId;

    try {
      const districts = await getDistricts(cityId);
      const district = districts.find((d) => d.id === districtId);
      if (district) {
        address.district = district.name;
      }
    } catch (error) {
      // Failed to fetch district name - send ID only
      console.warn(
        'Failed to fetch district name, sending districtId only',
        error,
      );
    }
  }

  // Level 3: Ward (requires valid district and city)
  if (
    !isNaN(wardId) &&
    wardId > 0 &&
    !isNaN(districtId) &&
    districtId > 0 &&
    !isNaN(cityId) &&
    cityId > 0
  ) {
    address.wardId = wardId;

    try {
      const wards = await getWards(districtId);
      const ward = wards.find((w) => w.id === wardId);
      if (ward) {
        address.ward = ward.name;
      }
    } catch (error) {
      // Failed to fetch ward name - send ID only
      console.warn('Failed to fetch ward name, sending wardId only', error);
    }
  }

  // Return undefined if address object is empty (all fetches failed and no street)
  return Object.keys(address).length > 0 ? address : undefined;
}

interface UseConfirmOrderProps {
  locale: AppLocale;
  checkoutSessionId?: string;
  checkoutSession?: CheckoutSession | null;
  navigationSource?: 'product' | 'cart';
  productId?: string;
  onCheckoutSessionUpdate?: (_session: CheckoutSession | null) => void;
}

export function useConfirmOrder({
  locale,
  checkoutSessionId,
  checkoutSession: externalSession,
  navigationSource,
  productId,
  onCheckoutSessionUpdate,
}: UseConfirmOrderProps) {
  const dispatch = useAppDispatch();
  const t = useTranslations('orderDetail');
  const tCart = useTranslations('cart');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { status: authStatus } = useAppSelector((state) => state.auth);
  const isAuthenticated = authStatus === AuthStatus.AUTHENTICATED;

  // Fetch addresses on confirm page OR on desktop cart page
  // Use window.innerWidth to detect desktop (>= 1024px is lg: breakpoint)
  // Initialize with correct value to avoid "first render problem"
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const isConfirmPage = pathname?.includes('/cart/confirm') ?? false;
  const isCartPage = pathname?.endsWith('/cart') ?? false;

  // Fetch addresses if on confirm page, or on cart page with desktop screen
  const shouldFetchAddresses = isConfirmPage || (isCartPage && isDesktop);

  const [checkoutSession, setCheckoutSessionState] =
    useState<CheckoutSession | null>(null);

  // Wrapper to update both local state and notify parent
  const setCheckoutSession = useCallback(
    (session: CheckoutSession | null) => {
      setCheckoutSessionState(session);
      // Notify parent of session updates (for shippingPromotion sync)
      onCheckoutSessionUpdate?.(session);
    },
    [onCheckoutSessionUpdate],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isCalculatingCheckout, setIsCalculatingCheckout] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.PAYMENT_METHOD_COD,
  );
  const paymentMethodRef = useRef<PaymentMethod>(paymentMethod);

  // Keep paymentMethodRef in sync with paymentMethod state
  useEffect(() => {
    paymentMethodRef.current = paymentMethod;
  }, [paymentMethod]);

  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const pendingOrderIdRef = useRef<string | null>(null);
  const [guestShippingFormData, setGuestShippingFormData] =
    useState<ShippingFormData>(initialShippingFormData);
  const [cities, setCities] = useState<City[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableWards, setAvailableWards] = useState<Ward[]>([]);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [qrDialogData, setQrDialogData] = useState<{
    qrUrl?: string;
    qrData?: string;
  }>({});
  const [isAddressManagementDialogOpen, setIsAddressManagementDialogOpen] =
    useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Separate debounce timers for different field groups
  const debounceContactTimerRef = useRef<NodeJS.Timeout | null>(null); // For fullName, phone, email (1000ms)
  const debounceAddressTimerRef = useRef<NodeJS.Timeout | null>(null); // For city, district, ward, street, notes (500ms)

  // Function to clear specific field error
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const previousFormDataRef = useRef<string>('');
  const previousAuthStatus = useRef(isAuthenticated);

  // Keep pendingOrderIdRef in sync with state for socket event handler
  useEffect(() => {
    pendingOrderIdRef.current = pendingOrderId;
  }, [pendingOrderId]);

  // Navigate to order detail when socket receives order:refetch
  // Using ref instead of state to ensure we always have the latest pendingOrderId
  // when socket event arrives (avoids stale closure issue with fast QR payments)
  const handleOrderRefetch = useCallback(
    (orderId: string) => {
      if (pendingOrderIdRef.current === orderId) {
        // Get orderNumber before clearing session
        const customerData = storageService.getOrderCustomerData();
        const orderNumber = customerData?.orderNumber;
        // Clear checkout session from localStorage when payment is confirmed
        storageService.clearCheckoutSession();
        const url = new URL(window.location.href);
        url.searchParams.delete('pendingOrderId');
        window.history.replaceState({}, '', url.toString());
        // Navigate to order-success page with orderNumber after payment confirmation
        router.push(
          orderNumber
            ? `/${locale}/order-success/${orderNumber}`
            : `/${locale}/order-success`,
        );
      }
    },
    [router, locale],
  );

  const handlePaymentFailed = useCallback(
    (orderId: string) => {
      if (pendingOrderIdRef.current === orderId) {
        // Show error toast
        showErrorToast(tCart('paymentRetryFailed'));

        // Reset payment UI state
        setPendingOrderId(null);
        setIsPaymentProcessing(false);

        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete('pendingOrderId');
        window.history.replaceState({}, '', url.toString());
      }
    },
    [tCart],
  );

  useShopWebSocket({
    enabled: true,
    pendingOrderId,
    onOrderRefetch: handleOrderRefetch,
    onPaymentFailed: handlePaymentFailed,
  });

  // Read pendingOrderId from URL on mount
  useEffect(() => {
    const urlPendingOrderId = searchParams.get('pendingOrderId');
    if (urlPendingOrderId) {
      setPendingOrderId(urlPendingOrderId);
      setIsPaymentProcessing(true);
    }
  }, [searchParams]);

  /**
   * Determines if we have enough meaningful data to warrant an API call
   * - Requires at least partial customer OR address data
   * - Address needs minimum: city+street OR city+district+ward
   */
  const hasMinimumRequiredData = (
    customer: any,
    shippingAddress: any,
  ): boolean => {
    const hasCustomer =
      customer && (customer.name || customer.phone || customer.email);

    const hasAddress =
      shippingAddress &&
      (// Option 1: Has street + city (bare minimum)
      (shippingAddress.address && shippingAddress.cityId) ||
        // Option 2: Has complete location hierarchy (city+district+ward)
        (shippingAddress.cityId &&
          shippingAddress.districtId &&
          shippingAddress.wardId));

    // Must have at least customer OR address data
    return hasCustomer || hasAddress;
  };

  // Update checkout session when shipping info changes
  const updateCheckoutSession = useCallback(
    async (
      formData: ShippingFormData,
    ) => {
      if (!checkoutSession?.id) return;

      // Validate contact fields (email/phone) if provided
      const validationErrors: Record<string, string> = {};

      if (formData.email && !isValidEmail(formData.email)) {
        validationErrors.email = tCommon('errors.emailInvalid');
      }

      if (formData.phone && !isValidVNPhone(formData.phone)) {
        validationErrors.phone = tCommon('errors.phoneInvalid');
      }

      // If validation fails, set errors and return early (block API call)
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...validationErrors }));
        setIsCalculatingCheckout(false);
        return; // Don't call API
      }

      // Build shippingAddress with progressive enhancement
      let shippingAddress = await buildPartialShippingAddress(formData);

      // Build customer data (unchanged)
      let customer = undefined;
      if (formData.fullName || formData.phone || formData.email) {
        customer = {
          name: formData.fullName || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        };
      }

      // Skip API call if we don't have minimum required data
      if (!hasMinimumRequiredData(customer, shippingAddress)) {
        setIsCalculatingCheckout(false);
        return; // Don't waste API call
      }

      setIsCalculatingCheckout(true);
      try {
        const session = await cartRepository.upsertCheckoutSession({
          id: checkoutSession.id,
          // Preserve existing items from checkout session (don't send empty arrays)
          items: checkoutSession.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          // Preserve existing combo instances (backend preserves when empty array sent)
          combos: [],
          clearCartAfterOrder: true,
          customer,
          shippingAddress,
          paymentMethod: paymentMethodRef.current,
          note: formData.notes || undefined,
        });
        setCheckoutSession(session);
        // Clear all field errors on successful validation
        setFieldErrors({});
        console.log('[useConfirmOrder] Session updated locally:', {
          canPlaceOrder: session.canPlaceOrder,
          hasCallback: !!onCheckoutSessionUpdate,
        });
        // Notify parent component of session update
        onCheckoutSessionUpdate?.(session);
        console.log('[useConfirmOrder] Called onCheckoutSessionUpdate with session:', session.id);
      } catch (error: any) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 400 && checkoutSession?.orderId) {
          showErrorToast(tCart('paymentSessionExpired'));
        } else {
          // Check if it's a 422 validation error
          if (
            error?.response?.status === 422 &&
            error?.response?.data?.errors
          ) {
            const apiErrors = error.response.data.errors;
            const parsedErrors: Record<string, string> = {};
            // Map API field names to form field names
            apiErrors.forEach((err: { field: string; message: string }) => {
              // Map "customer.phone" -> "phone", "customer.name" -> "fullName", etc.
              const fieldMap: Record<string, string> = {
                'customer.phone': 'phone',
                'customer.name': 'fullName',
                'customer.email': 'email',
                'shippingAddress.street': 'street',
                'shippingAddress.city': 'city',
                'shippingAddress.district': 'district',
                'shippingAddress.ward': 'ward',
              };

              const formFieldName = fieldMap[err.field] || err.field;
              parsedErrors[formFieldName] = err.message;
            });
            setFieldErrors(parsedErrors);
            // Show general error toast
            showErrorToast(
              error.response.data.message || 'Vui lòng kiểm tra lại thông tin',
            );
          } else {
            showErrorToast(
              tCart('failedToUpdateCheckout') ||
                'Failed to update checkout information',
            );
          }
        }
      } finally {
        setIsCalculatingCheckout(false);
      }
    },
    [checkoutSession?.id, checkoutSession?.orderId, tCart, tCommon, onCheckoutSessionUpdate],
  );

  // Address management hook
  const addressHook = useConfirmOrderAddress({
    isAuthenticated,
    checkoutSessionId: checkoutSession?.id,
    updateCheckoutSession,
    shouldFetchAddresses,
  });

  const { isAddressLoaded } = addressHook;

  // Fetch checkout session on mount
  useEffect(() => {
    const fetchCheckoutSession = async () => {
      if (!checkoutSessionId) {
        router.push(`/${locale}/cart`);
        return;
      }

      // Don't fetch if session was cleared from storage (e.g., after logout)
      const storedSessionId = storageService.getCheckoutSessionId();
      if (!storedSessionId) {
        // Session cleared, don't fetch
        setCheckoutSession(null);
        return;
      }

      try {
        const session =
          await cartRepository.getCheckoutSession(checkoutSessionId);
        setCheckoutSession(session);

        if (session.customer && session.shippingAddress) {
          const formData = {
            fullName: session.customer.name || '',
            phone: session.customer.phone || '',
            email: session.customer.email || '',
            notes: session.note || '',
            street: session.shippingAddress.address || '',
            city: String(session.shippingAddress.cityId || ''),
            district: String(session.shippingAddress.districtId || ''),
            ward: String(session.shippingAddress.wardId || ''),
          };
          setGuestShippingFormData(formData);
          addressHook.setShippingFormData(formData);
        }
      } catch {
        showErrorToast(t('sessionExpired') || 'Session expired');
        router.push(`/${locale}/cart`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckoutSession();
  }, [checkoutSessionId, locale, router, t, isAuthenticated]);

  // Sync external session updates from parent (when cart changes)
  useEffect(() => {
    // If external session provided and matches current session ID, update local state
    // Use setCheckoutSessionState (raw setter) to avoid infinite loop with parent callback
    if (externalSession && externalSession.id === checkoutSessionId) {
      setCheckoutSessionState(externalSession);

      // Update form data if shipping address changed
      if (externalSession.customer && externalSession.shippingAddress) {
        const formData = {
          fullName: externalSession.customer.name || '',
          phone: externalSession.customer.phone || '',
          email: externalSession.customer.email || '',
          notes: externalSession.note || '',
          street: externalSession.shippingAddress.address || '',
          city: String(externalSession.shippingAddress.cityId || ''),
          district: String(externalSession.shippingAddress.districtId || ''),
          ward: String(externalSession.shippingAddress.wardId || ''),
        };
        setGuestShippingFormData(formData);
        addressHook.setShippingFormData(formData);
      }
    }
  }, [externalSession, checkoutSessionId]);

  // Fetch cities on mount (for guest users)
  useEffect(() => {
    if (!isAuthenticated) {
      getCities().then(setCities);
    }
  }, [isAuthenticated]);

  // Fetch districts when city changes (for guest users)
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!isAuthenticated && guestShippingFormData.city) {
        const cityId = parseInt(guestShippingFormData.city);
        if (!isNaN(cityId)) {
          const districts = await getDistricts(cityId);
          setAvailableDistricts(districts);
        }
      }
    };
    fetchDistricts();
  }, [guestShippingFormData.city, isAuthenticated]);

  // Fetch wards when district changes (for guest users)
  useEffect(() => {
    const fetchWards = async () => {
      if (!isAuthenticated && guestShippingFormData.district) {
        const districtId = parseInt(guestShippingFormData.district);
        if (!isNaN(districtId)) {
          const wards = await getWards(districtId);
          setAvailableWards(wards);
        }
      }
    };
    fetchWards();
  }, [guestShippingFormData.district, isAuthenticated]);

  // Helper function to detect which field group changed
  const getChangedFieldGroup = (
    oldDataString: string,
    newData: ShippingFormData,
  ): 'contact' | 'address' | 'both' => {
    if (!oldDataString) return 'both'; // First load

    try {
      const oldData: ShippingFormData = JSON.parse(oldDataString);

      const contactFieldsChanged =
        oldData.fullName !== newData.fullName ||
        oldData.phone !== newData.phone ||
        oldData.email !== newData.email;

      const addressFieldsChanged =
        oldData.city !== newData.city ||
        oldData.district !== newData.district ||
        oldData.ward !== newData.ward ||
        oldData.street !== newData.street ||
        oldData.notes !== newData.notes;

      if (contactFieldsChanged && addressFieldsChanged) return 'both';
      if (contactFieldsChanged) return 'contact';
      if (addressFieldsChanged) return 'address';

      return 'both'; // Fallback
    } catch {
      return 'both'; // If parse fails, treat as both changed
    }
  };

  // Debounced checkout session update for guest users with field-specific delays
  // Contact fields (fullName, phone, email): 1000ms debounce
  // Address fields (city, district, ward, street, notes): 500ms debounce
  useEffect(() => {
    if (!isAuthenticated) {
      const currentFormDataString = JSON.stringify(guestShippingFormData);
      if (currentFormDataString === previousFormDataRef.current) {
        return; // No changes, skip API call
      }

      // Detect which field group changed
      const changedGroup = getChangedFieldGroup(
        previousFormDataRef.current,
        guestShippingFormData,
      );

      // Clear both timers to ensure only one API call happens
      if (debounceContactTimerRef.current) {
        clearTimeout(debounceContactTimerRef.current);
        debounceContactTimerRef.current = null;
      }
      if (debounceAddressTimerRef.current) {
        clearTimeout(debounceAddressTimerRef.current);
        debounceAddressTimerRef.current = null;
      }

      // Apply appropriate debounce delay based on changed field group
      if (changedGroup === 'contact' || changedGroup === 'both') {
        // Contact fields changed: use 1000ms debounce
        debounceContactTimerRef.current = setTimeout(() => {
          previousFormDataRef.current = currentFormDataString;
          updateCheckoutSession(guestShippingFormData);
        }, 1000);
      } else if (changedGroup === 'address') {
        // Only address fields changed: use 500ms debounce
        debounceAddressTimerRef.current = setTimeout(() => {
          previousFormDataRef.current = currentFormDataString;
          updateCheckoutSession(guestShippingFormData);
        }, 500);
      }

      return () => {
        // Cleanup: clear both timers on unmount or when dependencies change
        if (debounceContactTimerRef.current) {
          clearTimeout(debounceContactTimerRef.current);
        }
        if (debounceAddressTimerRef.current) {
          clearTimeout(debounceAddressTimerRef.current);
        }
      };
    }
  }, [guestShippingFormData, isAuthenticated, updateCheckoutSession]);

  // Create new authenticated session when user logs in
  useEffect(() => {
    const handleLoginSuccess = async () => {
      // Check if we're on the cart page (not confirm page)
      const pathname = window.location.pathname;
      const isCartPage = pathname?.endsWith('/cart') ?? false;

      // Skip session creation if on cart page OR navigationSource is "cart"
      if (isCartPage) {
        previousAuthStatus.current = isAuthenticated;
        return;
      }

      // Only run if auth state changed from false to true (login event)
      if (!previousAuthStatus.current && isAuthenticated && checkoutSession) {
          // Only run if auth state changed from false to true (login event)
          // Check if current session is a guest session
          const needsAuthenticatedSession = !checkoutSession.userId;

          if (needsAuthenticatedSession) {
            setIsLoading(true);
            try {
              // Create new authenticated session transferring cart items
              const newSession = await cartRepository.upsertCheckoutSession({
                items: checkoutSession.items || [],
                combos: [],
                clearCartAfterOrder: false,
              });

              // Update URL with new authenticated sessionId
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("sessionId", newSession.id);

              // Preserve other URL params (source, productId)
              const newUrl = `${
                window.location.pathname
              }?${searchParams.toString()}`;

              // Replace current history entry with new session (prevents duplicate history entries)
              window.location.replace(newUrl);
            } catch (_error) {
              showErrorToast(tCart("checkoutSessionNotFound"));
              setIsLoading(false);
            }
          }
        }

      // Update previous auth status
      previousAuthStatus.current = isAuthenticated;
    };

    handleLoginSuccess();
  }, [isAuthenticated, checkoutSession, tCart]);

  const handlePlaceOrder = async () => {
    if (!checkoutSession?.id) {
      showErrorToast(t('sessionExpired') || 'Session expired');
      return;
    }

    if (!checkoutSession.canPlaceOrder) {
      if (checkoutSession.hasUnavailableItems) {
        showErrorToast(
          tCart('hasUnavailableItems') || 'Some items are unavailable',
        );
      } else if (checkoutSession.missingFields?.length > 0) {
        showErrorToast(
          tCart('missingFields') ||
            `Missing fields: ${checkoutSession.missingFields.join(', ')}`,
        );
      } else {
        showErrorToast(tCart('cannotPlaceOrder') || 'Cannot place order');
      }
      return;
    }

    setIsPlacingOrder(true);

    try {
      const response = await cartRepository.placeOrder(checkoutSession.id, {
        paymentMethod,
      });

      if (response.success && response.order) {
        if (response.paymentUrl) {
          if (checkoutSession.customer) {
            const customerData = {
              name: checkoutSession.customer.name || '',
              phone: checkoutSession.customer.phone || '',
              email: checkoutSession.customer.email || '',
              orderNumber: response.order?.orderNumber || '',
              productIds: checkoutSession.items?.map(item => item.productId) || [],
            };
            storageService.setOrderCustomerData(customerData);
          }

          window.open(response.paymentUrl, '_blank');
          const orderId = response.order?.id || null;
          setPendingOrderId(orderId);
          setIsPaymentProcessing(true);
          setIsPlacingOrder(false);

          if (orderId) {
            const url = new URL(window.location.href);
            url.searchParams.set('pendingOrderId', orderId);
            window.history.replaceState({}, '', url.toString());
          }
          return;
        }

        // Handle VietQR payment with QR code display
        if (response.qrUrl || response.qrData) {
          // NOTE: Don't refresh cart here - it interferes with QR dialog opening
          // Cart will be refreshed when user completes/cancels payment
          // Store customer data for order success page (before clearing session)
          if (checkoutSession.customer) {
            const customerData = {
              name: checkoutSession.customer.name || '',
              phone: checkoutSession.customer.phone || '',
              email: checkoutSession.customer.email || '',
              orderNumber: response.order?.orderNumber || '',
              productIds: checkoutSession.items?.map(item => item.productId) || [],
            };
            storageService.setOrderCustomerData(customerData);
          }

          setQrDialogData({
            qrUrl: response.qrUrl,
            qrData: response.qrData,
          });
          setIsQRDialogOpen(true);
          const orderId = response.order?.id || null;
          setPendingOrderId(orderId);
          setIsPaymentProcessing(true);
          setIsPlacingOrder(false);
          if (orderId) {
            const url = new URL(window.location.href);
            url.searchParams.set('pendingOrderId', orderId);
            window.history.replaceState({}, '', url.toString());
          }
          return;
        }

        // Store customer data for order success page (before clearing session)
        if (checkoutSession.customer) {
          const customerData = {
            name: checkoutSession.customer.name || '',
            phone: checkoutSession.customer.phone || '',
            email: checkoutSession.customer.email || '',
            productIds: checkoutSession.items?.map(item => item.productId) || [],
          };
          storageService.setOrderCustomerData(customerData);
        }

        // Clear checkout session from localStorage when order is successfully placed
        storageService.clearCheckoutSession();

        // Navigate to order success page with orderNumber using window.location for hard navigation
        // This prevents cart refresh from interfering with navigation
        const orderNumber = response.order?.orderNumber;
        window.location.href = orderNumber
          ? `/${locale}/order-success/${orderNumber}`
          : `/${locale}/order-success`;
        showSuccessToast(
          tCart('orderPlacedSuccessfully') || 'Order placed successfully!',
        );
        // Note: Cart will be automatically refreshed when user returns from order-success page
        // No need to dispatch refreshCartRequest here as it interferes with navigation
      } else if (response.pricesAdjusted && response.flashSaleAdjustments?.length) {
        // Flash sale prices were auto-adjusted — order NOT created yet.
        // Refresh the session so the UI reflects the new (regular) prices,
        // then let the user review and confirm again.
        response.flashSaleAdjustments.forEach((adj) => {
          showWarningToast(
            tCart('flashSalePriceAdjusted', {
              name: adj.productName,
              price: formatPrice(adj.regularPrice),
            }),
          );
        });
        // Refresh checkout session so UI shows the updated (regular) prices
        if (checkoutSession?.id) {
          try {
            const refreshed = await cartRepository.getCheckoutSession(checkoutSession.id);
            setCheckoutSession(refreshed);
          } catch {
            // non-critical — session will be stale but user can still retry
          }
        }
        // Refresh cart Redux state so cart sidebar and bottom bar totals update too
        dispatch(refreshCartRequest());
        setIsPlacingOrder(false);
      } else {
        if (response.validationErrors && response.validationErrors.length > 0) {
          toast.error(
            React.createElement(
              'div',
              { className: 'flex flex-col gap-2' },
              response.validationErrors.map((err, index) =>
                React.createElement(
                  'div',
                  { key: index },
                  `${err.message}: ${err.productName}`,
                ),
              ),
            ),
          );
        } else if (safeLength(response.missingFields) > 0) {
          showErrorToast(
            `Missing fields: ${response.missingFields.join(', ')}`,
          );
        } else {
          showErrorToast(
            tCart('failedToPlaceOrder') || 'Failed to place order',
          );
        }
        setIsPlacingOrder(false);
      }
    } catch {
      showErrorToast(tCart('failedToPlaceOrder') || 'Failed to place order');
      setIsPlacingOrder(false);
    }
  };

  const handleBackToCart = useCallback(() => {
    try {
      let targetPath: string;

      // Smart navigation based on source
      if (navigationSource === 'product' && productId) {
        // User came from product page via Buy Now
        targetPath = `/${locale || 'en'}/products/${productId}`;
        console.log('[ConfirmOrder] Navigating back to product:', targetPath);
      } else {
        // User came from cart page via Checkout, or no source specified
        targetPath = `/${locale || 'en'}/cart`;
        console.log('[ConfirmOrder] Navigating back to cart:', targetPath);
      }

      router.replace(targetPath);
    } catch (error) {
      console.error('[ConfirmOrder] Navigation error:', error);
      // Fallback: always go to cart on error
      window.location.href = `/${locale || 'en'}/cart`;
    }
  }, [navigationSource, productId, locale, router]);

  // Handle browser back button with same smart navigation logic
  useEffect(() => {
    const handlePopState = () => {
      // Intercept browser back button and use smart navigation
      handleBackToCart();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleBackToCart]);

  const handleItemQuantityChange = async (
    productId: string,
    variantId: string | undefined,
    newQuantity: number,
    comboInstanceId?: string,
  ) => {
    if (!checkoutSession || newQuantity < 1) return;

    setIsUpdatingQuantity(true);
    try {
      // Reconstruct items array with updated quantity
      const updatedItems = checkoutSession.items.map((item) => {
        const isTargetItem =
          item.productId === productId &&
          item.variantId === variantId &&
          item.comboInstanceId === comboInstanceId;

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: isTargetItem ? newQuantity : item.quantity,
        };
      });

      // Get current customer data if not authenticated
      const customer = isAuthenticated
        ? undefined // Backend uses authenticated user
        : {
            name: shippingFormData.fullName,
            phone: shippingFormData.phone,
            email: shippingFormData.email || undefined,
          };

      // Build shipping address from current form data
      const shippingAddress =
        await buildPartialShippingAddress(shippingFormData);

      // Remove shipping promotion when quantity changes (tier may change with new total)
      if (checkoutSession.shippingPromotion?.id) {
        try {
          await promotionRepository.removeShippingPromotion(checkoutSession.id);
        } catch (error) {
          console.error('Failed to remove shipping promotion:', error);
        }
      }

      // Call API to recalculate checkout session
      const session = await cartRepository.upsertCheckoutSession({
        id: checkoutSession.id,
        items: updatedItems,
        combos: [], // Preserve combos unchanged
        clearCartAfterOrder: true,
        customer,
        shippingAddress,
        paymentMethod,
        note: shippingFormData.notes || undefined,
      });

      setCheckoutSession(session);
      console.log('[ConfirmOrder] Quantity updated:', {
        productId,
        variantId,
        newQuantity,
      });
    } catch (error) {
      console.error('[ConfirmOrder] Failed to update quantity:', error);
      showErrorToast(tCommon('errors.updateFailed'));
    } finally {
      setIsUpdatingQuantity(false);
    }
  };

  const handleRetryPayment = () => {
    setPendingOrderId(null);
    setIsPaymentProcessing(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('pendingOrderId');
    window.history.replaceState({}, '', url.toString());
  };

  const handleQRDialogClose = () => {
    setIsQRDialogOpen(false);
    setQrDialogData({});
  };

  const handleNavigateToAddressBook = () => {
    if (isDesktop) {
      // Desktop: Open dialog popup
      setIsAddressManagementDialogOpen(true);
    } else {
      // Mobile: Navigate to address page
      router.push(`/${locale}/account/addresses`);
    }
  };

  const handleCloseAddressManagementDialog = () => {
    setIsAddressManagementDialogOpen(false);
  };

  const handleGuestNotesChange = (notes: string) => {
    setGuestShippingFormData({ ...guestShippingFormData, notes });
  };

  /**
   * Handle voucher applied on confirm order page.
   * Updates local session and syncs cart to reflect any auto-removed gifts.
   */
  const handleVoucherApplied = useCallback(
    async (updatedSession: CheckoutSession) => {
      setCheckoutSession(updatedSession);
      try {
        const updatedCart = await cartRepository.syncCart();
        dispatch(setCart(updatedCart));
      } catch (error) {
        console.error('[ConfirmOrder] Failed to sync cart after voucher applied:', error);
      }
    },
    [dispatch, setCheckoutSession],
  );

  // Determine which shipping form data to use based on auth status
  const shippingFormData = isAuthenticated
    ? addressHook.shippingFormData
    : guestShippingFormData;

  const setShippingFormData = isAuthenticated
    ? addressHook.setShippingFormData
    : setGuestShippingFormData;

  // Prioritize externalSession when available to ensure synchronization
  // This fixes the issue where PaymentDetails and ConfirmOrderPlaceButton
  // show different totals because they use different session sources
  const effectiveCheckoutSession = externalSession || checkoutSession;

  return {
    // State
    isAuthenticated,
    isDesktop,
    checkoutSession: effectiveCheckoutSession,
    isLoading,
    isPlacingOrder,
    isCalculatingCheckout,
    isPaymentProcessing,
    isUpdatingQuantity,
    paymentMethod,
    shippingFormData,
    cities,
    availableDistricts,
    availableWards,
    shippingAddresses: addressHook.shippingAddresses,
    selectedAddressId: addressHook.selectedAddressId,
    isAddressLoaded,
    isQRDialogOpen,
    qrDialogData,
    isAddressManagementDialogOpen,
    fieldErrors,

    // Setters
    setPaymentMethod,
    setShippingFormData,
    setCheckoutSession,

    // Handlers
    handlePlaceOrder,
    handleBackToCart,
    handleItemQuantityChange,
    handleNotesChange: addressHook.handleNotesChange,
    handleSelectAddress: addressHook.handleSelectAddress,
    handleEditAddress: addressHook.handleEditAddress,
    handleAddNewAddress: addressHook.handleAddNewAddress,
    handleRetryPayment,
    handleQRDialogClose,
    handleNavigateToAddressBook,
    handleCloseAddressManagementDialog,
    handleGuestNotesChange,
    handleVoucherApplied,
    clearFieldError,
  };
}
