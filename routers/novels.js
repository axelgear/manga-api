import db from './db.mjs'; // Import MySQL connection pool
import redis from './redis'; // Import Redis client
// Fetch the most recent novels
export async function fetchMostRecentNovels() {
  // Check if the data is in Redis cache
  const cacheKey = 'RecentN';
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    // If data is found in Redis, return it
    console.log('Returning recent novels from cache');
    return JSON.parse(cachedData);
  }
  // If not in cache, fetch the data from MySQL database
  const [rows] = await db.execute(`
    SELECT * FROM novels
    WHERE is_public = 0
    ORDER BY created_timestamp DESC
    LIMIT 5
  `);
  // Cache the result in Redis for 1 hour
  await redis.setex(cacheKey, 3, JSON.stringify(rows));
  return rows;
}
// Fetch the most popular novels
export async function fetchMostPopularNovels() {
  // Check if the data is in Redis cache
  const cacheKey = 'PopularN';
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    // If data is found in Redis, return it
    console.log('Returning popular novels from cache');
    return JSON.parse(cachedData);
  }
  // If not in cache, fetch the data from MySQL database
  const [rows] = await db.execute(`
    SELECT * FROM novels
    WHERE is_public = 0
    ORDER BY likes DESC
    LIMIT 5
  `);
  // Cache the result in Redis for 1 hour
  await redis.setex(cacheKey, 3, JSON.stringify(rows));
  return rows;
}
// Fetch chapters by novel ID
export async function fetchChaptersByNovelId(novelId) {
    // Check if the chapters are in Redis cache
    const cacheKey = `novel:${novelId}:chapters`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      // If data is found in Redis, return it
      console.log('Returning chapters from cache');
      return JSON.parse(cachedData);
    }
    // If not in cache, fetch the data from MySQL database
    const [rows] = await db.execute(`
      SELECT * FROM chapters
      WHERE novel_id = ?
      ORDER BY chapter_number ASC
    `, [novelId]);
    // Cache the result in Redis for 1 hour
    await redis.setex(cacheKey, 3, JSON.stringify(rows));
    return rows;
  }
// Fetch a novel by its ID with Redis caching
export async function fetchNovelById(novelId) {
    const cacheKey = `novel:${novelId}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
        // If data is found in Redis, return it
        console.log('Returning novel from cache');
        return JSON.parse(cachedData);
    }
    // Fetch the novel from the MySQL database
    const [rows] = await db.execute(`
      SELECT * FROM novels
      WHERE id = ?
      LIMIT 1
    `, [novelId]);
    // If no novel is found, return null
    if (rows.length === 0) {
      return null;
    }
    // Cache the result in Redis for 1 hour (3600 seconds)
    await redis.setex(cacheKey, 3, JSON.stringify(rows[0]));
    return rows[0];
}
