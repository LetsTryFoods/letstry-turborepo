import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '../../common/pagination';

@Injectable()
export class PaginationService {
  buildPaginationMeta(
    totalCount: number,
    page: number,
    limit: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(totalCount / limit);

    return {
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}
