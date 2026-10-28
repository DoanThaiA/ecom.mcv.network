import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HealthService {
  /**
   * Get health status of worker service
   * @returns Object containing status, service name, version, and timestamp
   */
  getHealth() {
    let version = 'unknown';

    const versionFilePath = path.join(process.cwd(), 'version.json');
    const versionData = fs.readFileSync(versionFilePath, 'utf8');
    version = JSON.parse(versionData).version;

    return {
      status: 'ok',
      service: 'worker',
      version,
      timestamp: new Date().toISOString(),
    };
  }
}
