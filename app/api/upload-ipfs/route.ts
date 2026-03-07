import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    const pinataMetadata = JSON.stringify({
      name: "Petition Image",
    });
    pinataFormData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    pinataFormData.append("pinataOptions", pinataOptions);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataFormData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Pinata error details:", errText);
      return NextResponse.json(
        { error: "Failed to upload to Pinata" },
        { status: res.status },
      );
    }

    const data = await res.json();

    return NextResponse.json({ IpfsHash: data.IpfsHash }, { status: 200 });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
