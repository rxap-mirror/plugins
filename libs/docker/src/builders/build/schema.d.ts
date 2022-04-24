import { JsonObject } from '@angular-devkit/core';

export interface BuildBuilderSchema extends JsonObject {
  context?: string;
  dockerfile?: string;
  tag?: string[];
  buildTarget: string;
  command: string;
  latest: boolean;
  imageSuffix?: string;
  imageName?: string;
}
