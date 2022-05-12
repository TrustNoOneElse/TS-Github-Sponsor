import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { filter, map, Observable, of, tap } from 'rxjs';
import { AxiosResponse, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { SponsorResponse, ViewerResponse } from 'src/model/sponsor';

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
        // @ts-ignore
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
        // @ts-ignore
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
        // @ts-ignore
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

  getSponsor(loginName: string): Observable<any> {
    return this.httpService
      .post(
        this.URL,
        JSON.stringify({
          query: this.getSponsorByLoginForViewer(),
          variables: { loginName },
        }),
        // @ts-ignore
        this.getConfig(),
      )
      .pipe(map((req) => req.data.data.viewer.sponsorshipsAsMaintainer));
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
          // @ts-ignore
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
          // @ts-ignore
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
            }
            ... on Organization {
              login
              email
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
            }
            ... on Organization {
              login
              email
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
    const config: AxiosRequestConfig = {
      headers,
    };
    return config;
  }
}
