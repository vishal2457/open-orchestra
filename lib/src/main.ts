import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

type InvocationMode = 'auto' | 'manual';

type AgentConfig = {
  dependsOn: string[];
  next: string | null;
  invocation: InvocationMode;
};

type OrchestraSettings = {
  version: 1;
  install: {
    skillsSource: string;
    installedBy: string;
  };
  workflow: {
    sequence: string[];
    agents: Record<string, AgentConfig>;
  };
};

const SETTINGS_FILE = 'orchestra-settings.json';
const SKILLS_SOURCE =
  'https://github.com/vishal2457/open-orchestra/tree/main/skills';

const DEFAULT_SETTINGS: OrchestraSettings = {
  version: 1,
  install: {
    skillsSource: SKILLS_SOURCE,
    installedBy: 'open-orch init',
  },
  workflow: {
    sequence: ['planning-agent', 'implementation-agent', 'pr-review-agent'],
    agents: {
      'planning-agent': {
        dependsOn: [],
        next: 'implementation-agent',
        invocation: 'auto',
      },
      'implementation-agent': {
        dependsOn: ['planning-agent'],
        next: 'pr-review-agent',
        invocation: 'auto',
      },
      'pr-review-agent': {
        dependsOn: ['implementation-agent'],
        next: null,
        invocation: 'manual',
      },
    },
  },
};

async function main() {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === '--version' || command === '-v') {
    printVersion();
    return;
  }

  if (command !== 'init') {
    exitWithError(`Unknown command: ${command}`);
  }

  await runInit(rest);
}

async function runInit(args: string[]) {
  const force = args.includes('--force');
  const cwd = process.cwd();
  const settingsPath = path.join(cwd, SETTINGS_FILE);

  const settingsAction = force
    ? await writeSettings(settingsPath, DEFAULT_SETTINGS)
    : await ensureSettings(settingsPath, DEFAULT_SETTINGS);

  const installOutcome = installSkills(cwd);

  printSummary(cwd, settingsAction, installOutcome);
}

async function ensureSettings(
  settingsPath: string,
  settings: OrchestraSettings
): Promise<'created' | 'reused'> {
  if (existsSync(settingsPath)) {
    return 'reused';
  }

  await writeSettings(settingsPath, settings);
  return 'created';
}

async function writeSettings(
  settingsPath: string,
  settings: OrchestraSettings
): Promise<'created'> {
  await mkdir(path.dirname(settingsPath), { recursive: true });
  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
  return 'created';
}

function installSkills(cwd: string): 'installed' {
  execFileSync(
    'npx',
    ['skills', 'add', SKILLS_SOURCE],
    {
      cwd,
      stdio: 'inherit',
    }
  );

  return 'installed';
}

function printSummary(
  cwd: string,
  settingsAction: 'created' | 'reused',
  installOutcome: 'installed'
) {
  const settingsPath = path.join(cwd, SETTINGS_FILE);

  console.log('');
  console.log('Open Orchestra initialization complete.');
  console.log(
    `- ${SETTINGS_FILE}: ${
      settingsAction === 'created' ? `created at ${settingsPath}` : `reused at ${settingsPath}`
    }`
  );
  console.log(`- core skills: ${installOutcome} from ${SKILLS_SOURCE}`);
  console.log('');
  console.log(
    `Edit ${SETTINGS_FILE} to add agents, change dependencies, or switch handoffs between auto and manual.`
  );
}

function printHelp() {
  console.log(`open-orch

Usage:
  npx open-orch init [--force]

Commands:
  init       Create orchestra-settings.json in the current directory and install the core Open Orchestra skills.

Options:
  --force    Overwrite orchestra-settings.json with the default workflow before installing skills.
  -h, --help Show this help message.
  -v, --version Show the package version.
`);
}

function printVersion() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    console.log(packageJson.version);
  } catch {
    console.log('unknown');
  }
}

function exitWithError(message: string): never {
  console.error(message);
  console.error('Run `npx open-orch --help` for usage.');
  process.exit(1);
}

void main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Unknown error while running open-orch.';
  exitWithError(message);
});
