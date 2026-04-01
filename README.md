# Japan Explorer

This repository now includes an Android Jetpack Compose client for **JapanTrip 2026** alongside the original web files.

## Android app location

- `app/src/main/java/com/amitbc/japanexplorer/MainActivity.kt`
- Gradle Kotlin DSL setup at root and `app/build.gradle.kts`

## Firebase setup (existing project)

1. Open Firebase Console for project `japan-explorer-22f18`.
2. Add Android app with package name `com.amitbc.japanexplorer`.
3. Download `google-services.json` and place it at `app/google-services.json`.
4. A template is included at `app/google-services.json.example`.

## Features scaffolded

- RTL-aware app shell with right-side drawer navigation.
- Home screen with countdown + currency converter (live ILS→JPY with fallback 40.5).
- Firestore-backed expenses CRUD.
- Dictionary with Japanese TTS.
- Toilet guide static grid.
- Lucky wheel canvas spin interaction.
- Quiz game loop.

## Build

```bash
./gradlew assembleDebug
```
