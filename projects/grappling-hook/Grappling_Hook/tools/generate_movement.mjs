import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Minecraft Grappling Movement Generator';

const toolsRoot = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.resolve(toolsRoot, '..', 'data', 'grapple', 'function', 'movement');
fs.mkdirSync(outputRoot, { recursive: true });

const variants = [
  ['air_far', '0.75', '0.375'],
  ['air_medium', '0.60', '0.30'],
  ['air_near', '0.40', '0.20'],
  ['water_far', '0.375', '0.1875'],
  ['water_medium', '0.30', '0.15'],
  ['water_near', '0.20', '0.10'],
];

function collisionMove(step) {
  const samples = [
    ['-0.31', '0.01', '-0.31'], ['-0.31', '0.01', '0.31'],
    ['0.31', '0.01', '-0.31'], ['0.31', '0.01', '0.31'],
    ['-0.31', '1', '-0.31'], ['-0.31', '1', '0.31'],
    ['0.31', '1', '-0.31'], ['0.31', '1', '0.31'],
    ['-0.31', '1.79', '-0.31'], ['-0.31', '1.79', '0.31'],
    ['0.31', '1.79', '-0.31'], ['0.31', '1.79', '0.31'],
  ];
  const checks = samples.map(([x, y, z]) => `if block ~${x} ~${y} ~${z} #grapple:movement_passable`).join(' ');
  return `execute store success score $moved gh_tmp run execute facing entity @s eyes positioned ^ ^ ^${step} ${checks} run tp @a[tag=grapple.current,limit=1] ~ ~ ~`;
}

for (const [name, primary, half] of variants) {
  const primaryText = [
    `# ${name}: full step, then a collision-safe half step fallback.`,
    collisionMove(primary),
    `execute if score $moved gh_tmp matches 0 run function grapple:movement/${name}_half`,
    '',
  ].join('\n');
  const halfText = [
    `# ${name}: half step fallback.`,
    collisionMove(half),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(outputRoot, `${name}.mcfunction`), primaryText, 'utf8');
  fs.writeFileSync(path.join(outputRoot, `${name}_half.mcfunction`), halfText, 'utf8');
}

console.log(`Generated ${variants.length * 2} collision-checked movement functions in ${outputRoot}`);
