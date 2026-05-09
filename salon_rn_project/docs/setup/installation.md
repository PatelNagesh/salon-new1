# Installation Guide

Complete installation instructions for the Salon Management System on all platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Platform-Specific Setup](#platform-specific-setup)
3. [Project Installation](#project-installation)
4. [Supabase Setup](#supabase-setup)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

#### Node.js
- **Version**: >= 22.11.0
- **Download**: [nodejs.org](https://nodejs.org/)
- **Verification**:
  ```bash
  node --version
  npm --version
  ```

#### Git
- **Download**: [git-scm.com](https://git-scm.com/)
- **Verification**:
  ```bash
  git --version
  ```

#### React Native CLI
```bash
npm install -g react-native-cli
```

### Platform-Specific Requirements

#### Android Development
- **Android Studio**: [developer.android.com/studio](https://developer.android.com/studio)
- **Android SDK**: API Level 33 or higher
- **Java Development Kit (JDK)**: Version 11 or higher
- **Android SDK Build-Tools**: 33.0.0 or higher

#### iOS Development (macOS only)
- **Xcode**: 14.0 or higher
- **CocoaPods**: 1.11.0 or higher
- **iOS Simulator**: iOS 16.0 or higher

---

## Platform-Specific Setup

### Android Setup

#### 1. Install Android Studio
1. Download and install Android Studio
2. Launch Android Studio
3. Go to **Preferences** > **Appearance & Behavior** > **System Settings** > **Android SDK**
4. Install the following SDK components:
   - Android SDK Platform 33
   - Android SDK Build-Tools 33.0.0
   - Android SDK Platform-Tools
   - Intel x86 Emulator Accelerator (HAXM installer)

#### 2. Configure ANDROID_HOME
Add to your shell profile (~/.bashrc, ~/.zshrc, or ~/.bash_profile):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### 3. Create an Emulator
1. Open Android Studio
2. Go to **Tools** > **Device Manager**
3. Click **Create Device**
4. Select a device (e.g., Pixel 6)
5. Select a system image (API 33)
6. Finish and start the emulator

### iOS Setup (macOS only)

#### 1. Install Xcode
```bash
xcode-select --install
```

#### 2. Install CocoaPods
```bash
sudo gem install cocoapods
```

#### 3. Install iOS Command Line Tools
```bash
xcode-select --install
```

---

## Project Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/salon-rn-project.git
cd salon-rn-project
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native
- React Navigation
- Supabase client
- React Native Keychain
- Other dependencies

### 3. Install iOS Dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

### 4. Verify Installation

```bash
npm start
```

You should see the Metro bundler starting successfully.

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **New Project**
4. Fill in project details:
   - **Name**: salon-management
   - **Database Password**: [generate strong password]
   - **Region**: Choose nearest region
5. Wait for project to be created (2-3 minutes)

### 2. Get Project Credentials

1. Go to **Settings** > **API**
2. Copy the following:
   - **Project URL**
   - **anon public key**

### 3. Run Database Migrations

#### Option A: Using Supabase Dashboard
1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy and run the SQL files from `database/migrations/`:
   - `001_initial_schema.sql`
   - `002_rls_policies.sql`

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Create Database Functions

Run the SQL files from `database/functions/`:
- `set_user_role.sql`

### 5. Configure Storage

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:
   - `profiles` (for profile images)
   - `services` (for service images)
   - `documents` (for documents)

3. Set bucket policies:
   - Make `profiles` public
   - Enable upload for authenticated users

---

## Environment Configuration

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
touch .env
```

### 2. Add Environment Variables

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Environment
EXPO_PUBLIC_ENVIRONMENT=development

# API Configuration
EXPO_PUBLIC_API_TIMEOUT=30000

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=true
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
```

### 3. Verify Environment Variables

Restart the Metro bundler after creating the `.env` file:

```bash
npm start -- --reset-cache
```

---

## Running the Application

### Development Mode

#### Start Metro Bundler
```bash
npm start
```

#### Run on Android
```bash
npm run android
```

#### Run on iOS (macOS only)
```bash
npm run ios
```

### Production Mode

#### Android Release Build
```bash
cd android
./gradlew assembleRelease
```

The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

#### iOS Release Build
```bash
cd ios
xcodebuild -workspace Salon.xcworkspace -scheme Salon -configuration Release
```

---

## Troubleshooting

### Common Issues

#### Metro Bundler Won't Start
```bash
# Clear cache and restart
npm start -- --reset-cache
```

#### Android Build Fails
```bash
# Clean gradle build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

#### iOS Build Fails
```bash
# Clean pods
cd ios
pod deintegrate
pod install
cd ..

# Rebuild
npm run ios
```

#### Supabase Connection Error
1. Verify `.env` file exists
2. Check Supabase URL and key are correct
3. Ensure Supabase project is active
4. Check network connection

#### Permission Errors
```bash
# Android: Grant permissions
adb shell pm grant com.salonapp android.permission.CAMERA
adb shell pm grant com.salonapp android.permission.WRITE_EXTERNAL_STORAGE
```

### Getting Help

If you encounter issues not covered here:
1. Check [Troubleshooting Guide](../troubleshooting/common-issues.md)
2. Review [Error Codes](../troubleshooting/error-codes.md)
3. Open an issue on GitHub

---

## Next Steps

After successful installation:

1. [Configure Application](configuration.md)
2. [Set Up Development Environment](development.md)
3. [Review Architecture Documentation](../architecture/ARCHITECTURE.md)
4. [Explore API Documentation](../api/README.md)

---

**Last Updated**: 2026-05-09
**Version**: 1.0.0
