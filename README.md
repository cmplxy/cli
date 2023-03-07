# okpush-cli

okpush-cli is command-line utility to manage git hooks for the [okpush.io](https://okpush.io) service.

## Usage

Initialize a new repository for okpush (you can find your account id by clicking "New repository" on
the okpush website):

```bash
npx okpush init <account id>
```

Install hooks for a repository that already has a `.okpush` file:

```bash
npx okpush install
```

Sync repository history to okpush: (by default, last 100 commits are synced)

```bash
npx okpush sync [--since <date>] [--count <number>]
```

## Installation

okpush-cli can be run directly from npx with `npx okpush`.

You can also install it into your javascript project as a dev dependency. This way you can write
a script to automatically install okpush hooks for everyone.

```bash
npm install okpush --save-dev
# or
yarn install -D okpush
```

## Hooks

The following hooks are currently supported:

- `pre-commit` - run commands to check whether commit is allowed (synchronous)
- `post-commit` - run commands after a commit succeeds (async)
- `post-rewrite` - run commands after a commit is modified (async)
- `pre-push` - run commands to check whether push is allowed (synchronous)
- `post-checkout` - run commands after a new branch is checked out (async)

These commands can be triggered directly as commands with okpush-cli as well by running:

```bash
okpush pre-commit # any supported hook
```

## Support

If something is going wrong, please run okpush with the `-v` flag and create an issue with the output of the command.

## License

[GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
