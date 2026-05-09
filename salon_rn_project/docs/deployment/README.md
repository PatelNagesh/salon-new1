# Deployment Documentation

This section contains guides for deploying the Salon Management System to production.

## Deployment Guides

### Build Process
[build.md](build.md) - Building the application for different platforms

### Production Deployment
[production.md](production.md) - Deploying to production environments

### CI/CD Setup
[ci-cd.md](ci-cd.md) - Continuous integration and deployment configuration

## Deployment Platforms

### Android
- Google Play Store
- Amazon Appstore
- Direct APK distribution

### iOS
- Apple App Store
- TestFlight for beta testing
- Enterprise distribution

## Deployment Checklist

### Pre-Deployment
- [ ] Update version numbers
- [ ] Run all tests
- [ ] Check for security vulnerabilities
- [ ] Update documentation
- [ ] Prepare release notes

### Build
- [ ] Create production builds
- [ ] Sign applications
- [ ] Optimize assets
- [ ] Test on target devices

### Post-Deployment
- [ ] Monitor crash reports
- [ ] Check analytics
- [ ] Verify functionality
- [ ] Update documentation

## Environment Variables

### Production
```env
EXPO_PUBLIC_SUPABASE_URL=production_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=production_anon_key
EXPO_PUBLIC_ENVIRONMENT=production
```

### Staging
```env
EXPO_PUBLIC_SUPABASE_URL=staging_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=staging_anon_key
EXPO_PUBLIC_ENVIRONMENT=staging
```

## Monitoring

### Crash Reporting
- Sentry integration
- Crashlytics
- Custom error tracking

### Analytics
- User behavior tracking
- Performance monitoring
- Feature usage statistics

---

**Last Updated**: 2026-05-09
