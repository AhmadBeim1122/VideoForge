# VideoForge - Mobile Video Editor

## Run Locally
```bash
npm install
npm run dev
```

## Build Android APK with Capacitor
```bash
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init VideoForge com.videoforge.app --web-dir=dist
npx cap add android
npx cap open android
```
In Android Studio: Build -> Generate Signed Bundle / APK -> APK.

## Direct Phone PWA Install
Open the URL in Android Chrome -> 3 dots menu -> "Install App" or "Add to Home Screen".
On iPhone Safari -> Share button -> "Add to Home Screen".
