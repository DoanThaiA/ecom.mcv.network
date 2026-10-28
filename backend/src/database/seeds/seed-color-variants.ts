/**
 * Standalone seed script for color variants
 * Run: npx ts-node -r tsconfig-paths/register src/database/seeds/seed-color-variants.ts
 */
import { NestFactory } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Module, Injectable } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  ColorVariantSchemaClass,
  ColorVariantSchema,
} from '../../color-variants/model/color-variant.schema';
import { ColorVariantDisplayType } from '../../color-variants/domain/color-variant-display-type.enum';
import databaseConfig from '../config/database.config';
import appConfig from '../../config/app.config';
import { MongooseConfigService } from '../mongoose-config.service';

interface SeedColor {
  name: string;
  displayType: ColorVariantDisplayType;
  colorValue?: string;
}

// Base color mapping (Vietnamese to hex)
const BASE_COLORS: Record<string, string> = {
  // Basic
  đen: '#000000',
  trắng: '#FFFFFF',
  xám: '#808080',
  ghi: '#696969',
  đỏ: '#FF0000',
  vàng: '#FFD700',
  cam: '#FF8C00',
  hồng: '#FF69B4',
  tím: '#800080',
  nâu: '#8B4513',
  be: '#F5F5DC',
  kem: '#FFFDD0',
  xanh: '#0000FF',
  rêu: '#556B2F',
  cốm: '#90EE90',
  nude: '#E3BC9A',
  wine: '#722F37',
  ruby: '#E0115F',
  mocha: '#967969',
  taupe: '#483C32',
  khói: '#708090',
  chì: '#36454F',
  sữa: '#FFFAF0',
  cát: '#C2B280',
  mint: '#98FF98',
  plum: '#8E4585',
  navy: '#000080',
  violet: '#EE82EE',
  chocolate: '#D2691E',
  cafe: '#6F4E37',
  cacao: '#D2691E',
  carot: '#ED9121',
  kaki: '#C3B091',
  choco: '#7B3F00',
  grey: '#808080',
  tiger: '#FC6600',
  dior: '#C4A484',
};

// Pattern detection
const PATTERN_KEYWORDS = {
  stripe: ['sọc', 'kẻ'],
  dot: ['chấm', 'bi', 'chấm bi'],
  gradient: ['loang', 'ombre'],
  checkered: ['ô vuông', 'caro', 'ô'],
  floral: ['hoa', 'bướm', 'lá'],
  print: [
    'ht',
    'h.',
    'báo',
    'rắn',
    'sao',
    'chữ',
    'galaxy',
    'phố',
    'sóng',
    'thủy',
  ],
};

/**
 * Detect display type from color name
 */
function detectDisplayType(name: string): ColorVariantDisplayType {
  const lower = name.toLowerCase();

  // Check for stripe patterns
  if (PATTERN_KEYWORDS.stripe.some((k) => lower.includes(k))) {
    return ColorVariantDisplayType.STRIPE_HORIZONTAL;
  }

  // Check for dot patterns
  if (PATTERN_KEYWORDS.dot.some((k) => lower.includes(k))) {
    return ColorVariantDisplayType.DOT;
  }

  // Check for gradient/loang patterns
  if (PATTERN_KEYWORDS.gradient.some((k) => lower.includes(k))) {
    return ColorVariantDisplayType.GRADIENT;
  }

  // Check for checkered patterns
  if (PATTERN_KEYWORDS.checkered.some((k) => lower.includes(k))) {
    return ColorVariantDisplayType.CARO;
  }

  // Default to solid
  return ColorVariantDisplayType.SOLID;
}

/**
 * Generate color value based on name and display type
 */
function generateColorValue(
  name: string,
  displayType: ColorVariantDisplayType,
): string | undefined {
  const lower = name.toLowerCase();
  const colors: string[] = [];

  // Extract all colors mentioned in the name
  for (const [colorName, hex] of Object.entries(BASE_COLORS)) {
    if (lower.includes(colorName)) {
      colors.push(hex);
    }
  }

  // If no colors found, try to guess from common patterns
  if (colors.length === 0) {
    // Default fallback color
    return '#CCCCCC';
  }

  // For solid, use first color
  if (displayType === ColorVariantDisplayType.SOLID) {
    return colors[0];
  }

  // For patterns with 2+ colors
  if (colors.length >= 2) {
    const separator = {
      [ColorVariantDisplayType.GRADIENT]: '/',
      [ColorVariantDisplayType.STRIPE_VERTICAL]: '|',
      [ColorVariantDisplayType.STRIPE_HORIZONTAL]: '-',
      [ColorVariantDisplayType.DOT]: '.',
      [ColorVariantDisplayType.CARO]: ',',
    }[displayType];

    return colors.slice(0, 2).join(separator || '/');
  }

  // For patterns with 1 color, add white as second
  if (colors.length === 1) {
    const separator = {
      [ColorVariantDisplayType.GRADIENT]: '/',
      [ColorVariantDisplayType.STRIPE_VERTICAL]: '|',
      [ColorVariantDisplayType.STRIPE_HORIZONTAL]: '-',
      [ColorVariantDisplayType.DOT]: '.',
      [ColorVariantDisplayType.CARO]: ',',
    }[displayType];

    // For dot/caro, use color on white background
    if (
      displayType === ColorVariantDisplayType.DOT ||
      displayType === ColorVariantDisplayType.CARO
    ) {
      return `${colors[0]}${separator}#FFFFFF`;
    }

    return colors[0];
  }

  return colors[0];
}

/**
 * All colors from the system
 */
const ALL_COLORS = [
  'sọc cam',
  'Nâu be',
  'Nâu đất',
  'navi',
  'hồng tím',
  'Đen chấm bi',
  'taupe',
  'Cam',
  'ghi tiêu',
  'XL',
  'ghi tây',
  'mint',
  'loang đen',
  'nền be',
  'Hoa tím',
  'trắng hồng',
  'Báo nâu',
  'HT xanh cam',
  'bướm đỏ',
  'chấm nâu',
  'loang be',
  'kẻ nhỏ',
  'Kẻ Rêu',
  'đỏ cam',
  'vàng đồng',
  'Xanh rêu',
  'nền hồng',
  'chữ be',
  'xích đen',
  'Trắng đen',
  'Kẻ vàng',
  'đỏ ruby',
  'nâu xanh',
  'xám ghi',
  'xanh vàng',
  'Xanh than',
  'Violet',
  'Tiger',
  'Đỏ Burgury',
  'nâu',
  'chữ đen',
  'HT bướm',
  'hoa vàng',
  'trắng vàng',
  'H.ruốc',
  'HT đỏ',
  'Navy',
  'L',
  'XANH NAVI',
  'HT chữ',
  'Hoa nâu',
  'kẻ hồng',
  'xanh gỗ',
  'nâu vàng',
  'rắn hồng',
  'Thủy ấn',
  'tím hồng',
  'Sọc xanh',
  'HT cam',
  'đen nâu',
  'xanh dương',
  '40',
  'xanh navy',
  'carot',
  'trắng kem',
  'đỏ',
  'đen đá',
  'xanh ghi',
  'xanh cốm',
  'CHOCOLATE',
  'Đen be',
  'Xanh - trắng',
  'HT taupe',
  'ô tim',
  'đen',
  'ĐỒNG',
  'HT tím',
  'Dior',
  'chữ trắng',
  'grey',
  'HT galaxy',
  'vàng',
  'bướm xanh',
  'Cốm',
  'Be đậm',
  'kẻ cốm',
  'ghi đen',
  'Kaki',
  'sọc đỏ',
  'Trắng melen',
  'HT lá đậm',
  'Đỏ đô',
  'HT lá',
  'HT vàng',
  'ghi chì',
  'mocha',
  'ghi nhạt',
  'nâu úa',
  'nền cam',
  'Hồng nhạt',
  'kẻ trắng',
  'HT hồng',
  'Nâu đậm',
  'HT sóng',
  'hoa đỏ',
  'Kẻ xanh',
  'HT hoa xanh',
  'Saphile',
  'nâu nhạt',
  'HT Xanh đậm',
  'Nâu sữa',
  'trắng ngọc',
  'nền xanh',
  'trắng cam',
  'nude',
  'Xanh đá',
  'Hoa trắng',
  'xanh két',
  'Kaki nâu',
  'trắng sữa',
  'S',
  'xám',
  'hồng',
  'đen ngọc',
  'bò',
  'ghi đậm',
  'cacao',
  'Xanh lá',
  'HT rêu',
  'trắng xanh',
  'chữ đỏ',
  'kem',
  'hồng đậm',
  'Kẻ đỏ',
  'báo xanh',
  'trắng',
  'hoa xanh',
  'nâu rêu',
  'Be nâu',
  'trắng-ht hồng',
  'nơ PB2',
  'vani',
  'hồng baby',
  'Đỏ đậm',
  'Kẻ ghi',
  'bướm đen',
  '35',
  'hồng sen',
  'kẻ đen',
  'xanh phẩy',
  'nâu-be',
  'ghi',
  'be đỏ',
  'sữa',
  'xanh',
  'Nền đen',
  'Ô vuông',
  'bướm',
  'HT hồng ô',
  'tiêu',
  'da đậm',
  'xanh xám',
  'Xanh nhạt',
  'ghi sữa',
  'HT kem',
  'đen lì',
  'Nến trắng',
  'Xanh Jeans',
  'xích vàng',
  'xanh min',
  'sao trắng',
  'nâu tây',
  'chì',
  'HT đen',
  'x. lá đậm',
  'xanh nơ',
  'thủy mặc',
  'xám chì',
  'Trắng tiêu',
  'HT hoa',
  'tím than',
  'xanh thêu',
  'Vàng mơ',
  'Cát',
  'hoa cam',
  'loang xanh',
  'kim tuyến',
  'Kem sữa',
  'M',
  'xanh bơ',
  'Nền vàng',
  'HT xích',
  'HT navi',
  'trượt be',
  'rêu vàng',
  'Nâu chấm bi',
  'Rêu',
  'nâu đỏ',
  'vàng kem',
  'HT xanh',
  'Đỏ xanh',
  'HT ghi',
  'Nâu EU',
  'xi măng',
  'Đỏ đen',
  'hoa hồng',
  'be đen',
  'đỏ gạch',
  'Xanh đậm',
  'HT Cốm',
  'loang khói',
  'hồng trắng',
  'tím',
  'Choco',
  'Cam đất',
  'plum',
  'HT số 8',
  'đen nhũ',
  'cam xanh',
  'HT báo',
  'Tím nhạt',
  'trượt cốm',
  'hoa đen',
  'ghi xám',
  'Nhung đen',
  'vàng bò',
  'đen trắng',
  'Hồng cam',
  'trắng nâu',
  'hồng da',
  'đỏ plum',
  'trắng-HT đen',
  'ghi phẩy',
  'Khói',
  'kẻ navy',
  'kẻ cam',
  'Đen',
  'kem tiêu',
  'Nâu Chocolate',
  'X. CO VIT',
  'be cam',
  'đen than',
  'wine',
  'Be',
  'HT be',
  'Hồng dâu',
  'Ruby',
  'nâu đen',
  'HT phố',
  'cafe',
  'cam cháy',
  'xanh be',
  'be hồng',
  'HT Trắng',
  'bạch kim',
  'Xanh ngọc',
  '38',
  'nâu gỗ',
  'Kẻ nâu',
  'HT xanh lá',
  'HT nâu',
  'ghi xanh',
  'tím đậm',
];

/**
 * Process all colors and generate seed data
 */
function generateSeedData(): SeedColor[] {
  const seedData: SeedColor[] = [];
  const processedNames = new Set<string>();

  for (const colorName of ALL_COLORS) {
    // Skip null, empty, or size values
    if (
      !colorName ||
      colorName.trim() === '' ||
      /^(S|M|L|XL|35|38|40)$/i.test(colorName.trim())
    ) {
      continue;
    }

    const normalizedName = colorName.trim();
    const lowerName = normalizedName.toLowerCase();

    // Skip duplicates
    if (processedNames.has(lowerName)) {
      continue;
    }
    processedNames.add(lowerName);

    const displayType = detectDisplayType(normalizedName);
    const colorValue = generateColorValue(normalizedName, displayType);

    seedData.push({
      name: normalizedName,
      displayType,
      colorValue,
    });
  }

  return seedData;
}

@Injectable()
class SeedService {
  constructor(
    @InjectModel(ColorVariantSchemaClass.name)
    private readonly colorVariantModel: Model<ColorVariantSchemaClass>,
  ) {}

  async run() {
    console.log('🌱 Starting color variant seed...\n');

    const seedData = generateSeedData();
    console.log(`📝 Generated ${seedData.length} color variants to seed\n`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const color of seedData) {
      try {
        const nameNormalized = color.name.toLowerCase().trim();

        const existing = await this.colorVariantModel.findOne({
          nameNormalized,
        });

        if (existing) {
          skipped++;
          console.log(`⏭️  Skipped (exists): ${color.name}`);
          continue;
        }

        await this.colorVariantModel.create({
          name: color.name,
          nameNormalized,
          displayType: color.displayType,
          display: {
            colorValue: color.colorValue || null,
            patternImage: null,
          },
          order: created,
        });

        created++;
        console.log(`✅ Created: ${color.name}`);
      } catch (error: any) {
        if (error.code === 11000) {
          skipped++;
          console.log(`⏭️  Skipped (duplicate): ${color.name}`);
        } else {
          failed++;
          console.error(`❌ Failed: ${color.name} - ${error.message}`);
        }
      }
    }

    console.log('\n📊 Seed Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total: ${seedData.length}`);
    console.log('\n🎉 Seed completed!');
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    MongooseModule.forFeature([
      { name: ColorVariantSchemaClass.name, schema: ColorVariantSchema },
    ]),
  ],
  providers: [SeedService],
})
class SeedModule {}

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);
  await app.get(SeedService).run();
  await app.close();
};

void runSeed();
