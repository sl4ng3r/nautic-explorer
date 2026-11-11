# Sprintschwimmen: Recherche und offener Nachweis

Stand: 11. November 2026. Nutzer testet lokal mit Bedrock 26.63; späterer Zielbetrieb ist ein Realm. Kein messbarer Sprintschwimm-Bonus bisher bestätigt. Die Version ist eine Nutzerangabe, keine unabhängig geprüfte Laufzeit.

## Belegte Punkte

- `minecraft:movement` ist die allgemeine Bewegungskomponente. Die Dokumentation garantiert keine proportionale Änderung der Sprintschwimmgeschwindigkeit: [API](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entitymovementcomponent?view=minecraft-bedrock-stable).
- Mojangs [Spielerbeispiel](https://github.com/Mojang/bedrock-samples/blob/main/behavior_pack/entities/player.json) enthält `minecraft:movement`, aber kein `minecraft:underwater_movement`. Daraus folgt nicht sicher, welche Komponenten zur Laufzeit vorhanden sind.
- [EntityAttributeComponent](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entityattributecomponent?view=minecraft-bedrock-stable) stellt currentValue, effectiveMin/effectiveMax und setCurrentValue (boolean) bereit. Unser Adapter ignoriert den Rückgabewert; die Annahme eines übernommenen Zielwerts muss gemessen werden.
- [Entity](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/entity?view=minecraft-bedrock-stable) liefert Position, getVelocity, isSwimming und isSprinting sowie applyImpulse/applyKnockback. Die Dokumentation allein belegt keinen gleichmäßigen, Realm-tauglichen Schwimmbonus durch Impulse.
- [InputInfo](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/inputinfo?view=minecraft-bedrock-stable) liefert Bewegungseingaben. Ein späterer Vortrieb kann damit von bloßer Restbewegung unterschieden werden.
- [minecraft:water_movement](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/examples/entitycomponents/minecraftcomponent_water_movement?view=minecraft-bedrock-stable) konfiguriert Wasserwiderstand in Entity-JSON. Ein allgemeiner Script-Setter dafür ist in der geprüften Component-API nicht dokumentiert. Eine Spielerdefinition zu überschreiben wäre ein separater Ansatz mit Konfliktpotenzial zu anderen Packs; keine bestätigte Lösung.

## Konkrete Schwachstellen unseres aktuellen Ansatzes

1. In `MovementController.update` wird bei jeder unerwarteten Änderung des currentValue `suspended` gesetzt. Der Bonus bleibt bis zur Inaktivität aus. Ob der Sprintwechsel diese Änderung auslöst, ist eine Hypothese.
2. Ein abgewiesener oder begrenzter Setzversuch wird nicht als Fehler ausgewertet. Der danach gelesene tatsächliche Wert wird als `applied` gespeichert, auch wenn er nicht dem Ziel entspricht.
3. Die Statusanzeige zeigt den konfigurierten Prozentwert anhand der Flossen; sie bestätigt weder eine erfolgreiche Attributänderung noch die tatsächliche Geschwindigkeit.
4. Die bisherigen Mocktests prüfen die Controller-Rechnung. Sie simulieren weder Minecraft-Physik noch Clientbewegung oder Sprintwechsel.

Diese Punkte erklären mögliche Fehlerpfade, beweisen aber noch nicht die konkrete Ursache in der Nutzerwelt.

## Nächster gezielter Diagnosetest

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
