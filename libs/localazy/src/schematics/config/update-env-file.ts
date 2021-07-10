import { Rule } from '@angular-devkit/schematics';
import { ConfigSchema } from './schema';
import { MergeWithEnvFile } from '@rxap/schematics-utilities';

export function UpdateEnvFile({ readKey, writeKey }: ConfigSchema): Rule {
  const map: Record<string, string> = {};

  if (writeKey) {
    map.LOCALAZY_WRITE_KEY = writeKey;
  }

  if (readKey) {
    map.LOCALAZY_READ_KEY = readKey;
  }

  return MergeWithEnvFile(map);
}
