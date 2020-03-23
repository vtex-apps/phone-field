# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
