// Shared demo store for site, user area and admin.
// shortcut: data lives in this browser's localStorage; on WordPress dogs become a "cane" post type,
// texts an options page and sign-ups user accounts + form entries.
const CANILE = (() => {
  const KEY = 'canile-demo-v1';
  const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  const texts = {
    hero_kicker: 'Rifugio per cani a Roncade · Treviso e Venezia',
    hero_title: 'Trova un amico a quattro zampe',
    hero_text: 'Siamo un gruppo di volontari che ogni giorno si prende cura di circa 30 cani arrivati dai canili del sud. Scopri come adottarne uno, o come aiutarlo anche da lontano.',
    adozione_intro: 'Il nostro rifugio si trova a Roncade, in provincia di Treviso. Tutti i cani vengono affidati chippati previo controllo preaffido e con profilassi veterinaria in regola. Per venire a trovare i nostri ospiti è richiesta una prenotazione telefonica via messaggio.',
    adozione_info: 'Info e appuntamenti: Alice | 349 1482136',
    chi_1: 'Siamo un gruppo di volontari con una grande passione per gli animali, uniti dall’obiettivo di offrire una vita migliore a cani bisognosi.',
    chi_2: 'La nostra associazione, situata a Roncade, accudisce circa 30 cani che arrivano da noi grazie alla staffetta solidale dai canili del sud. Ogni giorno, mattina e pomeriggio, ci dedichiamo con amore e impegno a tutte le necessità degli animali che accogliamo: somministriamo pasti e farmaci, facciamo passeggiate e giochi e ci occupiamo della loro igiene e pulizia.',
    chi_3: 'Lavoriamo instancabilmente per garantire loro una vita dignitosa e serena, nella speranza di trovare una casa che li ami per sempre.',
    dove: 'Via Treponti, snc, 31056 Musestre di Roncade (TV)',
    orari: 'Siamo aperti tutti i giorni (feriali e festivi) dalle 9 alle 12 e dalle 16 alle 18. Per le visite è richiesto appuntamento via messaggio al numero 349 1482136.',
    volontario: 'Se ami gli animali e vuoi dare una mano concreta, unisciti a noi! Cerchiamo volontari per aiutarci nelle attività quotidiane e nella gestione dei nostri amici a quattro zampe.',
    volontario_contatto: 'Contattaci: Flisa | 347 4335790',
    dona: 'Ogni piccolo gesto può cambiare la vita di un animale in difficoltà. Puoi aiutarci con una donazione tramite bonifico, PayPal, lista desideri Amazon o destinando il tuo 5x1000. Grazie di cuore! 🐾',
    iban: 'IT47D0306909606100000406723',
    paypal: '@Improntezampecuore',
    codice_fiscale: '90204630272',
    box_regalo: 'Per info e ordini: scrivici su WhatsApp al 347 4335790',
    distanza: 'Con l’adozione a distanza puoi aiutare uno dei nostri cani contribuendo al suo sostentamento e alle sue necessità quotidiane. Scegli un cane e sostienilo anche se non puoi adottarlo fisicamente.',
    distanza_note: 'Una volta compilato il modulo ti chiediamo di effettuare in autonomia il pagamento, con PayPal o bonifico. Gli aggiornamenti sul tuo cagnolone partiranno all’inizio del mese successivo 💌',
    distanza_paypal: 'am.improntedizampenelcuore@gmail.com',
    distanza_email: 'adoz.improntedizampenelcuore@gmail.com',
    eventi: 'Partecipa ai nostri eventi per supportare l’associazione e i nostri cani. Organizziamo regolarmente eventi di raccolta fondi, incontri di sensibilizzazione e altre attività.',
    telefono: 'Alice | 349 1482136',
    email: 'info.improntedizampenelcuore@gmail.com',
  };

  const d = (id, name, age, gender, neutered, size, description, extra = {}) =>
    ({ id, name, age, gender, neutered, size, description, image: `assets/img/${id}.jpg`, stato: 'disponibile', distanza: false, quote: '', ...extra });

  const dogs = [
    d('william', 'William', 'adulto', 'M', false, 'grande', 'William è nato nel 2021, ha vissuto i primi mesi della sua vita in un canile del sud, insieme ai suoi fratelli, dopo aver già conosciuto la cattiveria umana. È arrivato nel nostro rifugio quando era ancora un cucciolone e ha visto tutti i suoi fratelli andarsene adottati da splendide famiglie. Oggi è un cane adulto, ancora giovane, pieno di energia e voglia di correre. Non si fida di tutti subito: ha bisogno del suo tempo per poi rivelarsi un cane estremamente fedele e dolce. Va d’accordo con i suoi simili, specialmente femmine. Pesa 27 kg.', { distanza: true, quote: 'Amo le palline, e anche se sono diffidente all’inizio, con il tempo giocherò anche con te!' }),
    d('sam', 'Sam', 'adulto', 'M', true, 'grande', 'Sam è nato nel 2021, ha molta paura delle persone, difficilmente si fa avvicinare se non in cambio di un premietto. L’essere umano si è dimostrato crudele con lui in passato e ora Sam vuole solo proteggersi. Cerchiamo per lui una famiglia consapevole dell’impegno che richiede e disposta a intraprendere un percorso educativo. Pesa 30 kg.', { distanza: true, quote: 'Da piccolino certi umani mi hanno trattato molto male… mi aiuti anche tu ad avere più fiducia?' }),
    d('dylan', 'Dylan', 'adulto', 'M', true, 'media contenuta', 'Dylan è nato nel 2020 ed è ancora alla ricerca di una famiglia! È un cagnolino unico: ti accoglie con una danza speciale tutta sua! Adora giocare con l’umano, infatti si fa trovare sempre pronto, armato di un giochino. Va d’accordo con le femmine, sa andare in passeggiata, tende a saltare. Pesa 18 kg.', { distanza: true, quote: 'Corro, salto, ti porto la pallina… Sono un cane super sportivo!' }),
    d('alba', 'Alba', 'adulto', 'F', true, 'media', 'Alba è nata nel novembre 2021 ed è stata salvata dalla Sicilia, dove viveva legata a un guinzaglio all’interno di un negozio di scarpe. È una cagnolina un po’ timida ma dolcissima e coccolona. È possessiva e territoriale e sta svolgendo un percorso con la nostra educatrice: cerchiamo per lei una famiglia consapevole e disposta a continuarlo. Pesa 15 kg.', { distanza: true, quote: 'Ora scorazzo nel mio giardinetto in cerca di coccole! Mi chiamo Alba d’altronde, andrà sempre meglio!' }),
    d('ambra', 'Ambra', 'adulto', 'F', true, 'grande', 'Ambra è nata a marzo 2025 ed è sopravvissuta, ma il prezzo è stato altissimo. Viveva libera con il suo branco nelle strade di un piccolo paese in Sicilia, finché qualcuno ha lasciato bocconi avvelenati: ha visto morire tutti i suoi compagni. Una volontaria l’ha portata via subito. Nonostante tutto è rimasta dolcissima e fiduciosa con le persone e ama la compagnia degli altri cani. Negativa a leishmania ed erlichia. Pesa 24 kg.'),
    d('oliver', 'Oliver', 'adulto', 'M', true, 'grande', 'Oliver è nato nel 2024. Aveva una casa e una persona di riferimento, che è partita lasciandolo a un amico e non è mai tornata. È un bellissimo rottweiler, dinamico e forte ma molto ubbidiente e legato alle persone, con una simpatica passione per i grossi sassi che porta in giro durante le passeggiate. Cerchiamo una persona esperta di cani di taglia grande, in un contesto senza altri animali. Pesa 37 kg.'),
    d('berta', 'Berta', 'cucciolo', 'F', false, 'media', 'Berta è nata a gennaio 2026 e arriva dalla Sicilia. Una cucciola ancora piccola, piena di voglia di scoprire il mondo! È giocherellona, vivace, coccolona e compatibile con altri cani. Aspetta solo che qualcuno la scelga.'),
    d('linda', 'Linda', 'adulto', 'F', false, 'media contenuta', 'Linda è nata presumibilmente nel 2022 e ha passato gran parte della sua vita per strada, senza casa e senza protezione, costretta ad avere tantissime cucciolate. Oggi finalmente è al sicuro. È una cagnolina delicata, che all’inizio osserva in silenzio: un po’ timida, ma basta poco per vedere quanto sia dolce e bisognosa di affetto. Compatibile con altri cani. Pesa 22 kg.'),
    d('sara', 'Sara', 'adulto', 'F', true, 'grande', 'Sara è nata nel 2023, arriva dalla Sicilia e per tutta la vita ha conosciuto solo il rifugio. Con le persone nuove è timida e diffidente, ma con un po’ di pazienza si scopre una cagnolona buona, delicata e sensibile, che piano piano si lascia andare alle carezze. Compatibile con gli altri cani. Pesa 30 kg.'),
    d('lilly', 'Lilly', 'adulto', 'F', true, 'media', 'Lilly è nata presumibilmente nel 2023. Quando è stata trovata in Calabria era piena di rogna, denutrita e trascurata: ora sembra una pecorella! Ha quel modo di guardarti e di cercare una carezza che ti entra nel cuore. Compatibile con tutti, sa andare in passeggiata ed è brava in auto. Pesa 22 kg.'),
    d('cristina', 'Cristina', 'adulto', 'F', true, 'grande', 'Cristina è nata nel 2021, una simil maremmana trovata stremata a bordo strada in Calabria, a un passo dal colpo di calore. Messa in salvo e curata, ha mostrato subito il suo cuore meraviglioso: è una cagnolona dolcissima, una presenza discreta pronta a riempire una casa di amore. Pesa 37 kg.'),
    d('lola', 'Lola', 'adulto', 'F', false, 'media', 'Lola è nata a febbraio 2025 ed è stata trovata per strada in Calabria. Poco dopo ha dato alla luce sei splendidi cuccioli. Ora che crescono, è arrivato il momento anche per lei di trovare una famiglia. Ha un carattere solare, è dolce, coccolona e compatibile con altri cani. Pesa 25 kg.'),
    d('trilly', 'Trilly', 'cucciolo', 'F', false, 'grande', 'Trilly è nata ad aprile 2026 ed è stata trovata in Sicilia, abbandonata tra le sterpaglie insieme al fratellino, che nel frattempo è stato adottato. È una cucciola meravigliosa, dolce e tranquilla, ma quando è il momento di giocare tira fuori tutta la sua allegria. Va d’accordo con gli altri cani, sarà una futura taglia medio grande.'),
    d('clover', 'Clover', 'adulto', 'F', true, 'media contenuta', 'Clover è nata nel 2023 e viene dalla Calabria. È una tripode, ma non ditelo a lei: la mancanza di una zampetta non le impedisce di correre, giocare ed esplorare. È stata investita e mai soccorsa, eppure ha un cuore grande così. Oggi cerca la svolta che merita davvero: una famiglia per sempre.'),
    d('maya', 'Maya', 'adulto', 'F', true, 'media', 'Maya è nata nel 2019 ed è stata sequestrata a una persona che non era in grado di prendersi cura di lei. Oggi è una cagnolona super simpatica e socievole, coccolona e affettuosa. Cerchiamo persone affidabili e consapevoli, che conoscano la razza e sappiano cosa significa vivere con un Amstaff.'),
    d('olivia', 'Olivia', 'adulto', 'F', true, 'media', 'Olivia è nata nel 2024 e arriva dalla Calabria, dopo la strada e un canile lager. È dolcissima, tranquilla e delicata; all’inizio un pochino timida, ma quando capisce di potersi fidare lascia emergere tutta la sua tenerezza. Ha bisogno di tempo, pazienza e di qualcuno che sappia aspettare.'),
    d('stracciatella', 'Stracciatella', 'cucciolo', 'F', false, 'media', 'Stracciatella è nata a giugno 2026 ed è arrivata dalla Sicilia con la sorella Cioccolata, che ha già trovato famiglia. È simpatica e piena di energia, sempre pronta a giocare e a combinare qualche marachella. Ora tocca a lei!'),
    d('yuma', 'Yuma', 'cucciolo', 'F', false, 'media', 'Yuma è nata a giugno 2026. Lei e Gemma non sono sorelle di sangue, ma dopo tutto quello che hanno vissuto insieme lo sono diventate: giochi, corse e coccole. Due piccole pesti meravigliose, affidabili anche separatamente.'),
    d('gemma', 'Gemma', 'cucciolo', 'F', false, 'media', 'Gemma è nata a giugno 2026. Lei e Yuma arrivano dalla Sicilia e dopo il canile hanno iniziato a condividere tutto. Simpatica e piena di energia, ama giocare e stare in compagnia. Affidabile anche separatamente da Yuma.'),
  ];

  const e = (id, data, nome, cognome, email, cane, mesi, pagamento, extra = {}) =>
    ({ id, data, nome, cognome, email, regalo: '', cane, mesi, anno: 2026, pagamento, ricevuta: false, ...extra });

  const iscritti = [
    e('a1', '2026-01-03', 'Giulia', 'Bianchi', 'giulia.bianchi@email.it', 'alba', [0, 1, 2, 3, 4, 5], 'ricevuto', { ricevuta: true }),
    e('a2', '2026-07-01', 'Giulia', 'Bianchi', 'giulia.bianchi@email.it', 'alba', [6, 7, 8, 9, 10, 11], 'ricevuto'),
    e('a3', '2026-09-28', 'Giulia', 'Bianchi', 'giulia.bianchi@email.it', 'sam', [9, 10, 11], 'attesa'),
    e('a4', '2026-02-11', 'Marco', 'Zanin', 'marco.zanin@email.it', 'william', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'ricevuto'),
    e('a5', '2026-03-02', 'Elena', 'Favaro', 'elena.favaro@email.it', 'dylan', [2, 3, 4], 'ricevuto'),
    e('a6', '2026-05-20', 'Elena', 'Favaro', 'elena.favaro@email.it', 'dylan', [5, 6, 7, 8, 9, 10], 'ricevuto'),
    e('a7', '2026-04-14', 'Paolo', 'Rossetto', 'p.rossetto@email.it', 'sam', [3, 4, 5, 6, 7, 8], 'ricevuto', { regalo: 'anna.rossetto@email.it' }),
    e('a8', '2026-06-01', 'Chiara', 'Dal Bo', 'chiara.dalbo@email.it', 'alba', [5, 6, 7], 'ricevuto'),
    e('a9', '2026-08-30', 'Chiara', 'Dal Bo', 'chiara.dalbo@email.it', 'william', [8, 9, 10, 11], 'ricevuto', { ricevuta: true }),
    e('a10', '2026-09-15', 'Luca', 'Boscolo', 'luca.boscolo@email.it', 'dylan', [9], 'attesa'),
    e('a11', '2026-10-02', 'Sofia', 'Marchetto', 'sofia.marchetto@email.it', 'sam', [10, 11], 'attesa', { regalo: 'nonna.marchetto@email.it' }),
    e('a12', '2026-10-09', 'Andrea', 'Pavan', 'andrea.pavan@email.it', 'william', [10], 'attesa'),
  ];

  const seed = { texts, dogs, iscritti, quota: 10 };

  let db = null;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (err) { /* private mode: run on seed data */ }
  if (!db) db = JSON.parse(JSON.stringify(seed));
  db.texts = { ...texts, ...db.texts };

  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (err) { alert('Impossibile salvare nel browser: spazio esaurito o archiviazione bloccata.'); } };
  const reset = () => { try { localStorage.removeItem(KEY); } catch (err) { /* nothing stored */ } location.reload(); };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dog = (id) => db.dogs.find((x) => x.id === id) || { name: id, image: '', id };
  const totale = (entry) => entry.mesi.length * db.quota;
  const causale = (entry) => `Donazione adozione a distanza ${dog(entry.cane).name} da ${entry.nome} ${entry.cognome}`;

  // apply editable texts to [data-t] elements
  const applyTexts = (root = document) => root.querySelectorAll('[data-t]').forEach((el) => { el.textContent = db.texts[el.dataset.t] ?? ''; });

  return { db, save, reset, esc, dog, totale, causale, applyTexts, MESI };
})();
