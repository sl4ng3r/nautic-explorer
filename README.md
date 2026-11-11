# Nautic Explorer

Ein Bedrock-Add-on für Unterwasserforscher.

Enthalten sind der fünfminütige Trank der Tiefenatmung, einfache und diamantene Flossen mit experimentellem Schwimmschub, Fleischbündel und ein interaktives Handbuch. Die Rezepte sind formlos und an der Werkbank herstellbar.

## Entwicklung

```sh
npm ci
npm test
npm run typecheck
npm run validate
npm run package
```

Danach liegt die aktuelle Testversion unter `test/nautic-explorer.mcaddon`. Diese letzte gebaute Testversion und der Build unter `dist/` werden bewusst im Git-Repository mitgeführt. Für einen versionierten Release wird `npm run package:release` ausgeführt; das Ergebnis liegt dann als `release/nautic-explorer-<version>.mcaddon` vor. Die Testdatei importiert Behavior, Resources und Symbols. Alle drei Packs sind über ihre Manifeste miteinander verknüpft: Behavior benötigt Resources und Symbols; beide Ressourcenpakete benötigen Behavior. Dadurch soll das Aktivieren eines beliebigen Packs alle drei aktivieren. Die Aktivierung über alle drei Einstiegspunkte muss in Bedrock geprüft werden; die automatisierten Tests prüfen nur die Abhängigkeitsstruktur. Symbols ist damit nicht mehr optional. Bei Konflikten mit anderen Schriftressourcen muss die Packkombination geprüft werden.

## Rezepte

| Item | Rezept |
|---|---|
| Fleischbündel | 9× verrottetes Fleisch |
| Trank der Tiefenatmung | 2× Fleischbündel, 2× Kugelfisch, 1× Glasflasche |
| Einfache Flossen | 3× getrockneter Seetangblock, 6× Leder |
| Diamantflossen | einfache Flossen, 1× Diamantblock, 2× Nautilusschale, 2× getrockneter Seetangblock |
| Handbuch der Tiefen | 1× Buch, 1× getrockneter Seetang |

## Teststatus

Die automatisierten Tests prüfen die fachliche Logik und die Packstruktur. Die Flossen verwenden experimentelle Bewegungsimpulse; ihre tatsächliche Wirkung und mögliche Nebenwirkungen müssen in einer echten Bedrock-Welt und anschließend auf dem Ziel-Realm vermessen werden. Die Impulsstärken sind keine bestätigten Geschwindigkeitsprozente.
