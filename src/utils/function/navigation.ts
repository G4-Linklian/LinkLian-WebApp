// src/utils/navigation.ts
import { NextRouter } from "next/router";

export const PushRouter = (
  router: NextRouter,
  path: string,
  field: string,
  id: string | number | undefined,
) => {
  router.push(`${path}?${field}=${id}`);
};
