# keyboard_customized

Small keyboard, customized for a special presentation.

Et enkelt nettpiano med akkord-pads for iPad, laget for bruk i Stage Manager ved siden av andre apper (f.eks. Bilder og Musikk).

**Åpne:** https://eldarskjorten.github.io/keyboard_customized/

## Funksjoner (versjon 0.4)

- Flygellyd (Salamander Grand Piano). Alle anslag har samme styrke.
- **Pads over tangentene:** Bb, C og Dm (dypest til venstre), med en varm og fyldig synth-pad-lyd laget direkte i nettleseren. Myk og lik start hver gang.
  - Ett trykk starter akkorden (myk innfading). Et trykk på en annen pad bytter med en rask, jevn overgang uten hull, og et nytt trykk på samme pad stopper med en fade på ca. 1 s.
  - Padsene følger transponeringen (med +4 blir C → E, Dm → F#m og Bb → D). Sustain påvirker ikke padsene.
- **Sustain** av/på (gul knapp). Hvor lenge tonene klinger, velges med «Sustain-lengde» (standard 7 s). Når sustain slås av, dempes alle pianotoner du ikke holder inne.
- **Transp.** av/på (blå knapp). Standard er +4 halvtoner (C klinger som E). Antall velges i innstillingene (−12 til +12).
- **Innstillinger (⚙):**
  - laveste og høyeste tone og transponering
  - piano-volum, piano-romklang og sustain-lengde
  - vis/skjul pads, pad-volum og pad-romklang
- **Lampe:** grønn = klar, gul = laster lyd, rød = lyden har stoppet. Trykk på den røde lampen for å starte lyden på nytt.
- Lyden blandes med lyd fra andre apper (lydmodus «ambient»), i stedet for å stoppe dem.
- Virker uten nett etter at siden er åpnet én gang.
- Innstillingene huskes på iPad-en. Sustain starter alltid av.
- Tonenavn: norsk H for B, engelsk Bb for B-flat. C4 er midtre C.
- Alle C-tangenter er litt grå, så C er lett å finne uansett hvilket utsnitt av tangentene som vises.
- Tomt felt langs hele toppen (med et lite håndtak): iPadOS flytter vinduet når du drar i de øverste ca. 30 punktene, og her ligger ingen knapper eller tangenter. Over Sustain er det også tomt, der iPadOS viser vindusknappene.
- Tangentene blir ikke unaturlig lange i høye vinduer: overskytende høyde blir tomrom øverst.

## Andre sider

- **Piano visuell** (piano + pads + visningsfelt, brukes i presentasjoner): https://eldarskjorten.github.io/keyboard_customized/visuell/
  – se `visuell/README.md`. Reservekopi av forrige versjon: `visuell-0.2/`.
- **Sandkasse** (eksperimenter): https://eldarskjorten.github.io/keyboard_customized/sandkasse/

## Ideer til senere versjoner

Alle ideer (også for visuell og sandkasse) står samlet i [`IDEER.md`](IDEER.md). Utviklingsnotater: [`UTVIKLING.md`](UTVIKLING.md).

## Versjoner

- `main`: gjeldende versjon på adressen over (0.4, med pads).
- `stabil-v0.4`: versjonen med pads slik den ble godkjent (tilbakefallspunkt).
- `stabil-v0.1`: første testversjon uten pads (tilbakefallspunkt).
- `beta/`: kopi av 0.4 med egne innstillinger, beholdt så et eventuelt beta-ikon på Hjem-skjermen fortsatt virker.

## Lyd og lisens

Pianolyden er hentet fra [Salamander Grand Piano V3](https://github.com/sfzinstruments/SalamanderGrandPiano) av Alexander Holm, lisensiert under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Lydfilene i `samples/` er ett anslagsnivå (v12) som er trimmet, tonet ut, nivåjustert og konvertert til MP3. Pad-lyden lages direkte i nettleseren og bruker ingen lydfiler.
