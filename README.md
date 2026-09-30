# Parole Fluttuanti

Pagina da proiettare in aula: una dozzina di parole chiave fluttuano sullo schermo in direzioni casuali e rimbalzano sui bordi. Utile come apertura di un modulo ("quali di queste sapete spiegare?") o come ripasso finale.

Modalità: **proiettata, un solo operatore**. HTML/CSS/JS vanilla, nessuna libreria esterna.

## Come si usa in aula

1. Apri la pagina (link GitHub Pages) sul PC collegato al proiettore.
2. Premi **F** per lo schermo intero e **H** per nascondere il pannello dei comandi.
3. **Clicca su una parola** per fermarla ed evidenziarla (più grande, sfondo giallo, simbolo ▶): è il momento per chiedere alla classe di spiegarla. Riclicca per rilasciarla.

### Comandi

| Tasto | Pulsante | Azione |
|---|---|---|
| Spazio | ⏸ Pausa | Ferma / riprende il movimento |
| + / − | Veloce / Lento | Velocità da 0,25× a 3× |
| R | ↻ Rimescola | Nuove posizioni e direzioni casuali |
| F | ⛶ Schermo intero | Entra / esce dallo schermo intero |
| H | — | Nasconde / mostra il pannello |
| Clic o Invio su una parola | — | Evidenzia / rilascia la parola |

## Cambiare le parole

Le parole stanno in `contenuti/parole.json`. Per un altro corso basta sostituire quel file (o crearne un altro e caricarlo col pulsante **📂 Carica JSON**, anche a lezione in corso).

### Schema del JSON

```json
{
  "titolo": "AI literacy - concetti base",
  "parole": ["Algoritmo", "IA", "Prompt"]
}
```

- `titolo` (facoltativo): solo promemoria, non viene mostrato.
- `parole` (obbligatorio): elenco di testi tra virgolette, da 1 a 40. Consigliate 8-15 per una buona leggibilità.
- È accettato anche un semplice elenco: `["Algoritmo", "IA", "Prompt"]`.

Se il file ha un problema compare un avviso in alto, per esempio: *"La parola numero 4 è vuota o non è un testo tra virgolette."*

### Aprire la pagina dal computer (senza internet)

Aprendo `index.html` con doppio clic il browser blocca la lettura automatica del JSON: la pagina mostra comunque le parole predefinite (quelle dell'esempio, scritte in `app.js`) e puoi caricarne altre con **📂 Carica JSON**.

## Personalizzare

- Colori e dimensione delle parole: variabili in cima a `style.css` (`--dimensione-parola`, `--accento`, …).
- Velocità di base: costante `VELOCITA_BASE` in `app.js`.

## Struttura

```
index.html
style.css
app.js
contenuti/parole.json
README.md
```
