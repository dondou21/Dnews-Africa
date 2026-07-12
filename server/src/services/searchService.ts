import { searchRepository, SearchParams } from "../repositories/searchRepository";
import { formatArticleList } from "../utils/formatArticle";

export const searchService = {
  async search(params: SearchParams) {
    const normalizedSort = params.sort === "relevance" ? "latest" : params.sort;
    const result = await searchRepository.search({ ...params, sort: normalizedSort });
    return {
      ...result,
      articles: formatArticleList(result.articles),
    };
  },
};
