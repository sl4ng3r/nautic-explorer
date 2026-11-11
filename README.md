# Nautic Explorer

Ein Bedrock-Add-on für Unterwasserforscher.

Enthalten sind der fünfminütige Trank der Tiefenatmung, einfache Flossen mit +10 %, Diamantflossen mit +50 %, Fleischbündel und ein interaktives Handbuch. Die Rezepte sind formlos und an der Werkbank herstellbar.

## Entwicklung

```sh
npm ci
npm test
npm run typecheck
npm run validate
npm run package
```

Danach liegt `release/nautic-explorer.mcaddon` vor. Diese letzte gebaute Add-on-Version wird bewusst im Git-Repository mitgeführt. In Bedrock werden Behavior Pack und Resource Pack gemeinsam importiert und aktiviert. Das optionale Symbolpaket wird nur aktiviert, wenn die verwendete Welt keine kollidierende Schriftressource besitzt.

## Rezepte

| Item | Rezept |
|---|---|
| Fleischbündel | 9× verrottetes Fleisch |
| Trank der Tiefenatmung | 2× Fleischbündel, 2× Kugelfisch, 1× Glasflasche |
| Einfache Flossen | 3× getrockneter Seetangblock, 6× Leder |
| Diamantflossen | einfache Flossen, 1× Diamantblock, 2× Nautilusschale, 2× getrockneter Seetangblock |
| Handbuch der Tiefen | 1× Buch, 1× getrockneter Seetang |

## Teststatus

Die automatisierten Tests prüfen die fachliche Logik und die Packstruktur. Die Prozentwerte der Flossen müssen zusätzlich in einer echten Bedrock-Welt und anschließend auf dem Ziel-Realm vermessen werden, weil die Spielerbewegung nicht vollständig durch lokale TypeScript-Tests abbildbar ist.
