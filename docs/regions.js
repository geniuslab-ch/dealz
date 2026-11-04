/* Regions a client can cover, by country, for the onboarding form (docs/onboarding-form.js):
 * Swiss cantons, French départements, UK counties, US states. */
(function () {
  // Cantons: code, French, German, English names.
  var CH = [
    ["AG", "Argovie", "Aargau", "Aargau"],
    ["AI", "Appenzell Rhodes-Intérieures", "Appenzell Innerrhoden", "Appenzell Innerrhoden"],
    ["AR", "Appenzell Rhodes-Extérieures", "Appenzell Ausserrhoden", "Appenzell Ausserrhoden"],
    ["BE", "Berne", "Bern", "Bern"],
    ["BL", "Bâle-Campagne", "Basel-Landschaft", "Basel-Landschaft"],
    ["BS", "Bâle-Ville", "Basel-Stadt", "Basel-Stadt"],
    ["FR", "Fribourg", "Freiburg", "Fribourg"],
    ["GE", "Genève", "Genf", "Geneva"],
    ["GL", "Glaris", "Glarus", "Glarus"],
    ["GR", "Grisons", "Graubünden", "Graubünden"],
    ["JU", "Jura", "Jura", "Jura"],
    ["LU", "Lucerne", "Luzern", "Lucerne"],
    ["NE", "Neuchâtel", "Neuenburg", "Neuchâtel"],
    ["NW", "Nidwald", "Nidwalden", "Nidwalden"],
    ["OW", "Obwald", "Obwalden", "Obwalden"],
    ["SG", "Saint-Gall", "St. Gallen", "St. Gallen"],
    ["SH", "Schaffhouse", "Schaffhausen", "Schaffhausen"],
    ["SO", "Soleure", "Solothurn", "Solothurn"],
    ["SZ", "Schwytz", "Schwyz", "Schwyz"],
    ["TG", "Thurgovie", "Thurgau", "Thurgau"],
    ["TI", "Tessin", "Tessin", "Ticino"],
    ["UR", "Uri", "Uri", "Uri"],
    ["VD", "Vaud", "Waadt", "Vaud"],
    ["VS", "Valais", "Wallis", "Valais"],
    ["ZG", "Zoug", "Zug", "Zug"],
    ["ZH", "Zurich", "Zürich", "Zurich"],
  ];

  var FR = [
    ["01", "Ain"], ["02", "Aisne"], ["03", "Allier"], ["04", "Alpes-de-Haute-Provence"], ["05", "Hautes-Alpes"],
    ["06", "Alpes-Maritimes"], ["07", "Ardèche"], ["08", "Ardennes"], ["09", "Ariège"], ["10", "Aube"],
    ["11", "Aude"], ["12", "Aveyron"], ["13", "Bouches-du-Rhône"], ["14", "Calvados"], ["15", "Cantal"],
    ["16", "Charente"], ["17", "Charente-Maritime"], ["18", "Cher"], ["19", "Corrèze"], ["2A", "Corse-du-Sud"],
    ["2B", "Haute-Corse"], ["21", "Côte-d'Or"], ["22", "Côtes-d'Armor"], ["23", "Creuse"], ["24", "Dordogne"],
    ["25", "Doubs"], ["26", "Drôme"], ["27", "Eure"], ["28", "Eure-et-Loir"], ["29", "Finistère"],
    ["30", "Gard"], ["31", "Haute-Garonne"], ["32", "Gers"], ["33", "Gironde"], ["34", "Hérault"],
    ["35", "Ille-et-Vilaine"], ["36", "Indre"], ["37", "Indre-et-Loire"], ["38", "Isère"], ["39", "Jura"],
    ["40", "Landes"], ["41", "Loir-et-Cher"], ["42", "Loire"], ["43", "Haute-Loire"], ["44", "Loire-Atlantique"],
    ["45", "Loiret"], ["46", "Lot"], ["47", "Lot-et-Garonne"], ["48", "Lozère"], ["49", "Maine-et-Loire"],
    ["50", "Manche"], ["51", "Marne"], ["52", "Haute-Marne"], ["53", "Mayenne"], ["54", "Meurthe-et-Moselle"],
    ["55", "Meuse"], ["56", "Morbihan"], ["57", "Moselle"], ["58", "Nièvre"], ["59", "Nord"],
    ["60", "Oise"], ["61", "Orne"], ["62", "Pas-de-Calais"], ["63", "Puy-de-Dôme"], ["64", "Pyrénées-Atlantiques"],
    ["65", "Hautes-Pyrénées"], ["66", "Pyrénées-Orientales"], ["67", "Bas-Rhin"], ["68", "Haut-Rhin"], ["69", "Rhône"],
    ["70", "Haute-Saône"], ["71", "Saône-et-Loire"], ["72", "Sarthe"], ["73", "Savoie"], ["74", "Haute-Savoie"],
    ["75", "Paris"], ["76", "Seine-Maritime"], ["77", "Seine-et-Marne"], ["78", "Yvelines"], ["79", "Deux-Sèvres"],
    ["80", "Somme"], ["81", "Tarn"], ["82", "Tarn-et-Garonne"], ["83", "Var"], ["84", "Vaucluse"],
    ["85", "Vendée"], ["86", "Vienne"], ["87", "Haute-Vienne"], ["88", "Vosges"], ["89", "Yonne"],
    ["90", "Territoire de Belfort"], ["91", "Essonne"], ["92", "Hauts-de-Seine"], ["93", "Seine-Saint-Denis"], ["94", "Val-de-Marne"],
    ["95", "Val-d'Oise"], ["971", "Guadeloupe"], ["972", "Martinique"], ["973", "Guyane"], ["974", "La Réunion"],
    ["976", "Mayotte"],
  ];

  // England (ceremonial counties), Wales (preserved counties), Scotland
  // (council areas), Northern Ireland (counties).
  var UK = [
    "Bedfordshire", "Berkshire", "Bristol", "Buckinghamshire", "Cambridgeshire", "Cheshire", "City of London", "Cornwall",
    "Cumbria", "Derbyshire", "Devon", "Dorset", "Durham", "East Riding of Yorkshire", "East Sussex", "Essex",
    "Gloucestershire", "Greater London", "Greater Manchester", "Hampshire", "Herefordshire", "Hertfordshire", "Isle of Wight", "Kent",
    "Lancashire", "Leicestershire", "Lincolnshire", "Merseyside", "Norfolk", "North Yorkshire", "Northamptonshire", "Northumberland",
    "Nottinghamshire", "Oxfordshire", "Rutland", "Shropshire", "Somerset", "South Yorkshire", "Staffordshire", "Suffolk",
    "Surrey", "Tyne and Wear", "Warwickshire", "West Midlands", "West Sussex", "West Yorkshire", "Wiltshire", "Worcestershire",
    "Clwyd (Wales)", "Dyfed (Wales)", "Gwent (Wales)", "Gwynedd (Wales)", "Mid Glamorgan (Wales)", "Powys (Wales)", "South Glamorgan (Wales)", "West Glamorgan (Wales)",
    "Aberdeen City", "Aberdeenshire", "Angus", "Argyll and Bute", "City of Edinburgh", "Clackmannanshire", "Dumfries and Galloway", "Dundee City",
    "East Ayrshire", "East Dunbartonshire", "East Lothian", "East Renfrewshire", "Falkirk", "Fife", "Glasgow City", "Highland",
    "Inverclyde", "Midlothian", "Moray", "Na h-Eileanan Siar", "North Ayrshire", "North Lanarkshire", "Orkney Islands", "Perth and Kinross",
    "Renfrewshire", "Scottish Borders", "Shetland Islands", "South Ayrshire", "South Lanarkshire", "Stirling", "West Dunbartonshire", "West Lothian",
    "Antrim (NI)", "Armagh (NI)", "Down (NI)", "Fermanagh (NI)", "Londonderry (NI)", "Tyrone (NI)",
  ];

  var US = [
    ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"], ["CO", "Colorado"],
    ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
    ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"],
    ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
    ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"],
    ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
    ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"],
    ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
    ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
  ];

  window.DEALZ_REGIONS = {
    CH: CH.map(function (c) { return { id: c[0], label: { fr: c[1] + " (" + c[0] + ")", de: c[2] + " (" + c[0] + ")", en: c[3] + " (" + c[0] + ")" } }; }),
    FR: FR.map(function (d) { return { id: d[0], label: d[0] + " – " + d[1] }; }),
    UK: UK.map(function (n) { return { id: n, label: n }; }),
    US: US.map(function (s) { return { id: s[0], label: s[1] + " (" + s[0] + ")" }; }),
  };
})();
