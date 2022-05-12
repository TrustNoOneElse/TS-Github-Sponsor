import { Injectable } from '@nestjs/common';
import { firstValueFrom, switchMap } from 'rxjs';
import { SponsorResponse } from 'src/model/sponsor';
import { QueryService } from 'src/query/query.service';

@Injectable()
export class ViewerService {
  constructor(private queryService: QueryService) {}

  isSponsoredBy(loginName: string) {
    return this.queryService.isSponsoredBy(loginName);
  }

  isSponsoring(loginName: string) {
    return this.queryService.isSponsoringTo(loginName);
  }

  getSponsorByToken(token: string) {
    return this.queryService
      .getUserByToken(token)
      .pipe(switchMap((data) => this.queryService.getSponsor(data.login)));
  }

  getSponsor(loginName: string) {
    return this.queryService.getSponsor(loginName);
  }

  async getAllSponsors() {
    let result: SponsorResponse = { edges: [], pageInfo: null };
    let data;
    while ((data = await this.fetchSponsors().next())) {
      result.edges.push(...data.edges);
    }
    return result;
  }

  async *fetchSponsors(): AsyncGenerator<SponsorResponse | null> {
    let hasNextPage = false;
    let nextCursor = null;
    do {
      const sponsors = await firstValueFrom(
        this.queryService.getListOfSponsors(nextCursor),
      );
      nextCursor = sponsors.pageInfo.endCursor;
      hasNextPage = sponsors.pageInfo.hasNextPage;
      yield sponsors;
    } while (hasNextPage);
    yield null;
  }
}
