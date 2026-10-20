// =====================================================================
// PAROLE FLUTTUANTI
// Le parole si muovono in direzioni casuali e rimbalzano sui bordi.
// Le parole vengono da contenuti/parole.json (vedi README).
// =====================================================================

// Percorso del file di contenuti (relativo, funziona su GitHub Pages)
const FILE_CONTENUTI = "contenuti/parole.json";

// Parole di riserva: usate solo se il JSON non si carica
// (es. index.html aperto con doppio clic dal computer).
const PAROLE_DI_RISERVA = [
  "Algoritmo", "IA", "IA Generativa", "LLM", "IA Agentica", "Allucinazione",
  "Bias Algoritmico", "Prompt", "Deep Learning", "Machine Learning",
  "Rete Neurale", "Token",
  // Parole intruse (non c'entrano con l'AI)
  "Spoofing", "Firewall", "Cache", "Svestad"
];

// Velocità di base in pixel al secondo (moltiplicata dal fattore velocità)
const VELOCITA_BASE = 70;
const FATTORI_VELOCITA = [0.25, 0.5, 1, 1.5, 2, 3];

// ----- Stato -----
let parole = [];          // [{ el, x, y, vx, vy, larghezza, altezza, ferma }]
let inPausa = false;
let indiceVelocita = 2;   // parte da 1×
let ultimoTempo = null;

const campo = document.getElementById("campo");
const avviso = document.getElementById("avviso");
const pannello = document.getElementById("pannello");
const btnPausa = document.getElementById("btn-pausa");
const etichettaVelocita = document.getElementById("velocita");

// =====================================================================
// VALIDAZIONE DEL JSON
// Restituisce la lista di parole oppure lancia un errore in italiano.
// Formati accettati:
//   { "titolo": "...", "parole": ["...", "..."] }
//   oppure direttamente ["...", "..."]
// =====================================================================
function validaContenuti(dati) {
  const lista = Array.isArray(dati) ? dati : dati && dati.parole;

  if (!Array.isArray(lista)) {
    throw new Error("Nel file manca l'elenco \"parole\" (deve essere una lista tra parentesi quadre).");
  }
  if (lista.length === 0) {
    throw new Error("L'elenco \"parole\" è vuoto: aggiungi almeno una parola.");
  }
  if (lista.length > 40) {
    throw new Error(`Ci sono ${lista.length} parole: il massimo consigliato è 40, altrimenti lo schermo diventa illeggibile.`);
  }
  lista.forEach((voce, i) => {
    if (typeof voce !== "string" || voce.trim() === "") {
      throw new Error(`La parola numero ${i + 1} è vuota o non è un testo tra virgolette.`);
    }
  });
  return lista.map(p => p.trim());
}

function mostraAvviso(testo) {
  avviso.textContent = testo;
  avviso.hidden = false;
  clearTimeout(mostraAvviso.timer);
  mostraAvviso.timer = setTimeout(() => { avviso.hidden = true; }, 8000);
}

// =====================================================================
// CREAZIONE DELLE PAROLE A SCHERMO
// =====================================================================
function direzioneCasuale() {
  const angolo = Math.random() * Math.PI * 2;
  const intensita = 0.6 + Math.random() * 0.8; // ogni parola ha una sua velocità
  return {
    vx: Math.cos(angolo) * VELOCITA_BASE * intensita,
    vy: Math.sin(angolo) * VELOCITA_BASE * intensita
  };
}

function creaParole(lista) {
  campo.innerHTML = "";
  parole = lista.map((testo, i) => {
    const el = document.createElement("div");
    el.className = `parola tono-${(i % 4) + 1}`;
    el.textContent = testo;
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    campo.appendChild(el);

    const p = { el, x: 0, y: 0, ...direzioneCasuale(), larghezza: 0, altezza: 0, ferma: false };

    // Clic (o Invio) sulla parola: la evidenzia e la ferma, per parlarne in aula
    const alterna = () => evidenzia(p);
    el.addEventListener("click", alterna);
    el.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); alterna(); }
    });
    return p;
  });
  misuraEPosiziona(true);
}

// Misura ogni parola e, se richiesto, la mette in un punto casuale
function misuraEPosiziona(casuale) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  parole.forEach(p => {
    p.larghezza = p.el.offsetWidth;
    p.altezza = p.el.offsetHeight;
    if (casuale) {
      p.x = Math.random() * Math.max(0, W - p.larghezza);
      p.y = Math.random() * Math.max(0, H - p.altezza);
    } else {
      // Dopo un ridimensionamento: riporta dentro lo schermo
      p.x = Math.min(Math.max(0, p.x), Math.max(0, W - p.larghezza));
      p.y = Math.min(Math.max(0, p.y), Math.max(0, H - p.altezza));
    }
    disegna(p);
  });
}

function disegna(p) {
  p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
}

// Evidenzia una sola parola alla volta; un secondo clic la rilascia
function evidenzia(p) {
  const giaEvidenziata = p.ferma;
  parole.forEach(q => { q.ferma = false; q.el.classList.remove("evidenziata"); });
  if (!giaEvidenziata) {
    p.ferma = true;
    p.el.classList.add("evidenziata");
  }
  // La dimensione cambia: aspetta la transizione e rimisura
  setTimeout(() => misuraEPosiziona(false), 280);
}

// =====================================================================
// ANIMAZIONE: sposta le parole e le fa rimbalzare sui bordi
// =====================================================================
function anima(tempo) {
  if (ultimoTempo === null) ultimoTempo = tempo;
  // dt in secondi, limitato per evitare salti se la scheda era in background
  const dt = Math.min((tempo - ultimoTempo) / 1000, 0.05);
  ultimoTempo = tempo;

  if (!inPausa) {
    const fattore = FATTORI_VELOCITA[indiceVelocita];
    const W = window.innerWidth;
    const H = window.innerHeight;

    parole.forEach(p => {
      if (p.ferma) return;
      p.x += p.vx * fattore * dt;
      p.y += p.vy * fattore * dt;

      const maxX = Math.max(0, W - p.larghezza);
      const maxY = Math.max(0, H - p.altezza);
      if (p.x <= 0)    { p.x = 0;    p.vx =  Math.abs(p.vx); }
      if (p.x >= maxX) { p.x = maxX; p.vx = -Math.abs(p.vx); }
      if (p.y <= 0)    { p.y = 0;    p.vy =  Math.abs(p.vy); }
      if (p.y >= maxY) { p.y = maxY; p.vy = -Math.abs(p.vy); }

      disegna(p);
    });
  }
  requestAnimationFrame(anima);
}

// =====================================================================
// CONTROLLI DELL'OPERATORE
// =====================================================================
function alternaPausa() {
  inPausa = !inPausa;
  btnPausa.textContent = inPausa ? "▶ Riprendi" : "⏸ Pausa";
}

function cambiaVelocita(delta) {
  indiceVelocita = Math.min(Math.max(0, indiceVelocita + delta), FATTORI_VELOCITA.length - 1);
  etichettaVelocita.textContent = `Velocità ${FATTORI_VELOCITA[indiceVelocita]}×`;
}

function rimescola() {
  parole.forEach(p => Object.assign(p, direzioneCasuale()));
  misuraEPosiziona(true);
}

function alternaSchermoIntero() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  } else {
    document.exitFullscreen?.();
  }
}

btnPausa.addEventListener("click", alternaPausa);
document.getElementById("btn-lento").addEventListener("click", () => cambiaVelocita(-1));
document.getElementById("btn-veloce").addEventListener("click", () => cambiaVelocita(1));
document.getElementById("btn-mescola").addEventListener("click", rimescola);
document.getElementById("btn-schermo").addEventListener("click", alternaSchermoIntero);

// Scorciatoie da tastiera
document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;
  switch (e.key) {
    case " ":            e.preventDefault(); alternaPausa(); break;
    case "+": case "=":  cambiaVelocita(1); break;
    case "-": case "_":  cambiaVelocita(-1); break;
    case "r": case "R":  rimescola(); break;
    case "f": case "F":  alternaSchermoIntero(); break;
    case "h": case "H":  pannello.classList.toggle("nascosto"); break;
  }
});

window.addEventListener("resize", () => misuraEPosiziona(false));

// Caricamento manuale di un file JSON (funziona anche offline)
document.getElementById("file-json").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const lettore = new FileReader();
  lettore.onload = () => {
    try {
      const lista = validaContenuti(JSON.parse(lettore.result));
      creaParole(lista);
      avviso.hidden = true;
    } catch (err) {
      const messaggio = err instanceof SyntaxError
        ? "Il file non è un JSON valido: controlla virgole, virgolette e parentesi."
        : err.message;
      mostraAvviso(`${file.name}: ${messaggio}`);
    }
  };
  lettore.readAsText(file);
  e.target.value = ""; // permette di ricaricare lo stesso file
});

// =====================================================================
// AVVIO
// =====================================================================
async function avvia() {
  let lista;
  try {
    const risposta = await fetch(FILE_CONTENUTI);
    if (!risposta.ok) throw new Error(`File ${FILE_CONTENUTI} non trovato.`);
    lista = validaContenuti(await risposta.json());
  } catch (err) {
    lista = PAROLE_DI_RISERVA;
    const motivo = location.protocol === "file:"
      ? "Pagina aperta dal computer: il file JSON non si carica in automatico. Uso le parole predefinite; per altre parole usa \"Carica JSON\"."
      : `Non riesco a usare ${FILE_CONTENUTI} (${err instanceof SyntaxError ? "JSON non valido" : err.message}). Uso le parole predefinite.`;
    mostraAvviso(motivo);
  }
  creaParole(lista);
  requestAnimationFrame(anima);
}

avvia();
