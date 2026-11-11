# Sprintschwimmen: Recherche und offener Nachweis

Stand: 11. November 2026. Nutzer testet lokal mit Bedrock 26.63; späterer Zielbetrieb ist ein Realm. Kein messbarer Sprintschwimm-Bonus bisher bestätigt. Die Version ist eine Nutzerangabe, keine unabhängig geprüfte Laufzeit.

## Belegte Punkte

- `minecraft:movement` ist die allgemeine Bewegungskomponente. Die Dokumentation garantiert keine proportionale Änderung der Sprintschwimmgeschwindigkeit: [API](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entitymovementcomponent?view=minecraft-bedrock-stable).
- Mojangs [Spielerbeispiel](https://github.com/Mojang/bedrock-samples/blob/main/behavior_pack/entities/player.json) enthält `minecraft:movement`, aber kein `minecraft:underwater_movement`. Daraus folgt nicht sicher, welche Komponenten zur Laufzeit vorhanden sind.
- [EntityAttributeComponent](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entityattributecomponent?view=minecraft-bedrock-stable) stellt currentValue, effectiveMin/effectiveMax und setCurrentValue (boolean) bereit. Der frühere Adapter ignorierte den Rückgabewert; daraus folgt keine bestätigte Übernahme des Zielwerts.
- [Entity](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entity?view=minecraft-bedrock-stable) liefert Position, getVelocity, isSwimming und isSprinting sowie applyImpulse/applyKnockback. Die Dokumentation allein belegt keinen gleichmäßigen, Realm-tauglichen Schwimmbonus durch Impulse.
- [InputInfo](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/inputinfo?view=minecraft-bedrock-stable) liefert Bewegungseingaben. Ein späterer Vortrieb kann damit von bloßer Restbewegung unterschieden werden.
- [minecraft:water_movement](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_water_movement?view=minecraft-bedrock-stable) konfiguriert Wasserwiderstand in Entity-JSON. Ein allgemeiner Script-Setter dafür ist in der geprüften Component-API nicht dokumentiert. Eine Spielerdefinition zu überschreiben wäre ein separater Ansatz mit Konfliktpotenzial zu anderen Packs; keine bestätigte Lösung.

## Konkrete Schwachstellen des früheren Attributansatzes (bis 0.1.9)

1. In `MovementController.update` wird bei jeder unerwarteten Änderung des currentValue `suspended` gesetzt. Der Bonus bleibt bis zur Inaktivität aus. Ob der Sprintwechsel diese Änderung auslöst, ist eine Hypothese.
2. Ein abgewiesener oder begrenzter Setzversuch wird nicht als Fehler ausgewertet. Der danach gelesene tatsächliche Wert wird als `applied` gespeichert, auch wenn er nicht dem Ziel entspricht.
3. Die Statusanzeige zeigt den konfigurierten Prozentwert anhand der Flossen; sie bestätigt weder eine erfolgreiche Attributänderung noch die tatsächliche Geschwindigkeit.
4. Die bisherigen Mocktests prüfen die Controller-Rechnung. Sie simulieren weder Minecraft-Physik noch Clientbewegung oder Sprintwechsel.

Diese Punkte erklären mögliche Fehlerpfade, beweisen aber noch nicht die konkrete Ursache in der Nutzerwelt.

## Ursprünglicher Diagnosetest für den Attributansatz

- Nur in einer Weltkopie, mit Versionsprüfung des aktiven Packs. Teststrecke in ruhigem Wasser, ohne Strömung, Blasensäulen oder andere Bewegungseffekte.
- Pro Tick (nur für den Testspieler) currentTick, Position, Dimension, isInWater, isSwimming, isSprinting, Flossentyp, Eingabevektor und Velocity erfassen. Zusätzlich vor/nach Setzen currentValue, effectiveMin/Max, Zielwert, Rückgabewert und Controllerstatus protokollieren.
- Matrix: ohne Flossen / einfache Flossen / Diamantflossen, jeweils normales Schwimmen und Sprintschwimmen. Beide Reihenfolgen prüfen: erst Flossen dann Sprint sowie erst Sprint dann Flossen. Je Bedingung drei Durchläufe nach identischer Anlaufphase, mindestens zehn Sekunden geradeaus, identischer Wasserstand und Blickwinkel.
- Horizontale Strecke und verstrichene Simulationsticks vergleichen; für reale Spielgeschwindigkeit zusätzlich Wanduhrzeit erfassen. Vertikale Abweichung und Kollisionen als Ausschlussgrund protokollieren. Ausrüstung, Tod/Respawn, Ausloggen und Wasserverlassen separat testen.
- Interpretation: Kein übernommener Zielwert => Attribut-/API-Problem. Übernommen, dann suspended => Zustandswechselproblem. Dauerhaft übernommener Zielwert ohne Streckenänderung => für Sprintschwimmen unwirksamer Attributansatz.
- Erst anhand dieses Ergebnisses Controller korrigieren oder einen begrenzten Impuls-Prototyp separat prüfen. Dieser braucht Eingabegating, Geschwindigkeitsgrenzen, keinen Vortrieb im Stillstand/an Land und Tests für Kollision, Rückstoß, Auf-/Abtauchen und Multiplayer. Kein wiederholtes Multiplizieren der bereits beschleunigten Velocity und kein ungeprüftes clearVelocity.
- Danach Realm mit zwei Spielern und unterschiedlicher Latenz prüfen. Bis zur Streckenmessung gelten die Prozentangaben als Zielkonfiguration, nicht als bestätigter Gameplay-Bonus.

## Zusätzlicher Nutzertest 0.1.7

Diamantflossen sind auf +200 % gesetzt (Multiplikator 3 statt zuvor 1,6). Einfache Flossen bleiben bei +20 %. Handbuch und Status übernehmen diese Werte dynamisch. Das erhöht nur den angeforderten Attributwert; die Mechanik wurde nicht ersetzt. Falls weiterhin kein Unterschied entsteht, ist das ein weiterer Hinweis gegen einen bloß zu kleinen Bonus, aber noch keine Ursachenbestimmung.

## Rückmeldung und Diagnosepaket 0.1.8

Der Nutzer bestätigt: Im normalen Schwimmen ist mit 0.1.7 ein Bonus merkbar, beim Sprintschwimmen weiterhin nicht. Damit ist der Attributansatz nicht allgemein wirkungslos; es bleibt offen, ob Sprintschwimmen den Wert ignoriert oder unser Controller nach einem Zustandswechsel suspendiert.

Testbefehle in einer lokalen Weltkopie mit Cheats/Operatorrechten:

- `/scriptevent nautic:swim_probe hud`: Live-Diagnose oben rechts ein-/ausschalten. Speed ist horizontale Verschiebung seit der letzten Anzeige, alle zehn Simulationsticks; keine Messung der gesamten 3D-Geschwindigkeit und keine garantierte Echtzeitgeschwindigkeit bei Serverlag. Teleports, Strömung und Kollision können die Anzeige verfälschen.
- `/scriptevent nautic:swim_probe start`: Drei Sekunden Vorlauf, dann 200 Simulationsticks messen; aktiviert auch die Live-Diagnose. Ergebnis als JSON im Chat. Nach Ende bleibt nur die Live-Anzeige aktiv, kein fortlaufendes Messprotokoll.
- `/scriptevent nautic:swim_probe stop`: Lauf beenden und Diagnoseanzeige ausschalten. Die reguläre Statusanzeige bleibt bestehen.

Die Befehle wirken nur auf den ausführenden Spieler. Beim Verlassen wird der Diagnosezustand verworfen. Die Diagnose ändert weder Geschwindigkeit noch Ausrüstung; Diamant bleibt zum Test auf +200 %. Die Änderungen des Controllers in 0.1.8 erfassen ausschließlich Diagnoseinformationen.

Anzeigen: `Speed` = horizontale Geschwindigkeit pro Simulationssekunde, `Swim`/`Sprint` = jeweilige API-Zustände (1/0), `Paused` = suspendierter Controller (1/0), `Attr` = gelesener Bewegungswert, `Target` = angeforderter Zielwert. Die Chat-Auswertung enthält zusätzlich Werte vor/nach Update, Attributgrenzen, letzten boolean-Setterrückgabewert (falls vorhanden), Sampleanzahl, Vertikalabweichung und Zeitdauer. Die Live-Anzeige alleine ist kein vollständiges Log.

Zuerst drei gleiche, gerade Sprintdurchläufe ohne Flossen, mit normalen Flossen und mit Diamantflossen vergleichen. Zusätzlich den Wechsel von normalem Schwimmen zu Sprint im selben Wasserkontakt beobachten. `Paused=1` würde den vermuteten Abschaltpfad bestätigen, aber nicht beweisen, wer den Wert geändert hat. `Paused=0`, dauerhaft passender `Attr`/`Target` und unveränderte Strecke würden gegen diesen Abschaltpfad als Ursache sprechen. Normales Schwimmen gesondert als Positivkontrolle wiederholen. Noch keine Messung in einer echten Welt durch den Entwickler erfolgt.

## Weitere Recherche: Flossen anderer Bedrock-Add-ons

Nutzerkorrektur: Die Anzeige zeigt ungefähr 2 Blöcke/s normal und 4 beim Sprinten, jeweils sowohl mit als auch ohne Flossen. Der scheinbare normale Geschwindigkeitsgewinn kann mit einer Sichtfeldänderung zusammenhängen; eine unabhängige Streckenmessung steht aus. Keine dieser Angaben beweist die Ursache für Sprintschwimmen.

- Die Autorenseite des älteren [Artifacts Addon](https://mcpedl.com/artifacts-addon/) beschreibt Flossen, die mit Depth Strider III verzaubert werden. Das ist ein dokumentierter Bedrock-Ansatz über eine Vanilla-Verzauberung, keine Einsicht in den Quellcode und kein Nachweis der Funktionsweise mit Bedrock 26.63 oder unseren Items.
- Der Autor des neueren [Artifacts Add-on Unofficial Port](https://www.curseforge.com/minecraft-bedrock/addons/artifacts-add-on-unofficial-port) bewirbt +100 % Schwimmgeschwindigkeit und nennt Bedrock-26.60-Unterstützung. Die konkrete Implementierung der Flossen ist in der Beschreibung nicht dokumentiert; das Projekt nennt All Rights Reserved. Den Wert und seine Wirkung auf Sprint oder Sichtfeld nicht als unabhängig verifiziert übernehmen.
- Microsoft dokumentiert [minecraft:enchantable](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_enchantable?view=minecraft-bedrock-stable) mit `armor_feet` und den [ItemEnchantableComponent](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/itemenchantablecomponent?view=minecraft-bedrock-stable) samt `canAddEnchantment` und `addEnchantment`. Unsere beiden eigenen Itemdefinitionen haben derzeit `minecraft:wearable`, aber kein `minecraft:enchantable`. Aus der Dokumentation folgt nicht, dass die Verzauberung bei unseren Items automatisch vorhanden ist oder wie stark sie Sprintschwimmen erhöht.
- Bedrock dokumentiert [applyImpulse](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entity?view=minecraft-bedrock-stable#applyimpulse). Das ist ein alternativer Ansatz, keine gefundene validierte Flossenimplementierung. Bewegungsrichtung, fehlende Eingabe, Stöße, Kollisionen, Spieler-/Server-Synchronisierung und Realm-Latenz müssen separat geprüft werden.
- Frei einsehbaren, auf Bedrock 26.63 getesteten Quellcode für einen Flossenbonus beim Sprintschwimmen haben wir bei dieser Suche nicht gefunden. Java-/Fabric- und Paper-Implementierungen lassen sich nicht ohne Weiteres auf Bedrock übertragen.

### Nächster Vergleich auf einer Weltkopie

1. Gleiche gerade, ruhige Wasserstrecke mit Anlauf und Start-/Endmarkierung vorbereiten; keine Strömung, Blasensäulen oder weiteren Bewegungseffekte.
2. Normale Vanilla-Stiefel ohne Verzauberung sowie mit Depth Strider I und III testen; je drei Fahrten normales Schwimmen und Sprintschwimmen, Strecke und Stoppuhrzeit sowie Sichtfeld notieren. Identische Spielversion und Bedingungen verwenden. Bei jeder Messung dokumentieren, ob sie lokal oder auf einem Realm stattfand.
3. Nur wenn Vanilla einen geeigneten Unterschied zeigt: separaten Test für `armor_feet` auf eigenen Testitems mit `canAddEnchantment` erstellen; prüfen, ob die Verzauberung beim Ausrüsten, Craften, Speichern/Laden, Upgrade und Respawn erhalten bleibt, keine Nutzerverzauberungen überschreibt und ohne Cheats beim regulären Crafting gesetzt werden kann. Falls bereits existierende Flossen migriert werden müssen, item- und inventarsicher vorgehen.
4. Eigene Flossen ohne bestehende `minecraft:movement`-Manipulation und mit der neuen Variante vergleichen. Die bisherigen Anzeigen 20 %, 60 % bzw. Testwert 200 % sind nicht automatisch auf Verzauberungsstufen übertragbar; pro Tier messen. Normale Bewegung an Land, Sichtfeld, Richtungswechsel, Rückstoß, andere Add-ons, zwei Spieler und Realm separat prüfen.
5. Nur wenn Vanilla-Verzauberung nicht genügt, einen begrenzten Impuls-Prototyp isoliert erproben. Falls 20 %/60 % nicht zuverlässig und ohne störende Nebenwirkungen erreichbar sind, tatsächliche Grenzen offenlegen statt ungemessene Werte anzuzeigen.

## Untersuchung: Artifacts Add-on Unofficial Port 1.3.2

Am 11. November 2026 wurde die vom Autor auf [CurseForge veröffentlichte Datei](https://www.curseforge.com/minecraft-bedrock/addons/artifacts-add-on-unofficial-port/files/9396367) heruntergeladen und statisch gelesen, nicht ausgeführt. SHA-256: `71ab73ed94c8dcba0972c749760b86b04b51c8cbc884ee647081db86c402de4f`. Das Archiv lag außerhalb des Projekts unter `/private/tmp`; es wird nicht ins Repository übernommen. Die Dateien waren lesbar, eine Dekompilierung war nicht notwendig. Das Projekt weist All Rights Reserved aus; diese Notiz beschreibt ausschließlich die Funktionsweise.

- In `BP/scripts/items/loop_artifacts_slots.js` prüft der Autor im Abstand von fünf Ticks, ob die passenden Flossen ausgerüstet sind (oder das entsprechende Novelty-Tag vorhanden ist) und ob `player.isSwimming` wahr ist.
- Dann ruft das Add-on `applyKnockback` in Blickrichtung auf. Die horizontalen Anteile der Blickrichtung werden mit 1,25 multipliziert; die vertikale Stärke wird abhängig vom Vorzeichen der Blickrichtung auf 0,1 bzw. -0,1 gesetzt. Der Vortrieb ist also ein periodischer Bewegungsimpuls, keine Änderung von `minecraft:movement` und in diesem Codeabschnitt keine Depth-Strider-Zuweisung.
- Das Item selbst ist unter `BP/items/flippers.json` verzauberbar und für den Fuß-Slot vorgesehen. Das macht Depth Strider grundsätzlich möglich, beweist aber nicht, dass die Flossen beim Erstellen automatisch damit ausgestattet werden.
- Die Manifest-Abhängigkeit ist `@minecraft/server` 2.12.0-beta. Ob dieselbe Technik mit der stabilen, von Nautic Explorer verwendeten Version und ohne experimentelle Einstellungen funktioniert, muss gesondert geprüft werden.
- Die Bedingung zeigt keine Prüfung auf laufende Vorwärts-Eingabe und keine geschwindigkeitsabhängige Regelung. Ob `isSwimming` allein Vortrieb im Stillstand unter konkreten Bedingungen ausschließt, wurde nicht getestet. Blickrichtung, vertikale Bewegung, Kollisionen, Rückstoß, Realm-Synchronisation und die beworbenen 100 % sind ebenfalls nicht vermessen.

Nächster möglicher eigener Versuch: eine eigenständige Testimplementierung mit begrenztem Impuls, expliziter Prüfung von Wasser/Schwimmzustand und tatsächlicher Eingabe, ohne Änderung von `minecraft:movement`; optionaler Diagnosevergleich und Notabschaltung. Stärke und Zeitabstand müssen getrennt für beide Flossentypen anhand gemessener Strecken kalibriert werden. Vor einer Übernahme: Verhalten beim Loslassen, Richtungswechsel, in Strömung, bei Rückstoß, an Wänden und mit mehreren Spielern auf dem Realm prüfen; keine ungemessenen Prozentwerte versprechen.


## Experiment 0.1.10: Vortrieb durch Impulse

Die Testversion ersetzt den bisherigen Attributcontroller durch eigenständig implementierte Impulse über `applyKnockback`: alle fünf Ticks bei Flossen, Vorwärtseingabe und Wasserkontakt; kein Impuls beim Reiten oder oberhalb der Geschwindigkeitsgrenze. Die Blickrichtung bestimmt den Vortrieb. Die Kraftwerte sind unkalibriert und entsprechen keinen bestätigten 20 % oder 200 %. Der Code ändert `minecraft:movement` nicht; ob Sichtfeld, Steuerung und Client-/Realm-Synchronisierung tatsächlich unbeeinträchtigt bleiben, muss im Spiel geprüft werden.

Die Diagnosebefehle aus 0.1.8 gelten weiterhin. Das HUD zeigt `Boost` als letzten Impulszustand, `Error` bei einem API-Fehler und `Attr` nur als gelesenen Bewegungswert; `Paused` und `Target` entfallen. Ein Fehler schaltet den Impuls für diesen Spieler bis zum Verlassen der Welt ab. `boostActiveSamples` zählt Messpunkte, an denen der letzte Impuls aktiv war, nicht einzelne Impulse. Die reine horizontale Geschwindigkeitsanzeige kann bei Auf-/Abtauchen und Kollisionen irreführen.

Auf einer Weltkopie ohne Strömung je mindestens drei gleich lange Strecken mit konstantem Blickwinkel messen: keine, einfache und Diamantflossen, jeweils normal und sprintend. Boost und Error beobachten und Sichtfeld, Loslassen, Auftauchen, Wände, Rückstoß, Ausziehen und Wechsel zwischen Land und Wasser prüfen. Erst nach lokaler Prüfung mit mehreren Spielern auf einem Realm testen. Die automatisierten Tests simulieren keine Bedrock-Physik.


## Experiment 0.1.11: Direkter Impuls

Rückmeldung zu 0.1.10: Bewegung ruckelt, möglicherweise auch langsamer. Alle fünf Ticks wurde `applyKnockback` verwendet; ob die Rückstoßbehandlung, Synchronisierung oder ein anderer Faktor die Ursache ist, ist nicht nachgewiesen. Für den isolierten Vergleich ersetzt 0.1.11 nur `applyKnockback` durch `applyImpulse`, bei gleicher Richtung, Stärke und gleichem Abstand. Laut [Entity-API](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entity?view=minecraft-bedrock-stable#applyimpulse) wirkt diese Methode auf die Geschwindigkeit; ob sie bei Spielern in 26.63 lokal und auf Realms tatsächlich Wirkung zeigt, ist ungeprüft. `Boost=1` besagt nur, dass der API-Aufruf ohne Fehler erfolgte, nicht dass sich die Geschwindigkeit geändert hat. Wenn kein Effekt auftritt oder das Ruckeln bleibt, ist dieser Versuch gescheitert.
