# Hermes S-Paket: Karton-Analyse (Stand 24.10.2026)

Quelle der Hermes-Bedingungen: myhermes.de "Preis- und Serviceübersicht gültig ab 02.03.2026"
(<https://www.myhermes.de/preise/paeckchen-paket/>). Vor dem Launch kurz gegenprüfen — Hermes ändert Preise und Bedingungen.

| Klasse | längste + kürzeste Seite | max. Gewicht (Zustellung) |
| --- | --- | --- |
| Päckchen | bis 37 cm | 25 kg |
| **S-Paket** | **bis 50 cm** | 25 kg (bei Abholung durch Hermes 31,5 kg) |
| M-Paket | bis 80 cm | 25 kg |

- Maßgeblich sind die **Außenmaße des fertig gepackten Pakets**; der Preis richtet sich nach den Maßen, nicht nach dem Gewicht.
- Mindestmaß: 15 × 10 × 1 cm.
- Nicht quaderförmige Pakete oder Pakete mit herausragenden Teilen gelten als **Sperrgut** (Zuschlag 19,95 €): Karton fest verschließen, nichts ausbeulen lassen.
- Preise S-Paket (Online-Paketschein): 4,89 € PaketShop-Zustellung, 5,79 € Haustür-Zustellung (im PaketShop erstellt: 6,79 €).

## Grundlage: gemessene Bücher (Höhe × Breite × Dicke, Gewicht)

Bücher liegen flach übereinander; Karton-Innenmaß = größte Höhe × größte Breite × Summe der Dicken.
Alle 84 möglichen Dreierkombinationen (9 Titel, 3 verschiedene) wurden gerechnet.

| Auswertung | Kombination | Maße (flach gestapelt) | Gewicht |
| --- | --- | --- | --- |
| größtes Volumen, größte Dicke, schwerste | Mushaf arabisch + Qur'an-Übersetzung + Riyadus Salihin | 24,5 × 17,5 × 9,5 cm | 2.338 g |
| 2. schwerste | Mushaf + Qur'an-Übersetzung + Sira | 24,5 × 17,5 × 9,0 cm | 2.053 g |

**Mindest-Innenmaß für jede Kombination:** 24,5 × 17,5 × 9,5 cm.

## Ergebnis

Mit realistischer Kartonwand (ca. 0,4 cm je Seite) und Polsterung liegt auch der größte Fall bei
**längste + kürzeste Seite ≈ 38,6 cm** — deutlich unter dem S-Limit von 50 cm. **Alle 84 Kombinationen passen voraussichtlich in ein S-Paket.**
Das Gewicht (max. 2,3 kg) ist unkritisch.

## Empfohlene Kartons (Innenmaße)

| | Innenmaß | Außen (ca.) | längste + kürzeste Seite | geeignet für |
| --- | --- | --- | --- | --- |
| **Karton A (groß)** | ≥ 26 × 19 × 11 cm | ≈ 26,8 × 19,8 × 11,8 cm | ≈ 38,6 cm → S-Paket | **alle 84 Kombinationen** |
| **Karton B (klein, optional)** | ≥ 23 × 16 × 8 cm | ≈ 23,8 × 16,8 × 8,8 cm | ≈ 32,6 cm | 35 Kombinationen ohne Mushaf und Riyadus Salihin (max. 7,2 cm Stapelhöhe, max. 1,26 kg) |

Hinweise:
- Wer nur einen Karton kaufen will: **Karton A** reicht für alles.
- Bei den kleinen Kombinationen (Karton B, ≈ 33 cm) wäre sogar die Hermes-Klasse „Päckchen“ (bis 37 cm) möglich — günstiger für die Empfänger. Vor der Nutzung das **gepackte** Paket nachmessen.
- Die Hermes-eigene S-Kartonage (35 × 34 × 15 cm) liegt mit genau 50 cm am Limit und ist unnötig groß — nicht empfohlen.
- Maßtoleranz: Karton nach dem Packen und Verschließen messen. Bücher nicht zusätzlich seitlich auffüllen, bis der Karton ausbeult.

## Was das Admin-Dashboard prüft

`src/lib/parcel.ts` schätzt für jede Bestellung den Karton aus den Buchmaßen (Zuschlag je Seite aus den Einstellungen, Standard 2 cm) und kennzeichnet
Bestellungen mit **„Paket prüfen“**, wenn Maße fehlen, das Ergebnis grenzwertig ist (< 3 cm Reserve), über dem S-Limit liegt oder über 25 kg wiegt.
Bücher mit „Maße unsicher“-Markierung (aktuell: *Das Gebet des Propheten*, Dicke 0,1 cm) werden mit 1 cm Aufschlag gerechnet.
Es bleibt eine **Schätzung ohne Garantie**; der tatsächlich gepackte Karton entscheidet.
