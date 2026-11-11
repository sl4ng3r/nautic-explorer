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

Die Flossengeschwindigkeit nutzt die verfügbare Spieler-Komponente `minecraft:underwater_movement`. Vor einer produktiven Realm-Abnahme muss die Geschwindigkeit in einer echten Welt gemessen werden. Falls die Komponente auf der Zielversion nicht verfügbar ist, meldet das Skript keinen künstlichen Vortrieb; dann muss die Bewegungstechnik gegen die konkrete Bedrock-Version angepasst werden.
