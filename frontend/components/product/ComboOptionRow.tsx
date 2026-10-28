"use client";

import { Box, Flex } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useAppSelector } from "@/lib/store/hooks";
import { selectColorVariantsByName } from "@/lib/store/slices/colorVariantSlice";
import { getColorSwatchStyle } from "@/lib/utils/colorVariantRenderer";
import type {
  ComboOptionChoice,
  ComboOptionKey,
} from "@/lib/helpers/comboVariantHelper";

interface ComboOptionRowProps {
  optionKey: ComboOptionKey;
  choices: ComboOptionChoice[];
  selected?: string;
  onPick: (_choice: ComboOptionChoice) => void;
}

/** Same strike the product detail page puts on its size chips. */
const SOLD_OUT_CHIP_CLASS =
  "opacity-40 diagonal-strike border-black cursor-not-allowed";
// A swatch carries its colour as an inline background, which wins over the
// strike gradient, so dim it instead.
const SOLD_OUT_SWATCH_CLASS = "opacity-30 cursor-not-allowed";

/** Same gradient the product detail page fills its selected size chip with. */
const SELECTED_GRADIENT =
  "linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)";

const GAP = 8;
/** Chevron plus its gap, matching the product card. */
const TOGGLE_WIDTH = 26;

/**
 * Width a choice takes. Swatches are fixed; chips grow with their label, so
 * measure them from the text rather than assuming they are all alike.
 */
function widthOf(
  optionKey: ComboOptionKey,
  choice: ComboOptionChoice,
  isDesktop: boolean
): number {
  const minimum = isDesktop ? 36 : 30;
  if (optionKey === "color") return minimum;

  const padding = 18; // px-2 plus the border
  const perChar = isDesktop ? 7 : 6.2;
  return Math.max(minimum, padding + choice.value.length * perChar);
}

interface ChoiceProps {
  choice: ComboOptionChoice;
  isSelected: boolean;
  onPick: (_choice: ComboOptionChoice) => void;
}

function ColorSwatch({
  choice,
  isSelected,
  swatchStyle,
  onPick,
}: ChoiceProps & { swatchStyle: React.CSSProperties }) {
  return (
    <Box
      title={choice.value}
      aria-label={choice.value}
      /* No bg-no-repeat: polka-dot and checkered swatches are small tiles that
         must repeat to fill. */
      className={`h-[17px] w-[30px] min-w-[30px] lg:h-5 lg:w-9 lg:min-w-9 rounded-full ring-1 overflow-hidden transition-all duration-150
        ${
          isSelected
            ? "ring-offset-1 ring-[#9B5526]"
            : "ring-transparent border border-[#e9b887]"
        }
        ${
          choice.inStock
            ? "cursor-pointer hover:ring-[#9B5526]"
            : SOLD_OUT_SWATCH_CLASS
        }`}
      style={swatchStyle}
      onClick={() => onPick(choice)}
    />
  );
}

/** Chevron that flips to point back, the same affordance a product card uses. */
function CollapseToggle({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      onClick={onToggle}
      className="cursor-pointer flex items-center shrink-0"
    >
      <ChevronRightIcon
        width={18}
        height={18}
        className={`text-gray-600 transition-transform duration-200 ${
          expanded ? "rotate-180" : ""
        }`}
      />
    </Box>
  );
}

function SizeChip({ choice, isSelected, onPick }: ChoiceProps) {
  return (
    <Box
      className={`h-[22px] min-w-[30px] px-2 lg:h-[26px] lg:min-w-[36px] lg:text-xs rounded-full border text-[11px] flex items-center justify-center whitespace-nowrap transition-all duration-150
        ${isSelected ? "text-white" : "bg-[#F0F0F0] text-gray-700"}
        ${
          choice.inStock
            ? "border-[#F0F0F0] cursor-pointer"
            : SOLD_OUT_CHIP_CLASS
        }`}
      style={isSelected ? { background: SELECTED_GRADIENT } : undefined}
      onClick={() => onPick(choice)}
    >
      {choice.value}
    </Box>
  );
}

/**
 * One row of options that collapses to a single line with a chevron, the way
 * the colour row on a product card does. When everything fits, no chevron.
 */
/** How many choices fit on one line, remeasured whenever the row resizes. */
function useVisibleCount(
  listRef: React.RefObject<HTMLDivElement | null>,
  optionKey: ComboOptionKey,
  choices: ComboOptionChoice[]
): number {
  const [visibleCount, setVisibleCount] = useState(choices.length);

  useEffect(() => {
    const element = listRef.current;
    if (!element) return;

    const measure = () => {
      const available = element.clientWidth;
      if (!available) return;

      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const widths = choices.map((choice) =>
        widthOf(optionKey, choice, isDesktop)
      );
      const total =
        widths.reduce((sum, width) => sum + width, 0) +
        GAP * Math.max(0, widths.length - 1);

      if (total <= available) {
        setVisibleCount(choices.length);
        return;
      }

      // Leave room for the chevron on the first line.
      let used = TOGGLE_WIDTH;
      let count = 0;
      for (const width of widths) {
        const next = used + width + (count > 0 ? GAP : 0);
        if (next > available) break;
        used = next;
        count++;
      }
      setVisibleCount(Math.max(1, count));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();

    return () => observer.disconnect();
  }, [listRef, choices, optionKey]);

  return visibleCount;
}

/** The first `count` choices, with the selected one kept in view. */
function collapse(
  choices: ComboOptionChoice[],
  count: number,
  selected: string | undefined
): ComboOptionChoice[] {
  const visible = choices.slice(0, count);
  if (!selected || visible.some((choice) => choice.value === selected)) {
    return visible;
  }

  const current = choices.find((choice) => choice.value === selected);
  return current ? [current, ...visible.slice(0, count - 1)] : visible;
}

export function ComboOptionRow({
  optionKey,
  choices,
  selected,
  onPick,
}: ComboOptionRowProps) {
  const colorVariantsByName = useAppSelector(selectColorVariantsByName);
  const listRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const visibleCount = useVisibleCount(listRef, optionKey, choices);

  const collapsible = visibleCount < choices.length;
  const visible =
    collapsible && !showAll
      ? collapse(choices, visibleCount, selected)
      : choices;

  return (
    <Flex
      ref={listRef}
      gap="2"
      align="center"
      // Vertical padding keeps a selected swatch's ring from being clipped.
      className={`w-full px-1 ${
        showAll ? "flex-wrap" : "flex-nowrap overflow-hidden"
      } ${optionKey === "color" ? "py-1" : ""}`}
    >
      {visible.map((choice) =>
        optionKey === "color" ? (
          <ColorSwatch
            key={choice.value}
            choice={choice}
            isSelected={selected === choice.value}
            swatchStyle={getColorSwatchStyle(
              colorVariantsByName[choice.value.toLowerCase().trim()],
              choice.value
            )}
            onPick={onPick}
          />
        ) : (
          <SizeChip
            key={choice.value}
            choice={choice}
            isSelected={selected === choice.value}
            onPick={onPick}
          />
        )
      )}

      {collapsible && (
        <CollapseToggle
          expanded={showAll}
          onToggle={() => setShowAll((shown) => !shown)}
        />
      )}
    </Flex>
  );
}
