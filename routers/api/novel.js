///www/wwwroot/localhost.com/light-novel-site/server/api/novel.js
import { fetchChaptersByNovelId } from '../novels';
export default defineEventHandler(async (event) => {
  const { type, novelId } = getQuery(event); // Get query parameter
  let response = {};
    // If novelId is provided, fetch the novel details and its chapters
    const novel = await fetchNovelById(novelId);
    const chapters = await fetchChaptersByNovelId(novelId);
    response = { novel, chapters };
  return response;
});
