# keyboard_customized

Small keyboard, customized for a special presentation.

Et enkelt nettpiano med akkord-pads for iPad, laget for bruk i Stage Manager ved siden av andre apper (f.eks. Bilder og Musikk).

**Åpne:** https://eldarskjorten.github.io/keyboard_customized/

## Funksjoner (versjon 0.2)

- Flygellyd (Salamander Grand Piano). Alle anslag har samme styrke.
- **Pads over tangentene:** C, Dm og Bb, med en varm synth-pad-lyd laget direkte i nettleseren.
  - Ett trykk starter akkorden. Et trykk på en annen pad bytter, og et nytt trykk på samme pad stopper med en kort fade.
  - Padsene følger transponeringen (med +4 blir C → E, Dm → F#m og Bb → D). Sustain påvirker ikke padsene.
- **Sustain** av/på (gul knapp). Når den slås av, dempes alle pianotoner du ikke holder inne.
- **Transp.** av/på (blå knapp). Standard er +4 halvtoner (C klinger som E). Antall velges i innstillingene (−12 til +12).
- **Innstillinger (⚙):**
  - laveste og høyeste tone og transponering
  - piano-volum og piano-romklang
  - vis/skjul pads, pad-volum og pad-romklang
- **Lampe:** grønn = klar, gul = laster lyd, rød = lyden har stoppet. Trykk på den røde lampen for å starte lyden på nytt.
- Lyden blandes med lyd fra andre apper (lydmodus «ambient»), i stedet for å stoppe dem.
- Virker uten nett etter at siden er åpnet én gang.
- Innstillingene huskes på iPad-en. Sustain starter alltid av.
- Tonenavn: norsk H for B, engelsk Bb for B-flat. C4 er midtre C.

## Ideer til senere versjoner

- Innstilling: gli med fingeren over tangentene gir nye toner (ja/nei). I dag gir bare nye trykk nye toner.
- Grunntonen spilt på piano når en pad slås an (slik Audanika gjør).
- Velge egne akkorder på padsene.
- Pad-modus «hold» (lyd bare mens fingeren ligger på) som alternativ til av/på.

## Versjoner

- `main`: gjeldende versjon på adressen over.
- `stabil-v0.1`: første testversjon uten pads (tilbakefallspunkt).

## Lyd og lisens

Pianolyden er hentet fra [Salamander Grand Piano V3](https://github.com/sfzinstruments/SalamanderGrandPiano) av Alexander Holm, lisensiert under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Lydfilene i `samples/` er ett anslagsnivå (v12) som er trimmet, tonet ut, nivåjustert og konvertert til MP3. Pad-lyden lages direkte i nettleseren og bruker ingen lydfiler.
