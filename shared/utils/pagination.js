export const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

export const paginateResponse = (count, page, limit, data) => {
  return {
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data
  };
};
