import redis from './redis';

// Cache key constants for all features
export const CACHE_KEYS = {
  // University Programs
  UNI_PROGRAMS: {
    ALL: '/university-programs/',
    BY_ID: (id: string) => `/university-programs/${id}`,
    PUBLIC: (page: number, limit: number) => `/university-programs/public?page=${page}&limit=${limit}`,
    BY_UNIVERSITY: (uniId: string) => `/university-programs/uni/${uniId}`
  },
  
  // Free Courses
  FREE_COURSES: {
    ALL: '/free-courses/',
    BY_ID: (id: string) => `/free-courses/${id}`,
    PUBLIC: (page: number, limit: number) => `/free-courses/public?page=${page}&limit=${limit}`
  },
  
  // Professional Courses
  PROFESSIONAL_COURSES: {
    ALL: '/professional-courses/',
    BY_ID: (id: string) => `/professional-courses/${id}`,
    PUBLIC: (page: number, limit: number) => `/professional-courses/public?page=${page}&limit=${limit}`
  },
  
  // Events
  EVENTS: {
    ALL: '/events/',
    BY_ID: (id: string) => `/events/${id}`,
    PUBLIC: (page: number, limit: number) => `/events/public?page=${page}&limit=${limit}`
  },
  
  // Careers
  CAREERS: {
    ALL: '/careers/',
    BY_ID: (id: string) => `/careers/${id}`,
    PUBLIC: (page: number, limit: number) => `/careers/public?page=${page}&limit=${limit}`
  },
  
  // Jobs
  JOBS: {
    ALL: '/jobs/',
    BY_ID: (id: string) => `/jobs/${id}`,
    PUBLIC: (page: number, limit: number) => `/jobs/public?page=${page}&limit=${limit}`
  },
  
  // Scholarships
  SCHOLARSHIPS: {
    ALL: '/scholarships/',
    BY_ID: (id: string) => `/scholarships/${id}`,
    PUBLIC: (page: number, limit: number) => `/scholarships/public?page=${page}&limit=${limit}`
  },
  
  // Grants
  GRANTS: {
    ALL: '/grants/',
    BY_ID: (id: string) => `/grants/${id}`,
    PUBLIC: (page: number, limit: number) => `/grants/public?page=${page}&limit=${limit}`
  },
  
  // Fellowships
  FELLOWSHIPS: {
    ALL: '/fellowships/',
    BY_ID: (id: string) => `/fellowships/${id}`,
    PUBLIC: (page: number, limit: number) => `/fellowships/public?page=${page}&limit=${limit}`
  },
  
  // Admin Management
  ADMIN: {
    ALL: '/admin-management/list',
    BY_ID: (id: string) => `/admin-management/list/${id}`
  }
};

// Cache duration constants
export const CACHE_DURATION = {
  SHORT: 1800,    // 30 minutes
  MEDIUM: 3600,   // 1 hour
  LONG: 7200,     // 2 hours
  DAY: 86400      // 24 hours
};

// Helper function to invalidate cache for a specific feature
export const invalidateCache = async (feature: string, itemId?: string) => {
  try {
    const keys = CACHE_KEYS[feature as keyof typeof CACHE_KEYS];
    if (!keys) {
      console.error(`Unknown feature: ${feature}`);
      return;
    }

    // Invalidate all items cache
    if (keys.ALL) {
      await redis.del(keys.ALL);
    }

    // Invalidate specific item cache
    if (itemId && keys.BY_ID) {
      await redis.del(keys.BY_ID(itemId));
    }

    // Invalidate public caches (for paginated results)
    if ('PUBLIC' in keys && typeof keys.PUBLIC === 'function') {
      // Delete common pagination patterns
      for (let page = 1; page <= 10; page++) {
        for (let limit of [10, 20, 50]) {
          await redis.del(keys.PUBLIC(page, limit));
        }
      }
    }

    console.log(`✅ Cache invalidated for ${feature}${itemId ? ` (ID: ${itemId})` : ''}`);
  } catch (error) {
    console.error(`❌ Cache invalidation error for ${feature}:`, error);
  }
};

// Helper function to invalidate all caches (for admin operations)
export const invalidateAllCaches = async () => {
  try {
    const allKeys = Object.values(CACHE_KEYS).flatMap(feature => 
      Object.values(feature).filter(key => typeof key === 'string')
    );
    
    for (const key of allKeys) {
      await redis.del(key as string);
    }
    
    console.log('✅ All caches invalidated');
  } catch (error) {
    console.error('❌ Cache invalidation error:', error);
  }
};

// Helper function to get cached data
export const getCachedData = async (key: string) => {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log("✅ Returning cached data");
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    console.error('❌ Cache retrieval error:', error);
    return null;
  }
};

// Helper function to set cached data
export const setCachedData = async (key: string, data: any, duration: number = CACHE_DURATION.MEDIUM) => {
  try {
    await redis.setEx(key, duration, JSON.stringify(data));
    console.log(`✅ Data cached with key: ${key}`);
  } catch (error) {
    console.error('❌ Cache setting error:', error);
  }
};

// Helper function to generate cache key for user-specific data
export const getUserCacheKey = (baseKey: string, userId: string) => {
  return `${baseKey}user/${userId}`;
};

// Helper function to check if Redis is connected
export const isRedisConnected = () => {
  return redis.isReady;
};

export default {
  CACHE_KEYS,
  CACHE_DURATION,
  invalidateCache,
  invalidateAllCaches,
  getCachedData,
  setCachedData,
  getUserCacheKey,
  isRedisConnected
};
