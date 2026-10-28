import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read version.json once at module load time
let cachedVersion: Record<string, unknown>;
try {
  const versionPath = join(process.cwd(), 'version.json');
  const versionData = readFileSync(versionPath, 'utf8');
  cachedVersion = JSON.parse(versionData);
} catch {
  cachedVersion = { version: 'unknown', error: 'version.json not found' };
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'cchat-frontend',
    ...cachedVersion
  });
}
