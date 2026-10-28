import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

/**
 * Example controller demonstrating cache usage
 * This is for testing and demonstration purposes
 */
@ApiTags('Cache Test')
@Controller('cache-test')
export class CacheTestController {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Simple set operation with default TTL
   */
  @Get('set/:key/:value')
  @ApiOperation({ summary: 'Set a value in cache with default TTL' })
  @ApiParam({ name: 'key', description: 'Cache key' })
  @ApiParam({ name: 'value', description: 'Value to cache' })
  async setDefaultTTL(
    @Param('key') key: string,
    @Param('value') value: string,
  ) {
    await this.cacheManager.set(key, value);
    return {
      success: true,
      message: `Value set for key: ${key}`,
      key,
      value,
      ttl: 'default',
    };
  }

  /**
   * Set operation with custom TTL (in seconds)
   */
  @Get('set/:key/:value/:ttl')
  @ApiOperation({ summary: 'Set a value in cache with custom TTL' })
  @ApiParam({ name: 'key', description: 'Cache key' })
  @ApiParam({ name: 'value', description: 'Value to cache' })
  @ApiParam({ name: 'ttl', description: 'TTL in seconds' })
  async setCustomTTL(
    @Param('key') key: string,
    @Param('value') value: string,
    @Param('ttl') ttlSeconds: string,
  ) {
    const ttl = parseInt(ttlSeconds, 10) * 1000; // Convert to milliseconds
    await this.cacheManager.set(key, value, ttl);
    return {
      success: true,
      message: `Value set for key: ${key} with TTL: ${ttlSeconds}s`,
      key,
      value,
      ttl: `${ttlSeconds}s`,
    };
  }

  /**
   * Get operation
   */
  @Get('get/:key')
  @ApiOperation({ summary: 'Get a value from cache' })
  @ApiParam({ name: 'key', description: 'Cache key' })
  async get(@Param('key') key: string) {
    const value = await this.cacheManager.get(key);
    return {
      success: value !== undefined,
      key,
      value,
      found: value !== undefined,
    };
  }

  /**
   * Delete operation
   */
  @Get('delete/:key')
  @ApiOperation({ summary: 'Delete a value from cache' })
  @ApiParam({ name: 'key', description: 'Cache key to delete' })
  async delete(@Param('key') key: string) {
    await this.cacheManager.del(key);
    return {
      success: true,
      message: `Key deleted: ${key}`,
      key,
    };
  }

  /**
   * Test with object value
   */
  @Get('set-object/:key')
  @ApiOperation({ summary: 'Set an object in cache' })
  @ApiParam({ name: 'key', description: 'Cache key' })
  async setObject(@Param('key') key: string) {
    const value = {
      message: 'Test object',
      timestamp: new Date().toISOString(),
      data: {
        nested: true,
        array: [1, 2, 3],
      },
    };
    await this.cacheManager.set(key, value);
    return {
      success: true,
      message: `Object set for key: ${key}`,
      key,
      value,
    };
  }

  /**
   * Test TTL expiration
   */
  @Get('test-ttl-expiration')
  @ApiOperation({ summary: 'Test TTL expiration with 5 second TTL' })
  async testTTLExpiration() {
    const key = 'ttl-test-key';
    const value = 'This will expire in 5 seconds';
    const ttl = 5000; // 5 seconds

    await this.cacheManager.set(key, value, ttl);

    const immediateValue = await this.cacheManager.get(key);

    return {
      success: true,
      message: 'Value set with 5 second TTL. Check again after 5 seconds.',
      key,
      value: immediateValue,
      ttl: '5s',
      instruction: `Call GET /cache-test/get/${key} after 5 seconds to verify expiration`,
    };
  }

  /**
   * Bulk set operation
   */
  @Get('bulk-set/:count')
  @ApiOperation({ summary: 'Set multiple values in cache' })
  @ApiParam({ name: 'count', description: 'Number of items to set' })
  async bulkSet(@Param('count') countStr: string) {
    const count = parseInt(countStr, 10);
    const operations = Array.from({ length: count }, async (_, i) => {
      const key = `bulk-key-${i}`;
      const value = `bulk-value-${i}`;
      await this.cacheManager.set(key, value);
      return { key, value };
    });

    const results = await Promise.all(operations);

    return {
      success: true,
      message: `Set ${count} values in cache`,
      count,
      items: results,
    };
  }

  /**
   * Clear all cache
   */
  @Get('clear-all')
  @ApiOperation({ summary: 'Clear all cached values' })
  async clearAll() {
    await this.cacheManager.clear();
    return {
      success: true,
      message: 'All cache cleared',
    };
  }

  /**
   * Comprehensive test
   */
  @Get('run-tests')
  @ApiOperation({ summary: 'Run a comprehensive cache test suite' })
  async runTests() {
    const results: Array<{ test: string; passed: boolean }> = [];

    // Test 1: Set and get with default TTL
    await this.cacheManager.set('test1', 'value1');
    const test1Result = await this.cacheManager.get('test1');
    results.push({
      test: 'Set and get with default TTL',
      passed: test1Result === 'value1',
    });

    // Test 2: Set and get with custom TTL
    await this.cacheManager.set('test2', 'value2', 10000);
    const test2Result = await this.cacheManager.get('test2');
    results.push({
      test: 'Set and get with custom TTL (10s)',
      passed: test2Result === 'value2',
    });

    // Test 3: Object value
    const objValue = { test: true, data: [1, 2, 3] };
    await this.cacheManager.set('test3', objValue);
    const test3Result = await this.cacheManager.get('test3');
    results.push({
      test: 'Set and get object value',
      passed: JSON.stringify(test3Result) === JSON.stringify(objValue),
    });

    // Test 4: Delete
    await this.cacheManager.set('test4', 'to-delete');
    await this.cacheManager.del('test4');
    const test4Result = await this.cacheManager.get('test4');
    results.push({
      test: 'Delete operation',
      passed: test4Result === undefined,
    });

    // Test 5: Non-existent key
    const test5Result = await this.cacheManager.get('non-existent');
    results.push({
      test: 'Get non-existent key returns undefined',
      passed: test5Result === undefined,
    });

    const allPassed = results.every((r) => r.passed);

    return {
      success: allPassed,
      message: allPassed ? 'All tests passed!' : 'Some tests failed',
      results,
      totalTests: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
    };
  }
}
