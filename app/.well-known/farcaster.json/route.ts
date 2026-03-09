export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjI2ODQzOCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDIxODA4RUUzMjBlREY2NGMwMTlBNmJiMEY3RTRiRkIzZDYyRjA2RWMifQ",
      payload: "eyJkb21haW4iOiJiYXNlcGV0aXRpb24uY29tIn0",
      signature: "q4q3+A/9G1sDBofjIAG2sNrPkcixedcqvL6Gbn8Wr7pznVHlsS7gDcs3JI2EQ48NeP2GRZtkEIGQa5T9/+zv2hs=",
    },
    frame: {
      version: "1",
      name: "BasePetition",
      iconUrl: `${appUrl}/logo.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/farcaster-image`,
      buttonTitle: "BasePetition",
      splashImageUrl: `${appUrl}/logo.png`,
      splashBackgroundColor: "#8660cc",
      webhookUrl: `${appUrl}/api/webhook`,
      primaryCategory: "social",
      subtitle: "Create and sign petitions",
      description: "Create and sign petitions on Base",
      ogImageUrl: `${appUrl}/farcaster-image`,
      tags: ["farcaster", "petition", "base", "created", "basepetition"],
      heroImageUrl: `${appUrl}/farcaster-image`,
      tagline: "Create and sign petitions",
      ogTitle: "Create and sign petitions",
      ogDescription: "Create and sign petitions on Base",
      requiredChains: ["eip155:8453"],
    },
  };

  return Response.json(config);
}
