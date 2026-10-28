"use client";

import { Box, Flex, Text } from "@radix-ui/themes";

interface StockStatusBadgeProps {
  available: number;
  t: any; // Translation function
  className?: string;
}

export function StockStatusBadge({ available, t, className }: StockStatusBadgeProps) {
  // Sold out - Red badge
  if (available === 0) {
    return (
      <Flex
        className={`justify-center lg:justify-start ${className || "my-2"}`}
      >
        <Box
          className="rounded-full border flex items-center justify-center"
          style={{
            width: "116px",
            height: "40px",
            borderColor: "#DC2626",
            borderWidth: "1px",
          }}
        >
          <Text
            style={{
              color: "#DC2626",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "24px",
              letterSpacing: "0%",
              textAlign: "center",
            }}
          >
            {t("soldOut")}
          </Text>
        </Box>
      </Flex>
    );
  }

  // Almost sold out - Amber badge (available <= 5)
  if (available <= 5) {
    return (
      <Flex
        className={`justify-center lg:justify-start ${className || "my-2"}`}
      >
        <Box
          className="rounded-full border flex items-center justify-center"
          style={{
            width: "116px",
            height: "40px",
            borderColor: "#F59E0B",
            borderWidth: "1px",
          }}
        >
          <Text
            style={{
              color: "#F59E0B",
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "24px",
              letterSpacing: "0%",
              textAlign: "center",
            }}
          >
            {t("almostSoldOut")}
          </Text>
        </Box>
      </Flex>
    );
  }

  // In stock - No badge shown
  return (
    <Flex className={`justify-center lg:justify-start ${className || "my-2"}`}>
      <Box
        className="rounded-full flex items-center justify-center"
        style={{
          width: "116px",
          height: "40px",
        }}
      >
        {/* Empty content for better UX*/}
      </Box>
    </Flex>
  );
}
