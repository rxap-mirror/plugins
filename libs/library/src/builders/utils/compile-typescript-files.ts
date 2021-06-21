import { removeSync } from 'fs-extra';
import { dirname } from 'path';
import * as ts from 'typescript';

export interface TypeScriptCompilationOptions {
  outputPath: string;
  projectName: string;
  projectRoot: string;
  tsConfig: string;
  deleteOutputPath?: boolean;
  rootDir?: string;
  watch?: boolean;
}

let tsModule: any;

export function readTsConfig(tsConfigPath: string) {
  if (!tsModule) {
    tsModule = require('typescript');
  }
  const readResult = tsModule.readConfigFile(
    tsConfigPath,
    tsModule.sys.readFile
  );
  return tsModule.parseJsonConfigFileContent(
    readResult.config,
    tsModule.sys,
    dirname(tsConfigPath)
  );
}

function normalizeOptions(
  options: TypeScriptCompilationOptions
): TypeScriptCompilationOptions {
  return {
    ...options,
    deleteOutputPath: options.deleteOutputPath ?? true,
    rootDir: options.rootDir ?? options.projectRoot
  };
}

function createProgram(
  tsconfig: ts.ParsedCommandLine,
  projectName: string
): { success: boolean } {
  const host = ts.createCompilerHost(tsconfig.options);
  const program = ts.createProgram({
    rootNames: tsconfig.fileNames,
    options: tsconfig.options,
    host
  });
  console.info(`Compiling TypeScript files for project "${projectName}"...`);
  const results = program.emit();
  if (results.emitSkipped) {
    const diagnostics = ts.formatDiagnosticsWithColorAndContext(
      results.diagnostics,
      {
        getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
        getNewLine: () => ts.sys.newLine,
        getCanonicalFileName: (name) => name
      }
    );
    console.error(diagnostics);
    throw new Error(diagnostics);
  } else {
    console.info(
      `Done compiling TypeScript files for project "${projectName}".`
    );
    return { success: true };
  }
}

export function CompileTypeScript(
  options: TypeScriptCompilationOptions
): { success: boolean } | Promise<any> {
  const normalizedOptions = normalizeOptions(options);

  if (normalizedOptions.deleteOutputPath) {
    removeSync(normalizedOptions.outputPath);
  }
  const tsConfig = readTsConfig(normalizedOptions.tsConfig);
  tsConfig.options.outDir = normalizedOptions.outputPath;
  tsConfig.options.noEmitOnError = true;
  tsConfig.options.rootDir = normalizedOptions.rootDir;

  return createProgram(tsConfig, normalizedOptions.projectName);
}
