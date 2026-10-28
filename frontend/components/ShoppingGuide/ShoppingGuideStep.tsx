import { Box, Flex, Text } from "@radix-ui/themes";
import { ReactNode } from "react";

interface ShoppingGuideStepProps {
    stepNumber: number;
    title: string;
    children: ReactNode;
}

export function ShoppingGuideStep({ stepNumber, title, children }: ShoppingGuideStepProps) {
    return (
        <Box className="py-4">
            <Flex direction="column" gap="4">
                {/* Step Header */}
                <Flex align="center" gap="4" className="bg-[#FDF7F1] rounded-r-2xl sm:rounded-r-[32px]">
                    <Box className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-r-2xl sm:rounded-r-[32px] bg-[linear-gradient(90deg,#FAA63E_0%,#EA9839_20%,#C0752F_63%,#9B5526_97%)]">
                        <Text className="text-white font-semibold text-[1.5rem] sm:text-[2rem] leading-[1.5]">
                            B{stepNumber}
                        </Text>
                    </Box>
                    <Text className="text-black font-semibold text-lg leading-7 lg:text-2xl lg:leading-8 pr-2 sm:pr-0">
                        {title}
                    </Text>
                </Flex>

                {/* Step Content */}
                <Flex direction="column" gap="4" className="px-4 sm:px-0">
                    {children}
                </Flex>
            </Flex>
        </Box>
    );
}
