import GymSettings from '../models/gymSettings.model.js';
import { cacheManager } from '../utils/cache.util.js';

export const getGymSettingsService = async () => {
  // ✅ Check cache first (sub-1ms response!)
  const cacheKey = 'gym:settings:main';
  const cached = cacheManager.get(cacheKey);

  if (cached) {
    console.log('✅ Cache hit for gym settings');
    return cached;
  }

  // ❌ Cache miss - fetch from database (50-100ms)
  console.log('❌ Cache miss - fetching gym settings from DB');
  let doc = await GymSettings.findOne();
  if (!doc) {
    doc = await GymSettings.create({});
  }

  // ✅ Store in cache for 15 minutes
  cacheManager.set(cacheKey, doc, 15 * 60 * 1000);
  return doc;
};

export const upsertGymSettingsService = async (data) => {
  const doc = await GymSettings.findOneAndUpdate({}, data, { new: true, upsert: true });

  // ✅ Clear cache when settings are updated
  cacheManager.delete('gym:settings:main');

  return doc;
};
