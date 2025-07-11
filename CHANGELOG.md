# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.1.5](https://github.com/champ8644/tscribe/compare/v2.1.4...v2.1.5) (2025-06-02)

### [2.1.4](https://github.com/champ8644/tscribe/compare/v2.1.3...v2.1.4) (2025-05-19)

### [2.1.3](https://github.com/champ8644/tscribe/compare/v2.1.2...v2.1.3) (2025-05-19)

### [2.1.2](https://github.com/champ8644/tscribe/compare/v2.1.1...v2.1.2) (2025-05-19)


### Bug Fixes

* **cli:** try testing release function ([95769a4](https://github.com/champ8644/tscribe/commit/95769a4be5dda83a61f0323a1d142a779cc2f909))

### [2.1.1](https://github.com/champ8644/tscribe/compare/v2.1.0...v2.1.1) (2025-05-19)

## [2.1.0](https://github.com/champ8644/tscribe/compare/v2.0.1...v2.1.0) (2025-05-19)


### Features

* **ci:** build and upload binaries to GitHub Releases via pkg ([8d7f870](https://github.com/champ8644/tscribe/commit/8d7f87059b2098ded07b0d5663760be68f70bc0b))

### [2.0.1](https://github.com/champ8644/tscribe/compare/v2.0.0...v2.0.1) (2025-05-19)

## [2.0.0](https://github.com/champ8644/tscribe/compare/v1.3.3...v2.0.0) (2025-05-19)


### ⚠ BREAKING CHANGES

* **sort:** - `--zip` is no longer supported; use `--out` or stdout instead
- Ignore patterns now require POSIX-style globs (e.g. `node_modules/**`, not `.\node_modules`)

### Features

* **sort:** add Windows-style natural sort with extension tie-break ([cfe05ed](https://github.com/champ8644/tscribe/commit/cfe05ed7700f5b3e963679c0f0a87596eb4b99e9))

### [1.3.3](https://github.com/champ8644/tscribe/compare/v1.3.2...v1.3.3) (2025-05-18)

### [1.3.2](https://github.com/champ8644/tscribe/compare/v1.3.1...v1.3.2) (2025-05-18)

### [1.3.1](https://github.com/champ8644/tscribe/compare/v1.3.0...v1.3.1) (2025-05-18)

## [1.3.0](https://github.com/champ8644/tscribe/compare/v1.2.1...v1.3.0) (2025-05-18)


### Features

* update version to 1.2.1 and add Codecov token to CI workflow ([ca2246b](https://github.com/champ8644/tscribe/commit/ca2246b3ca75615e332701b5c132bbdecfc9bfbd))


### Bug Fixes

* standardize quotation marks in LICENSE file ([ba6af9b](https://github.com/champ8644/tscribe/commit/ba6af9bd2def2b2c96d7fcbff652920092342b97))
* update CI workflow to use master branch instead of main ([e619356](https://github.com/champ8644/tscribe/commit/e619356df5ed28c0a20367e1881698233d9b2c98))
* update Codecov action configuration to include slug ([3609d9f](https://github.com/champ8644/tscribe/commit/3609d9fa1deeed6c62f251594f1ed45d88dea8d8))
* update deploy script to push to master branch instead of main ([338f0b8](https://github.com/champ8644/tscribe/commit/338f0b8032d861a9ef1d4de3b0ba798086003a9f))

### [1.2.1](https://github.com/champ8644/tscribe/compare/v1.2.0...v1.2.1) (2025-05-18)


### Bug Fixes

* update README badges to reflect branch name change from main to master ([a5d0cb9](https://github.com/champ8644/tscribe/commit/a5d0cb91f8aeb0926e494baee1329b908005a3b6))

## [1.2.0](https://github.com/champ8644/tscribe/compare/v1.1.0...v1.2.0) (2025-05-18)


### Features

* update version to 1.1.0 and synchronize version file; enhance CI workflow for multiple Node.js versions ([2309463](https://github.com/champ8644/tscribe/commit/23094639d85b981527fb1cac0a71a4e1f35e4a75))

## 1.1.0 (2025-05-18)


### Features

* add output option to write concatenated results to a text file; update README with usage instructions ([668b92d](https://github.com/champ8644/tscribe/commit/668b92de966e9be3704bafe49afc78a4dbd7ab3e))
* add repository field to package.json for better project visibility ([c18a283](https://github.com/champ8644/tscribe/commit/c18a28395501ac8d9678e4a427cfcc8fcf6fa62e))
* update package version to 1.0.0 and enhance description for LLM ingestion; add JSON module resolution in tsconfig ([9bdb72c](https://github.com/champ8644/tscribe/commit/9bdb72cc90dfa7aafb16b37b16d8717190bb4fcb))
