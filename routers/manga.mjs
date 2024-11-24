import express from 'express';
import db from './db.mjs';
import redis from './redis.mjs';
const router = express.Router();
router.get("/manga/page/:pagenumber", async (req, res) => {
  let pagenumber = req.params.pagenumber;
  const pageLimit = 10;  // Set number of results per page
  const offset = (pagenumber - 1) * pageLimit;
  const cacheKey = `mangaPages111:${pagenumber}`;
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    // If data is in cache, return it
    console.log('Returning manga page from cache');
    return res.json(JSON.parse(cachedData));
  }
  try {
    const [rows] = await db.execute(`
      SELECT * FROM novels
      WHERE is_public = 0
      ORDER BY updated_at DESC
      LIMIT  ${offset}, ${pageLimit}
    `);
    const manga_list = rows.map(row => {
      return {
        title: row.title,                // assuming title is a column in the 'novels' table
        endpoint: row.novel_id,          // assuming endpoint is a column in the 'novels' table
        type: row.type,                  // assuming type is a column in the 'novels' table
        updated_on: row.updated_timestamp,      // assuming updated_at is a column in the 'novels' table
        thumb: row.image_file,            // assuming thumbnail is a column in the 'novels' table
        chapter: row.chapter_count,      // assuming chapter_count is a column in the 'novels' table
      };
    });
    // Cache the result in Redis for 1 hour
    await redis.setex(cacheKey, 3, JSON.stringify(manga_list));
    return res.status(200).json({
      status: true,
      message: "success",
      manga_list,
    });
  } catch (err) {
    res.send({
      status: false,
      message: err,
      manga_list: [],
    });
  }
});
router.get("/manga/detail/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const [novel] = await db.execute(`
      SELECT * FROM novels
      WHERE slug = ? AND is_public = 0
    `, [slug]);
    if (novel.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Manga not found",
      });
    }
    const [chapters] = await db.execute(`
      SELECT * FROM chapters
      WHERE novel_id = ?
      ORDER BY chapter_number ASC
    `, [novel[0].id]);
    const [genres] = await db.execute(`
      SELECT genre_name FROM genres
      WHERE novel_id = ?
    `, [novel[0].id]);
    res.status(200).json({
      title: novel[0].title,
      type: novel[0].type,
      author: novel[0].author,
      status: novel[0].status,
      manga_endpoint: slug,
      thumb: novel[0].thumb_url,
      genre_list: genres,
      synopsis: novel[0].synopsis,
      chapter: chapters,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: false,
      message: error,
    });
  }
});
router.get("/search/", async (req, res) => {
  const query = req.query.q;
  try {
    const [rows] = await db.execute(`
      SELECT * FROM novels
      WHERE title LIKE ? AND is_public = 0
    `, [`%${query}%`]);
    res.status(200).json({
      status: true,
      message: "success",
      manga_list: rows,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error.message,
    });
  }
});
router.get("/genres", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT * FROM genres
    `);
    res.status(200).json({
      status: true,
      message: "success",
      list_genre: rows,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error,
    });
  }
});
router.get("/genres/:slug/:pagenumber", async (req, res) => {
  const slug = req.params.slug;
  const pagenumber = req.params.pagenumber;
  const pageLimit = 10;
  const offset = (pagenumber - 1) * pageLimit;
  try {
    const [rows] = await db.execute(`
      SELECT * FROM novels
      WHERE genre LIKE ? AND is_public = 0
      ORDER BY updated_at DESC
      LIMIT ?, ?
    `, [`%${slug}%`, offset, pageLimit]);
    res.status(200).json({
      status: true,
      message: "success",
      manga_list: rows,
    });
  } catch (error) {
    res.send({
      status: false,
      message: error,
      manga_list: [],
    });
  }
});
export default router;