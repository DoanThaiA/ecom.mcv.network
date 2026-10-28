import { Box, Flex, Text } from '@radix-ui/themes';

interface ProductBenefitsProps {
  translations: {
    freeShipping: string;
    freeShippingDesc: string;
    returnPolicy: string;
    returnPolicyDesc: string;
    payment: string;
    paymentDesc: string;
    support: string;
    supportDesc: string;
  };
}

export function ProductBenefits({ translations: t }: ProductBenefitsProps) {
  return (
    <Box className="w-full bg-gray-200 py-8 px-6 rounded-lg">
      <Flex justify="between" className="max-w-full">
        {/* Free Shipping */}
        <Flex direction="column" className="flex-1 items-center text-center">
          <svg
            width="30"
            height="24"
            viewBox="0 0 30 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2"
          >
            <path
              d="M0 3.5C0 2.67157 0.671573 2 1.5 2H18.5C19.3284 2 20 2.67157 20 3.5V15.5C20 16.3284 19.3284 17 18.5 17H1.5C0.671573 17 0 16.3284 0 15.5V3.5Z"
              fill="currentColor"
            />
            <path
              d="M20 7H23.5L28 11.5V15.5C28 16.3284 27.3284 17 26.5 17H20V7Z"
              fill="currentColor"
            />
            <circle cx="6" cy="20" r="2" fill="currentColor" />
            <circle cx="24" cy="20" r="2" fill="currentColor" />
          </svg>
          <Text size="2" className="text-gray-800 font-normal leading-snug">
            {t.freeShipping}
            <br />
            {t.freeShippingDesc}
          </Text>
        </Flex>

        {/* Return Policy */}
        <Flex direction="column" className="flex-1 items-center text-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2"
          >
            <path
              d="M14 2C7.92487 2 3 6.92487 3 13C3 19.0751 7.92487 24 14 24C20.0751 24 25 19.0751 25 13H23C23 17.9706 18.9706 22 14 22C9.02944 22 5 17.9706 5 13C5 8.02944 9.02944 4 14 4V8L19 4L14 0V2Z"
              fill="currentColor"
            />
          </svg>
          <Text size="2" className="text-gray-800 font-normal leading-snug">
            {t.returnPolicy}
            <br />
            {t.returnPolicyDesc}
          </Text>
        </Flex>

        {/* Payment */}
        <Flex direction="column" className="flex-1 items-center text-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2"
          >
            <path
              d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path d="M1 9H23" stroke="currentColor" strokeWidth="2" />
            <path
              d="M4 14H8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <Text size="2" className="text-gray-800 font-normal leading-snug">
            {t.payment}
            <br />
            {t.paymentDesc}
          </Text>
        </Flex>

        {/* Support */}
        <Flex direction="column" className="flex-1 items-center text-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2"
          >
            <path
              d="M3 5C3 3.89543 3.89543 3 5 3H8C9.10457 3 10 3.89543 10 5V8C10 9.10457 9.10457 10 8 10H5C3.89543 10 3 9.10457 3 8V5Z"
              fill="currentColor"
            />
            <path
              d="M14 5C14 3.89543 14.8954 3 16 3H19C20.1046 3 21 3.89543 21 5V8C21 9.10457 20.1046 10 19 10H16C14.8954 10 14 9.10457 14 8V5Z"
              fill="currentColor"
            />
            <path
              d="M3 16C3 14.8954 3.89543 14 5 14H8C9.10457 14 10 14.8954 10 16V19C10 20.1046 9.10457 21 8 21H5C3.89543 21 3 20.1046 3 19V16Z"
              fill="currentColor"
            />
            <path
              d="M14 16C14 14.8954 14.8954 14 16 14H19C20.1046 14 21 14.8954 21 16V19C21 20.1046 20.1046 21 19 21H16C14.8954 21 14 20.1046 14 19V16Z"
              fill="currentColor"
            />
          </svg>
          <Text size="2" className="text-gray-800 font-normal leading-snug">
            {t.support}
            <br />
            {t.supportDesc}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
