export type SponsorResponse = {
  edges: SponsorshipEdge[];
  pageInfo: PageInfo;
};

export type PageInfo = {
  endCursor: string;
  hasNextPage: boolean;
};

export type ViewerResponse = {
  login: string;
  name: string;
  email: string;
};

export type SponsorshipEdge = {
  node: Sponsorship;
};

export type Sponsorship = {
  tierSelectedAt: string;
  tier: Tier;
  isOneTimePayment: boolean;
  sponsorEntity: SponsorEntity;
};

export type SponsorEntity = {
  __typename: 'User' | 'Organization';
  login: string;
  email: string;
};

export type Tier = {
  id: string;
  name: string;
  isOneTime: boolean;
  isCustomAmount: boolean;
  closestLesserValueTier: Tier;
};
