Changelog
=========

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[Unreleased]
------------

### Changed

- Updated the `Config` type to use `Writable` to allow for mutable properties.
- The `Argument.required` property to `Argument.isRequired` to match the style of `meow`.

[0.2.0] - 2025-10-22
--------------------

### Added

- The `getHelpTextAndOptions` function.

### Changed

- The signature of the `Config` type. See [the types file](src/types.ts) for reference.

### Fixed

- Added user theme configuration. Which was documented but not properly implemented.

[0.1.1] - 2025-10-22
--------------------

### Fixed

- Instances of the `Dynamic require of "..." is not supported` error.

[0.1.0] - 2025-10-20
--------------------

### Added

- Initial release.

[Unreleased]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jbenner-radham/node-meowtastic/releases/tag/v0.1.0
