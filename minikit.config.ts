
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjMyMjE5MywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDUzNTFBYmZhOTAyMkQxRTgxMTdiMTFjYTM1NTZkZTQxNjRBZDM0ZmQifQ",
    payload: "eyJkb21haW4iOiJidWNrZXQtbGlzdC1iYXNlLnZlcmNlbC5hcHAifQ",
    signature: "QMTXHZ+1vVhRC7TN+rBcbM4Z+oTk++KUlDP6OMBfijZPH1oUfsncEkJ7m+n0/7aK9zuuIy9E7oKEbMvGbw0WQhs=",
  },
  baseBuilder: {
    ownerAddress: "",
  },
  miniapp: {
    version: "1",
    name: "Bucket List",
    subtitle: "Your dreams, on-chain",
    description: "Store your bucket list items on-chain on Base. Pay 0.0001 ETH per item and explore community lists.",
    screenshotUrls: [],
    iconUrl: `https://bucket-list-base.vercel.app/icon.png`,
    splashImageUrl: `https://bucket-list-base.vercel.app/splash.png`,
    splashBackgroundColor: "#1e293b",
    homeUrl: `https://bucket-list-base.vercel.app`,
    webhookUrl: `https://bucket-list-base.vercel.app/api/webhook`,
    primaryCategory: "entertainment",
    tags: ["base", "bucketlist", "social", "onchain", "lifestyle"],
    heroImageUrl: `https://bucket-list-base.vercel.app/image.png`,
    tagline: "Your dreams, forever on-chain.",
    ogTitle: "Bucket List",
    ogDescription: "Store your bucket list items on-chain on Base. Pay 0.0001 ETH per item and explore community lists.",
    ogImageUrl: `https://bucket-list-base.vercel.app/image.png`,
  },
} as const;
