import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TEXT_KEYS } from '../src/domain/localization';

const lang = (locale: string) => Object.fromEntries(readFileSync(`addon/resource_pack/texts/${locale}.lang`, 'utf8').trim().split('\n').filter(Boolean).map(line => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));

describe('localization', () => {
  it('provides a nonempty English fallback and German value for every UI key', () => {
    for (const locale of ['en_US', 'de_DE']) {
      const translations = lang(locale);
      for (const key of Object.values(TEXT_KEYS)) expect(translations[key], `${locale}: ${key}`).toBeTruthy();
    }
  });
  it('keeps quantity placeholders in both languages', () => {
    for (const locale of ['en_US', 'de_DE']) {
      const translations = lang(locale);
      expect(translations[TEXT_KEYS.quantity]).toContain('%%1');
      expect(translations[TEXT_KEYS.quantity]).toContain('%%2');
    }
  });
  it('declares English and German as available languages', () => {
    expect(JSON.parse(readFileSync('addon/resource_pack/texts/languages.json', 'utf8'))).toEqual(expect.arrayContaining(['en_US', 'de_DE']));
  });
});
