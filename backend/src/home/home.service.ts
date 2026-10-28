import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { checkRedisHealth } from '../cache/utils/redis-checker';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HomeService implements OnModuleInit {
  private version: string = 'unknown';

  constructor(private configService: ConfigService<AllConfigType>) {}

  onModuleInit() {
    this.version = this.readVersionFromFile();
  }

  appInfo() {
    return { name: this.configService.get('app.name', { infer: true }) };
  }

  async health() {
    if (this.version === 'unknown') {
      this.version = this.readVersionFromFile();
    }

    const redisUrl = this.configService.get('cache.redisUrl', { infer: true });
    let redisAvailable = false;
    try {
      redisAvailable = await checkRedisHealth(redisUrl);
    } catch {}

    return {
      status: 'ok',
      version: this.version,
      timestamp: new Date().toISOString(),
      redis: {
        status: redisAvailable ? 'up' : 'down',
      },
    };
  }

  private readVersionFromFile(): string {
    const versionFilePath = path.join(process.cwd(), 'version.json');
    const versionData = fs.readFileSync(versionFilePath, 'utf8');
    return JSON.parse(versionData).version;
  }
}
