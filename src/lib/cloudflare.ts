import dotenv from "dotenv";
dotenv.config();

export async function saveImage(imageBuffer: Buffer, answerId: string) {
  if (!process.env.CF_WORKER_URL) {
    throw new Error("You must provide a worker URL.");
  }

  if (!process.env.R2_SECRET) {
    throw new Error("You must provide a R2 secret.");
  }

  try {
    const r2ReqHeaders = new Headers();

    // Required for CF worker requests
    r2ReqHeaders.set("X-Custom-Auth-Key", process.env.R2_SECRET as string);
    r2ReqHeaders.set("Content-Type", "image/jpeg");

    // Save image to cloud storage via cloudflare worker
    // https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
    await fetch(`${process.env.CF_WORKER_URL}${answerId}` as string, {
      method: "PUT",
      headers: r2ReqHeaders,
      body: imageBuffer,
    });
  } catch (e) {
    console.error("Error saving image with cloudflare worker.");
    console.error(e);
  }
}
