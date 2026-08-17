import { S3mini } from "s3mini";

import { appenv } from "@/lib/appenv";

export const s3mini = new S3mini({
  region: "auto",
  endpoint: `${appenv.R2_ENDPOINT}/${appenv.R2_BUCKET}`,
  accessKeyId: appenv.R2_ACCESS_KEY_ID,
  secretAccessKey: appenv.R2_SECRET_ACCESS_KEY,
});
