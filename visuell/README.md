# Piano visuell

Piano + pads + visningsfelt i samme vindu. Hovedversjonen i rotmappen er ikke endret.
Denne mappen er «det enkleste som funker» til presentasjonen. Nye ideer prøves i `sandkasse/`.

**Åpne:** https://eldarskjorten.github.io/keyboard_customized/visuell/
**Forrige versjon (0.2), hvis noe ikke virker:** https://eldarskjorten.github.io/keyboard_customized/visuell-0.2/

## Nytt i 0.3.2

- Notene har fast størrelse, uansett hvor mange tangenter som vises. Notelinjene står i midten av hver linje,
  med luft over og under (plass til toner fra G3 til C6 uten at de når skillelinjene). Notene er litt mindre enn før.
  Størrelsen følger bare høyden på linjene (antall linjer og vindusstørrelse).
- Innstillinger: «Lyseste tone» står over «Dypeste tone», og lyseste tone står øverst i lista.

## Nytt i 0.3.1

- Notelinjene er klar blå og tynne, så de skilles fra de grå skillelinjene mellom linjene i feltet.
- Ingen forklaringstekst i feltet når det er tomt (heller ikke i «Bilder» før første bilde vises; telleren viser «0 / n»).

## Nytt i 0.3

- Standardlyd: piano 75 %, romklang av, sustain 5 s. Pads 70 %, romklang 50 %. (Tatt i bruk én gang, også om noe var lagret.)
- Visningsfeltet til venstre: knappene (Sustain, Transp., ⚙, lampe) ligger over pads, ikke helt til venstre.
- «Størrelse på visningsfeltet» (⚙ → Visning): 30–70 % av bredden (til venstre) eller høyden (over). Huskes for hver plassering.
- «Bilder»: nye bilder legges til de som er der (før ble de erstattet). Ett bilde kan fjernes i lista under ⚙ → Visning.
- «Bilder» samlet i linjer: bildene kommer fram ett og ett og blir stående, med én plass per linje i «Spill»
  (to per linje når feltet ligger over). Trykk i feltet for neste. «Ett og ett» (hele feltet) kan velges i innstillingene.
- Hold inne «Angre»: «Ikke angre likevel».
- «Rutenett»: C-linjene er blågrå (som C-tangentene, som nå også er svakt blågrå), de andre linjene svakere,
  og skillelinjene mellom linjene tydeligere.
- Tonelengden lagres (ikke synlig ennå; forberedelse til avspilling senere).

## Visningsfeltet

Ligger over pads og tangenter, eller til venstre for dem (⚙ → Visning → Plassering).

- **Spill:** notehoder uten halser tegnes mens du spiller.
  - Loddrett = tonehøyde som på noter (hver hvite tangent er ett trinn; # og b står på sin tone med fortegn).
  - Vannrett = tid, så avstanden viser rytme og varighet. Avstanden er fast og krymper bare hvis en linje ikke får plass.
  - Hver frase får sin egen linje, og alle linjer starter likt til venstre, så motiv, repetisjon og variasjon kan sammenlignes.
  - **Ny linje:** knappen, eller automatisk etter en pause (velges i innstillingene).
  - **Angre** fjerner siste linje (eller henter tilbake etter «Tøm»). Neste tone havner alltid på en ny linje.
    **Hold inne** for «Ikke angre likevel».
  - **Tøm** tømmer feltet.
  - **Frys:** det som står, blir stående mens du spiller fritt. Trykk igjen (eller «Ny linje») for å skrive videre.
  - **Rutenett:** svake linjer for hver hvite tangent, C-linjene blågrå (med navn helt til høyre).
  - **Notelinjer:** fem blå notelinjer som i G-nøkkel, med hjelpelinjer for toner over og under.
  - **Navn på linjer:** trykk i venstre felt på en linje. Hver del (Motiv, Kontrast, Slutt …) har sin farge;
    «Repetisjon» er samme farge, blekere, og «Variasjon» er samme farge, stripete.
    Delene (navn, farge, rekkefølge) endres under ⚙ → Visning.
  - Det som står i feltet, huskes til du trykker «Tøm», også om siden lastes på nytt.
  - Notene vises slik tangentene heter (ikke transponert). Pads tegnes ikke.
- **Bilder:** egne bilder, f.eks. skjermbilder av linjer fra «Spill» (beskjært). Vises i filnavn-rekkefølge.
  - **Samlet i linjer** (standard): trykk i feltet, sveip eller › for neste bilde; ‹ skjuler det siste.
    Flere bilder enn plasser: neste bilde starter en ny side.
  - **Ett og ett:** hvert bilde fyller hele feltet.
  - Innstillingene viser hvilken form (bredde : høyde) som fyller en plass best akkurat nå.
  - Piltaster og presentasjonsklikkere (PageDown/PageUp) virker også.
  - Bildene lagres på iPaden (Safari og Hjem-skjerm-appen har hvert sitt lager).

Visningsfeltet kan slås av i innstillingene, og da er siden som det vanlige pianoet.
Innstillingene lagres separat fra hovedversjonen.

Sandkasse med flere ideer (Under/Etter, Del for del, Melodier): https://eldarskjorten.github.io/keyboard_customized/sandkasse/
