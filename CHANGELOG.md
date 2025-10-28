Changelog
=========

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

[Unreleased]
------------

### Changed

- Further optimized the size of the example image for the readme.

### Fixed

- The output of `%CHOICES_AND%` and `%CHOICES_OR%` variables when there were two choices exactly.

[0.5.0] - 2025-10-24
--------------------

### Added

- The `%DEFAULT%`, `%CHOICES_AND%`, and `%CHOICES_OR%` variables which expand to the default value
  of a flag, the choices of a flag with an "and" conjunction, and the choices of a flag with an "or"
  conjunction respectively.

### Changed

- Compressed example image used in readme.

[0.4.1] - 2025-10-24
--------------------

### Fixed

- Inconsistencies between the usage example code and the corresponding example output image.

[0.4.0] - 2025-10-24
--------------------

### Changed

- Help text is now wrapped at 80 columns. A corresponding `Config.wrapText` option has been added
  which defaults to `true`.

[0.3.1] - 2025-10-23
--------------------

### Fixed

- A type error related to the output of `getHelpTextAndOptions`. Where the result did not fully
  match the type signature that `meow` expects.

[0.3.0] - 2025-10-23
--------------------

### Changed

- Updated the `Config` type to allow for mutable properties. Previously the properties inherited
  from `meow.Options` were all `readonly`. In the future this could change and all the properties of
  `Config` may be changed to `readonly` though.
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

[Unreleased]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/jbenner-radham/node-meowtastic/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/jbenner-radham/node-meowtastic/releases/tag/v0.1.0
