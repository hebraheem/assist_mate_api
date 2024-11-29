import { model as _model } from 'mongoose';

class PaginatedQuery {
  constructor({ req, res, model, where, include, select, orderBy }) {
    this.req = req;
    this.res = res;
    this.model = model;
    this.where = where || {};
    this.include = include;
    this.select = select;
    this.orderBy = orderBy;
  }

  async performQuery() {
    try {
      const page = parseInt(this.req.query.page) || 1;
      const limit = parseInt(this.req.query.limit) || 100;
      const skip = (page - 1) * limit;

      if (this.req?.queryFilter) {
        // return only the current user document
        this.where.createdBy = this.req.queryFilter.createdBy;
      }

      // Find documents and get total count
      const [data, total] = await Promise.all([
        _model(this.model)
          .find(this.where)
          .select(this.select)
          .sort(this.orderBy)
          .skip(skip)
          .limit(limit)
          .populate(this.include || ''),
        _model(this.model).countDocuments(this.where),
      ]);

      // Check for out-of-bounds pages
      if (page > 1 && skip >= total) {
        return this.res
          .status(404)
          .json({ error: 'Page out of bounds', status: 'failed' });
      }

      // Send paginated response
      this.res.status(200).json({
        total,
        pagination: {
          page,
          limit,
          pageCount: Math.ceil(total / limit),
          totalCount: total,
        },
        data,
      });
    } catch (error) {
      this.res.status(500).json({
        error: error.message || 'An error occurred',
        status: 'failed',
      });
    }
  }
}

export default PaginatedQuery;
