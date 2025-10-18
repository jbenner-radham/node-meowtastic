import isPlainObject from 'is-plain-obj';
import type { PackageJson } from 'type-fest';

export function getPackageBin(pkg: PackageJson): string {
  const isScopedPackage = (name: string): boolean =>
    name.startsWith('@') &&
    name.slice(1, -1).includes('/');

  const getUnscopedPackageName = (name: string): string =>
    name.slice(name.indexOf('/') + 1);

  const binObjectKeys = isPlainObject(pkg.bin) ? Object.keys(pkg.bin) : [];

  if (typeof pkg.bin === 'string' && typeof pkg.name === 'string') {
    return isScopedPackage(pkg.name)
      ? getUnscopedPackageName(pkg.name)
      : pkg.name;
  } else if (binObjectKeys.length) {
    return binObjectKeys.at(0)!;
  }

  return '';
}

export function getPackageDescription(pkg: PackageJson): string {
  return pkg.description ?? '';
}
