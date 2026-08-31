(function () {
  const COMPANY_NAME = "SwissClean Sàrl";

  const OBJECTION_CHIPS = [
    { category: "price", label: "💰 Le prix est trop élevé" },
    { category: "timing", label: "📅 La date ne convient pas" },
    { category: "scope", label: "🧹 Je n'ai pas besoin de tout" },
    { category: "conditions", label: "🏠 Les conditions/détails ne conviennent pas" },
    { category: "thinking", label: "🤔 Je dois réfléchir" },
    { category: "competitor", label: "🆚 J'ai reçu une autre offre" },
    { category: "information", label: "❓ J'ai une autre question" },
    { category: "not_needed", label: "⚪ Je n'ai plus besoin du service" },
  ];

  // ---- i18n ----
  // The conversation engine (mock.js, and the shared calculation logic it
  // feeds) always speaks French internally — every question, chip label
  // and stored answer round-trips through the message history exactly as
  // mock.js generates it, on every language's page. That's deliberate: it
  // keeps the pricing engine's own string-matching (KITCHEN_APPLIANCE_KEYS,
  // TYPE_NETTOYAGE_MAP, the "oui"/condition-keyword regexes, etc.) untouched
  // and correct regardless of what the visitor sees on screen — zero risk
  // of a translated label silently producing a wrong quote.
  //
  // T(fr) is a display-only lookup: exact known French strings render
  // translated when window.DEALZ_LANG is "en"/"de"; anything not in the
  // table (including a customer's own free-text answers) passes through
  // unchanged. Applied at a few central rendering choke-points (el(),
  // renderAssistantText, renderUserMessage) so it covers nearly every
  // string in the file without touching what actually gets sent back to
  // the engine — see sendMessage's `text` vs `displayText` split below.
  const I18N = {
    "Quel type de nettoyage souhaitez-vous ?": { en: "What type of cleaning would you like?", de: "Welche Art von Reinigung wünschen Sie?" },
    "Nettoyage régulier": { en: "Regular cleaning", de: "Regelmässige Reinigung" },
    "Nettoyage ponctuel": { en: "One-off cleaning", de: "Einmalige Reinigung" },
    "Nettoyage en profondeur": { en: "Deep cleaning", de: "Tiefenreinigung" },
    "Nettoyage de fin de bail / état des lieux": { en: "End of tenancy / handover cleaning", de: "Endreinigung / Wohnungsübergabe" },
    "Nettoyage après déménagement": { en: "Post-move cleaning", de: "Reinigung nach Umzug" },
    "Nettoyage après travaux": { en: "Post-renovation cleaning", de: "Reinigung nach Bauarbeiten" },
    "Nettoyage professionnel / bureau": { en: "Professional / office cleaning", de: "Büroreinigung" },

    "Quel type de bien souhaitez-vous faire nettoyer ?": { en: "What type of property would you like cleaned?", de: "Welche Art von Objekt möchten Sie reinigen lassen?" },
    "Appartement": { en: "Apartment", de: "Wohnung" },
    "Maison": { en: "House", de: "Haus" },
    "Studio": { en: "Studio", de: "Studio" },
    "Bureau": { en: "Office", de: "Büro" },
    "Commerce / local professionnel": { en: "Shop / commercial premises", de: "Geschäft / Gewerberaum" },
    "Villa": { en: "Villa", de: "Villa" },

    "Combien de pièces compte votre logement ?": { en: "How many rooms does your home have?", de: "Wie viele Zimmer hat Ihre Wohnung?" },
    "1 pièce": { en: "1 room", de: "1 Zimmer" },
    "1.5 pièces": { en: "1.5 rooms", de: "1.5 Zimmer" },
    "2 pièces": { en: "2 rooms", de: "2 Zimmer" },
    "2.5 pièces": { en: "2.5 rooms", de: "2.5 Zimmer" },
    "3 pièces": { en: "3 rooms", de: "3 Zimmer" },
    "3.5 pièces": { en: "3.5 rooms", de: "3.5 Zimmer" },
    "4 pièces": { en: "4 rooms", de: "4 Zimmer" },
    "4.5 pièces": { en: "4.5 rooms", de: "4.5 Zimmer" },
    "5 pièces": { en: "5 rooms", de: "5 Zimmer" },

    "Quelle est approximativement la surface du logement ?": { en: "Roughly how big is the property?", de: "Wie gross ist die Wohnung ungefähr?" },
    "Moins de 50 m²": { en: "Under 50 m²", de: "Unter 50 m²" },
    "50–75 m²": { en: "50–75 m²", de: "50–75 m²" },
    "75–100 m²": { en: "75–100 m²", de: "75–100 m²" },
    "100–150 m²": { en: "100–150 m²", de: "100–150 m²" },
    "150–200 m²": { en: "150–200 m²", de: "150–200 m²" },
    "Plus de 200 m²": { en: "Over 200 m²", de: "Über 200 m²" },
    "Je ne sais pas": { en: "I don't know", de: "Ich weiss es nicht" },

    "Le logement comporte-t-il plusieurs niveaux ?": { en: "Does the property have several levels?", de: "Hat die Wohnung mehrere Ebenen?" },
    "Un seul niveau": { en: "A single level", de: "Nur eine Ebene" },
    "2 niveaux": { en: "2 levels", de: "2 Ebenen" },
    "3 niveaux ou plus": { en: "3 levels or more", de: "3 oder mehr Ebenen" },

    "Combien d'étages faut-il nettoyer ?": { en: "How many floors need cleaning?", de: "Wie viele Stockwerke müssen gereinigt werden?" },

    "Combien de salles de bains et de WC faut-il nettoyer ?": { en: "How many bathrooms and toilets need cleaning?", de: "Wie viele Badezimmer und WCs müssen gereinigt werden?" },

    "Y a-t-il une cuisine à nettoyer ?": { en: "Is there a kitchen to clean?", de: "Gibt es eine Küche zu reinigen?" },
    "Oui": { en: "Yes", de: "Ja" },
    "Non": { en: "No", de: "Nein" },
    "Cuisine ouverte": { en: "Open kitchen", de: "Offene Küche" },
    "Cuisine fermée": { en: "Closed kitchen", de: "Geschlossene Küche" },
    "Plusieurs cuisines": { en: "Several kitchens", de: "Mehrere Küchen" },

    "Dans quel état se trouve actuellement le logement ?": { en: "What condition is the property in right now?", de: "In welchem Zustand befindet sich die Wohnung aktuell?" },
    "Entretien normal": { en: "Normal upkeep", de: "Normaler Pflegezustand" },
    "Peu sale": { en: "A little dirty", de: "Leicht verschmutzt" },
    "Très poussiéreux": { en: "Very dusty", de: "Sehr staubig" },
    "Très sale": { en: "Very dirty", de: "Sehr schmutzig" },
    "Très encrassé": { en: "Very grimy", de: "Sehr stark verschmutzt" },
    "Nécessite un nettoyage en profondeur": { en: "Needs a deep clean", de: "Benötigt eine Tiefenreinigung" },

    "Le logement sera-t-il vide au moment du nettoyage ?": { en: "Will the property be empty during the cleaning?", de: "Wird die Wohnung während der Reinigung leer sein?" },
    "Oui, complètement vide": { en: "Yes, completely empty", de: "Ja, komplett leer" },
    "Partiellement vide": { en: "Partially empty", de: "Teilweise leer" },
    "Non, il sera encore occupé": { en: "No, it will still be occupied", de: "Nein, sie wird noch bewohnt sein" },

    "Souhaitez-vous inclure le nettoyage des fenêtres ?": { en: "Would you like window cleaning included?", de: "Möchten Sie die Fensterreinigung einschliessen?" },

    "Quel type de nettoyage des fenêtres souhaitez-vous ?": { en: "What type of window cleaning would you like?", de: "Welche Art von Fensterreinigung wünschen Sie?" },
    "Intérieur uniquement": { en: "Inside only", de: "Nur innen" },
    "Intérieur + extérieur": { en: "Inside + outside", de: "Innen + aussen" },
    "Vitres + cadres + rebords": { en: "Panes + frames + sills", de: "Scheiben + Rahmen + Fensterbänke" },
    "Nettoyage complet": { en: "Full cleaning", de: "Komplette Reinigung" },

    "Combien de fenêtres environ ?": { en: "Roughly how many windows?", de: "Wie viele Fenster ungefähr?" },
    "1–5": { en: "1–5", de: "1–5" },
    "6–10": { en: "6–10", de: "6–10" },
    "11–15": { en: "11–15", de: "11–15" },
    "16–20": { en: "16–20", de: "16–20" },
    "Plus de 20": { en: "More than 20", de: "Mehr als 20" },

    "Les vitres sont-elles difficiles d'accès (baies vitrées, hauteur, etc.) ?": { en: "Are the windows hard to access (bay windows, height, etc.)?", de: "Sind die Fenster schwer zugänglich (Fensterfronten, Höhe usw.)?" },

    "Souhaitez-vous inclure le nettoyage du four ?": { en: "Would you like oven cleaning included?", de: "Möchten Sie die Backofenreinigung einschliessen?" },

    "Dans quel état est le four ?": { en: "What condition is the oven in?", de: "In welchem Zustand ist der Backofen?" },
    "Très graisseux": { en: "Very greasy", de: "Sehr fettig" },

    "Souhaitez-vous inclure le nettoyage du réfrigérateur ?": { en: "Would you like fridge cleaning included?", de: "Möchten Sie die Kühlschrankreinigung einschliessen?" },
    "Réfrigérateur + congélateur": { en: "Fridge + freezer", de: "Kühlschrank + Gefrierfach" },

    "Souhaitez-vous nettoyer d'autres appareils de cuisine ?": { en: "Any other kitchen appliances to clean?", de: "Möchten Sie weitere Küchengeräte reinigen lassen?" },
    "Hotte": { en: "Extractor hood", de: "Dunstabzugshaube" },
    "Plaques de cuisson": { en: "Stovetop", de: "Kochfeld" },
    "Micro-ondes": { en: "Microwave", de: "Mikrowelle" },
    "Lave-vaisselle": { en: "Dishwasher", de: "Geschirrspüler" },
    "Congélateur": { en: "Freezer", de: "Gefrierschrank" },
    "Aucun": { en: "None", de: "Keines" },

    "Souhaitez-vous un nettoyage de tapis ou de moquette ?": { en: "Would you like carpet or rug cleaning?", de: "Möchten Sie eine Teppich- oder Teppichbodenreinigung?" },
    "Tapis": { en: "Rugs", de: "Teppiche" },
    "Moquette": { en: "Carpet", de: "Teppichboden" },
    "Tapis + moquette": { en: "Rugs + carpet", de: "Teppiche + Teppichboden" },

    "Quelle est approximativement la surface concernée (en nombre de pièces) ?": { en: "Roughly how many rooms does this cover?", de: "Wie viele Zimmer sind ungefähr betroffen?" },
    "4+": { en: "4+", de: "4+" },

    "Souhaitez-vous nettoyer des textiles ou du mobilier ?": { en: "Any textiles or furniture to clean?", de: "Möchten Sie Textilien oder Möbel reinigen lassen?" },
    "Canapé": { en: "Sofa", de: "Sofa" },
    "Fauteuil": { en: "Armchair", de: "Sessel" },
    "Matelas": { en: "Mattress", de: "Matratze" },
    "Rideaux": { en: "Curtains", de: "Vorhänge" },

    "Le logement est-il accessible sans ascenseur ?": { en: "Is the property accessible without a lift?", de: "Ist die Wohnung ohne Lift erreichbar?" },
    "Rez-de-chaussée ou ascenseur": { en: "Ground floor or lift", de: "Erdgeschoss oder Lift" },
    "1 étage sans ascenseur": { en: "1 floor, no lift", de: "1 Stockwerk ohne Lift" },
    "2 étages sans ascenseur": { en: "2 floors, no lift", de: "2 Stockwerke ohne Lift" },
    "3 étages ou plus sans ascenseur": { en: "3 floors or more, no lift", de: "3 oder mehr Stockwerke ohne Lift" },

    "Comment l'équipe pourra-t-elle accéder au logement ?": { en: "How will the team be able to access the property?", de: "Wie kann das Team die Wohnung betreten?" },
    "Je serai présent(e)": { en: "I'll be there", de: "Ich werde anwesend sein" },
    "Clés remises à l'équipe": { en: "Keys handed to the team", de: "Schlüssel werden dem Team übergeben" },
    "Boîte à clés": { en: "Key box", de: "Schlüsselbox" },
    "Concierge / réception": { en: "Caretaker / front desk", de: "Hauswart / Empfang" },

    "Y a-t-il une possibilité de stationner facilement à proximité du logement ?": { en: "Is there easy parking near the property?", de: "Gibt es in der Nähe der Wohnung einfache Parkmöglichkeiten?" },
    "Parking privé": { en: "Private parking", de: "Privater Parkplatz" },
    "Parking public": { en: "Public parking", de: "Öffentlicher Parkplatz" },

    "À partir de quelle date souhaitez-vous démarrer le nettoyage régulier ?": { en: "From what date would you like the regular cleaning to start?", de: "Ab welchem Datum möchten Sie mit der regelmässigen Reinigung beginnen?" },
    "Quand souhaitez-vous effectuer le nettoyage ?": { en: "When would you like the cleaning done?", de: "Wann möchten Sie die Reinigung durchführen lassen?" },

    "Cette date de démarrage est-elle impérative ?": { en: "Is this start date fixed?", de: "Ist dieses Startdatum verbindlich?" },
    "Cette date est-elle impérative ?": { en: "Is this date fixed?", de: "Ist dieses Datum verbindlich?" },
    "Non, je suis flexible": { en: "No, I'm flexible", de: "Nein, ich bin flexibel" },

    "Quels travaux ont été réalisés ?": { en: "What work was carried out?", de: "Welche Arbeiten wurden durchgeführt?" },
    "Peinture": { en: "Painting", de: "Malerarbeiten" },
    "Rénovation": { en: "Renovation", de: "Renovation" },
    "Construction": { en: "Construction", de: "Bauarbeiten" },
    "Travaux de cuisine": { en: "Kitchen work", de: "Küchenarbeiten" },
    "Travaux de salle de bains": { en: "Bathroom work", de: "Badezimmerarbeiten" },
    "Rénovation complète": { en: "Full renovation", de: "Komplettrenovation" },

    "Quel est le niveau de poussière ou de saleté après les travaux ?": { en: "How much dust or dirt is there after the work?", de: "Wie stark ist der Staub- oder Schmutzanfall nach den Arbeiten?" },
    "Léger": { en: "Light", de: "Leicht" },
    "Moyen": { en: "Moderate", de: "Mittel" },
    "Important": { en: "Significant", de: "Stark" },
    "Très important": { en: "Very significant", de: "Sehr stark" },

    "À quelle fréquence souhaitez-vous le nettoyage ?": { en: "How often would you like the cleaning?", de: "Wie oft wünschen Sie die Reinigung?" },
    "Chaque semaine": { en: "Every week", de: "Jede Woche" },
    "Toutes les 2 semaines": { en: "Every 2 weeks", de: "Alle 2 Wochen" },
    "Toutes les 3 semaines": { en: "Every 3 weeks", de: "Alle 3 Wochen" },
    "Une fois par mois": { en: "Once a month", de: "Einmal im Monat" },
    "Ponctuellement": { en: "One-off, as needed", de: "Bei Bedarf, einmalig" },

    "Quel jour de la semaine préférez-vous pour le passage de l'équipe ?": { en: "Which day of the week works best for the team's visit?", de: "Welcher Wochentag passt Ihnen für den Einsatz des Teams am besten?" },
    "Lundi": { en: "Monday", de: "Montag" },
    "Mardi": { en: "Tuesday", de: "Dienstag" },
    "Mercredi": { en: "Wednesday", de: "Mittwoch" },
    "Jeudi": { en: "Thursday", de: "Donnerstag" },
    "Vendredi": { en: "Friday", de: "Freitag" },
    "Samedi": { en: "Saturday", de: "Samstag" },

    "À quelle heure de la journée souhaitez-vous que l'équipe passe ?": { en: "What time of day should the team come by?", de: "Zu welcher Tageszeit soll das Team vorbeikommen?" },
    "Matin (8h–12h)": { en: "Morning (8am–12pm)", de: "Morgens (8–12 Uhr)" },
    "Après-midi (12h–17h)": { en: "Afternoon (12pm–5pm)", de: "Nachmittags (12–17 Uhr)" },
    "Fin de journée (17h–19h)": { en: "End of day (5pm–7pm)", de: "Am Abend (17–19 Uhr)" },

    "Combien de temps souhaitez-vous prévoir pour chaque nettoyage ?": { en: "How much time should be planned for each cleaning?", de: "Wie viel Zeit möchten Sie für jede Reinigung einplanen?" },
    "1–2 heures": { en: "1–2 hours", de: "1–2 Stunden" },
    "2–3 heures": { en: "2–3 hours", de: "2–3 Stunden" },
    "3–4 heures": { en: "3–4 hours", de: "3–4 Stunden" },
    "4–5 heures": { en: "4–5 hours", de: "4–5 Stunden" },
    "Plus de 5 heures": { en: "More than 5 hours", de: "Mehr als 5 Stunden" },

    "Le logement sera-t-il complètement vidé avant le nettoyage ?": { en: "Will the property be fully cleared out before the cleaning?", de: "Wird die Wohnung vor der Reinigung vollständig geräumt?" },
    "Partiellement": { en: "Partially", de: "Teilweise" },

    "Quand aura lieu votre état des lieux ?": { en: "When is your handover inspection?", de: "Wann findet Ihre Wohnungsübergabe statt?" },

    "Avez-vous besoin d'un nettoyage avec garantie de remise en état pour l'état des lieux ?": { en: "Do you need a cleaning with a handover-condition guarantee?", de: "Benötigen Sie eine Reinigung mit Garantie für die Wohnungsübergabe?" },

    "Y a-t-il des animaux dans le logement ?": { en: "Are there any pets in the property?", de: "Gibt es Haustiere in der Wohnung?" },
    "Chien": { en: "Dog", de: "Hund" },
    "Chat": { en: "Cat", de: "Katze" },
    "Plusieurs animaux": { en: "Several pets", de: "Mehrere Haustiere" },

    "Y a-t-il une situation particulière dont notre équipe devrait tenir compte ?": { en: "Is there anything unusual our team should know about?", de: "Gibt es etwas Besonderes, das unser Team berücksichtigen sollte?" },
    "Aucune": { en: "None", de: "Keine" },
    "Forte accumulation de poussière": { en: "Heavy dust build-up", de: "Starke Staubansammlung" },
    "Fumée / odeurs": { en: "Smoke / odours", de: "Rauch / Gerüche" },
    "Beaucoup de poils": { en: "Lots of pet hair", de: "Viele Tierhaare" },
    "Logement très encombré": { en: "Very cluttered property", de: "Sehr vollgestellte Wohnung" },
    "Taches importantes": { en: "Significant stains", de: "Starke Flecken" },
    "Moisissures visibles": { en: "Visible mould", de: "Sichtbarer Schimmel" },

    "Parfait ! Pour finaliser votre devis, merci d'indiquer vos coordonnées ci-dessous. (Vous testez cette démo pour votre entreprise ? Indiquez les coordonnées fictives d'un de vos clients — pas les vôtres.)": {
      en: "Perfect! To finalise your quote, please enter your details below. (Testing this demo for your own business? Enter fictional details for one of your customers — not your own.)",
      de: "Perfekt! Um Ihre Offerte abzuschliessen, geben Sie bitte unten Ihre Kontaktdaten ein. (Testen Sie diese Demo für Ihr eigenes Unternehmen? Geben Sie fiktive Angaben für einen Ihrer Kunden ein — nicht Ihre eigenen.)",
    },

    // ---- quote-app.js UI chrome ----
    "Bonjour ! Je vais vous poser quelques questions rapides sur votre logement, et je vous établis un devis ferme tout de suite après.": {
      en: "Hello! I'll ask you a few quick questions about your home, then put together a firm quote right away.",
      de: "Hallo! Ich stelle Ihnen ein paar kurze Fragen zu Ihrer Wohnung und erstelle Ihnen anschliessend sofort eine feste Offerte.",
    },
    "En train d'écrire…": { en: "Typing…", de: "Schreibt gerade…" },
    "Une erreur est survenue — veuillez réessayer.": { en: "Something went wrong — please try again.", de: "Ein Fehler ist aufgetreten — bitte versuchen Sie es erneut." },
    "Une erreur est survenue.": { en: "Something went wrong.", de: "Ein Fehler ist aufgetreten." },
    "Nom": { en: "Name", de: "Name" },
    "E-mail": { en: "Email", de: "E-Mail" },
    "Téléphone (optionnel)": { en: "Phone (optional)", de: "Telefon (optional)" },
    "Adresse du logement à nettoyer": { en: "Address of the property to clean", de: "Adresse der zu reinigenden Wohnung" },
    "Confirmer la date": { en: "Confirm the date", de: "Datum bestätigen" },
    "Valider mes choix": { en: "Confirm my choices", de: "Auswahl bestätigen" },
    "Aucune option": { en: "No option", de: "Keine Option" },
    "Continuer": { en: "Continue", de: "Weiter" },
    "(coordonnées transmises)": { en: "(contact details sent)", de: "(Kontaktdaten übermittelt)" },

    "💰 Le prix est trop élevé": { en: "💰 The price is too high", de: "💰 Der Preis ist zu hoch" },
    "📅 La date ne convient pas": { en: "📅 The date doesn't work", de: "📅 Der Termin passt nicht" },
    "🧹 Je n'ai pas besoin de tout": { en: "🧹 I don't need all of it", de: "🧹 Ich brauche nicht alles" },
    "🏠 Les conditions/détails ne conviennent pas": { en: "🏠 The terms/details don't suit me", de: "🏠 Die Bedingungen/Details passen nicht" },
    "🤔 Je dois réfléchir": { en: "🤔 I need to think about it", de: "🤔 Ich muss noch überlegen" },
    "🆚 J'ai reçu une autre offre": { en: "🆚 I got another offer", de: "🆚 Ich habe ein anderes Angebot erhalten" },
    "❓ J'ai une autre question": { en: "❓ I have another question", de: "❓ Ich habe eine andere Frage" },
    "⚪ Je n'ai plus besoin du service": { en: "⚪ I no longer need the service", de: "⚪ Ich benötige den Service nicht mehr" },
    "Ou décrivez avec vos mots (ex: « Autre entreprise à CHF 420 »)": { en: "Or describe it in your own words (e.g. \"Another company quoted CHF 420\")", de: "Oder beschreiben Sie es mit eigenen Worten (z. B. «Anderes Unternehmen zu CHF 420»)" },
    "Envoyer": { en: "Send", de: "Senden" },

    "Bien sûr. Auriez-vous deux minutes pour me dire ce qui ne convenait pas dans notre offre ?": {
      en: "Of course. Would you have two minutes to tell me what didn't work about our offer?",
      de: "Natürlich. Hätten Sie zwei Minuten Zeit, mir zu sagen, was an unserem Angebot nicht gepasst hat?",
    },
    "Pour vous recontacter si besoin, laissez-nous vos coordonnées :": { en: "So we can follow up if needed, please leave us your details:", de: "Damit wir Sie bei Bedarf kontaktieren können, hinterlassen Sie uns bitte Ihre Kontaktdaten:" },
    "Merci pour votre retour ! Nous avons transmis votre message à l'équipe — vous serez recontacté(e) rapidement si une meilleure offre est possible.": {
      en: "Thanks for the feedback! We've passed your message on to the team — you'll hear back shortly if a better offer is possible.",
      de: "Vielen Dank für Ihr Feedback! Wir haben Ihre Nachricht an das Team weitergeleitet — Sie hören bald von uns, falls ein besseres Angebot möglich ist.",
    },
    "Pour confirmer votre réservation :": { en: "To confirm your booking:", de: "Um Ihre Buchung zu bestätigen:" },
    "✓ Confirmer la réservation": { en: "✓ Confirm the booking", de: "✓ Buchung bestätigen" },

    "📄 Votre devis": { en: "📄 Your quote", de: "📄 Ihre Offerte" },
    "Génération du devis…": { en: "Generating the quote…", de: "Offerte wird erstellt…" },
    "✓ Accepter le devis": { en: "✓ Accept the quote", de: "✓ Offerte annehmen" },
    "Refuser": { en: "Decline", de: "Ablehnen" },
    "Devis PDF": { en: "Quote PDF", de: "Offerte-PDF" },
    "⬇ Télécharger le PDF": { en: "⬇ Download the PDF", de: "⬇ PDF herunterladen" },
    "Impossible de générer le PDF (connexion requise). Vous pouvez tout de même accepter ou refuser ci-dessous.": {
      en: "Couldn't generate the PDF (connection required). You can still accept or decline below.",
      de: "Das PDF konnte nicht erstellt werden (Internetverbindung erforderlich). Sie können unten trotzdem annehmen oder ablehnen.",
    },
    "DEVIS DÉTAILLÉ": { en: "DETAILED QUOTE", de: "DETAILLIERTE OFFERTE" },
    "TOTAL": { en: "TOTAL", de: "TOTAL" },
    "📄 Voir mon devis (PDF)": { en: "📄 View my quote (PDF)", de: "📄 Offerte ansehen (PDF)" },
    "Merci d'avoir testé l'outil de devis intégré de Dealz !": { en: "Thanks for trying Dealz's built-in quote tool!", de: "Danke, dass Sie das integrierte Offert-Tool von Dealz getestet haben!" },
    "Intégrer Dealz": { en: "Integrate Dealz", de: "Dealz integrieren" },
    "Nous contacter": { en: "Contact us", de: "Kontaktieren Sie uns" },
    "📧 Aperçu de l'e-mail (démo)": { en: "📧 Email preview (demo)", de: "📧 E-Mail-Vorschau (Demo)" },
    "📅 Ajouter à mon Google Agenda": { en: "📅 Add to my Google Calendar", de: "📅 Zu meinem Google Kalender hinzufügen" },
    "Voici votre devis, ferme et détaillé pour cette prestation — vous pouvez l'accepter ou le refuser ci-dessous.": {
      en: "Here is your firm, detailed quote for this service — you can accept or decline it below.",
      de: "Hier ist Ihre feste, detaillierte Offerte für diese Leistung — Sie können sie unten annehmen oder ablehnen.",
    },
  };

  // A handful of server- or template-generated strings splice in a value
  // (the customer's name, an error message, a date) — an exact-match lookup
  // can never catch those, so a small set of regex patterns handles them
  // instead. Checked only when T() finds no exact match.
  const I18N_PATTERNS = [
    {
      re: /^Merci (.+) ! Voici votre devis, ferme et détaillé pour cette prestation — vous pouvez l'accepter ou le refuser ci-dessous\.$/,
      build: (m, lang) =>
        lang === "en"
          ? `Thank you ${m[1]}! Here is your firm, detailed quote for this service — you can accept or decline it below.`
          : `Vielen Dank, ${m[1]}! Hier ist Ihre feste, detaillierte Offerte für diese Leistung — Sie können sie unten annehmen oder ablehnen.`,
    },
    {
      re: /^Erreur\s*:\s*(.+)$/,
      build: (m, lang) => (lang === "en" ? `Error: ${m[1]}` : `Fehler: ${m[1]}`),
    },
  ];

  function T(fr) {
    const lang = window.DEALZ_LANG;
    if (!lang || lang === "fr" || !fr) return fr;
    for (const p of I18N_PATTERNS) {
      const m = fr.match(p.re);
      if (m) return p.build(m, lang);
    }
    const entry = I18N[fr];
    return (entry && entry[lang]) || fr;
  }

  let messages = [];
  let sending = false;
  let greeted = false;
  let useStaticFallback = false;
  let pricingPromise = null;

  // Set by embed.js when this widget is loaded on a third-party site (a
  // different origin than the Dealz backend) — API calls need an absolute
  // URL in that case. Same-origin pages (demo.html served by this repo's
  // own server) leave this unset and every call stays relative, unchanged.
  function apiUrl(path) {
    return (window.DEALZ_API_BASE || "") + path;
  }

  // The e-mail captured by docs/lead-gate.js before the widget was revealed
  // — when set, company-facing demo notifications (decline, booking) are
  // addressed to it instead of the fictional company inbox, so testing the
  // demo for your own business shows what *you* would actually receive.
  function getCompanyEmail() {
    try {
      return sessionStorage.getItem("dealz_company_email") || "";
    } catch (e) {
      return "";
    }
  }

  // window.DEALZ_COMPANY is set by embed.js from the script tag's
  // data-dealz-company="..." attribute — a real tenant's own pricing grid
  // (see /api/pricing in server.js); empty on demo.html, which keeps using
  // the static /pricing.json for the single-tenant demo grid.
  function loadPricing() {
    if (!pricingPromise) {
      const url = window.DEALZ_COMPANY
        ? apiUrl("/api/pricing?company=" + encodeURIComponent(window.DEALZ_COMPANY))
        : apiUrl("/pricing.json");
      pricingPromise = fetch(url).then((r) => r.json());
    }
    return pricingPromise;
  }

  // Talks to the real backend. Throws a plain Error (network failure, or a
  // non-JSON response like a static host's 404 page) when no backend exists
  // at all — that's the signal to fall back to the offline client-side mock,
  // as opposed to a *reachable* backend returning a real error (bad API key,
  // no credit, etc.), which should be shown to the user as-is.
  async function callBackend(payloadMessages) {
    const res = await fetch(apiUrl("/api/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: payloadMessages,
        company: window.DEALZ_COMPANY || undefined,
        lang: window.DEALZ_LANG || undefined,
      }),
    });
    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("no-backend");
    }
    if (!res.ok) {
      const err = new Error(data.error || "une erreur est survenue");
      err.isAppError = true;
      throw err;
    }
    return data;
  }

  // Same shape as callBackend, for the decline/accept/counteroffer endpoints.
  async function postJSON(path, body) {
    const res = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let data;
    try {
      data = await res.json();
    } catch (e) {
      throw new Error("no-backend");
    }
    if (!res.ok) {
      const err = new Error(data.error || "une erreur est survenue");
      err.isAppError = true;
      throw err;
    }
    return data;
  }

  // Translates through T() here (not at every call site) so every button,
  // chip and header built with el() picks up the right language for free —
  // one choke point instead of hundreds of individual call-site edits.
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = T(text);
    return e;
  }

  function scrollToBottom(container) {
    container.scrollTop = container.scrollHeight;
  }

  function renderUserMessage(container, text) {
    container.appendChild(el("div", "dealz-msg user", text));
    scrollToBottom(container);
  }

  function renderAssistantText(container, text) {
    container.appendChild(el("div", "dealz-msg assistant", text));
    scrollToBottom(container);
  }

  function renderSystemMessage(container, text, kind, html) {
    const bubble = el("div", `dealz-msg ${kind}`);
    if (html) bubble.innerHTML = html;
    else bubble.textContent = T(text);
    container.appendChild(bubble);
    scrollToBottom(container);
  }

  // ---- Contact capture (name/email/phone/address) ----
  function renderContactForm(container, { intro, submitLabel, needAddress }, onSubmit) {
    const wrap = el("div", "dealz-contact-form");
    if (intro) wrap.appendChild(el("p", "dcf-intro", intro));

    const nameInput = el("input", "dcf-input");
    nameInput.placeholder = T("Nom");
    const emailInput = el("input", "dcf-input");
    emailInput.type = "email";
    emailInput.placeholder = T("E-mail");
    emailInput.required = true;
    const phoneInput = el("input", "dcf-input");
    phoneInput.placeholder = T("Téléphone (optionnel)");

    wrap.appendChild(nameInput);
    wrap.appendChild(emailInput);
    wrap.appendChild(phoneInput);

    let addressInput = null;
    if (needAddress) {
      addressInput = el("input", "dcf-input");
      addressInput.placeholder = T("Adresse du logement à nettoyer");
      addressInput.required = true;
      wrap.appendChild(addressInput);
    }

    const submitBtn = el("button", "dcf-submit", submitLabel);
    wrap.appendChild(submitBtn);

    submitBtn.addEventListener("click", () => {
      if (!emailInput.value.trim()) {
        emailInput.focus();
        return;
      }
      if (addressInput && !addressInput.value.trim()) {
        addressInput.focus();
        return;
      }
      submitBtn.disabled = true;
      wrap.querySelectorAll("input").forEach((i) => (i.disabled = true));
      onSubmit({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: addressInput ? addressInput.value.trim() : "",
      });
    });

    container.appendChild(wrap);
    scrollToBottom(container);
  }

  // ---- Objection picker (chips + free text) ----
  function renderObjectionPicker(container, onPick) {
    const wrap = el("div", "dealz-objection-picker");
    const chipsRow = el("div", "dop-chips");
    OBJECTION_CHIPS.forEach((chip) => {
      const btn = el("button", "dop-chip", chip.label);
      btn.addEventListener("click", () => {
        wrap.querySelectorAll("button, input").forEach((n) => (n.disabled = true));
        onPick({ category: chip.category, text: chip.label });
      });
      chipsRow.appendChild(btn);
    });
    wrap.appendChild(chipsRow);

    const freeRow = el("div", "dop-free");
    const freeInput = el("input", "dop-free-input");
    freeInput.placeholder = T("Ou décrivez avec vos mots (ex: « Autre entreprise à CHF 420 »)");
    const freeBtn = el("button", "dop-free-btn", "Envoyer");
    freeRow.appendChild(freeInput);
    freeRow.appendChild(freeBtn);
    wrap.appendChild(freeRow);

    function submitFree() {
      if (!freeInput.value.trim()) return;
      wrap.querySelectorAll("button, input").forEach((n) => (n.disabled = true));
      onPick({ category: null, text: freeInput.value.trim() });
    }
    freeBtn.addEventListener("click", submitFree);
    freeInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitFree();
    });

    container.appendChild(wrap);
    scrollToBottom(container);
  }

  // ---- Adaptive question chips (mock-mode question flow) ----
  // Reuses the objection picker's chip styling. The free-text input at the
  // bottom of the widget stays live the whole time, so typing an answer
  // instead of clicking a chip always works too — no separate "Autre" chip
  // needed.
  function renderChipQuestion(container, question, onAnswer) {
    if (question.type === "date") {
      const dateWrap = el("div", "dealz-objection-picker");
      const dateInput = el("input", "dcf-input");
      dateInput.type = "date";
      dateInput.min = question.minDate;
      dateWrap.appendChild(dateInput);
      const dateMsg = el("p", "dlg-msg");
      dateWrap.appendChild(dateMsg);
      const confirmDateBtn = el("button", "dcf-submit", "Confirmer la date");
      confirmDateBtn.addEventListener("click", () => {
        if (!dateInput.value || dateInput.value < question.minDate) {
          dateMsg.textContent =
            window.DEALZ_LANG === "en"
              ? "Please choose a valid date (earliest: " + question.minDate + ")."
              : window.DEALZ_LANG === "de"
              ? "Bitte wählen Sie ein gültiges Datum (frühestens: " + question.minDate + ")."
              : "Merci de choisir une date valide (au plus tôt : " + question.minDate + ").";
          dateMsg.className = "dlg-msg show err";
          return;
        }
        dateWrap.querySelectorAll("input, button").forEach((n) => (n.disabled = true));
        onAnswer(dateInput.value);
      });
      dateWrap.appendChild(confirmDateBtn);
      container.appendChild(dateWrap);
      scrollToBottom(container);
      return;
    }

    const wrap = el("div", "dealz-objection-picker");
    const chipsRow = el("div", "dop-chips");
    const selected = new Set();
    const preselected = new Set(question.preselected || []);

    question.options.forEach((opt) => {
      const btn = el("button", "dop-chip", opt.label);
      // "Aucun(e)" is mutually exclusive with every other option in the
      // same multi-select question — picking it means none of the others
      // apply, so they're greyed out and cleared; picking any real option
      // clears "Aucun(e)" back the other way.
      const isNoneOption = /^aucun/i.test(opt.label);
      if (question.type === "multi" && preselected.has(opt.value)) {
        btn.classList.add("selected");
        selected.add(opt.label);
      }
      btn.addEventListener("click", () => {
        if (question.type === "multi") {
          btn.classList.toggle("selected");
          if (selected.has(opt.label)) selected.delete(opt.label);
          else selected.add(opt.label);

          const otherButtons = Array.from(chipsRow.querySelectorAll("button")).filter((b) => b !== btn);
          if (isNoneOption) {
            const nowSelected = btn.classList.contains("selected");
            otherButtons.forEach((otherBtn) => {
              otherBtn.disabled = nowSelected;
              if (nowSelected && otherBtn.classList.contains("selected")) {
                otherBtn.classList.remove("selected");
                selected.delete(otherBtn.textContent);
              }
            });
          } else if (btn.classList.contains("selected")) {
            const noneBtn = otherButtons.find((b) => /^aucun/i.test(b.textContent));
            if (noneBtn && noneBtn.classList.contains("selected")) {
              noneBtn.classList.remove("selected");
              selected.delete(noneBtn.textContent);
            }
          }
        } else {
          wrap.querySelectorAll("button").forEach((n) => (n.disabled = true));
          onAnswer(opt.label);
        }
      });
      chipsRow.appendChild(btn);
    });
    wrap.appendChild(chipsRow);

    if (question.type === "multi") {
      const confirmBtn = el("button", "dcf-submit", "Valider mes choix");
      confirmBtn.addEventListener("click", () => {
        wrap.querySelectorAll("button").forEach((n) => (n.disabled = true));
        onAnswer(selected.size ? Array.from(selected).join(", ") : "Aucune option");
      });
      wrap.appendChild(confirmBtn);
    }

    container.appendChild(wrap);
    scrollToBottom(container);
  }

  // Shows exactly what would be emailed — real dry-run content from the
  // backend when it's simulating (no SMTP configured), or a client-built
  // approximation when there's no backend at all (static fallback).
  function renderEmailPreview(container, preview) {
    if (!preview) return;
    const wrap = el("div", "dealz-email-preview");
    const toLabel = window.DEALZ_LANG === "en" ? "To:" : window.DEALZ_LANG === "de" ? "An:" : "À :";
    const subjectLabel = window.DEALZ_LANG === "en" ? "Subject:" : window.DEALZ_LANG === "de" ? "Betreff:" : "Objet :";
    wrap.innerHTML =
      `<div class="dep-head">${T("📧 Aperçu de l'e-mail (démo)")}</div>` +
      `<div class="dep-meta"><b>${toLabel}</b> ${preview.to}<br/><b>${subjectLabel}</b> ${preview.subject}</div>` +
      `<div class="dep-body">${preview.html}</div>`;
    container.appendChild(wrap);
    scrollToBottom(container);
  }

  // Shown once, right after a booking is confirmed — the moment someone has
  // just watched the whole flow work end to end is the natural point to ask
  // for the next step, rather than leaving the conversation with no CTA.
  function renderPostBookingCTA(container) {
    const wrap = el("div", "dealz-post-cta");
    wrap.appendChild(
      el("p", "dpc-text", "Merci d'avoir testé l'outil de devis intégré de Dealz !")
    );
    const actions = el("div", "dpc-actions");
    const integrateLink = el("a", "dpc-btn dpc-btn-primary", "Intégrer Dealz");
    integrateLink.href = (window.DEALZ_LANG === "en" ? "/en" : window.DEALZ_LANG === "de" ? "/de" : "") + "/index.html#contact";
    const contactLink = el("a", "dpc-btn dpc-btn-secondary", "Nous contacter");
    contactLink.href = "mailto:dealz@dealz.website";
    actions.appendChild(integrateLink);
    actions.appendChild(contactLink);
    wrap.appendChild(actions);
    container.appendChild(wrap);
    scrollToBottom(container);
  }

  function simulatedAcceptHtml() {
    if (window.DEALZ_LANG === "en") {
      return (
        `✓ Thank you! Your quote has been sent to ${COMPANY_NAME}. You'll receive confirmation ` +
        `by email, and the appointment has been added to the company's Google Calendar. Someone ` +
        `from the team will contact you if needed to finalise the details.` +
        `<br/><br/><i style="opacity:.7">(Static demo mode — no real email is sent here.)</i>`
      );
    }
    if (window.DEALZ_LANG === "de") {
      return (
        `✓ Vielen Dank! Ihre Offerte wurde an ${COMPANY_NAME} übermittelt. Sie erhalten eine ` +
        `Bestätigung per E-Mail, und der Termin wurde im Google Kalender des Unternehmens eingetragen. ` +
        `Bei Bedarf meldet sich jemand aus dem Team, um die Details zu klären.` +
        `<br/><br/><i style="opacity:.7">(Statischer Demo-Modus — es wird hier keine echte E-Mail versendet.)</i>`
      );
    }
    return (
      `✓ Merci ! Votre devis a été transmis à ${COMPANY_NAME}. Vous recevrez la confirmation ` +
      `par e-mail, et le rendez-vous a été ajouté à l'agenda Google de l'entreprise. Une personne ` +
      `de l'équipe vous contactera si besoin pour finaliser les détails.` +
      `<br/><br/><i style="opacity:.7">(Mode démonstration statique — aucun e-mail réel n'est envoyé ici.)</i>`
    );
  }

  async function confirmBooking(container, quote, customer) {
    if (useStaticFallback) {
      renderSystemMessage(container, null, "system-success", simulatedAcceptHtml());
      renderEmailPreview(container, window.DealzMock.buildBookingConfirmationPreview({ quote, customer }));
      renderPostBookingCTA(container);
      return;
    }
    try {
      const data = await postJSON("/api/accept", {
        quote,
        customer,
        companyEmail: getCompanyEmail(),
        company: window.DEALZ_COMPANY || undefined,
        lang: window.DEALZ_LANG || undefined,
      });
      renderSystemMessage(
        container,
        null,
        "system-success",
        (window.DEALZ_LANG === "en"
          ? `✓ Booking confirmed! A confirmation email has been sent, and the appointment ` +
            `is ready to be added to the company's calendar.`
          : window.DEALZ_LANG === "de"
          ? `✓ Buchung bestätigt! Eine Bestätigungs-E-Mail wurde versendet, und der Termin ` +
            `ist bereit, in den Kalender des Unternehmens eingetragen zu werden.`
          : `✓ Réservation confirmée ! Un e-mail de confirmation a été envoyé, et le rendez-vous ` +
            `est prêt à être ajouté à l'agenda de l'entreprise.`) +
          (data.calendarLink
            ? `<br/><br/><a href="${data.calendarLink}" target="_blank" rel="noopener">${T("📅 Ajouter à mon Google Agenda")}</a>`
            : "")
      );
      renderEmailPreview(container, data.emailPreview);
      renderPostBookingCTA(container);
    } catch (err) {
      if (err.isAppError) {
        renderSystemMessage(container, `Erreur : ${err.message}`, "system-decline");
      } else {
        renderSystemMessage(container, null, "system-success", simulatedAcceptHtml());
        renderEmailPreview(container, window.DealzMock.buildBookingConfirmationPreview({ quote, customer }));
        renderPostBookingCTA(container);
      }
    }
  }

  function handleAccept(container, quote) {
    // Contact info is normally already captured earlier in the conversation
    // (the assistant asks for it before delivering the quote) — only fall
    // back to asking again here if that didn't happen for some reason.
    if (quote.customer && quote.customer.email) {
      confirmBooking(container, quote, quote.customer);
      return;
    }
    renderContactForm(
      container,
      { intro: "Pour confirmer votre réservation :", submitLabel: "✓ Confirmer la réservation", needAddress: true },
      (customer) => confirmBooking(container, quote, customer)
    );
  }

  async function submitDecline(container, quote, category, text, customer) {
    try {
      const data = await postJSON("/api/decline", {
        quote,
        category,
        text,
        customer,
        companyEmail: getCompanyEmail(),
        company: window.DEALZ_COMPANY || undefined,
        lang: window.DEALZ_LANG || undefined,
      });
      renderSystemMessage(
        container,
        "Merci pour votre retour ! Nous avons transmis votre message à l'équipe — vous serez " +
          "recontacté(e) rapidement si une meilleure offre est possible.",
        "system-decline"
      );
      renderEmailPreview(container, data.emailPreview);
    } catch (err) {
      renderSystemMessage(
        container,
        err.isAppError ? `Erreur : ${err.message}` : "Une erreur est survenue.",
        "system-decline"
      );
    }
  }

  function handleDecline(container, quote) {
    renderAssistantText(
      container,
      "Bien sûr. Auriez-vous deux minutes pour me dire ce qui ne convenait pas dans notre offre ?"
    );
    renderObjectionPicker(container, ({ category, text }) => {
      renderUserMessage(container, text);

      if (useStaticFallback) {
        renderSystemMessage(
          container,
          null,
          "system-decline",
          (window.DEALZ_LANG === "en"
            ? `Thanks for the feedback! Under real conditions, this message would be sent to ` +
              `${COMPANY_NAME} by email, with an action tailored to your reason for declining.` +
              `<br/><br/><i style="opacity:.7">(Static demo mode — no real email is sent here.)</i>`
            : window.DEALZ_LANG === "de"
            ? `Vielen Dank für Ihr Feedback! Unter realen Bedingungen würde diese Nachricht per ` +
              `E-Mail an ${COMPANY_NAME} übermittelt, mit einer auf Ihren Ablehnungsgrund abgestimmten Massnahme.` +
              `<br/><br/><i style="opacity:.7">(Statischer Demo-Modus — es wird hier keine echte E-Mail versendet.)</i>`
            : `Merci pour votre retour ! En conditions réelles, ce message serait transmis à ` +
              `${COMPANY_NAME} par e-mail, avec une action adaptée à votre motif de refus.` +
              `<br/><br/><i style="opacity:.7">(Mode démonstration statique — aucun e-mail réel n'est envoyé ici.)</i>`)
        );
        renderEmailPreview(
          container,
          window.DealzMock.buildDeclineEmailPreview({
            quote,
            category: category || "other",
            rawText: text,
            customer: quote.customer || {},
            companyEmail: getCompanyEmail(),
          })
        );
        return;
      }

      // Contact info is normally already captured earlier, before the quote
      // was delivered — only ask again here if that didn't happen.
      if (quote.customer && quote.customer.email) {
        submitDecline(container, quote, category, text, quote.customer);
        return;
      }

      renderContactForm(
        container,
        { intro: "Pour vous recontacter si besoin, laissez-nous vos coordonnées :", submitLabel: "Envoyer" },
        (customer) => submitDecline(container, quote, category, text, customer)
      );
    });
  }

  // ---- PDF modal: the quote opens as a real PDF, viewed without leaving
  // Dealz, with Accepter/Refuser directly below it — not shown until the
  // customer chooses to view it, per the brief this shipped from.
  const PDF_LIB_URL = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  let pdfLibPromise = null;

  function loadPdfLibs() {
    if (pdfLibPromise) return pdfLibPromise;
    pdfLibPromise = new Promise((resolve, reject) => {
      const jspdfScript = document.createElement("script");
      jspdfScript.src = PDF_LIB_URL;
      jspdfScript.onload = () => {
        const genScript = document.createElement("script");
        genScript.src = (window.DEALZ_API_BASE || "") + "/pdf-generator.js";
        genScript.onload = resolve;
        genScript.onerror = reject;
        document.body.appendChild(genScript);
      };
      jspdfScript.onerror = reject;
      document.body.appendChild(jspdfScript);
    });
    return pdfLibPromise;
  }

  function closePdfModal() {
    const overlay = document.getElementById("dealz-pdf-overlay");
    if (overlay) overlay.remove();
  }

  async function openPdfModal(container, quote) {
    const overlay = el("div", "dealz-pdf-overlay");
    overlay.id = "dealz-pdf-overlay";
    const closeLabel = window.DEALZ_LANG === "en" ? "Close" : window.DEALZ_LANG === "de" ? "Schliessen" : "Fermer";
    overlay.innerHTML =
      '<div class="dealz-pdf-modal">' +
      '<div class="dealz-pdf-modal-head">' +
      `<span>${T("📄 Votre devis")}</span>` +
      `<button class="dealz-pdf-close" aria-label="${closeLabel}">✕</button>` +
      "</div>" +
      `<div class="dealz-pdf-body"><p class="dealz-pdf-loading">${T("Génération du devis…")}</p></div>` +
      '<div class="dealz-pdf-actions">' +
      `<button class="qc-accept" id="dealz-pdf-accept">${T("✓ Accepter le devis")}</button>` +
      `<button class="qc-decline" id="dealz-pdf-decline">${T("Refuser")}</button>` +
      "</div>" +
      "</div>";
    document.body.appendChild(overlay);

    overlay.querySelector(".dealz-pdf-close").addEventListener("click", closePdfModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePdfModal();
    });

    const acceptBtn = overlay.querySelector("#dealz-pdf-accept");
    const declineBtn = overlay.querySelector("#dealz-pdf-decline");
    acceptBtn.addEventListener("click", () => {
      acceptBtn.disabled = true;
      declineBtn.disabled = true;
      closePdfModal();
      handleAccept(container, quote);
    });
    declineBtn.addEventListener("click", () => {
      acceptBtn.disabled = true;
      declineBtn.disabled = true;
      closePdfModal();
      handleDecline(container, quote);
    });

    try {
      await loadPdfLibs();
      const { doc, blobUrl } = window.DealzPDF.generate(quote, quote.customer || {}, window.DEALZ_LANG || "fr");
      const body = overlay.querySelector(".dealz-pdf-body");
      body.innerHTML = "";
      const iframe = el("iframe", "dealz-pdf-frame");
      iframe.src = blobUrl;
      iframe.title = T("Devis PDF");
      body.appendChild(iframe);
      const dl = el("a", "dealz-pdf-download", "⬇ Télécharger le PDF");
      dl.href = blobUrl;
      dl.download = "devis-swissclean.pdf";
      body.appendChild(dl);
    } catch (err) {
      const body = overlay.querySelector(".dealz-pdf-body");
      body.innerHTML = `<p class="dealz-pdf-loading">${T(
        "Impossible de générer le PDF (connexion requise). Vous pouvez tout de même accepter ou refuser ci-dessous."
      )}</p>`;
    }
  }

  function renderQuoteCard(container, quote) {
    const card = el("div", "dealz-quote-card");
    const headLabel = quote.customer && quote.customer.name
      ? `${T("DEVIS DÉTAILLÉ")} — ${quote.customer.name.toUpperCase()}`
      : T("DEVIS DÉTAILLÉ");
    const headEl = el("div", "qc-head");
    headEl.textContent = headLabel;
    card.appendChild(headEl);
    quote.items.forEach((item) => {
      const row = el("div", "qc-row");
      row.appendChild(el("span", null, item.label));
      row.appendChild(el("span", null, `CHF ${item.amount.toFixed(2)}`));
      card.appendChild(row);
    });
    const total = el("div", "qc-total");
    total.appendChild(el("span", null, "TOTAL"));
    total.appendChild(el("span", null, `CHF ${quote.total.toFixed(2)}`));
    card.appendChild(total);

    const actions = el("div", "qc-actions");
    const viewBtn = el("button", "qc-accept", "📄 Voir mon devis (PDF)");
    viewBtn.style.flex = "1 1 100%";
    actions.appendChild(viewBtn);
    card.appendChild(actions);

    viewBtn.addEventListener("click", () => openPdfModal(container, quote));

    container.appendChild(card);
    scrollToBottom(container);
    document.dispatchEvent(new CustomEvent("dealz:quote-delivered", { detail: quote }));
  }

  function extractText(content) {
    if (typeof content === "string") return content;
    return content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");
  }

  // displayText lets a structured-form submission (e.g. the contact form)
  // show a clean human-readable bubble while the actual engine payload
  // (JSON) travels as `text` — defaults to `text` for ordinary typed/chip
  // answers, where the two are the same thing. Passing `null` suppresses
  // the user bubble entirely (used to silently prime the very first
  // question — see primeConversation).
  async function sendMessage(container, input, sendBtn, text, displayText) {
    if (!text.trim() || sending) return;
    sending = true;
    sendBtn.disabled = true;

    messages.push({ role: "user", content: text });
    if (displayText !== null) {
      renderUserMessage(container, displayText !== undefined ? displayText : text);
    }
    input.value = "";

    const typing = el("div", "dealz-msg typing", "En train d'écrire…");
    container.appendChild(typing);
    scrollToBottom(container);

    try {
      let data;
      try {
        if (useStaticFallback) throw new Error("no-backend");
        data = await callBackend(messages);
      } catch (err) {
        if (err.isAppError) {
          typing.remove();
          renderAssistantText(container, `Erreur : ${err.message}`);
          return;
        }
        // No reachable backend at all (e.g. this page hosted as static files,
        // no Express server behind it) — switch to the offline demo engine
        // for the rest of the session and keep going transparently.
        useStaticFallback = true;
        const pricing = await loadPricing();
        data = window.DealzMock.runTurnMock(pricing, messages, window.DEALZ_LANG || "fr");
      }

      typing.remove();
      messages.push(...data.messages);

      for (const msg of data.messages) {
        if (msg.role === "assistant") {
          const t = extractText(msg.content);
          if (t) renderAssistantText(container, t);
        }
      }

      if (data.quote) {
        renderQuoteCard(container, data.quote);
      } else if (data.question && data.question.type === "contact_form") {
        renderContactForm(
          container,
          { submitLabel: "Continuer", needAddress: data.question.needAddress },
          (customer) => {
            const summary = [customer.name, customer.email, customer.phone].filter(Boolean).join(" · ");
            sendMessage(container, input, sendBtn, JSON.stringify(customer), summary || "(coordonnées transmises)");
          }
        );
      } else if (data.question) {
        renderChipQuestion(container, data.question, (text) =>
          sendMessage(container, input, sendBtn, text)
        );
      }
    } catch (err) {
      typing.remove();
      renderAssistantText(container, "Une erreur est survenue — veuillez réessayer.");
    } finally {
      sending = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  function init() {
    const container = document.getElementById("dealz-messages");
    const input = document.getElementById("dealz-input");
    const sendBtn = document.getElementById("dealz-send");
    if (!container || !input || !sendBtn) return;

    function greet() {
      if (greeted) return;
      greeted = true;
      renderAssistantText(
        container,
        "Bonjour ! Je vais vous poser quelques questions rapides sur votre logement, et je vous " +
          "établis un devis ferme tout de suite après."
      );
      // Silently primes the engine with a generic opening statement so the
      // first real question (chips, not free text) appears immediately —
      // no wasted first reply that the structured question bank would
      // otherwise ignore and ask about again later.
      sendMessage(container, input, sendBtn, "Je souhaite un devis de nettoyage.", null);
    }

    greet();

    sendBtn.addEventListener("click", () => sendMessage(container, input, sendBtn, input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage(container, input, sendBtn, input.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
