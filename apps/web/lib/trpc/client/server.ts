import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import { type AppRouter } from '@repo/api';

function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return 'http://localhost:3001';
}

export const apiServer = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getApiUrl()}/trpc`,
      transformer: superjson,
    }),
  ],
});
