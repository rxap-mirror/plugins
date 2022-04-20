import { JsonObject } from '@angular-devkit/core';

export interface BuildBuilderSchema extends JsonObject {
  release?: string;
  commit?: string;
  timestamp?: string;
  branch?: string;
  tag?: string;
  name?: string;
  url?: string;
  tier?: string;
  job?: string;
  pipeline?: string;
  project?: string;
  runner?: string;
  slug?: {
    name?: string;
    branch?: string;
    tag?: string;
  }
}
