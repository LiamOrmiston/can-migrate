#!/usr/bin/env node
'use strict';

const path = require('path');
const meow = require('meow');
const execa = require('execa');
const globby = require('globby');
const series = require('promise-map-series');
const isGitClean = require('is-git-clean');
const transforms = require('../');

const ENSURE_BACKUP_MESSAGE = 'Ensure you have a backup of your tests or commit the latest changes before continuing.';

function checkGitStatus(force) {
  let clean = false;
  let errorMessage = 'Unable to determine if git directory is clean';

  try {
    clean = isGitClean.sync(process.cwd(), { files: ['!package.json'] });
    errorMessage = 'Git directory is not clean';
  } catch (e) { }
  if (!clean) {
    if (force) {
      console.log(`WARNING: ${errorMessage}.\nForcibly continuing.\n${ENSURE_BACKUP_MESSAGE}`);
    } else {
      console.log(`ERROR: ${errorMessage}. Refusing to continue.\n${ENSURE_BACKUP_MESSAGE}\nYou may use the --force flag to override this safety check.`);
      return false;
    }
  }
  return true;
}

const booleanFlags = ['apply', 'minimal', 'future', 'steal', 'force'];
const stringFlags = ['_', 'config', 'transform'];
const aliases = {
  a: 'apply',
  c: 'config',
  h: 'help',
  s: 'silent',
  t: 'transform'
};

const cli = meow(`
  Usage
  $ can-migrate [<file|glob> ...]

  Updates files according to the CanJS 3.0 migration paths (minimal, modern, future)
  More info: http://canjs.github.io/canjs/doc/migrate-3.html#Modernizedmigrationpath

  Options
  --apply     -a    Apply transforms (instead of a dry run)
  --force           Apply transforms regardless of git status
  --silent    -s    Silence output
  --config    -c    Path to custom config file
  --transform -t    specify a transform

  Examples
  can-migrate **/*.js
  can-migrate --apply **/*.js
  can-migrate -iad **/*.js
`, {
    boolean: booleanFlags,
    string: stringFlags,
    alias: aliases
  });

if (!cli.input.length) {
  cli.showHelp();
  return;
}

if(!checkGitStatus(cli.flags.force)) {
  process.exit(1);
}

globby(cli.input).then((paths) => {
  let toApply = transforms;
  let config;
  if (cli.flags.transform) {
    toApply = toApply.filter((t) => {
      return t.name.indexOf(cli.flags.transform) !== -1;
    });
  }
  if (cli.flags.config) {
    config = path.resolve(__dirname, cli.flags.config);
  }

  return series(toApply, (transform) => {
    const jscodeshiftPath = require.resolve('.bin/jscodeshift');
    let args = [
      '-t', transform.file
    ];

    if (!cli.flags.apply) {
      args.push('-d');
    }

    if (cli.flags.silent) {
      args.push('-s');
    }

    if (cli.flags.config) {
      args.push(`--config=${config}`);
    }

    // pass cli flags through to the transformer
    // as long as they are not in booleanFlags or stringFlags lists
    const ignoreArgs = [].concat(booleanFlags)
      .concat(stringFlags)
      .concat(Object.keys(aliases));

    for (const key in cli.flags) {
      if (ignoreArgs.indexOf(key) < 0) {
        args.push(`--${key}=${cli.flags[key]}`);
      }
    }

    args = args.concat(paths);

    return execa(jscodeshiftPath, args, { stdio: 'inherit' }).then(() => {
    }).catch(console.error.bind(console));
  });
});
