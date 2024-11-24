import { fetchMostPopularNovels, fetchMostRecentNovels } from '../novels'; // Import functions to fetch novels
// Define API handler for fetching novels based on type
export default defineEventHandler(async (event) => {
  // Get the 'type' query parameter from the request URL
  const { type } = getQuery(event);
  let novels = [];
  // Check which type of novels to fetch (recent or popular)
  if (type === 'recent') {
    novels = await fetchMostRecentNovels();
  } else if (type === 'popular') {
    novels = await fetchMostPopularNovels();
  } else {
    // If 'type' is neither 'recent' nor 'popular', return an error
    return { error: 'Invalid type' };
  }
  // Return the fetched novels as a response
  return novels;
});
