import { ImageResponse } from "next/og";

const TAMANOS: Record<string, number> = { "192": 192, "512": 512, maskable: 512, apple: 180 };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const px = TAMANOS[size];
  if (!px) return new Response("No encontrado", { status: 404 });
  const maskable = size === "maskable";
  const radio = maskable ? 0 : Math.round(px * 0.22);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: px * (maskable ? 0.42 : 0.56),
          fontWeight: 800,
          borderRadius: radio,
          letterSpacing: -px * 0.02,
        }}
      >
        LR
      </div>
    ),
    { width: px, height: px },
  );
}
