#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import chalk from "chalk";
import {
  camelCase,
  constantCase,
  kebabCase,
  pascalCase,
  snakeCase,
} from "change-case";
import meow from "meow";
import pluralize from "pluralize";

const { plural, singular } = pluralize;

const HELPERS = {
  plural,
  singular,
  camelCase,
  constantCase,
  kebabCase,
  pascalCase,
  snakeCase,
};

function compile(opts, str, preprocess) {
  const ctx = { t: opts.replacement, ...HELPERS };
  return str.replace(/\{\{(.+?)\}\}/g, (_, expression) => {
    const trimmed = expression.trim();
    const exp = preprocess(trimmed);
    try {
      const func = new Function(...Object.keys(ctx), `return ${exp};`);
      return func(...Object.values(ctx));
    } catch {
      console.error(chalk.red(`Evaluation was failed:\n  ${trimmed}`));
      process.exit(1);
    }
  });
}

function compileBody(opts, tplBody) {
  return compile(opts, tplBody, (expression) => expression);
}

function compilePath(opts, tplDir, tplPath) {
  return compile(
    opts,
    join(opts.out, relative(tplDir, tplPath)),
    (expression) => expression.replace(/\[/g, "(").replace(/\]/g, ")"),
  ).replace(/\.tpl$/, "");
}

async function generate(opts, tplDir, dirent) {
  const { name, parentPath } = dirent;
  const tplPath = join(parentPath, name);
  const tplBody = await readFile(tplPath, { encoding: "utf8" });
  const content = compileBody(opts, tplBody);
  const outputPath = compilePath(opts, tplDir, tplPath);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, content, { encoding: "utf8" });
  console.log(chalk.green(outputPath));
}

async function sscg(opts, tplName) {
  const startedAt = new Date();
  const tplDir = join(opts.dir, tplName);
  console.log(`Generate from '${chalk.blue(tplDir)}'...\n`);
  try {
    const dirents = await readdir(tplDir, {
      recursive: true,
      withFileTypes: true,
    });
    const targets = dirents.filter(
      (d) => d.isFile() && extname(d.name) === ".tpl",
    );
    await Promise.all(targets.map((t) => generate(opts, tplDir, t)));
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(chalk.red(`'${tplDir}' was not found`));
      process.exit(1);
    }
    throw err;
  }
  const finishedAt = new Date();
  console.log(`\nDone in ${finishedAt - startedAt}ms`);
}

const { input, flags } = meow(
  `
    Usage:
      $ sscg <name> [options]

    Options:
      -r, --replacement <text>    The string that replaces tokens in templates
      -o, --out <dir>             The output directory where generated codes are located
      -d, --dir <dir>             The directory where templates are located (default: ./templates)

    Example:
      $ sscg model -r user -o ./models
  `,
  {
    importMeta: import.meta,
    flags: {
      replacement: {
        type: "string",
        shortFlag: "r",
        isRequired: true,
      },
      out: {
        type: "string",
        shortFlag: "o",
        isRequired: true,
      },
      dir: {
        type: "string",
        shortFlag: "d",
        default: "./templates",
        isRequired: true,
      },
    },
  },
);

if (input.length <= 0) {
  console.error(chalk.red("Template name is required"));
  process.exit(1);
}

sscg(flags, input[0]);
