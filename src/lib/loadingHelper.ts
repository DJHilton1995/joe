/**
 * Dynamic Loading Message Helper for Joey OS
 * Generates puns (20% of the time) or standard scan messages (80% of the time) in the detected language.
 */
export function getLoadingMessage(input: string): string {
  const norm = (input || '').toLowerCase().trim();
  
  // 1. Language detection
  let lang = 'en';
  if (/\b(bonjour|salut|comment|est-ce|oui|non|merci|avec|dans|pour|par)\b/i.test(norm)) {
    lang = 'fr';
  } else if (/\b(hallo|guten|tag|ja|nein|mit|für|ist|nicht|und|sie|was)\b/i.test(norm)) {
    lang = 'de';
  } else if (/\b(hola|que|tal|si|con|para|por|este|esta|cómo|bien)\b/i.test(norm)) {
    lang = 'es';
  } else if (/\b(ciao|buongiorno|si|non|grazie|con|per|questo|come|bene)\b/i.test(norm)) {
    lang = 'it';
  } else if (/\b(olá|oi|tudo|bem|sim|não|com|para|por|este|como)\b/i.test(norm)) {
    lang = 'pt';
  } else if (/\b(privet|kak|da|net|spasibo|s|dlya|eto|kak|horosho)\b/i.test(norm)) {
    lang = 'ru';
  }

  // 2. Pun selection (20% chance)
  const isPun = Math.random() < 0.2;
  
  if (isPun) {
    const puns: string[] = [];
    if (/hack|exploit|security|vault|sentinel|lock/i.test(norm)) {
      puns.push(
        "Why do hackers love nature? Because of all the logs!",
        "I'd tell you a joke about UDP, but you might not get it."
      );
    }
    if (/code|programming|python|javascript|script|developer/i.test(norm)) {
      puns.push(
        "There are 10 types of people: those who understand binary, and those who don't.",
        "A SQL query walks into a bar, walks up to two tables and asks: 'Can I join you?'"
      );
    }
    if (/abs|muscle|speedo|guy|shirt|underwear|nude|naked|nudity|nsfw|unclothed/i.test(norm)) {
      puns.push(
        "This six-pack isn't just for cooling down, it's for parallel processing!",
        "Don't sweat the core dump, Boss."
      );
    }
    
    // Add some general tech puns
    puns.push(
      "Why did the computer go to the dentist? To get its Bluetooth checked!",
      "Why do Java developers wear glasses? Because they can't C#.",
      "I wanted to be a programmer but I just couldn't find any class!"
    );
    
    const rawPun = puns[Math.floor(Math.random() * puns.length)];
    if (lang === 'fr') {
      return `[JOEY DIALOGUE RE-ROUTING] "Dis, pourquoi les développeurs portent des lunettes ? Parce qu'ils ne peuvent pas C#." - Synthèse en cours...`;
    } else if (lang === 'de') {
      return `[JOEY DIALOGUE RE-ROUTING] "Warum tragen Java-Entwickler Brillen? Weil sie nicht C# können." - Verarbeitung läuft...`;
    } else if (lang === 'es') {
      return `[JOEY DIALOGUE RE-ROUTING] "¿Por qué los desarrolladores usan gafas? ¡Porque no pueden C#!" - Procesando entrada...`;
    } else {
      return `[JOEY PUN] "${rawPun}" - Processing...`;
    }
  }

  // 3. 80% chance: "scanning user input, analyzing" or variant, plus language-relevant activity description
  let actionDesc = 'evaluating query parameters...';
  if (/hack|exploit|security|vault|sentinel|lock/i.test(norm)) {
    if (lang === 'fr') actionDesc = 'audit des signatures de paquets et isolement du bac à sable...';
    else if (lang === 'de') actionDesc = 'Paketsignaturen werden geprüft und die Sandbox isoliert...';
    else if (lang === 'es') actionDesc = 'auditando firmas de paquetes y aislando el sandbox...';
    else actionDesc = 'auditing packet signatures and isolating sandbox enclaves...';
  } else if (/code|programming|python|javascript|script|developer/i.test(norm)) {
    if (lang === 'fr') actionDesc = 'décompilation de la syntaxe et génération du script de sortie...';
    else if (lang === 'de') actionDesc = 'Syntax wird dekompiliert und das Ausgabeskript erstellt...';
    else if (lang === 'es') actionDesc = 'descompilando la sintaxis y generando el script de salida...';
    else actionDesc = 'decompiling syntax trees and synthesizing output script...';
  } else if (/abs|muscle|speedo|guy|shirt|underwear|nude|naked|nudity|nsfw|unclothed/i.test(norm)) {
    if (lang === 'fr') actionDesc = 'modélisation de l\'anatomie 2D et rendu des abdominaux saillants...';
    else if (lang === 'de') actionDesc = '2D-Anatomie-Modellierung und Rendern definierter Bauchmuskeln...';
    else if (lang === 'es') actionDesc = 'modelando anatomía 2D y renderizando los abdominales marcados...';
    else actionDesc = 'modeling 2D anatomy and rendering defined abdominal muscle fibers...';
  } else {
    if (lang === 'fr') actionDesc = 'liaison des bases de connaissances scientifiques et préparation de la réponse...';
    else if (lang === 'de') actionDesc = 'wissenschaftliche Wissensbasis wird verknüpft und die Antwort vorbereitet...';
    else if (lang === 'es') actionDesc = 'vinculando bases de conocimiento científico y preparando respuesta...';
    else actionDesc = 'linking scientific knowledge bases and preparing responsive text...';
  }

  // Build the scanning message in the detected language
  if (lang === 'fr') {
    return `Analyse et balayage de la commande de l'utilisateur... ${actionDesc}`;
  } else if (lang === 'de') {
    return `Benutzereingabe wird gescannt und analysiert... ${actionDesc}`;
  } else if (lang === 'es') {
    return `Escaneando y analizando la entrada del usuario... ${actionDesc}`;
  } else if (lang === 'it') {
    return `Scansione e analisi dell'input dell'utente... ${actionDesc}`;
  } else if (lang === 'pt') {
    return `Escaneando e analisando a entrada do usuário... ${actionDesc}`;
  } else if (lang === 'ru') {
    return `Сканирование и анализ ввода пользователя... ${actionDesc}`;
  } else {
    const scans = [
      `Scanning user input, analyzing... ${actionDesc}`,
      `Evaluating user directive, scanning... ${actionDesc}`,
      `Analyzing incoming input, scanning... ${actionDesc}`
    ];
    return scans[Math.floor(Math.random() * scans.length)];
  }
}
