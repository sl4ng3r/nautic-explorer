import { readFileSync } from 'node:fs';

const names = ['behavior_pack', 'resource_pack', 'optional_symbols'];
const packs = names.map(name => JSON.parse(readFileSync(`addon/${name}/manifest.json`, 'utf8')));

describe('pack activation dependencies', () => {
  it('requests every pack regardless of which one is activated first', () => {
    for (const first of packs) {
      const reached = new Set<string>();
      const visit = (uuid: string) => {
        if (reached.has(uuid)) return;
        reached.add(uuid);
        const pack = packs.find(p => p.header.uuid === uuid);
        expect(pack, `unresolved dependency ${uuid}`).toBeDefined();
        for (const dep of pack.dependencies ?? []) {
          if (!dep.uuid) continue;
          const target = packs.find(p => p.header.uuid === dep.uuid);
          expect(target).toBeDefined();
          expect(dep.version).toEqual(target.header.version);
          visit(dep.uuid);
        }
      };
      visit(first.header.uuid);
      expect(reached).toEqual(new Set(packs.map(p => p.header.uuid)));
    }
  });
  it('keeps the linked resource packs scoped to worlds', () => {
    for (const pack of packs.filter(p => p.modules.every((m: {type: string}) => m.type === 'resources'))) expect(pack.header.pack_scope).toBe('world');
  });
});
