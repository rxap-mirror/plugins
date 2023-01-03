import { JsonObject } from '@angular-devkit/core';

export interface SaveBuilderSchema extends JsonObject {
  outputPath?: string;
}
