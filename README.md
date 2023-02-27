# okpush

okpush is a whole-codebase code quality tool for Javascript/Typescript to help teams write better code.

## Usage

Navigate to your project directory and run complexity using npx.

```bash
npx okpush
```

This will analyze your code and open the results in your browser.

You can also install okpush as a devDependency.

## okpush.config.js

Options can be configured through a config file in your project root directory. An example is below.

```javascript
export default {
  // analyze files matching glob
  fileGlob: ['**/*.ts', '**/*.tsx'],

  // exclude files found in these folders
  excludeFolders: ['**/generated'],

  // pattern for test files
  testFileGlob: ['**/*.test.*'],

  // individual test option overrides
  testOptions: {
    fileComplexity: {
      enabled: false,
    },
    duplicateBlocks: {
      duplicateCountThreshold: 2,
    },
  },
}
```

## Project philosphy (aka why another linter?)

**Big picture insight** - rather than scrutinizing individual lines of code, we seek to give team
leaders and project maintainers a overview of codebase quality, to answer questions such as:

- Is the code getting better or worse over time?
- What is the impact of a particular pull request?
- Who has been most helpful in maintaining codebase quality?

**Incremental progress** - rather than overwhelm developers with thousands of errors to fix out of
the box, we seek to provide a clear path to improving code quality. By helping teams leave the code
better than they found it, code quality can be achieved without halting feature development.

**Developer friendly** - writing good software is hard, tools like this should make life easier.
Understanding and fixing results, tight integration with IDE and CI/CD, and writing new checks
should all be delightful experiences.

## Contributing

This project is currently focused on Javascript / Typescript, but I'd like to support additional
languages once the initial version feels complete. If you have an idea for a code quality check
that you'd like to see in your project, please open an issue.

Pull requests are welcome. For major changes, please open an issue first to discuss what you would
like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
