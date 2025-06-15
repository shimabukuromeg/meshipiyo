import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../backend/src/schema.gen.graphql',
  documents: [
    'src/**/*.tsx',
    'app/**/*.tsx',
    'components/**/*.tsx',
    'lib/**/*.ts',
    'app/api/**/*.ts',
    'graphql/**/*.graphql',
  ],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/gql/': {
      preset: 'client',
    },
  },
}

export default config
