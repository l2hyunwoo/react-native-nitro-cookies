import { NitroModules } from 'react-native-nitro-modules';
import type { NitroCookies } from './NitroCookies.nitro';

const NitroCookiesHybridObject =
  NitroModules.createHybridObject<NitroCookies>('NitroCookies');

export function multiply(a: number, b: number): number {
  return NitroCookiesHybridObject.multiply(a, b);
}
