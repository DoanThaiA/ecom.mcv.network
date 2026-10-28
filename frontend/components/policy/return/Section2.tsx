import { Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

interface PolicyItem {
  text: string;
  subItems?: string[];
}

interface PolicyCardProps {
  title: string;
  description?: string;
  items?: PolicyItem[];
}

function PolicyCard({ title, description, items }: PolicyCardProps) {
  return (
    <Flex
      direction="column"
      justify="center"
      align="start"
      className="self-stretch pb-4 gap-3 border-b border-[#F0F0F0]"
    >
      {/* Title Badge */}
      <Flex
        justify="center"
        align="center"
        className="px-4 py-1 border border-[#AFAFAF] rounded-full"
      >
        <Text className="text-black text-sm leading-6 font-semibold">
          {title}
        </Text>
      </Flex>
      {/* Description */}
      {description && (
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
          {description}
        </Text>
      )}
      {/* Items as bullet list */}
      {items && items.length > 0 && (
        <Flex direction="column" gap="3" className="self-stretch">
          {items.map((item, index) => (
            <Flex key={index} direction="column" gap="2">
              <Flex align="start" gap="2">
                <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
                  •
                </Text>
                <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
                  {item.text}
                </Text>
              </Flex>
              {/* Sub-items with dash and indent */}
              {item.subItems && item.subItems.length > 0 && (
                <Flex direction="column" gap="2" className="pl-6">
                  {item.subItems.map((subItem, subIndex) => (
                    <Flex key={subIndex} align="start" gap="2">
                      <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
                        -
                      </Text>
                      <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
                        {subItem}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              )}
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
}

interface FeeCardProps {
  title: string;
  description: string;
}

function FeesCard({ title, description }: FeeCardProps) {
  return (
    <Flex
      direction="column"
      justify="center"
      align="start"
      className="self-stretch gap-4"
    >
      {/* Title Badge */}
      <Flex
        justify="center"
        align="center"
        className="px-4 py-1 border border-[#AFAFAF] rounded-full"
      >
        <Text className="text-black text-sm leading-6 font-semibold">
          {title}
        </Text>
      </Flex>
      {/* Description */}
      <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 self-stretch">
        {description}
      </Text>
    </Flex>
  );
}

interface FeeItemProps {
  number: string;
  title: string;
  description: string;
  items?: string[];
}

function FeeItem({ number, title, description, items }: FeeItemProps) {
  return (
    <Flex direction="column" align="start" className="self-stretch gap-4">
      {/* Header with number badge */}
      <Flex align="center" gap="2">
        {/* Number badge */}
        <Flex
          justify="center"
          align="center"
          className="w-6 h-6 rounded-full flex-shrink-0"
          style={{
            background:
              'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
          }}
        >
          <Text className="text-white text-sm leading-6 font-semibold">
            {number}
          </Text>
        </Flex>
        <Text className="text-black text-sm leading-6 font-semibold">
          {title}
        </Text>
      </Flex>
      {/* Description */}
      <Flex direction="column" className="self-stretch pl-8">
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
          {description}
        </Text>
        {items && items.length > 0 && (
          <Flex direction="column" className="pl-4">
            {items.map((item, index) => (
              <Flex key={index} align="start" gap="2">
                <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
                  •
                </Text>
                <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6">
                  {item}
                </Text>
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

interface ProcessCardProps {
  title: string;
}

function ProcessCard({ title }: ProcessCardProps) {
  return (
    <Flex
      direction="column"
      justify="center"
      align="start"
      className="self-stretch pb-4 gap-4"
    >
      {/* Title Badge */}
      <Flex
        justify="center"
        align="center"
        className="px-4 py-1 border border-[#AFAFAF] rounded-full"
      >
        <Text className="text-black text-sm leading-6 font-semibold">
          {title}
        </Text>
      </Flex>
    </Flex>
  );
}

interface ProcessItemProps {
  number: string;
  title: string;
  description?: string;
  steps?: string[];
}

function ProcessItem({ number, title, description, steps }: ProcessItemProps) {
  return (
    <Flex direction="column" align="start" className="self-stretch gap-4">
      {/* Header */}
      <Flex align="center" gap="2">
        {/* Number badge */}
        <Flex
          justify="center"
          align="center"
          className="w-6 h-6 rounded-full flex-shrink-0"
          style={{
            background:
              'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
          }}
        >
          <Text className="text-white text-sm leading-6 font-semibold">
            {number}
          </Text>
        </Flex>
        <Text className="text-black text-sm leading-6 font-semibold">
          {title}
        </Text>
      </Flex>
      {/* Description or Steps */}
      {description && (
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 self-stretch pl-8">
          {description}
        </Text>
      )}
      {steps && steps.length > 0 && (
        <Flex direction="column" gap="4" className="self-stretch pl-8">
          {steps.map((step, index) => (
            <Text
              key={index}
              className="text-black text-sm leading-5 lg:text-base lg:leading-6"
            >
              {step}
            </Text>
          ))}
        </Flex>
      )}
    </Flex>
  );
}

export async function Section2() {
  const t = await getTranslations('returnPolicy.section2');

  const exchangeApplicableItems: PolicyItem[] = [
    { text: t('exchangeApplicable.items.item1') },
    { text: t('exchangeApplicable.items.item2') },
    {
      text: t('exchangeApplicable.items.item3'),
      subItems: [
        t('exchangeApplicable.items.item3a'),
        t('exchangeApplicable.items.item3b'),
      ],
    },
  ];

  const exchangeNotApplicableItems: PolicyItem[] = [
    { text: t('exchangeNotApplicable.items.item1') },
    { text: t('exchangeNotApplicable.items.item2') },
    { text: t('exchangeNotApplicable.items.item3') },
    { text: t('exchangeNotApplicable.items.item4') },
    { text: t('exchangeNotApplicable.items.item5') },
  ];

  const returnPolicyItems: PolicyItem[] = [
    { text: t('returnPolicy.items.item1') },
    { text: t('returnPolicy.items.item2') },
    { text: t('returnPolicy.items.item3') },
    { text: t('returnPolicy.items.item4') },
    { text: t('returnPolicy.items.item5') },
  ];

  const productConditionsItems: PolicyItem[] = [
    { text: t('productConditions.items.item1') },
    { text: t('productConditions.items.item2') },
    { text: t('productConditions.items.item3') },
    { text: t('productConditions.items.item4') },
  ];

  return (
    <Flex
      direction="column"
      align="center"
      className="py-6 gap-4 border-b border-[#F0F0F0] lg:py-8 lg:gap-6"
    >
      {/* Section Header */}
      <Flex
        align="center"
        className="w-[calc(100%+40px)] -mx-5 bg-[#FDF7F1] md:w-[calc(100%+80px)] md:-mx-10 lg:w-auto lg:mx-0 lg:self-stretch"
      >
        <Flex
          justify="center"
          align="center"
          className="px-8 py-2 rounded-r-[32px]"
          style={{
            background:
              'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)',
          }}
        >
          <Text className="text-white text-[32px] leading-[48px] lg:text-[40px] lg:leading-[56px] font-semibold">
            {t('number')}
          </Text>
        </Flex>
        {/* Title */}
        <Text className="text-black text-sm leading-5 lg:text-base lg:leading-6 font-semibold flex-1 px-4">
          {t('title')}
        </Text>
      </Flex>

      {/* Exchange Policy Card */}
      <PolicyCard
        title={t('exchangePolicy.title')}
        description={t('exchangePolicy.description')}
      />

      {/* Exchange Applicable Card */}
      <PolicyCard
        title={t('exchangeApplicable.title')}
        items={exchangeApplicableItems}
      />

      {/* Exchange Not Applicable Card */}
      <PolicyCard
        title={t('exchangeNotApplicable.title')}
        items={exchangeNotApplicableItems}
      />

      {/* Return Policy Card */}
      <PolicyCard title={t('returnPolicy.title')} items={returnPolicyItems} />

      {/* Product Conditions Card */}
      <PolicyCard
        title={t('productConditions.title')}
        items={productConditionsItems}
      />

      {/* Fees Section - wrapped with border-bottom */}
      <Flex
        direction="column"
        align="start"
        className="self-stretch pb-4 gap-4 border-b border-[#F0F0F0]"
      >
        <FeesCard title={t('fees.title')} description={t('fees.description')} />

        {/* Fee Items */}
        <FeeItem
          number={t('fees.byRequest.number')}
          title={t('fees.byRequest.title')}
          description={t('fees.byRequest.description')}
          items={[
            t('fees.byRequest.items.item1'),
            t('fees.byRequest.items.item2'),
          ]}
        />

        <FeeItem
          number={t('fees.byDefect.number')}
          title={t('fees.byDefect.title')}
          description={t('fees.byDefect.description')}
        />
      </Flex>

      {/* Process Section - wrapped without border */}
      <Flex
        direction="column"
        align="start"
        className="self-stretch pb-4 gap-4"
      >
        <ProcessCard title={t('process.title')} />

        {/* Process Items */}
        <ProcessItem
          number={t('process.online.number')}
          title={t('process.online.title')}
          steps={[
            t('process.online.steps.step1'),
            t('process.online.steps.step2'),
            t('process.online.steps.step3'),
            t('process.online.steps.step4'),
          ]}
        />

        <ProcessItem
          number={t('process.inStore.number')}
          title={t('process.inStore.title')}
          description={t('process.inStore.description')}
        />
      </Flex>
    </Flex>
  );
}
