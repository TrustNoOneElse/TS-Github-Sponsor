import { Injectable } from '@nestjs/common';
import { firstValueFrom, Observable, switchMap } from 'rxjs';
import { SponsorResponse, Sponsorship } from 'src/model/sponsor';
import { QueryService } from 'src/query/query.service';

@Injectable()
export class ViewerService {
  constructor(private queryService: QueryService) {}

  isSponsoredBy(loginName: string): Observable<boolean> {
    return this.queryService.isSponsoredBy(loginName);
  }

  isSponsoring(loginName: string): Observable<boolean> {
    return this.queryService.isSponsoringTo(loginName);
  }

  getSponsorByToken(token: string): Observable<Sponsorship> {
    return this.queryService
      .getUserByToken(token)
      .pipe(switchMap((data) => this.queryService.getSponsor(data.login)));
  }

  getSponsor(loginName: string): Observable<Sponsorship> {
    return this.queryService.getSponsor(loginName);
  }

  async getAllSponsors(): Promise<Sponsorship[]> {
    let result: Sponsorship[] = [];
    for await (const data of this.fetchSponsors()) {
      result.push(...data.edges.map((e) => e.node));
    }
    return result;
  }

  async *fetchSponsors(): AsyncIterable<SponsorResponse | null> {
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
