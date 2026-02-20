import NodeCache from 'node-cache';

// TTL in seconds
// Default TTL: 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

export const getCache = <T>(key: string): T | undefined => {
    return cache.get<T>(key);
};

export const setCache = <T>(key: string, value: T, ttl?: number): boolean => {
    return cache.set(key, value, ttl || 3600);
};

export const deleteCache = (key: string | string[]): number => {
    return cache.del(key);
};

export const clearCacheByPrefix = (prefix: string): void => {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.startsWith(prefix));
    if (keysToDelete.length > 0) {
        cache.del(keysToDelete);
    }
};

export const flushCache = (): void => {
    cache.flushAll();
};

export default cache;
