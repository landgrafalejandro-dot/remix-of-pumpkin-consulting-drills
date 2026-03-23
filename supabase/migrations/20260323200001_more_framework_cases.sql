-- ============================================================
-- Add 30 more framework_cases (total → 60)
-- Distribution: ~5 per category, balanced across difficulties
-- All content in German, consulting-interview quality
-- ============================================================

-- EASY (8 new)
INSERT INTO public.framework_cases (difficulty, category, prompt, context_info, recommended_framework, reference_solution, active)
VALUES
  ('easy', 'market_entry',
   'Ein deutsches Unternehmen für Tiernahrung möchte in den britischen Markt expandieren. UK hat den größten Heimtiermarkt Europas. Strukturiere deine Markteintrittsanalyse.',
   'Umsatz DACH: 200 Mio €, 8 Produktlinien (Hund, Katze), UK Markt: 4,5 Mrd £, dominiert von 3 großen Marken, wachsender Premium-Trend',
   'Market Entry Framework',
   '• Marktattraktivität: Marktgröße, Wachstum, Premium-Segment-Anteil, Regulierung (Post-Brexit Einfuhrregeln)
• Wettbewerb: Positionierung gegenüber Mars, Nestlé Purina, Aldi-Eigenmarken, Differenzierung durch Premium-Qualität
• Eintrittsmodus: Partnerschaft mit britischem Retailer vs. eigener Online-D2C-Kanal vs. Akquisition einer lokalen Marke',
   true),

  ('easy', 'ma',
   'Ein mittelständischer Softwareanbieter für Handwerksbetriebe erwägt die Übernahme eines kleineren Wettbewerbers. Der Wettbewerber hat komplementäre Funktionen, aber veraltete Technologie. Bewerte die strategische Logik.',
   'Eigenes Unternehmen: 12 Mio € ARR, 800 Kunden, Cloud-basiert. Ziel: 3 Mio € ARR, 250 Kunden, On-Premise, starkes CRM-Modul, Kaufpreis: 8 Mio €',
   'M&A Framework',
   '• Strategischer Fit: Komplementäre Features (CRM), Kundenüberlappung prüfen, Technologie-Migration bewerten
• Bewertung: Multiples (2,5x ARR), Synergiepotenziale quantifizieren (Cross-Sell, Churn-Reduktion)
• Risiken: Migrationskomplexität On-Premise zu Cloud, Kunden-Churn bei Umstellung, Integrationsaufwand',
   true),

  ('easy', 'pricing',
   'Eine Fitnesskette mit 30 Studios möchte eine neue Preisstruktur einführen. Aktuell gibt es nur eine Flatrate. Strukturiere die Analyse für ein differenziertes Preismodell.',
   '30 Studios in Großstädten, 45.000 Mitglieder, Monatsbeitrag: 39,90 €, Auslastung: 65% im Schnitt, Spitzenzeiten: 85%, NPS: 42',
   'Pricing Framework',
   '• Segmentierung: Nutzergruppen identifizieren (Casual, Regular, Power-User), Zahlungsbereitschaft pro Segment ermitteln
• Preismodell: 2-3 Tiers (Basic/Flex/Premium) mit differenzierten Leistungen, Peak/Off-Peak Pricing erwägen
• Impact-Analyse: Umsatzeffekt modellieren, Churn-Risiko pro Segment abschätzen, Kommunikationsstrategie planen',
   true),

  ('easy', 'operations',
   'Ein E-Commerce-Unternehmen für Elektronik hat eine Retourenquote von 28%, deutlich über dem Branchendurchschnitt von 15%. Strukturiere deine Analyse zur Retourenreduktion.',
   '500.000 Bestellungen/Jahr, Retourenquote: 28%, Kosten pro Retoure: 15 €, Hauptgründe laut Umfrage: Produktbeschreibung passt nicht (35%), Qualitätsprobleme (25%), zu spät geliefert (20%)',
   'Operations Framework',
   '• Ursachenanalyse: Retourengründe nach Produktkategorie und Kundengruppe aufschlüsseln, Top-Retouren-Produkte identifizieren
• Quick Wins: Produktbeschreibungen und Bilder verbessern, Qualitätskontrolle verschärfen, Lieferzuverlässigkeit erhöhen
• Langfristig: Virtuelle Produktpräsentation (AR/3D), dynamische Empfehlungen, Retouren-Scoring zur Prävention',
   true),

  ('easy', 'growth',
   'Ein Online-Nachhilfeportal hat 50.000 registrierte Schüler in Deutschland und wächst seit einem Jahr nicht mehr. Der Gründer sucht Wachstumshebel. Strukturiere deine Analyse.',
   'Registrierte Schüler: 50.000, aktive Nutzer: 15.000/Monat, ARPU: 25 €/Monat, Fächer: Mathe und Englisch, Zielgruppe: Klasse 5-10, NPS: 55',
   'Growth Strategy Framework (Ansoff-Matrix)',
   '• Marktdurchdringung: Conversion von registrierten zu aktiven Nutzern steigern, Empfehlungsprogramm einführen
• Produktentwicklung: Neue Fächer (Deutsch, Physik, Chemie), Prüfungsvorbereitung (Abi, MSA), Gruppenunterricht
• Marktentwicklung: Zielgruppe erweitern (Grundschule, Oberstufe, Erwachsene), B2B an Schulen und Nachhilfeinstitute',
   true),

  ('easy', 'profitability',
   'Eine Bäckereikette mit 15 Filialen in Berlin hat sinkende Margen trotz konstanter Kundenzahlen. Strukturiere deine Profitabilitätsanalyse.',
   'Umsatz: 8 Mio €/Jahr, 15 Filialen, Bruttomarge gesunken von 55% auf 42%, Mehlpreise +30%, Energiekosten +40%, Mindestlohn gestiegen, 3 Filialen in unrentablen Lagen',
   'Profitability Framework',
   '• Kostenanalyse: Wareneinsatz (Mehl, Energie), Personalkosten und Mieten pro Filiale aufschlüsseln
• Filial-Analyse: P&L je Standort erstellen, Bottom-3-Filialen identifizieren, Schließung oder Restrukturierung prüfen
• Gegenmaßnahmen: Preiserhöhung, Sortimentsoptimierung (margenstarke Produkte fördern), Einkaufsgemeinschaft für Rohstoffe',
   true),

  ('easy', 'market_entry',
   'Ein deutsches EdTech-Startup für Sprachlern-Apps plant den Markteintritt in Südkorea. Der koreanische Markt für Sprachlernen ist riesig, aber extrem wettbewerbsintensiv. Strukturiere die Analyse.',
   'App: 2 Mio Downloads in DACH, Sprachen: Englisch/Spanisch/Französisch, Umsatz: 5 Mio € ARR, Südkorea: Bildungsausgaben pro Kopf weltweit am höchsten, 80% lernen Englisch',
   'Market Entry Framework',
   '• Marktattraktivität: Marktgröße (Sprachlernen in Korea ~5 Mrd $), Zahlungsbereitschaft, Mobile-First-Kultur
• Wettbewerb: Positionierung vs. lokale Anbieter und globale Player (Duolingo, YBM), Differenzierung identifizieren
• Go-to-Market: Lokalisierung (Koreanische UI, kulturelle Anpassung), Vertriebskanal (App Store, Partnerschaften mit Hagwons)',
   true),

  ('easy', 'ma',
   'Ein Lebensmittelkonzern prüft die Übernahme eines Bio-Snack-Startups. Das Startup hat eine starke Marke bei jungen Konsumenten und wächst dynamisch. Strukturiere deine Bewertung.',
   'Konzern: 3 Mrd € Umsatz, 50 Marken. Startup: 8 Mio € Umsatz, +45% YoY, vegane Riegel und Chips, 90% Umsatz über Einzelhandel, Bewertung: 40 Mio €',
   'M&A Framework',
   '• Strategischer Fit: Zugang zum Bio/Vegan-Trend, jüngere Zielgruppe, Regalplatz-Synergien im Handel
• Bewertung: 5x Umsatz-Multiple prüfen, Wachstumspotenzial und Skalierbarkeit der Produktion einschätzen
• Integration: Markenautonomie bewahren, Produktionsskalierung über Konzern-Infrastruktur, Gründer-Bindung durch Earn-out',
   true);


-- MEDIUM (12 new)
INSERT INTO public.framework_cases (difficulty, category, prompt, context_info, recommended_framework, reference_solution, active)
VALUES
  ('medium', 'profitability',
   'Ein Carsharing-Anbieter in 5 deutschen Großstädten ist nach 4 Jahren immer noch unprofitabel. Die Unit Economics variieren stark zwischen den Städten. Der Investor fordert einen klaren Weg zur Profitabilität. Analysiere die Situation.',
   'Flotte: 3.000 Fahrzeuge, 250.000 registrierte Nutzer, Umsatz: 35 Mio €, EBITDA: -8 Mio €, Fahrzeugauslastung: 22-48% je nach Stadt, Umsatz pro Fahrzeug/Tag variiert von 18 € bis 45 €, Wartungskosten 30% über Plan',
   'Profitability Framework mit Unit Economics je Stadt',
   '• Stadt-Level-Analyse: P&L pro Stadt aufstellen, Auslastung und Umsatz/Fahrzeug als Haupttreiber identifizieren, Break-even-Auslastung berechnen
• Flottenoptimierung: Unprofitable Zonen eliminieren, dynamisches Pricing zu Spitzenzeiten, Flottenreduktion in schwachen Städten
• Kostensenkung: Wartungsverträge neu verhandeln, Elektrifizierung für geringere Betriebskosten, Versicherungsmodell optimieren',
   true),

  ('medium', 'profitability',
   'Ein Hersteller von Industrieverpackungen sieht, dass seine Marge von 12% auf 6% gesunken ist, obwohl der Umsatz um 20% gewachsen ist. Das Wachstum kam hauptsächlich durch einen neuen Großkunden. Analysiere die Profitabilitätsproblematik.',
   'Umsatz: 60 Mio € (+20% YoY), Top-Kunde: 25% des Umsatzes (neu, mit aggressiven Preisverhandlungen), Rohstoffkosten +15%, 3 Produktionswerke, Bestandskunden-Margen: 14%, Neukunden-Marge: 2%',
   'Profitability Framework mit Kundensegmentierung',
   '• Kundenprofitabilität: P&L pro Kundengruppe (Bestands- vs. Neukunden), Margenverfall durch Großkunden quantifizieren
• Preisanalyse: Nachkalkulation des Großkunden-Vertrags, versteckte Kosten (Sonderwünsche, Logistik, Zahlungsziele) aufdecken
• Handlungsoptionen: Neuverhandlung mit Großkunde, Bestandskunden-Preiserhöhung, Rohstoff-Hedging, Portfolio-Bereinigung',
   true),

  ('medium', 'market_entry',
   'Ein europäischer Hersteller von Premium-Kaffeemaschinen (Segmentpreis 800-3.000 €) plant den Eintritt in den US-Markt. In den USA dominieren Kapselmaschinen und Filterkaffee, aber der Specialty-Coffee-Trend wächst. Entwickle eine Markteintrittsstrategie.',
   'EU-Umsatz: 180 Mio €, Marktanteil Europa: 15%, US-Kaffeemaschinen-Markt: 8 Mrd $, Premium-Segment (<5%), Specialty Coffee +12% p.a., Hauptwettbewerber: Breville, Jura, DeLonghi (bereits in US), kein eigener US-Vertrieb',
   'Market Entry Framework mit Channel-Strategie',
   '• Marktsegmentierung: Specialty-Coffee-Enthusiasten als Zielgruppe, Marktgröße des Premium-Segments schätzen, Zahlungsbereitschaft validieren
• Channel-Strategie: D2C (eigener Online-Shop) vs. Retail (Williams-Sonoma, Sur La Table) vs. Amazon, Showroom-Konzept prüfen
• Lokalisierung: US-Serviceinfrastruktur aufbauen, Marketingansatz (Influencer, Coffee-Community), Stromspannung/Zertifizierungen (UL)',
   true),

  ('medium', 'growth',
   'Eine Plattform für Freelancer-Vermittlung in der IT hat 10.000 aktive Freelancer und 500 Unternehmenskunden. Das Wachstum stagniert bei beiden Seiten. Analysiere die Wachstumshebel für eine zweiseitige Plattform.',
   'GMV: 80 Mio €, Take-Rate: 15%, Umsatz: 12 Mio €, Freelancer-Retention: 60%/Jahr, Unternehmens-Retention: 85%/Jahr, durchschn. Projektgröße: 25.000 €, NPS Freelancer: 35, NPS Unternehmen: 52',
   'Platform Growth Framework (Network Effects)',
   '• Supply-Seite (Freelancer): Retention verbessern (schnellere Vermittlung, bessere Konditionen), Spezialisierung auf gefragte Skills (Cloud, KI)
• Demand-Seite (Unternehmen): Account-Management stärken, Self-Service für kleinere Projekte, Managed-Service für Enterprise
• Netzwerkeffekte: Matching-Algorithmus verbessern, Qualitätssicherung durch Reviews und Zertifizierungen, Community aufbauen',
   true),

  ('medium', 'growth',
   'Ein Premium-Fitnessstudio-Betreiber mit 12 Studios möchte den Umsatz pro Mitglied steigern, ohne weitere Studios zu eröffnen. Entwickle eine Wachstumsstrategie auf bestehender Fläche.',
   'Mitglieder: 18.000, Monatsbeitrag: 79 €, Zusatzumsatz: nur 5% des Gesamtumsatzes, Auslastung: 60% im Schnitt, Personal Trainer Kapazität: 30% ausgelastet, kein digitales Angebot',
   'Growth Strategy Framework (Revenue per Member)',
   '• Upselling: Personal Training Pakete, Ernährungsberatung, Premium-Mitgliedschaften mit Wellness/Sauna
• Cross-Selling: Supplements, Sportbekleidung, Partner-Angebote (Physiotherapie), Corporate-Wellness-Programme
• Digital: Hybrid-Modell mit Online-Kursen, App mit Trainingsplänen (Freemium), digitale Community und Challenges',
   true),

  ('medium', 'ma',
   'Ein Medienkonzern erwägt die Übernahme eines Podcast-Netzwerks mit 50 Shows und 10 Mio monatlichen Downloads. Das Netzwerk wächst stark, ist aber noch nicht profitabel. Bewerte die Akquisition.',
   'Medienkonzern: 2 Mrd € Umsatz, TV/Print/Digital. Podcast-Netzwerk: 5 Mio € Umsatz, -2 Mio € EBITDA, 50 Shows (davon 5 Top-Performer mit 70% der Downloads), CPM: 25 €, exklusive Verträge mit 80% der Hosts, Kaufpreis: 35 Mio €',
   'M&A Framework mit Content-Asset-Bewertung',
   '• Content-Assets: Abhängigkeit von Top-5-Shows analysieren, Host-Verträge und Laufzeiten prüfen, IP-Rechte bewerten
• Synergien: Cross-Promotion mit bestehenden Medienmarken, Werbeverkauf über Konzern-Salesforce, Exklusiv-Content für Streaming-Plattform
• Risiken: Host-Abwanderung bei Übernahme, Podcast-Markt-Sättigung, Monetarisierung über Werbung vs. Abo-Modell',
   true),

  ('medium', 'ma',
   'Ein internationaler Logistikkonzern prüft die Übernahme einer Last-Mile-Delivery-Plattform in Südostasien. Die Plattform hat ein Gig-Worker-Modell und wächst stark, steht aber unter regulatorischem Druck. Bewerte den Deal.',
   'Logistikkonzern: 25 Mrd € Umsatz, schwach in Asien. Plattform: GMV 200 Mio $, 80.000 Gig-Worker, Präsenz in 5 Ländern, -30 Mio $ EBITDA, Regulierer in 2 Ländern fordern Festanstellung der Fahrer, Kaufpreis: 400 Mio $',
   'M&A Framework mit Regulatory Risk Assessment',
   '• Strategischer Wert: Zugang zu Last-Mile in Wachstumsregion, Netzwerk und Technologie-Plattform bewerten
• Regulatorisches Risiko: Gig-Worker-Gesetzgebung in jedem Land analysieren, Szenario-Modell (Status quo vs. Festanstellung vs. Hybrid)
• Integration: Standalone vs. Integration in Konzernlogistik, Technologie-Plattform als Basis für eigene Services nutzen',
   true),

  ('medium', 'pricing',
   'Ein Cloud-Infrastruktur-Anbieter verliert Kunden an AWS und Azure trotz besser bewerteten Supports. Die Analyse zeigt, dass das Preismodell zu komplex ist und Kunden Schwierigkeiten haben, Kosten vorherzusagen. Entwickle ein neues Preismodell.',
   'Umsatz: 120 Mio €, 600 Kunden, aktuell 47 verschiedene Preiskomponenten, durchschn. Rechnung: 16.000 €/Monat, 35% der Support-Tickets betreffen Abrechnungsfragen, Churn: 18% p.a., NPS: 48',
   'Pricing Framework mit Simplification Strategy',
   '• Preismodell-Analyse: Aktuelle 47 Komponenten clustern, Hauptkostentreiber identifizieren, Vergleich mit AWS/Azure-Modellen
• Vereinfachung: 3-5 Pakete (S/M/L/Enterprise) mit vorhersagbaren Kosten, Flatrate-Elemente einführen, Pay-as-you-grow
• Migration: Bestandskunden-Transition planen, Savings Guarantee für Wechsler, Transparenz-Dashboard für Kostenprognose',
   true),

  ('medium', 'pricing',
   'Ein Anbieter von Projektmanagement-Software erwägt den Wechsel von Per-User-Pricing zu nutzungsbasiertem Pricing. Analysiere die strategischen und finanziellen Implikationen.',
   'ARR: 25 Mio €, 2.000 Unternehmenskunden, durchschn. 30 User/Kunde, Preis: 12 €/User/Monat, 40% der User nutzen die Software weniger als 2x/Monat, Enterprise-Kunden (>100 User) machen 60% des Umsatzes',
   'Pricing Transformation Framework',
   '• Impact-Modell: Umsatzeffekt bei Usage-Pricing simulieren (Gewinner/Verlierer unter Kunden), Risiko bei Enterprise-Kunden quantifizieren
• Hybrid-Modell: Basisgebühr + nutzungsbasierte Komponente, Mindestcommitment für Planungssicherheit, Fair-Use-Modell erwägen
• Transition: Grandfather-Klauseln für Bestandskunden, schrittweise Umstellung über 12 Monate, Metriken zur Messung des Erfolgs',
   true),

  ('medium', 'operations',
   'Ein Krankenversicherer hat eine durchschnittliche Bearbeitungszeit für Erstattungsanträge von 21 Tagen. Der Branchendurchschnitt liegt bei 7 Tagen. Kundenbeschwerden nehmen massiv zu. Strukturiere die Prozessoptimierung.',
   '500.000 Versicherte, 120.000 Erstattungsanträge/Monat, 200 Sachbearbeiter, 65% manuelle Prüfung, 3 verschiedene IT-Systeme, Fehlerquote: 12%, 30% der Anträge brauchen Rückfragen an den Kunden',
   'Operations Framework mit Process Optimization',
   '• Prozessanalyse: End-to-End-Prozess kartieren, Engpässe identifizieren (manuelle Prüfung, Systembrüche, Rückfragen)
• Automatisierung: Straight-Through-Processing für Standardfälle, KI-gestützte Dokumentenprüfung, Self-Service-Portal für Kunden
• Quick Wins: Rückfragen reduzieren (bessere Formulare), Prioritäts-Routing (einfache Fälle zuerst), Sachbearbeiter-Schulung',
   true),

  ('medium', 'operations',
   'Ein Automobilhersteller hat in seinem Motorenwerk eine OEE (Overall Equipment Effectiveness) von 62%, während der Benchmark bei 85% liegt. Der Werkleiter bittet um eine systematische Analyse.',
   'Werk: 3 Produktionslinien, 800 Mitarbeiter, 3-Schicht-Betrieb, geplante Kapazität: 1.200 Motoren/Tag, Ist: 850 Motoren/Tag, ungeplante Stillstände: 15% der Betriebszeit, Ausschussrate: 4,5%, Umrüstzeiten: 90 Min (Ziel: 30 Min)',
   'Operations Framework (OEE-Analyse)',
   '• OEE-Zerlegung: Verfügbarkeit (ungeplante Stillstände), Leistung (Taktzeit-Verluste), Qualität (Ausschuss) einzeln analysieren
• Verfügbarkeit: Predictive Maintenance einführen, Ersatzteil-Bestandsmanagement optimieren, Stillstandsursachen nach Pareto priorisieren
• Leistung & Qualität: SMED für Umrüstzeiten, Qualitäts-Regelkreise an jeder Linie, Automatisierung kritischer Prüfschritte',
   true),

  ('medium', 'market_entry',
   'Ein deutscher Hersteller von intelligenten Heizsystemen plant den Markteintritt in Frankreich. Frankreich hat ein anderes Heizsystem (überwiegend Elektroheizung statt Gas) und strenge Energieeffizienz-Regulierung. Strukturiere die Analyse.',
   'DACH-Umsatz: 90 Mio €, Produkt: Smart-Thermostate und Wärmepumpen-Steuerung, Frankreich: 30 Mio Wohnungen, 35% Elektroheizung, neue Energieeffizienz-Verordnung RE2020, Wettbewerber: Netatmo (Legrand), Somfy',
   'Market Entry Framework mit Regulierungsanalyse',
   '• Marktspezifika: Französisches Heizsystem verstehen, Produktanpassung für Elektroheizung, RE2020 als Treiber oder Hürde bewerten
• Wettbewerb: Positionierung vs. Netatmo und Somfy, Differenzierung durch Wärmepumpen-Expertise und Energieeinsparung
• Vertrieb: Partnerschaft mit französischen Installateuren, Baumärkte (Leroy Merlin, Castorama), Online-Kanal',
   true);


-- HARD (10 new)
INSERT INTO public.framework_cases (difficulty, category, prompt, context_info, recommended_framework, reference_solution, active)
VALUES
  ('hard', 'profitability',
   'Ein globaler Tier-1-Automobilzulieferer steht vor einem strategischen Dilemma: Das profitable Verbrennungsmotor-Geschäft (ICE) schrumpft, während das neue E-Mobility-Segment stark wächst, aber hohe Verluste produziert. Der Vorstand muss entscheiden, wie aggressiv der Übergang gestaltet wird, ohne die kurzfristige Profitabilität zu zerstören.',
   'Konzernumsatz: 8 Mrd €, EBIT: 480 Mio € (6%). ICE-Geschäft: 6 Mrd €, EBIT 12%, schrumpft 8% p.a. E-Mobility: 2 Mrd €, EBIT -15%, wächst 35% p.a. F&E-Budget: 600 Mio € (70% bereits E-Mobility). 35.000 Mitarbeiter, davon 20.000 im ICE-Bereich. Kunden fordern CO2-Neutralität bis 2030. Hauptwettbewerber hat bereits 60% E-Mobility-Anteil',
   'Profitability Framework mit Portfolio-Transformation und Szenarioanalyse',
   '• Dual-Transformation: ICE als Cash-Cow managen (Kosten optimieren, keine Neuinvestitionen), E-Mobility zur Break-even-Reife bringen, Übergangsszenarien modellieren
• ICE-Management: Erntestrategie definieren, Personalabbau sozialverträglich planen, Produktionskonsolidierung (Werke schließen)
• E-Mobility: Break-even-Pfad modellieren, Skaleneffekte quantifizieren, strategische Partnerschaften für Kostenreduktion, Kundenportfolio diversifizieren',
   true),

  ('hard', 'market_entry',
   'Ein europäischer Telekommunikationskonzern plant den Eintritt in den afrikanischen Mobilfunkmarkt durch Übernahme eines Betreibers in Nigeria oder Kenia. Beide Märkte bieten enormes Wachstumspotenzial, aber unterschiedliche Risikoprofile. Gleichzeitig evaluiert der Konzern, ob Mobile Money als zweiter Geschäftszweig aufgebaut werden sollte.',
   'Konzern: 40 Mrd € Umsatz, Präsenz in 12 EU-Ländern, kein Afrika-Exposure. Nigeria: 220 Mio Einwohner, 4 Betreiber, SIM-Penetration 85%, ARPU: 4 $/Monat, politisch instabil. Kenia: 55 Mio Einwohner, Safaricom dominiert (65% Marktanteil), M-Pesa weltweit führend im Mobile Money. Verfügbares Akquisitionsbudget: 3 Mrd €',
   'Market Entry Framework mit Ländervergleich und Business-Model-Innovation',
   '• Ländervergleich: Nigeria vs. Kenia nach Marktgröße, Wettbewerb, Regulierung, politischem Risiko und Wachstumspotenzial bewerten
• Mobile Money: Zusätzliche Wertschöpfung durch Finanzdienstleistungen, M-Pesa als Benchmark, regulatorische Anforderungen (Banking-Lizenz)
• Risikomanagement: Währungsrisiko (Naira-Volatilität), politische Risiken, Infrastruktur-Investitionen, Exit-Optionen bei Misserfolg',
   true),

  ('hard', 'growth',
   'Ein etablierter Versand-Apotheken-Betreiber mit 2 Mio Kunden steht vor einem Wachstumsproblem: Der OTC-Markt wächst kaum, die Margen sinken durch Preiskampf, und das E-Rezept bietet zwar eine riesige Chance (Rx-Markt ist 10x größer als OTC), aber erfordert massive Investitionen in Logistik und Regulierung. Gleichzeitig drängen Amazon und neue Startups in den Markt. Entwickle eine priorisierte Wachstumsstrategie.',
   'Umsatz: 400 Mio € (95% OTC), 2 Mio aktive Kunden, Bruttomarge: 22% (sinkend), Rx-Markt DE: 55 Mrd €, E-Rezept seit 2024 Pflicht, eigene Logistik für OTC, Rx erfordert Kühlkette und Same-Day-Delivery, Amazon Pharmacy in US gestartet, 3 Rx-Startups mit VC-Funding in DE',
   'Growth Strategy mit Competitive Response und Capability Assessment',
   '• OTC-Verteidigung: Kundenbindung stärken (Abo-Modell, Loyalty), Margendruck durch Eigenmarken und Effizienz begegnen
• Rx-Expansion: Investitionsbedarf für Kühlkette und Same-Day-Delivery berechnen, regulatorische Hürden klären, Pilotregion starten
• Wettbewerbsreaktion: Differenzierung vs. Amazon (Beratung, Vertrauen, Schnelligkeit), First-Mover-Advantage im E-Rezept vs. Startups',
   true),

  ('hard', 'ma',
   'Ein mittelständischer Maschinenbauer mit Weltmarktführerschaft in einem Nischensegment (Spezialpumpen) wird von drei verschiedenen Käufern umworben: (1) ein strategischer Wettbewerber, (2) ein Private-Equity-Fonds, und (3) ein chinesischer Industriekonzern. Der Eigentümer (Familienunternehmen, 3. Generation) muss die Optionen bewerten. Führe eine strukturierte Analyse durch.',
   'Umsatz: 250 Mio €, EBITDA: 45 Mio € (18%), 1.200 Mitarbeiter, 65% Export, 12 Patente, Weltmarktanteil: 35%. Angebot Wettbewerber: 350 Mio €, Synergien versprochen. PE-Fonds: 400 Mio € (8x EBITDA), Management bleibt. China-Konzern: 500 Mio € (11x EBITDA), Technologietransfer erwartet. Mitarbeiterrat besorgt um Standortgarantie.',
   'M&A Framework mit Seller-Perspektive und Stakeholder-Analyse',
   '• Optionsvergleich: Preis, Bedingungen, strategische Implikationen für jede Option, Risiko-Rendite-Matrix erstellen
• Stakeholder-Interessen: Familie (Vermögen + Vermächtnis), Mitarbeiter (Arbeitsplätze), Kunden (Lieferkontinuität), Region (Wirtschaftsfaktor)
• Due Diligence der Käufer: Strategischer Wettbewerber (Synergien vs. Kannibalisierung), PE (Value Creation Plan, Exit nach 5 Jahren), China (Technologietransfer-Risiko, geopolitische Sensitivität)',
   true),

  ('hard', 'pricing',
   'Ein globaler Hersteller von Industrierobotern verkauft aktuell Hardware mit einmaligem Kaufpreis und optionalem Wartungsvertrag. Der Vorstand will auf ein Robot-as-a-Service (RaaS) Modell umstellen, bei dem Kunden pro produzierter Einheit oder pro Betriebsstunde zahlen. Die Umstellung birgt Chancen und erhebliche Risiken. Entwickle die Preisstrategie.',
   'Umsatz: 800 Mio € (75% Hardware, 25% Service), durchschn. Roboterpreis: 120.000 €, Lebensdauer: 8 Jahre, Wartungsvertrag: 8.000 €/Jahr (45% Attach-Rate), 6.000 Roboter im Feld, Wettbewerber testen RaaS-Modelle, Kunden wünschen OpEx statt CapEx, CFO besorgt über Bilanzeffekte (Revenue Recognition)',
   'Pricing Transformation Framework (CapEx to OpEx)',
   '• Finanzielles Modell: RaaS-Pricing berechnen (Leasing-Kalkulation, Zielrendite), Revenue-Recognition-Impact modellieren, Cash-Flow-Übergangsphase planen
• Kundenanalyse: Welche Segmente profitieren von RaaS (KMU, projektbasierte Fertigung), welche bevorzugen Kauf (Großserie), Hybrid-Modell anbieten
• Risikomanagement: Auslastungsrisiko (Kunde zahlt weniger bei Unterauslastung), Asset-Management (Rücknahme, Zweitmarkt), Vertragsgestaltung (Mindestlaufzeit, Mindestabnahme)',
   true),

  ('hard', 'pricing',
   'Eine europäische Billigfluggesellschaft erwägt die Einführung eines Abo-Modells: Kunden zahlen eine monatliche Pauschale und können unbegrenzt fliegen. Analysiere die strategischen und finanziellen Implikationen dieses radikalen Preismodells.',
   'Umsatz: 6 Mrd €, 80 Mio Passagiere/Jahr, durchschn. Ticketpreis: 55 €, Ancillary Revenue: 20 €/Passagier, Load Factor: 93%, 200 Routen, Hauptwettbewerber: Ryanair, easyJet. Abo-Idee: 49 €/Monat für Inlandsflüge, 99 €/Monat für EU-weit. Test in 2 Märkten geplant.',
   'Pricing Innovation Framework mit Demand Modeling',
   '• Nachfragemodell: Kannibalisierung bestehender Buchungen quantifizieren, inkrementelle Nachfrage schätzen, Kapazitätsimpact bei 93% Load Factor
• Unit Economics: Break-even-Frequenz pro Abo-Kunde berechnen, Segmentierung (Geschäftsreisende vs. Leisure), Ancillary Revenue bei Abo-Kunden
• Risiken: Adverse Selection (Vielflieger abonnieren, Wenigflieger nicht), Kapazitätsengpässe auf beliebten Routen, Marken-Repositionierung, regulatorische Fragen',
   true),

  ('hard', 'operations',
   'Ein globaler Halbleiterhersteller muss entscheiden, ob er eine neue Chip-Fabrik in Europa (Förderung durch EU Chips Act) oder in Südostasien (niedrigere Kosten) baut. Die Investition beträgt 5 Mrd € und ist die größte Einzelentscheidung der Firmengeschichte. Strukturiere die Entscheidungsanalyse.',
   'Umsatz: 15 Mrd €, 3 bestehende Fabs (Taiwan, Singapur, USA), Europa-Kunden: 30% des Umsatzes, EU Chips Act Förderung: bis zu 40% der Investition, Bauzeit Europa: 4 Jahre, Asien: 2,5 Jahre, Fachkräftemangel in Europa, Energiekosten Europa 2x Asien, geopolitisches Risiko Taiwan steigt',
   'Operations Framework mit Standortentscheidung und Szenarioanalyse',
   '• Total Cost of Ownership: Investitionskosten (mit/ohne Förderung), Betriebskosten (Energie, Personal, Logistik), 20-Jahres-NPV für beide Optionen
• Strategische Faktoren: Kundennähe, geopolitische Diversifizierung (Abhängigkeit von Asien reduzieren), EU-Regulierung (Versorgungssicherheit), Fachkräfteverfügbarkeit
• Risikobewertung: Förder-Clawback-Klauseln, Technologiegeneration (welcher Chip-Node in welchem Markt), Szenario bei Eskalation Taiwan-Konflikt',
   true),

  ('hard', 'operations',
   'Ein Lebensmittelkonzern betreibt eine komplexe Kühlkette von 15 Produktionsstandorten zu 30.000 Verkaufspunkten in 8 Ländern. Die Logistikkosten sind 25% über Benchmark, gleichzeitig werden 3% der Ware wegen Kühlkettenunterbrechungen entsorgt. Der Vorstand will bis 2028 die Logistikkosten auf Benchmark senken und Schwund halbieren.',
   'Umsatz: 5 Mrd €, Logistikkosten: 625 Mio € (12,5% vom Umsatz, Benchmark: 10%), Schwund: 150 Mio €/Jahr, 15 Werke, 45 Kühl-Verteilzentren, 800 eigene LKW + 400 Subunternehmer, IoT-Sensorik in 20% der Flotte, keine zentrale Transportplanung',
   'Operations Framework mit Supply-Chain-Transformation',
   '• Netzwerkoptimierung: Verteilzentren konsolidieren, Transportrouten optimieren (Hub-and-Spoke vs. Direktbelieferung), Auslastung der LKW-Flotte steigern
• Schwundreduktion: IoT-Sensorik auf 100% ausweiten, Echtzeitüberwachung der Kühlkette, Qualitätsmanagement an Übergabepunkten
• Digitalisierung: Zentrale Transportplanungssoftware einführen, Predictive Analytics für Nachfrage und Routing, Kosten-Dashboard pro Route und Verkaufspunkt',
   true),

  ('hard', 'growth',
   'Ein europäisches FinTech für KMU-Kreditvergabe (Revenue-Based Financing) hat Product-Market-Fit in Deutschland bewiesen, steht aber vor einem Trilemma: (1) Geografische Expansion in weitere EU-Länder, (2) Produkt-Expansion in neue Finanzprodukte (Factoring, Versicherung), oder (3) Upstream-Integration durch Entwicklung einer eigenen Banking-Plattform. Das Kapital reicht nur für eine Richtung. Priorisiere und begründe.',
   'ARR: 30 Mio €, 2.500 aktive KMU-Kunden, durchschn. Kreditvolumen: 150.000 €, Default Rate: 3,2%, NPS: 68, Series B: 50 Mio € (Runway: 18 Monate), Regulatorik: BaFin-Lizenz für DE, jedes EU-Land braucht eigene Lizenzierung, Banking-Plattform würde BaFin-Volllizenz erfordern',
   'Growth Strategy mit Optionsbewertung und Resource Allocation',
   '• Optionsbewertung: Jede Richtung nach Marktpotenzial, Regulierungskomplexität, Kapitalbedarf und Time-to-Revenue bewerten
• Geo-Expansion: EU-Passporting-Möglichkeiten, Kreditrisiko-Modelle pro Land anpassen, Pilotland auswählen (NL oder AT als Low-Risk)
• Empfehlung: Sequenzieller Ansatz priorisieren — erst Produkt-Expansion (Factoring, niedrige regulatorische Hürde, Up-Sell an Bestandskunden), dann Geo-Expansion, Banking-Plattform langfristig',
   true),

  ('hard', 'profitability',
   'Ein diversifizierter Medienkonzern besitzt TV-Sender, Zeitungen, eine Streaming-Plattform und ein Eventgeschäft. Die Gesamtprofitabilität sinkt, aber die Segmente entwickeln sich unterschiedlich: Print schrumpft, TV stagniert, Streaming wächst mit Verlusten, Events boomen. Der Vorstand diskutiert einen radikalen Portfolioumbau. Analysiere und empfehle.',
   'Konzernumsatz: 3,5 Mrd €, EBIT: 140 Mio € (4%). Print: 600 Mio € (EBIT -8%, -12% p.a.), TV: 1,5 Mrd € (EBIT 10%, flat), Streaming: 800 Mio € (EBIT -20%, +30% p.a.), Events: 600 Mio € (EBIT 15%, +10% p.a.). Nettoverschuldung: 1,2 Mrd €, 8.000 Mitarbeiter (40% im Print)',
   'Profitability Framework mit Portfolio-Strategie (BCG Matrix)',
   '• Portfolio-Analyse: Jedes Segment als Star/Cash Cow/Question Mark/Dog klassifizieren, Sum-of-Parts-Bewertung erstellen, Konzernabschlag quantifizieren
• Strategische Optionen: Print-Verkauf oder kontrolliertes Schrumpfen (Harvest), TV als Cash Cow für Streaming-Investitionen nutzen, Events als Wachstumssäule ausbauen
• Streaming-Turnaround: Break-even-Pfad modellieren, Content-Synergien mit TV, Abo vs. Werbefinanzierung, Partnerschaften oder Konsolidierung prüfen',
   true);
