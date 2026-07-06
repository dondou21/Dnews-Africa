import { searchRepository, SearchParams } from "../repositories/searchRepository";

export const searchService = {
  async search(params: SearchParams) {
    const normalizedSort = params.sort === "relevance" ? "latest" : params.sort;
    return searchRepository.search({ ...params, sort: normalizedSort });
  },
};
