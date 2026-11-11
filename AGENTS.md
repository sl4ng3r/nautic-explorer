# Nautic Explorer

Minecraft Bedrock Add-on für Unterwassererkundung. Das Projekt erzeugt ein Behavior Pack, ein Resource Pack und ein optionales Symbolpaket für die Actionbar.

## Befehle

- `npm ci` installiert die festgeschriebenen Entwicklungsabhängigkeiten.
- `npm test` führt die reinen Domain- und Balancetests aus.
- `npm run typecheck` prüft TypeScript.
- `npm run build` bündelt das Bedrock-Skript nach `dist/` und kopiert die Packs.
- `npm run validate` prüft alle Pack-JSON-Dateien und Manifeste.
- `npm run package` baut und erstellt die aktuelle Testversion `test/nautic-explorer.mcaddon`.
- `npm run package:release` baut einen versionierten Release unter `release/nautic-explorer-<version>.mcaddon`.

## Architektur

- `src/domain/` enthält testbare, Minecraft-unabhängige Rezept-, Zeit-, Flossen- und Statuslogik.
- `src/runtime/main.ts` enthält die Bedrock-Laufzeitintegration.
- `addon/behavior_pack/` enthält Items, Rezepte und das Packmanifest.
- `addon/resource_pack/` enthält Texturen, Übersetzungen, Modelle und Attachables.
- `addon/optional_symbols/` enthält die separat aktivierbaren Statussymbole.

## Datenhaltung und Deployment

Das Add-on hat keine externe Datenbank, keine Geheimnisse und keinen Serverdienst. Die individuelle Statusanzeige wird als Spieler-Tag gespeichert. Import erfolgt über die erzeugte `.mcaddon`-Datei; das optionale Symbolpaket kann bei Konflikten deaktiviert werden. Eine Docker-Compose- oder Deploy-Cockpit-Installation ist für den ausdrücklich gewählten Welt-/Realm-Betrieb nicht erforderlich.

## Laufzeitgrenzen

Die Flossen ändern versuchsweise die Spieler-Komponente `minecraft:movement` nur im Wasser und stellen den Ausgangswert beim Verlassen des Wassers oder Ausziehen wieder her, sofern keine andere Änderung erkannt wurde. Normales Schwimmen und Sprintschwimmen, andere Effekte, Ausloggen und Landbewegung müssen vor Realm-Einsatz in einer echten Welt geprüft und gemessen werden; die tatsächlichen Prozentwerte sind nicht belegt. Die HUD-Position muss bei verschiedenen Bildschirmgrößen und gleichzeitigen Effekten geprüft werden.

## Bewegungsdiagnose

Nur für Entwicklertests in einer Weltkopie: `/scriptevent nautic:swim_probe hud` schaltet die Live-Messwerte ein/aus; `start` startet nach drei Sekunden einen zehnsekündigen Messlauf mit Chat-Ergebnis; `stop` beendet Lauf und Diagnose. Erfordert Cheats/Operatorrechte. Keine Einstellung für normale Spieler. Details und Grenzen: `docs/swim-speed-research.md`.
