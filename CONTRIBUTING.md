# Contributing to react-native-nitro-cookies

Thank you for your interest in contributing to react-native-nitro-cookies! This document provides guidelines and instructions for contributing to the project.

Contributions are always welcome, no matter how large or small! We want this community to be friendly and respectful to each other. Please follow the [code of conduct](./CODE_OF_CONDUCT.md) in all your interactions with the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting a Pull Request](#submitting-a-pull-request)

## Getting Started

### Prerequisites

- Node.js >= 20 (see `.nvmrc` for exact version)
- Yarn (npm is not supported due to workspace requirements)
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

### Initial Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/react-native-nitro-cookies.git
cd react-native-nitro-cookies
```

3. Install dependencies:

```bash
yarn install
```

4. Run Nitrogen to generate native bridging code:

```bash
yarn nitrogen
```

This step is required when:
- Running the project for the first time
- After making changes to any `*.nitro.ts` files

5. Install iOS dependencies:

```bash
cd ios && pod install && cd ..
```

## Development Workflow

This project is a monorepo managed using Yarn workspaces. It contains:

- The library package in the root directory
- An example app in the `example/` directory

### Understanding Nitro Modules

This project uses [Nitro Modules](https://nitro.margelo.com/). If you're not familiar with Nitro, check the [Nitro Modules Documentation](https://nitro.margelo.com/) before contributing.

### Building the Library

The library uses React Native Builder Bob for building:

```bash
yarn prepare
```

This command:
1. Runs Nitrogen to generate native bridging code
2. Compiles TypeScript to JavaScript (ESM)
3. Generates TypeScript type definitions

### Running the Example App

The example app demonstrates all library features and is configured to use the local version of the library.

#### iOS

```bash
cd example
yarn install
yarn ios
```

To edit native iOS code, open `example/ios/NitroCookiesExample.xcworkspace` in Xcode. Find the source files at `Pods > Development Pods > react-native-nitro-cookies`.

#### Android

```bash
cd example
yarn install
yarn android
```

To edit native Android code, open `example/android` in Android Studio. Find the source files under `react-native-nitro-cookies` in the Android view.

### Hot Reloading

- **JavaScript changes**: Reflected immediately in the example app
- **Native code changes**: Require rebuilding the example app

## Project Structure

```
react-native-nitro-cookies/
├── src/                          # TypeScript source code
│   ├── types.ts                  # Type definitions
│   ├── NitroCookies.nitro.ts    # Nitro HybridObject spec
│   └── index.tsx                 # Public API with JSDoc
├── ios/                          # iOS native implementation
│   └── NitroCookies.swift       # Swift implementation
├── android/                      # Android native implementation
│   └── src/main/.../NitroCookies.kt  # Kotlin implementation
├── nitrogen/                     # Nitrogen configuration
│   ├── generated/               # Auto-generated code (DO NOT EDIT)
│   └── nitro.json               # Nitrogen config
├── example/                      # Example React Native app
│   ├── src/
│   │   ├── screens/            # Demo screens (4 screens)
│   │   ├── components/         # CookieViewer component
│   │   └── utils/              # formatCookie utility
│   └── ...
└── specs/                        # Design documentation
    └── 001-nitro-cookies/
        ├── spec.md              # Feature specification
        ├── plan.md              # Implementation plan
        └── tasks.md             # Task breakdown
```

## Making Changes

### Code Style

- **TypeScript**: Follow existing code style, use Prettier for formatting
- **Swift**: Follow [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/)
- **Kotlin**: Follow [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)

Run linting:

```bash
yarn lint
```

Run TypeScript type checking:

```bash
yarn typecheck
```

### Type Safety

- All public APIs must have proper TypeScript types
- Use strict TypeScript compiler options (enabled in `tsconfig.json`)
- Document all parameters with comprehensive JSDoc comments
- Include `@example` blocks in JSDoc for complex methods

### Platform-Specific Code

When adding platform-specific features:

1. **Document** which platforms support the feature
2. **Throw** `PLATFORM_UNSUPPORTED` error on unsupported platforms
3. **Update** README.md with platform compatibility table
4. **Add** example usage in the appropriate demo screen

Example:

```typescript
/**
 * Get all cookies regardless of domain
 *
 * @platform ios
 * @throws {Error} PLATFORM_UNSUPPORTED on Android
 *
 * @example
 * ```typescript
 * if (Platform.OS === 'ios') {
 *   const allCookies = await NitroCookies.getAll();
 * }
 * ```
 */
async getAll(useWebKit?: boolean): Promise<Cookies> {
  // Implementation
}
```

### Native Code Changes

#### iOS (Swift)

- **File**: `ios/NitroCookies.swift`
- **Pattern**: Helper functions + public methods
- **Async**: Use `Promise.async { resolve, reject in ... }`
- **Errors**: Throw `NSError` with descriptive domain and message

Example:

```swift
public func myMethod() throws -> Promise<Bool> {
    return Promise.async { resolve, reject in
        do {
            // Implementation
            resolve(true)
        } catch {
            reject(error)
        }
    }
}
```

#### Android (Kotlin)

- **File**: `android/src/main/java/com/margelo/nitro/nitrocookies/NitroCookies.kt`
- **Async**: Use `Promise.async { resolve, reject -> ... }`
- **Errors**: Throw `Exception` with descriptive message

Example:

```kotlin
override fun myMethod(): Promise<Boolean> {
    return Promise.async { resolve, reject ->
        try {
            // Implementation
            resolve(true)
        } catch (e: Exception) {
            reject(e)
        }
    }
}
```

### Documentation

- Update **README.md** for API changes
- Add **JSDoc comments** to all public methods (see `src/index.tsx`)
- Include **code examples** in documentation
- Update **CHANGELOG.md** (if it exists)

## Testing

### Manual Testing with Example App

The example app has 4 demo screens:

1. **BasicOperationsScreen**: Test `set()`, `get()`, `clearAll()`
2. **HTTPParsingScreen**: Test `setFromResponse()`, `getFromResponse()`
3. **WebViewSyncScreen**: Test WebView integration and cookie viewer
4. **PlatformSpecificScreen**: Test platform-specific methods

### Testing Checklist

Before submitting a PR:

- [ ] Code compiles without errors on iOS
- [ ] Code compiles without errors on Android
- [ ] TypeScript types are correct (`yarn typecheck`)
- [ ] All public APIs have comprehensive JSDoc comments
- [ ] Example app demonstrates new features
- [ ] README.md is updated
- [ ] No console warnings or errors
- [ ] Linting passes (`yarn lint`)
- [ ] Tested on iOS simulator/device
- [ ] Tested on Android emulator/device

## Submitting a Pull Request

### Creating a Branch

Create a new branch for your changes:

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-description
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes
- `perf:` - Performance improvements

Examples:

```bash
git commit -m "feat: add cookie expiration validation"
git commit -m "fix: handle null domain in Android implementation"
git commit -m "docs: update API reference for clearByName method"
```

### Push and Create PR

```bash
git push origin feature/my-new-feature
```

Then create a Pull Request on GitHub.

### PR Guidelines

**Title**: Use a clear, descriptive title following Conventional Commits

**Description**: Include:
- What changes you made and why
- How you tested the changes
- Screenshots/videos for UI changes
- Breaking changes (if any)
- Related issues (if any)

**PR Template**:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe how you tested your changes:
- [ ] iOS simulator
- [ ] iOS device
- [ ] Android emulator
- [ ] Android device

## Screenshots (if applicable)
Add screenshots or videos

## Checklist
- [ ] My code follows the code style of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes on both iOS and Android
```

### Code Review

- Maintainers will review your PR
- Address any feedback promptly
- Keep the PR focused on a single feature/fix
- Rebase if needed to keep history clean

## Sending a Pull Request

> **Working on your first pull request?** You can learn how from this free series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change
- Verify that TypeScript, linting and tests are passing
- Review your own code before requesting a review
- Preview the documentation to ensure it looks correct
- Follow the pull request template when opening a pull request

## Questions?

- 🐛 **Bug reports**: Open an [issue](https://github.com/l2hyunwoo/react-native-nitro-cookies/issues)
- 💡 **Feature requests**: Start a [discussion](https://github.com/l2hyunwoo/react-native-nitro-cookies/discussions)
- 💬 **Questions**: Ask in [discussions](https://github.com/l2hyunwoo/react-native-nitro-cookies/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to react-native-nitro-cookies! 🎉
