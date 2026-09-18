import mockData from "../mocks/users-in-search.json";

import { User } from "./types";

// имитация сетевой задержки
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchGetUsers = async (
  full_name: string,
  platform: string,
  options?: { signal?: AbortSignal },
): Promise<{ users: User[] }> => {
  await delay(400);

  if (options?.signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const query = full_name.trim().toLowerCase();
  const platformQuery = platform.trim().toLowerCase();

  const filtered = (mockData.users as User[]).filter((user) => {
    const matchesName = user.full_name.toLowerCase().includes(query);
    const matchesPlatform = platformQuery
      ? user.platform.toLowerCase() === platformQuery
      : true;
    return matchesName && matchesPlatform;
  });

  return { users: filtered };
};
