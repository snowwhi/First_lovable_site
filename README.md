# Blog Platform

A full-stack blogging platform built with React, TypeScript, and Appwrite. Supports rich text editing, featured images, text-to-speech, and per-user post ownership.

## Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Appwrite (Auth, Database, Storage)
- **Editor**: TinyMCE (GPL, self-hosted)

## Setup

```bash
npm install
npm run dev
```

**.env**
```env
VITE_APPWRITE_URL=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_COLLECTION_ID=
VITE_APPWRITE_BUCKET_ID=
```

**Appwrite Collection** (`article`)

| Attribute     | Type   | Required |
|---------------|--------|----------|
| Title         | String | Yes      |
| Content       | String | Yes      |
| featuredimage | String | No       |
| status        | String | Yes      |

**Storage**: Set bucket permissions → Role `Any` → `Read`.

---

## Bug History

A log of every bug encountered and resolved during development.

---

**1. `allText` ReferenceError — TextToSpeech.tsx**
Variable declared as `all` but referenced as `allText`. Renamed to match.

---

**2. Featured image not displaying**
Appwrite `uploadFile()` returns a file ID, not a URL. Added `getFileView(fileId)` to `databaseService.ts` to convert the ID into a usable CDN URL. Used `getFileView` over `getFilePreview` — the latter can fail for certain file types.

---

**3. Field name case mismatch — `featuredImage` vs `featuredimage`**
Appwrite attribute names are case-sensitive. The collection attribute was `featuredimage` (lowercase) but the code used `featuredImage` (camelCase) in several places, causing the field to be silently ignored. Fixed consistently across all files.

---

**4. `getFileView` called before post loads**
`imageUrl` was computed at the top of the component before the post fetch completed, passing `undefined` as the file ID and throwing `AppwriteException: Missing required parameter`. Moved the calculation to after the null check.

---

**5. `userId` field causing 400 Bad Request**
`createPost` was sending a `userId` field that didn't exist as a collection attribute. Appwrite rejected the request. Removed `userId` from document data — ownership is handled entirely through `$permissions`.

---

**6. Edit always redirecting — ownership check on non-existent field**
`EditPost.tsx` checked `post.userId !== user.$id`, but `userId` was never stored. This was always `undefined`, so every user got redirected. Fixed by checking `$permissions` instead:
```ts
post.$permissions.includes(`update("user:${user.$id}")`)
```

---

**7. Featured image cleared on update**
`updatePost` was passing `featuredImage: ""`, overwriting the stored image on every save. Fixed by reading the existing image ID from the fetched post and preserving it unless a new image is explicitly uploaded.

