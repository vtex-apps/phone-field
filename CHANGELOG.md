# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.5] - 2021-05-06
### Fixed
- Fix Input Type

## [0.1.4] - 2020-06-15
### Changed
- Use `Listbox` and `CountryFlags` components from shared apps.
- Mask value on `blur` event instead of `change`.
- Sort country list by country ISO instead of code.

### Fixed
- Component crash when rules array is empty.
- Border color of country dropdown not synchronized with input.

## [0.1.3] - 2020-03-23
### Fixed
- Listbox button shrinking due to `Input`'s width.

## [0.1.2] - 2020-03-20
### Fixed
- Prop `errorMessage` incorrectly typed in `PhoneField`.

## [0.1.1] - 2020-03-20
### Added
- Allow prop `ref` to be passed to `PhoneField`.

### Fixed
- Phone number not rendered when rule don't have a mask.

## [0.1.0] - 2020-03-19
### Added
- Initial version of `PhoneField` component.
- Default rules including `BRA`, `ARG` and `USA` phone formats.
