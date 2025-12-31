//src\utils\pagination.ts
export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export const getPaginationMeta = (
  total: number,
  page: number = 1,
  perPage: number = 30
) => {
  const totalPages = Math.max(Math.ceil(total / perPage), 1);
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  return {
    total,
    page: currentPage,
    perPage,
    totalPages,
    skip: (currentPage - 1) * perPage,
  };
};
