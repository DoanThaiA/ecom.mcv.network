import { Box, Flex, Text, Separator } from "@radix-ui/themes";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { FeedbackSection } from "@/components/common/FeedbackSection";
import { ShoppingGuideStep } from "@/components/ShoppingGuide/ShoppingGuideStep";

export async function ShoppingGuideContent() {
    const t = await getTranslations("guide");

    return (
        <Box className="min-h-screen bg-white">
            <Box className="max-w-[800px] mx-auto sm:px-5 md:px-10 lg:px-0">
                {/* Title Section */}
                <Flex direction="column" align="start" gap="4" className="py-4 px-4 sm:py-8">
                    <Text className="text-black font-semibold uppercase self-stretch whitespace-pre-line text-3xl leading-9 lg:text-5xl lg:leading-[56px] pt-5 sm:pt-12">
                        {t("title")}
                    </Text>
                </Flex>

                <Separator className="border-b border-[#F0F0F0]" />

                {/* Step 1: Search Products */}
                <ShoppingGuideStep stepNumber={1} title={t("step1.title")}>
                    <Text className="text-black text-sm leading-[1.25rem]">{t("step1.description")}</Text>
                    <Text className="text-black text-sm leading-[1.25rem] sm:leading-[2rem]">{t("step1.method1")}</Text>

                    {/* Search Popup Images */}
                    <Box className="flex justify-center w-full">
                        <Box className="w-full max-w-full sm:max-w-[640px] rounded-2xl sm:rounded-3xl border border-[#F0F0F0] overflow-hidden">
                            <Image
                                src="/assets/images/guide/search-popup-1.png"
                                alt="Search popup"
                                width={640}
                                height={517}
                                className="w-full h-auto object-contain"
                            />
                        </Box>
                    </Box>
                    <Box className="flex justify-center w-full">
                        <Box className="w-full max-w-full sm:max-w-[640px] rounded-2xl sm:rounded-3xl border border-[#F0F0F0] overflow-hidden">
                            <Image
                                src="/assets/images/guide/search-popup-2.png"
                                alt="Search popup 2"
                                width={640}
                                height={283}
                                className="w-full h-auto object-contain"
                            />
                        </Box>
                    </Box>

                    <Text className="text-black text-sm leading-[1.25rem]">{t("step1.afterSearch")}</Text>
                    <Text className="text-black text-sm leading-[1.25rem]">{t("step1.cartSteps")}</Text>
                </ShoppingGuideStep>

                <Separator className="border-b border-[#F0F0F0]" />

                {/* Step 2: Payment */}
                <ShoppingGuideStep stepNumber={2} title={t("step2.title")}>
                    <Text className="text-black text-sm leading-[1.25rem]">{t("step2.description")}</Text>

                    {/* Cart Image */}
                    <Box className="flex justify-center w-full">
                        <Box className="w-full max-w-full sm:max-w-[640px] rounded-2xl sm:rounded-3xl border border-[#F0F0F0] overflow-hidden">
                            <Image
                                src="/assets/images/guide/cart-1.png"
                                alt="Cart"
                                width={640}
                                height={163}
                                className="w-full h-auto object-contain"
                            />
                        </Box>
                    </Box>

                    <Text className="text-black font-semibold text-sm leading-[1.25rem]">
                        {t("step2.shippingTitle")}
                    </Text>
                    <Text className="text-black text-sm leading-[1.25rem]">{t("step2.shippingFee")}</Text>

                    <Text className="text-black font-semibold text-sm leading-[1.25rem]">
                        {t("step2.paymentTitle")}
                    </Text>
                    <Flex direction="column" gap="2">
                        <Text className="text-black text-sm leading-[1.25rem]">• {t("step2.paymentMethods.cod")}</Text>
                        <Text className="text-black text-sm leading-[1.25rem]">
                            • {t("step2.paymentMethods.onepayInternational")}
                        </Text>
                        <Text className="text-black text-sm leading-[1.25rem]">
                            • {t("step2.paymentMethods.onepayDomestic")}
                        </Text>
                        <Text className="text-black text-sm leading-[1.25rem]">• {t("step2.paymentMethods.qr")}</Text>
                    </Flex>

                    {/* Cart Image 2 */}
                    <Box className="flex justify-center w-full">
                        <Box className="w-full max-w-full sm:max-w-[640px] rounded-2xl sm:rounded-3xl border border-[#F0F0F0] overflow-hidden">
                            <Image
                                src="/assets/images/guide/cart-2.png"
                                alt="Cart 2"
                                width={640}
                                height={163}
                                className="w-full h-auto object-contain"
                            />
                        </Box>
                    </Box>
                </ShoppingGuideStep>

                <Separator className="border-b border-[#F0F0F0]" />

                {/* Step 3: Order Confirmation */}
                <ShoppingGuideStep stepNumber={3} title={t("step3.title")}>
                    {/* Case 1 */}
                    <Flex direction="column" gap="4" className="pb-4 border-b border-[#F0F0F0]">
                        <Text className="text-[#9B5526] font-semibold text-sm leading-[1.25rem] w-full">
                            {t("step3.case1.title")}
                        </Text>
                        <Text className="text-black text-sm leading-[1.25rem]">{t("step3.case1.description")}</Text>
                        <Text className="text-black text-sm leading-[1.25rem]">{t("step3.case1.instructions")}</Text>
                        {/* Order History Image */}
                        <Box className="flex justify-center w-full">
                            <Box className="w-full max-w-full sm:max-w-[640px] rounded-2xl sm:rounded-3xl border border-[#F0F0F0] overflow-hidden">
                                <Image
                                    src="/assets/images/guide/order-history.png"
                                    alt="Order history"
                                    width={640}
                                    height={312}
                                    className="w-full h-auto object-contain"
                                />
                            </Box>
                        </Box>
                        {/* Account Menu Image */}
                        <Box className="flex justify-center w-full">
                            <Box className="w-full max-w-full sm:max-w-[640px] rounded-2xl sm:rounded-3xl border border-[#F0F0F0] overflow-hidden">
                                <Image
                                    src="/assets/images/guide/account-menu.png"
                                    alt="Account menu"
                                    width={640}
                                    height={272}
                                    className="w-full h-auto object-contain"
                                />
                            </Box>
                        </Box>
                    </Flex>

                    {/* Case 2 */}
                    <Flex direction="column" gap="4" className="pb-6 sm:pb-8">
                        <Text className="text-[#9B5526] font-semibold text-sm leading-[1.25rem] w-full">
                            {t("step3.case2.title")}
                        </Text>
                        <Text className="text-black text-sm leading-[1.25rem]">{t("step3.case2.description")}</Text>
                        <Text className="text-black text-sm leading-[1.25rem]">{t("step3.case2.instructions")}</Text>
                    </Flex>
                </ShoppingGuideStep>

                {/* Feedback Section */}
                <FeedbackSection showBorder={false} />
            </Box>
        </Box>
    );
}
