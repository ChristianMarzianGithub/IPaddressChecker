export type Flags = {
  datacenter: boolean;
  proxy: boolean;
  vpn: boolean;
  tor?: boolean;
};

export type LookupResult = {
  ip: string;
  version: number;
  reverse: string | null;
  geo: {
    country: string | null;
    region: string | null;
    city: string | null;
  };
  asn: string | null;
  isp: string | null;
  flags: Flags;
};
