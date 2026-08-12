# HN Reader

An unofficial, accessibility-minded Hacker News reader for iOS, Android, and web. Built with Expo Router and the official Hacker News API.

## What is included

- Top, New, Best, and Ask HN feeds
- Dense, readable story cards with generous tap targets
- Pull-to-refresh on feeds and discussions
- In-app article opening through the system browser
- Threaded comments with tap-to-collapse branches
- Light and dark appearance
- Loading, empty, and retryable error states

The initial scaffold intentionally does not include authentication, voting, posting, notifications, or local persistence.

## Run with Expo Go

1. Install dependencies with `npm install`.
2. Start the development server with `npm start`.
3. Scan the QR code with Expo Go on iOS or Android.

You can also run `npm run ios`, `npm run android`, or `npm run web` when the corresponding local environment is available.

## Verify

```sh
npm run typecheck
npm run lint
npx expo export --platform web
```

## Data source

The app reads public data from the [official Hacker News API](https://github.com/HackerNews/API). It is not affiliated with or endorsed by Y Combinator.
