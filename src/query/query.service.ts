import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import {
  SponsorResponse,
  Sponsorship,
  ViewerResponse,
} from 'src/model/sponsor';

@Injectable()
export class QueryService {
  private readonly URL = 'https://api.github.com/graphql';

  constructor(private httpService: HttpService) {}

  getUserByToken(token: string): Observable<ViewerResponse> {
    return this.httpService
      .post(
        this.URL,
        JSON.stringify({
          query: this.getUserByViewerQuery(),
          variables: {},
        }),
        this.getConfig(token),
      )
      .pipe(map((req) => req.data.data.viewer));
  }

  isSponsoredBy(loginName: string): Observable<boolean> {
    return this.httpService
      .post(
        this.URL,
        JSON.stringify({
          query: this.getSponsoredByQuery(),
          variables: { loginName },
        }),
        this.getConfig(),
      )
      .pipe(
        map(
          (req) =>
            req.data.data.user?.isSponsoringViewer ||
            req.data.data.organization?.isSponsoringViewer,
        ),
      );
  }

  isSponsoringTo(loginName: string): Observable<boolean> {
    return this.httpService
      .post(
        this.URL,
        JSON.stringify({
          query: this.getSponsoringToQuery(),
          variables: { loginName },
        }),
        this.getConfig(),
      )
      .pipe(
        map(
          (req) =>
            req.data.data.user?.viewerIsSponsoring ||
            req.data.data.organization?.viewerIsSponsoring,
        ),
      );
  }

  getSponsor(loginName: string): Observable<Sponsorship> {
    return this.httpService
      .post(
        this.URL,
        JSON.stringify({
          query: this.getSponsorByLoginForViewer(),
          variables: { loginName },
        }),
        this.getConfig(),
      )
      .pipe(
        map((req) => {
          const data = req.data.data.user ?? req.data.data.organization;
          const isUser = req.data.data.user != null;
          const sponsor: Sponsorship = {
            sponsorEntity: {
              __typename: isUser ? 'User' : 'Organization',
              email: data.email,
              login: data.login,
              name: data.name,
            },
            tier: data.sponsorshipForViewerAsSponsorable.tier,
            isOneTimePayment:
              data.sponsorshipForViewerAsSponsorable.isOneTimePayment,
            tierSelectedAt:
              data.sponsorshipForViewerAsSponsorable.tierSelectedAt,
          };
          return sponsor;
        }),
      );
  }

  getListOfSponsors(cursor?: string): Observable<SponsorResponse> {
    if (cursor) {
      return this.httpService
        .post(
          this.URL,
          JSON.stringify({
            query: this.getSponsorQueryWithCursor(),
            variables: { cursor },
          }),
          this.getConfig(),
        )
        .pipe(map((req) => req.data.data.viewer.sponsorshipsAsMaintainer));
    } else {
      return this.httpService
        .post(
          this.URL,
          JSON.stringify({
            query: this.getSponsorQuery(),
            variables: {},
          }),
          this.getConfig(),
        )
        .pipe(map((req) => req.data.data.viewer.sponsorshipsAsMaintainer));
    }
  }

  private getSponsorQuery() {
    return `#graphql
    query {
  viewer {
    sponsorshipsAsMaintainer(includePrivate: true, first: 100) {
      edges {
        node {
          sponsorEntity {
            __typename
            ... on User {
              login
              email
              name
            }
            ... on Organization {
              login
              email
              name
            }
          }
          tier {
            id
            name
            isOneTime
            isCustomAmount
            closestLesserValueTier {
              id
              name
            }
          }
          isOneTimePayment
          tierSelectedAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
    `;
  }

  private getSponsorQueryWithCursor() {
    return `#graphql
    query($cursor: String!) {
  viewer {
    sponsorshipsAsMaintainer(includePrivate: true, first: 50, after: $cursor) {
      edges {
        node {
          sponsorEntity {
            __typename
            ... on User {
              login
              email
              name
            }
            ... on Organization {
              login
              email
              name
            }
          }
          tier {
            id
            name
            isOneTime
            isCustomAmount
            closestLesserValueTier {
              id
              name
            }
          }
          isOneTimePayment
          tierSelectedAt
        }
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
      }
    }
  }
}
    `;
  }

  private getSponsoringToQuery() {
    return `#graphql 
      query (
                $loginName: String!
            ) {
                user(login: $loginName) {
                    viewerIsSponsoring
                }
                organization(login: $loginName) {
                    viewerIsSponsoring
                }
            }`;
  }

  private getSponsorByLoginForViewer() {
    return `#graphql
    query ($loginName: String!) {
      user(login: $loginName) {
        sponsorshipForViewerAsSponsorable {
          tier {
            id
            name
            isOneTime
            isCustomAmount
            closestLesserValueTier {
              id
              name
            }
          }
          id
          isOneTimePayment
          tierSelectedAt
        }
        login
        name
        email
      }
      organization(login: $loginName) {
        sponsorshipForViewerAsSponsorable {
          tier {
            id
            name
            isOneTime
            isCustomAmount
            closestLesserValueTier {
              id
              name
            }
          }
          id
          isOneTimePayment
          tierSelectedAt
        }
        login
        name
        email
      }
    }`;
  }

  private getUserByViewerQuery() {
    return `#graphql
    query {
      viewer {
        login
        email
        name
      }
    }`;
  }

  private getSponsoredByQuery() {
    return `#graphql
    query ($loginName: String!) {
      user(login: $loginName) {
        isSponsoringViewer
      }
      organization(login: $loginName) {
        isSponsoringViewer
      }
    }`;
  }

  private getConfig(token?: string): AxiosRequestConfig<any> {
    const usedToken = token ? token : process.env.TOKEN;
    const headers: AxiosRequestHeaders = {
      Authorization: 'bearer ' + usedToken,
    };
    const configs: AxiosRequestConfig = {
      headers,
    };
    return configs;
  }
}
