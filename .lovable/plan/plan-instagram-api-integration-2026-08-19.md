# Plan - Instagram API Integration

Integrate the Instagram Basic Display API to automatically fetch and display the latest posts from `@sualojinhamakeup` in the "Siga a @sualojinhamakeup" section.

## User Review Required

> [!IMPORTANT]
> To integrate the Instagram API, you need to provide a **Long-Lived Access Token**. Since I cannot access your Facebook Developer account, you must:
> 1. Create an app on [Facebook Developers](https://developers.facebook.com/).
> 2. Add "Instagram Basic Display".
> 3. Generate a User Token for `@sualojinhamakeup`.
> 4. Provide the token via the `add_secret` tool once this plan is approved.

## Proposed Changes

### Backend (Server Functions)

#### [NEW] `src/lib/instagram.functions.ts`
- Create a server function `getInstagramPosts` to fetch media from the Instagram Basic Display API.
- Use `process.env.INSTAGRAM_ACCESS_TOKEN` for authentication.
- Implement caching to avoid hitting API limits.

### Frontend (Components)

#### `src/components/site/InstagramSection.tsx`
- Replace the static image implementation with a dynamic feed.
- Use `useQuery` to call the `getInstagramPosts` server function.
- Display a loading state while fetching.
- Map the API response (images/videos) to the grid layout.

## Technical Details

- **API Endpoint:** `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${token}`
- **Caching:** The server function will cache the response for 1 hour to optimize performance.
- **Security:** The access token will be stored securely as a secret in Lovable Cloud.
