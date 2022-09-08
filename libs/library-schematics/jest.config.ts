/* eslint-disable */
export default {
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../coverage/libs/library-schematics',
  globals: { 'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' } },
  displayName: 'library-schematics',
  testEnvironment: 'node',
};
