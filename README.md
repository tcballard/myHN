# myHN

An unofficial, accessibility-minded Hacker News reader for iOS, Android, and web. Built with Expo Router and the official Hacker News API.

## What is included

- Top, New, Best, and Ask HN feeds
- Dense, readable story cards with generous tap targets
- Pull-to-refresh on feeds and discussions
- In-app article opening through the system browser
- Threaded comments with tap-to-collapse branches
- Light and dark appearance
- Loading, empty, and retryable error states

The initial build intentionally does not include authentication, voting, posting, notifications, or local persistence.

## Test with Expo Orbit

Expo Orbit is the primary test path. There are two different simulator builds:

- `preview-simulator` is a self-contained app. Use this to open myHN directly from Orbit and test it without Metro.
- `development-simulator` is a development client. Use this only while coding; it needs a Metro development server.

### First simulator build

Prerequisites: Xcode with an iOS Simulator, [Expo Orbit](https://docs.expo.dev/build/orbit/), and access to the linked Expo project.

```sh
npm install
npm install --global eas-cli
eas login
npm run build:ios:simulator
```

The repository is already linked to EAS project `5b13a179-102e-4349-b873-20260148c78b`; do not create a second EAS project. If the link ever needs to be restored, run:

```sh
eas init --id 5b13a179-102e-4349-b873-20260148c78b
```

When the EAS build completes:

1. Open the build on the EAS dashboard.
2. Select **Open with Expo Orbit**.
3. Choose the iOS Simulator in Orbit.
4. Open `myHN` in the simulator. The feed is bundled into this build and starts without a terminal or Metro server.

### Normal development loop

For live development, first install the development-client build:

```sh
npm run build:ios:simulator:dev
```

Open that build with Orbit. Then keep Metro running while using the app:

```sh
npm run start:dev-client
```

Press `i` in the Expo terminal to open the project in the iOS Simulator. The development client can also reconnect to a detected local server from its launcher screen. You only need another development-client build after changing native dependencies or native `app.json` configuration.

### Physical iPhone

Register the device with EAS, then create the ad hoc build:

```sh
npx eas-cli@latest device:create
npm run build:ios:device
```

Connect the iPhone to the Mac, select it in Orbit, and use **Open with Expo Orbit** from the EAS build page. Apple signing and device registration are required for this path.

## Local checks

```sh
npm run typecheck
npm run lint
npx expo export --platform web
```

## Application identity

- Display name: `myHN`
- iOS bundle identifier: `com.tcballard.myhn`
- Android package: `com.tcballard.myhn`
- URL scheme: `myhn`
- EAS project ID: `5b13a179-102e-4349-b873-20260148c78b`

## Data source

The app reads public data from the [official Hacker News API](https://github.com/HackerNews/API). It is not affiliated with or endorsed by Y Combinator.
