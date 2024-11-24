import express from 'express';
import db from './db.mjs';
const router = express.Router();
router.get("/", (req, res) => {
  res.send({
    message: "chapter"
  });
});
// Fetch chapter details from the database based on the slug
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    // Query to fetch the chapter details by slug
    const chapterQuery = `
      SELECT * FROM chapters
      WHERE slug = ?
    `;
    // Query to fetch the associated novel details (if needed)
    const novelQuery = `
      SELECT * FROM novels
      WHERE slug = ?
    `;
    // Fetch chapter data from the database
    const chapterData = await db.query(chapterQuery, [slug]);
    if (!chapterData || chapterData.length === 0) {
      return res.status(404).send({ message: "Chapter not found" });
    }
    const chapter = chapterData[0]; // Assuming only one chapter is returned
    const chapterImages = []; // You can adjust this as needed, depending on how images are stored in your DB
    // Fetch related novel data (optional)
    const novelData = await db.query(novelQuery, [slug]);
    const novel = novelData[0]; // Assuming only one novel is returned
    // Structure the response
    const responseObj = {
      chapter_endpoint: `/chapter/${slug}/`,
      chapter_name: chapter.title,
      title: novel ? novel.title : chapter.title, // Using the novel title or chapter title
      chapter_pages: chapter.pages, // Assuming there's a pages field in the chapters table
      chapter_image: chapterImages // You can populate this with image URLs if needed
    };
    res.json(responseObj);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      status: false,
      message: error.message,
      chapter_image: []
    });
  }
});
export default router;