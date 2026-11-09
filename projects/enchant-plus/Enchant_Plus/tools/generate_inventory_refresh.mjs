import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.title = 'Enchant_Plus.generate_inventory_refresh';

const toolsRoot = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(toolsRoot, '..', 'data', 'toybox', 'function', 'anvil_reset', 'refresh_inventory.mcfunction');
const slots = [];
for (let index = 0; index < 9; index++) slots.push({ command: `hotbar.${index}`, nbt: `${index}b` });
for (let index = 0; index < 27; index++) slots.push({ command: `inventory.${index}`, nbt: `${index + 9}b` });
slots.push(
  { command: 'weapon.offhand', nbt: '-106b' },
  { command: 'armor.feet', nbt: '100b' },
  { command: 'armor.legs', nbt: '101b' },
  { command: 'armor.chest', nbt: '102b' },
  { command: 'armor.head', nbt: '103b' },
);

const lines = [
  '# Event-bounded tooltip refresh. The stored NBT value, not the default item',
  '# component, decides whether a positive prior-work line is visible.',
];
for (const slot of slots) {
  lines.push(
    `scoreboard players set $anvil_cost ep_data 0`,
    `execute store result score $anvil_cost ep_data store result storage toybox:runtime anvil_lore.cost int 1 run data get entity @s Inventory[{Slot:${slot.nbt}}].components."minecraft:repair_cost"`,
    `execute if score $anvil_cost ep_data matches 1.. if items entity @s ${slot.command} *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s ${slot.command} toybox:anvil_lore_replace`,
    `execute if score $anvil_cost ep_data matches 1.. unless items entity @s ${slot.command} *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s ${slot.command} toybox:anvil_lore_insert`,
    `execute unless score $anvil_cost ep_data matches 1.. if items entity @s ${slot.command} *[minecraft:custom_data~{toybox:{anvil_lore:1b}}] run item modify entity @s ${slot.command} toybox:anvil_lore_remove`,
  );
}

fs.writeFileSync(output, `${lines.join('\n')}\n`, 'utf8');
console.log(`Generated ${slots.length} positive-cost slot refresh blocks: ${output}`);
