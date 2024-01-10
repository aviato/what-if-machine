import { CF_WORKER_URL, R2_SECRET } from '$env/static/private';

export async function saveImage(imageBuffer: Buffer, answerId: string) {
  if (!CF_WORKER_URL) {
    throw new Error("You must provide a worker URL.");
  }

  if (!R2_SECRET) {
    throw new Error("You must provide a R2 secret.");
  }

  try {
    const r2ReqHeaders = new Headers();

    // Required for CF worker requests
    r2ReqHeaders.set("X-Custom-Auth-Key", R2_SECRET as string);
    r2ReqHeaders.set("Content-Type", "image/jpeg");

    // Save image to cloud storage via cloudflare worker
    // https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
    await fetch(`${CF_WORKER_URL}${answerId}` as string, {
      method: "PUT",
      headers: r2ReqHeaders,
      body: imageBuffer,
    });
  } catch (e) {
    console.error("Error saving image with cloudflare worker.");
    console.error(e);
  }
}
