# Clerk Webhook Worker (Cloudflare) - Sync with Supabase

This Cloudflare Worker listens to Clerk user event webhooks (such as user.created, user.updated, and user.deleted) and synchronizes the data with a Supabase PostgreSQL database. The worker automatically updates Supabase whenever a new user is created, updated, or deleted in Clerk.

## Features

- Handles Clerk webhook events (user.created, user.updated, user.deleted).
- Syncs Clerk users with Supabase by performing inserts, updates, and deletions.
- Built using Cloudflare Workers for serverless execution.
- Uses Supabase's REST API with a service role key for full database access

## Installation

1. Clone this repository to your local machine.

```sh
git clone https://github.com/supabase/clerk-supabase-worker.git
```

2. Install Wrangler CLI

```sh
npm install -g @cloudflare/wrangler
```

3. Configure Environment Variables

You can use Wrangler Secrets to set your variables securely:

```sh
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put CLERK_WEBHOOK_SECRET
```

4. Configure Clerk Webhook

Configure Clerk to send user event webhooks to your Cloudflare Worker endpoint.

- Go to the Clerk Dashboard > Webhooks.
- Add a new webhook URL pointing to your Cloudflare Worker deployment.
- Example: https://<your-worker>.workers.dev/.

5. Worker deployment

```sh
wrangler publish
```

## Wrangler Commands

- `wrangler publish`: Deploys the worker to Cloudflare.
- `wrangler dev`: Starts a local development server for testing.
- `wrangler secret put <VARIABLE_NAME>`: Sets a secret variable.
- `wrangler secret delete <VARIABLE_NAME>`: Deletes a secret variable.
- `wrangler tail`: Tails the worker logs.

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE.md) file for more details.
