# Common Issues

Frequently encountered issues and their solutions in the Salon Management System.

## Table of Contents
1. [Installation Issues](#installation-issues)
2. [Build Issues](#build-issues)
3. [Runtime Issues](#runtime-issues)
4. [Authentication Issues](#authentication-issues)
5. [API Issues](#api-issues)
6. [Performance Issues](#performance-issues)
7. [Platform-Specific Issues](#platform-specific-issues)

---

## Installation Issues

### Issue: Node.js Version Incompatible

**Symptoms**:
- Error messages about Node.js version
- Installation fails
- Dependencies won't install

**Solution**:
```bash
# Check current Node.js version
node --version

# Install required version (22.11.0 or higher)
nvm install 22
nvm use 22

# Or using n
n 22

# Verify installation
node --version
```

### Issue: npm Install Fails

**Symptoms**:
- `npm install` hangs
- Dependency conflicts
- Network errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### Issue: CocoaPods Installation Fails (iOS)

**Symptoms**:
- `pod install` fails
- Ruby version errors
- Permission errors

**Solution**:
```bash
# Update Ruby gems
sudo gem update --system

# Install CocoaPods
sudo gem install cocoapods

# Update CocoaPods repo
cd ios
pod repo update
pod install
cd ..
```

### Issue: Android SDK Not Found

**Symptoms**:
- `ANDROID_HOME` not set
- Gradle build fails
- Emulator won't start

**Solution**:
```bash
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Add to shell profile (~/.bashrc, ~/.zshrc, or ~/.bash_profile)
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc

# Reload shell
source ~/.bashrc
```

---

## Build Issues

### Issue: Metro Bundler Won't Start

**Symptoms**:
- Metro bundler hangs
- Port already in use error
- Cache issues

**Solution**:
```bash
# Kill existing Metro processes
npx react-native start --reset-cache

# Or manually kill process
lsof -ti:8081 | xargs kill -9

# Clear cache and restart
npm start -- --reset-cache
```

### Issue: Android Build Fails

**Symptoms**:
- Gradle build errors
- Compilation errors
- Dependency conflicts

**Solution**:
```bash
# Clean Gradle build
cd android
./gradlew clean
cd ..

# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
cd ..

# If dependency issues, check build.gradle
# Ensure all dependencies are compatible
```

### Issue: iOS Build Fails

**Symptoms**:
- Xcode build errors
- Pod installation issues
- Signing errors

**Solution**:
```bash
# Clean pods
cd ios
pod deintegrate
pod install
cd ..

# Clean Xcode build
cd ios
xcodebuild clean
cd ..

# Rebuild
npm run ios
```

### Issue: TypeScript Compilation Errors

**Symptoms**:
- Type errors in code
- Missing type definitions
- Incompatible types

**Solution**:
```bash
# Check TypeScript version
npm list typescript

# Reinstall TypeScript
npm install --save-dev typescript@latest

# Clear TypeScript cache
rm -rf node_modules/.cache

# Rebuild
npm start
```

---

## Runtime Issues

### Issue: App Crashes on Launch

**Symptoms**:
- App crashes immediately
- White screen
- Error messages

**Solution**:
```bash
# Check for error logs
adb logcat | grep ReactNative

# Check Metro bundler logs
npm start

# Clear cache and restart
npm start -- --reset-cache

# Check for missing dependencies
npm list
```

### Issue: Navigation Not Working

**Symptoms**:
- Screens not navigating
- Navigation errors
- Stack overflow

**Solution**:
```typescript
// Check navigation configuration
// Ensure all screens are properly registered

// Example correct setup:
const Stack = createNativeStackNavigator();

<Stack.Navigator>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Details" component={DetailsScreen} />
</Stack.Navigator>

// Check navigation types
type RootStackParamList = {
  Home: undefined;
  Details: { itemId: string };
};
```

### Issue: State Not Updating

**Symptoms**:
- UI not reflecting state changes
- Stale data
- React not re-rendering

**Solution**:
```typescript
// Ensure proper state updates
const [count, setCount] = useState(0);

// Correct: functional update
setCount(prev => prev + 1);

// Incorrect: direct mutation
count = count + 1; // Don't do this

// Check for missing dependencies in useEffect
useEffect(() => {
  // effect logic
}, [dependency]); // Include all dependencies
```

### Issue: Memory Leaks

**Symptoms**:
- App becomes slow over time
- Memory usage increases
- App crashes

**Solution**:
```typescript
// Clean up subscriptions and timers
useEffect(() => {
  const subscription = someApi.subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);

// Clean up timers
useEffect(() => {
  const timer = setInterval(() => {
    // timer logic
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);
```

---

## Authentication Issues

### Issue: Login Fails

**Symptoms**:
- Invalid credentials error
- Network error
- Token not received

**Solution**:
```typescript
// Check credentials
const { email, password } = credentials;

// Ensure email format is valid
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email format');
}

// Check Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration missing');
}
```

### Issue: Token Expired

**Symptoms**:
- Authentication errors
- Session expired
- Need to re-login

**Solution**:
```typescript
// Implement token refresh
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        // Token refreshed successfully
      } else if (event === 'SIGNED_OUT') {
        // User signed out, redirect to login
        navigation.navigate('Login');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### Issue: Permission Denied

**Symptoms**:
- Access denied errors
- Cannot perform actions
- UI elements hidden

**Solution**:
```typescript
// Check user permissions
const { hasPermission } = usePermission();

if (!hasPermission('booking.create')) {
  // Show appropriate message or hide UI
  return <Text>You don't have permission to create bookings</Text>;
}

// Check role assignment
const { role } = useAuth();

if (role !== 'OWNER' && role !== 'MANAGER') {
  // Redirect or show error
  return <Text>Access denied</Text>;
}
```

---

## API Issues

### Issue: API Calls Failing

**Symptoms**:
- Network errors
- Timeout errors
- 500 errors

**Solution**:
```typescript
// Implement retry logic
async function fetchWithRetry(url: string, options: any, retries = 3) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('API error');
    return response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

// Check network connectivity
import NetInfo from '@react-native-community/netinfo';

const networkState = await NetInfo.fetch();
if (!networkState.isConnected) {
  throw new Error('No network connection');
}
```

### Issue: Data Not Loading

**Symptoms**:
- Empty lists
- Loading spinner never stops
- Data not displaying

**Solution**:
```typescript
// Implement proper loading states
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  async function loadData() {
    try {
      setLoading(true);
      const response = await api.getData();
      setData(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);

// Render based on state
if (loading) return <Loader />;
if (error) return <Error message={error.message} />;
if (!data) return <EmptyState />;
return <DataDisplay data={data} />;
```

### Issue: RLS Policy Errors

**Symptoms**:
- Permission denied from database
- Data not visible
- Query fails

**Solution**:
```sql
-- Check RLS policies are enabled
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;

-- Check policy exists
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test policy
SET ROLE authenticated;
SELECT * FROM your_table;

-- Check user role
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

---

## Performance Issues

### Issue: App is Slow

**Symptoms**:
- Laggy animations
- Slow navigation
- Poor performance

**Solution**:
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // component logic
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return data.reduce((acc, item) => acc + item.value, 0);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependency]);

// Optimize lists with FlatList
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

### Issue: High Memory Usage

**Symptoms**:
- App crashes
- Memory warnings
- Slow performance

**Solution**:
```typescript
// Optimize images
<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
/>

// Use lazy loading
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Clean up resources
useEffect(() => {
  const image = new Image();
  image.src = imageUrl;

  return () => {
    image.src = ''; // Clean up
  };
}, [imageUrl]);
```

### Issue: Battery Drain

**Symptoms**:
- Battery drains quickly
- Phone gets hot
- Background activity

**Solution**:
```typescript
// Optimize background tasks
import { AppState } from 'react-native';

useEffect(() => {
  const subscription = AppState.addEventListener('change', nextAppState => {
    if (nextAppState === 'background') {
      // Pause heavy operations
    } else if (nextAppState === 'active') {
      // Resume operations
    }
  });

  return () => subscription.remove();
}, []);

// Use efficient polling
const [data, setData] = useState(null);

useEffect(() => {
  let interval: NodeJS.Timeout;

  function fetchData() {
    api.getData().then(setData);
  }

  fetchData();
  interval = setInterval(fetchData, 60000); // Poll every minute

  return () => clearInterval(interval);
}, []);
```

---

## Platform-Specific Issues

### Android-Specific Issues

#### Issue: App Not Installing

**Symptoms**:
- Installation fails
- Parse error
- Signature mismatch

**Solution**:
```bash
# Uninstall existing app
adb uninstall com.salonapp

# Rebuild and install
cd android
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
cd ..
```

#### Issue: Permissions Denied

**Symptoms**:
- Camera not working
- Storage access denied
- Location not available

**Solution**:
```bash
# Grant permissions manually
adb shell pm grant com.salonapp android.permission.CAMERA
adb shell pm grant com.salonapp android.permission.WRITE_EXTERNAL_STORAGE
adb shell pm grant com.salonapp android.permission.ACCESS_FINE_LOCATION

# Check permissions
adb shell dumpsys package com.salonapp | grep permission
```

### iOS-Specific Issues

#### Issue: App Not Building

**Symptoms**:
- Build fails
- Signing errors
- Provisioning profile issues

**Solution**:
```bash
# Check signing
cd ios
xcodebuild -showBuildSettings | grep CODE_SIGN_IDENTITY

# Reinstall pods
pod deintegrate
pod install

# Clean build
xcodebuild clean
cd ..

# Rebuild
npm run ios
```

#### Issue: Simulator Not Starting

**Symptoms**:
- Simulator won't launch
- Black screen
- Boot issues

**Solution**:
```bash
# Reset simulator
xcrun simctl erase all

# List available simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot "iPhone 14"

# Rebuild and run
npm run ios
```

---

## Getting Additional Help

If you're still experiencing issues:

1. **Check Error Logs**
   ```bash
   # Android
   adb logcat

   # iOS
   # Open Console.app and filter for your app
   ```

2. **Review Documentation**
   - [Architecture Documentation](../architecture/ARCHITECTURE.md)
   - [API Documentation](../api/README.md)
   - [Setup Guide](../setup/README.md)

3. **Search GitHub Issues**
   - Check existing issues
   - Search for similar problems

4. **Create a New Issue**
   - Include error messages
   - Provide reproduction steps
   - Include environment details
   - Attach screenshots if applicable

---

**Last Updated**: 2026-05-09
**Version**: 1.0.0
