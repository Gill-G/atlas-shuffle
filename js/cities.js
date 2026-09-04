/* Curated city dossiers.
   `gallery[].article` is an English Wikipedia article title — main.js resolves it
   to a real photo at runtime via the MediaWiki pageimages API, so no image URLs
   are hardcoded here (they rot; article titles don't). */

const CITIES = [
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    region: "Southern Europe",
    accent: "#d08447",
    tagline: "The Eternal City",
    intro:
      "Rome is a city where three thousand years of history are stacked on top of each other and still in daily use. A 2nd-century temple is a working church, a chariot racetrack is a public park, and the best espresso in the neighbourhood is served under a Baroque ceiling. Nothing here is behind glass.",
    famousFor: ["Ancient ruins", "Vatican City", "Carbonara & cacio e pepe", "Baroque fountains", "Espresso culture"],
    thingsToDo: [
      { title: "Walk the Forum at opening time", text: "Get to the Roman Forum when the gates open at 09:00. You get the ruins in soft light and near-silence before the tour groups arrive from the Colosseum side." },
      { title: "Eat your way through Testaccio", text: "The old slaughterhouse district is where Roman cooking was invented. The covered market does supplì and sandwiches; the trattorias around it do the four classic pastas properly." },
      { title: "See the Pantheon's oculus in rain", text: "The 1,900-year-old concrete dome is still the largest unreinforced one on earth, and the open eye at its centre is not glazed. Rain falls straight through onto the marble floor and drains away." },
      { title: "Cross into Trastevere after dark", text: "Over the river, the medieval lanes fill up around 21:00. Start at Piazza di Santa Maria and wander — the mosaics on the basilica facade are lit and free to look at." }
    ],
    gallery: [
      { article: "Colosseum", caption: "The Colosseum held 50,000 spectators and could be emptied in minutes through 80 numbered arches." },
      { article: "Trevi Fountain", caption: "Trevi Fountain marks the end of an aqueduct that has carried water into Rome since 19 BC." },
      { article: "Pantheon, Rome", caption: "The Pantheon's dome has stood unreinforced since AD 126 — its concrete gets lighter toward the top." },
      { article: "Roman Forum", caption: "The Forum was the civic heart of the Republic: senate house, law courts and marketplace in one." },
      { article: "St. Peter's Basilica", caption: "St Peter's took 120 years and twelve architects, including Michelangelo, who designed the dome." },
      { article: "Trastevere", caption: "Trastevere kept its medieval street plan, which is why almost nothing there runs in a straight line." }
    ],
    facts: {
      Population: "2.8 million",
      Founded: "753 BC (traditional)",
      Language: "Italian",
      Currency: "Euro (€)",
      "Best time": "April–June, September–October",
      "Order this": "Cacio e pepe"
    }
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "East Asia",
    accent: "#e0556b",
    tagline: "Thirty-seven million people, and it still works",
    intro:
      "Tokyo is less a city than a federation of villages that grew into each other. Each hub — Shibuya, Shinjuku, Ueno, Asakusa — has its own gravity, and the gaps between them hide wooden houses, tiny shrines and six-seat bars. It is the largest metropolitan area on earth and one of the quietest at street level.",
    famousFor: ["Sushi & ramen", "Neon districts", "Punctual trains", "Cherry blossom", "Vending machines"],
    thingsToDo: [
      { title: "Ride the Yamanote line all the way round", text: "The loop takes about an hour and touches most of the city's centres. It costs the price of one ticket and is the fastest way to understand how Tokyo is organised." },
      { title: "Get to Sensō-ji before 07:00", text: "Tokyo's oldest temple, founded in 628, is open and empty at dawn. The Nakamise shopping street leading to it is shuttered, which is when you can actually see the gates." },
      { title: "Drink in Golden Gai", text: "Six alleys in Shinjuku, around 200 bars, most seating fewer than ten people. Many charge a cover; look for the ones with English signs if it's your first visit." },
      { title: "Eat standing up", text: "Tachigui soba counters near stations serve a bowl in under five minutes for a few hundred yen. It is the everyday Tokyo meal, and it is genuinely good." }
    ],
    gallery: [
      { article: "Shibuya Crossing", caption: "Shibuya Crossing halts traffic in all directions at once — up to 3,000 people cross per light." },
      { article: "Sensō-ji", caption: "Sensō-ji in Asakusa dates to 628, making it the oldest temple in Tokyo." },
      { article: "Tokyo Tower", caption: "Tokyo Tower is 333 m — deliberately taller than the Eiffel Tower it was modelled on." },
      { article: "Meiji Shrine", caption: "Meiji Shrine sits in a 170-acre forest of 120,000 trees, every one of them donated and planted by hand." },
      { article: "Shinjuku", caption: "Shinjuku Station handles around 3.5 million passengers a day, more than any other station on earth." },
      { article: "Tokyo Skytree", caption: "At 634 m, Tokyo Skytree is the tallest tower in the world and is built to sway, not resist, in quakes." }
    ],
    facts: {
      Population: "37 million (metro)",
      Founded: "1457 (as Edo)",
      Language: "Japanese",
      Currency: "Yen (¥)",
      "Best time": "Late March–May, October–November",
      "Order this": "Tsukemen"
    }
  },
  {
    id: "marrakesh",
    name: "Marrakesh",
    country: "Morocco",
    region: "North Africa",
    accent: "#d9694a",
    tagline: "The Red City",
    intro:
      "Marrakesh was founded in 1070 as a Berber imperial capital, and the old city still runs on that logic: a walled medina of rose-coloured pisé, a maze of souks organised by trade, and a central square that empties at dawn and refills at dusk. The Atlas Mountains are visible from the rooftops on a clear day.",
    famousFor: ["Jemaa el-Fnaa", "Souks & haggling", "Riads and courtyards", "Mint tea", "Zellij tilework"],
    thingsToDo: [
      { title: "Watch Jemaa el-Fnaa turn over at sunset", text: "The main square shifts from orange-juice carts and snake charmers to a hundred open-air food stalls in about forty minutes. Watch it happen from a café terrace on the south side, then go down and eat." },
      { title: "Get lost in the souks on purpose", text: "The markets north of the square are grouped by craft — leather, metal, dyed wool, babouches. Navigation is hopeless and that's the point; head roughly south to come out at the square." },
      { title: "Sit in the Jardin Majorelle", text: "Yves Saint Laurent bought and restored this cobalt-blue garden in 1980. Go at opening or late afternoon; midday is crowded and hot." },
      { title: "Take a hammam", text: "The public bathhouse is a genuine local institution, not a spa. Bring flip-flops; the scrub with savon noir and a kessa glove is the whole experience." }
    ],
    gallery: [
      { article: "Jemaa el-Fnaa", caption: "Jemaa el-Fnaa has functioned as a marketplace and performance ground since the 11th century." },
      { article: "Koutoubia Mosque", caption: "The Koutoubia's 77 m minaret set the template for towers in Seville and Rabat." },
      { article: "Bahia Palace", caption: "Bahia Palace was built in the 1860s–90s and means 'brilliance' — its ceilings are painted cedar." },
      { article: "Majorelle Garden", caption: "The garden's signature 'Majorelle blue' was mixed by the painter Jacques Majorelle in the 1920s." },
      { article: "Ben Youssef Madrasa", caption: "Ben Youssef Madrasa housed 900 students and is covered in carved cedar, stucco and zellij." },
      { article: "Medina of Marrakesh", caption: "The medina's walls run for 19 km and are built of rammed red earth, which is why the city is 'red'." }
    ],
    facts: {
      Population: "1.0 million",
      Founded: "1070",
      Language: "Arabic, Amazigh, French",
      Currency: "Dirham (MAD)",
      "Best time": "March–May, September–November",
      "Order this": "Tanjia"
    }
  },
  {
    id: "istanbul",
    name: "Istanbul",
    country: "Türkiye",
    region: "Europe / Asia",
    accent: "#3f8fa8",
    tagline: "The city on two continents",
    intro:
      "Istanbul has been the capital of the Roman, Byzantine and Ottoman empires under three different names, and it is the only major city sitting on two continents. The Bosphorus strait runs through the middle of it, which means commuting by ferry is normal and the skyline changes every few hundred metres.",
    famousFor: ["Hagia Sophia", "Bosphorus ferries", "Grand Bazaar", "Turkish coffee", "Baklava"],
    thingsToDo: [
      { title: "Cross to Asia on a commuter ferry", text: "The Eminönü–Kadıköy ferry costs the same as a bus ride, takes twenty minutes, and gives you the entire old-city skyline from the water. Buy tea from the man with the tray." },
      { title: "Stand under the Hagia Sophia dome", text: "Built in 537, it held the record for the largest interior space in the world for nearly a thousand years. The Christian mosaics and Islamic calligraphy are on the walls together." },
      { title: "Eat breakfast properly", text: "Turkish kahvaltı is a two-hour table of cheeses, olives, eggs, honey and clotted cream. Kadıköy and Beşiktaş do it best, and it's a weekend institution." },
      { title: "Get lost in the Grand Bazaar", text: "4,000 shops on 61 covered streets, trading since 1461. Prices are negotiable everywhere; the gold and carpet sections have the best architecture." }
    ],
    gallery: [
      { article: "Hagia Sophia", caption: "Hagia Sophia has been a cathedral, a mosque, a museum, and a mosque again since 537." },
      { article: "Sultan Ahmed Mosque", caption: "The Blue Mosque takes its name from 20,000 hand-painted İznik tiles lining the interior." },
      { article: "Grand Bazaar, Istanbul", caption: "The Grand Bazaar is one of the world's oldest covered markets — 61 streets under one roof." },
      { article: "Topkapı Palace", caption: "Topkapı was the Ottoman court for 400 years and housed up to 4,000 people at a time." },
      { article: "Bosporus", caption: "The Bosphorus is 31 km long and separates Europe from Asia — around 40,000 ships pass yearly." },
      { article: "Basilica Cistern", caption: "The 6th-century Basilica Cistern held 80,000 m³ of water on 336 recycled marble columns." }
    ],
    facts: {
      Population: "15.5 million",
      Founded: "c. 660 BC (as Byzantion)",
      Language: "Turkish",
      Currency: "Lira (₺)",
      "Best time": "April–May, September–October",
      "Order this": "Balık ekmek"
    }
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    region: "East Asia",
    accent: "#b8604f",
    tagline: "A thousand years of capital",
    intro:
      "Kyoto was Japan's imperial capital for over a millennium and was spared wartime bombing, so it kept what other Japanese cities lost: 1,600 Buddhist temples, 400 Shinto shrines, wooden machiya townhouses and an intact geisha district. It is laid out on a grid, which makes it the easiest large Japanese city to navigate on foot.",
    famousFor: ["Temples & zen gardens", "Geisha districts", "Kaiseki cuisine", "Autumn maples", "Matcha"],
    thingsToDo: [
      { title: "Climb Fushimi Inari at 06:00", text: "Around 10,000 vermilion torii gates run 4 km up the mountain. The shrine never closes, and going at dawn means you get the tunnel of gates to yourself." },
      { title: "Sit with a dry garden", text: "Ryōan-ji's fifteen rocks in raked gravel can never all be seen at once from any single position. Give it twenty minutes rather than five — that's the design." },
      { title: "Walk the Philosopher's Path", text: "A two-kilometre canal-side lane linking Ginkaku-ji to Nanzen-ji, lined with cherry trees. Named for a philosopher who commuted along it to Kyoto University." },
      { title: "Eat in Nishiki Market", text: "Five blocks of covered market that has fed the city for 400 years — pickles, tofu skin, grilled eel, tamagoyaki on a stick." }
    ],
    gallery: [
      { article: "Fushimi Inari-taisha", caption: "Each of Fushimi Inari's torii gates was donated by a business; the donor's name is on the back." },
      { article: "Kinkaku-ji", caption: "Kinkaku-ji's top two floors are covered in gold leaf; the current pavilion is a 1955 rebuild." },
      { article: "Arashiyama", caption: "The Arashiyama bamboo grove creaks audibly in wind — Japan lists the sound as a heritage soundscape." },
      { article: "Kiyomizu-dera", caption: "Kiyomizu-dera's veranda is built on 13 m pillars assembled without a single nail." },
      { article: "Gion", caption: "Gion is Kyoto's geisha district, where apprentice geiko still train in dance, music and conversation." },
      { article: "Ryōan-ji", caption: "Ryōan-ji's rock garden is 25 m by 10 m and its meaning has never been explained by its maker." }
    ],
    facts: {
      Population: "1.5 million",
      Founded: "794",
      Language: "Japanese",
      Currency: "Yen (¥)",
      "Best time": "Late March–April, November",
      "Order this": "Yudofu"
    }
  },
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    region: "Western Europe",
    accent: "#3e9c8f",
    tagline: "Seven hills and the Atlantic light",
    intro:
      "Lisbon is older than Rome, was flattened by an earthquake in 1755, and was rebuilt as one of Europe's first planned modern cities — which is why the grid of the Baixa sits between two hills of tangled medieval lanes. The light comes off the Tagus estuary and gives the tiled facades their particular glare.",
    famousFor: ["Azulejo tiles", "Fado music", "Pastéis de nata", "Yellow trams", "Age of Discovery"],
    thingsToDo: [
      { title: "Take tram 28 early", text: "The 1930s wooden tram grinds through Graça, Alfama and Baixa on the city's steepest streets. Board at Martim Moniz before 08:00 or you'll be standing the whole way." },
      { title: "Hear fado in Alfama", text: "The music is mournful, improvised around fate and longing, and traditionally sung in small rooms. Look for a casa de fado where the waiters stop serving while someone sings." },
      { title: "Eat a nata at Pastéis de Belém", text: "The recipe has come from the same monastery since 1837 and is known to three people. Eat it warm, with cinnamon, standing at the counter." },
      { title: "Find a miradouro at sunset", text: "The city has a dozen official viewpoints. Senhora do Monte is the highest; São Pedro de Alcântara has a kiosk that sells beer." }
    ],
    gallery: [
      { article: "Belém Tower", caption: "Belém Tower was the ceremonial gateway to Lisbon and a launch point for Portugal's sea voyages." },
      { article: "Jerónimos Monastery", caption: "The Jerónimos Monastery was funded by a 5% tax on the spice trade from India." },
      { article: "Alfama", caption: "Alfama survived the 1755 earthquake intact, which is why its street plan is still Moorish." },
      { article: "São Jorge Castle", caption: "São Jorge Castle has been fortified since the 8th century and holds the best view of the Baixa." },
      { article: "Praça do Comércio", caption: "Praça do Comércio was rebuilt after 1755 as a statement that the city would face the river again." },
      { article: "Pastel de nata", caption: "The pastel de nata was invented by monks who used egg whites to starch their habits." }
    ],
    facts: {
      Population: "550,000 (2.9m metro)",
      Founded: "c. 1200 BC",
      Language: "Portuguese",
      Currency: "Euro (€)",
      "Best time": "March–May, September–October",
      "Order this": "Bifana"
    }
  },
  {
    id: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    region: "Western Cape",
    accent: "#3d86b5",
    tagline: "Where a mountain meets two oceans",
    intro:
      "Cape Town is wrapped around a flat-topped mountain that drops almost directly into the sea, inside one of the smallest and richest plant kingdoms on earth. It is also a city carrying a difficult, recent history very visibly — the townships on the Cape Flats and Robben Island are part of the same view as the vineyards.",
    famousFor: ["Table Mountain", "Wine country", "Penguins at Boulders", "Fynbos flora", "Robben Island"],
    thingsToDo: [
      { title: "Go up Table Mountain when the cloud lifts", text: "The 'tablecloth' cloud closes the cableway often, so go the moment the summit is clear rather than at a booked time. Platteklip Gorge is the direct walking route — two hours, unshaded." },
      { title: "Drive Chapman's Peak", text: "A 9 km toll road carved into a near-vertical cliff between Hout Bay and Noordhoek, with 114 curves. Late afternoon light is the reason to go." },
      { title: "Take the Robben Island ferry", text: "Nelson Mandela was imprisoned here for 18 of his 27 years. Tours are led by former political prisoners; book well ahead and expect weather cancellations." },
      { title: "Eat in Bo-Kaap", text: "The Cape Malay quarter, brightly painted and Muslim since the 18th century. Try bobotie, koesisters and samoosas from a home kitchen." }
    ],
    gallery: [
      { article: "Table Mountain", caption: "Table Mountain is roughly 260 million years older than the Himalayas." },
      { article: "Bo-Kaap", caption: "Bo-Kaap's houses were painted after residents gained the right to own them — colour as a statement." },
      { article: "Cape of Good Hope", caption: "Cape of Good Hope is not Africa's southern tip, but it is where ships turn east toward the Indian Ocean." },
      { article: "Robben Island", caption: "Robben Island was a prison, a leper colony and a quarantine station before becoming a museum." },
      { article: "Boulders Beach", caption: "Boulders Beach holds a colony of African penguins that arrived on their own in 1982." },
      { article: "Victoria & Alfred Waterfront", caption: "The V&A Waterfront is still a working harbour — seals use the docks year-round." }
    ],
    facts: {
      Population: "4.8 million (metro)",
      Founded: "1652",
      Language: "Afrikaans, English, Xhosa",
      Currency: "Rand (R)",
      "Best time": "October–April",
      "Order this": "Snoek braai"
    }
  },
  {
    id: "mexico-city",
    name: "Mexico City",
    country: "Mexico",
    region: "North America",
    accent: "#cf5d8a",
    tagline: "Built on a drained lake",
    intro:
      "Mexico City sits 2,240 m above sea level on the bed of Lake Texcoco, where the Aztec capital Tenochtitlan stood until 1521. The Spanish built their cathedral on the ruins of the main temple, and the whole centre is slowly sinking into the old lakebed — you can see it in the tilted facades.",
    famousFor: ["Tacos al pastor", "Frida Kahlo", "Aztec ruins", "Mural painting", "Day of the Dead"],
    thingsToDo: [
      { title: "Eat tacos al pastor after 22:00", text: "Pork shaved off a vertical spit onto a small tortilla with pineapple — an adaptation of shawarma brought by Lebanese immigrants. The good places only get going late." },
      { title: "See Diego Rivera's murals at the Palacio Nacional", text: "The stairway murals compress the entire history of Mexico from Aztec markets to the Revolution into one wall. Entry is free with ID." },
      { title: "Punt through Xochimilco", text: "The last surviving Aztec canals, worked as floating farm plots for 700 years. Hire a trajinera; go on a weekday if you want quiet rather than a party." },
      { title: "Spend a morning at the Museo Nacional de Antropología", text: "The best pre-Columbian collection in the world, including the Aztec sun stone. Do one wing properly rather than all of it badly." }
    ],
    gallery: [
      { article: "Zócalo", caption: "The Zócalo is one of the largest city squares on earth and was the Aztec ceremonial centre." },
      { article: "Palacio de Bellas Artes", caption: "Bellas Artes has sunk about four metres into the soft lakebed since construction began in 1904." },
      { article: "Frida Kahlo Museum", caption: "La Casa Azul in Coyoacán is the house where Frida Kahlo was born, lived and died." },
      { article: "Teotihuacan", caption: "Teotihuacan was already a 1,000-year-old ruin when the Aztecs found it and named it." },
      { article: "Chapultepec", caption: "Chapultepec is roughly twice the size of Central Park and holds nine museums." },
      { article: "Xochimilco", caption: "Xochimilco's chinampas are artificial islands built by staking wattle into the lakebed." }
    ],
    facts: {
      Population: "22 million (metro)",
      Founded: "1325 (as Tenochtitlan)",
      Language: "Spanish",
      Currency: "Peso (MX$)",
      "Best time": "March–May, October–November",
      "Order this": "Tacos al pastor"
    }
  },
  {
    id: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    region: "South America",
    accent: "#5a8fd6",
    tagline: "The Paris of the South, with better beef",
    intro:
      "Buenos Aires was built by waves of Italian and Spanish immigration onto a French architectural template, then developed a culture entirely its own: tango out of the port slums, psychoanalysis at a per-capita rate higher than anywhere on earth, and a bookshop count to match. Dinner starts at ten.",
    famousFor: ["Tango", "Asado & steak", "Malbec", "Bookshops", "Football rivalries"],
    thingsToDo: [
      { title: "Go to a milonga, not a tango show", text: "Milongas are the social dance halls where locals actually dance, most of them after midnight. Beginners are tolerated at the edges; watch the códigos of who invites whom." },
      { title: "Eat an asado properly", text: "The parrilla grills over wood coals for hours. Order bife de chorizo or entraña, ask for jugoso if you want it pink, and start with provoleta and chorizo." },
      { title: "Walk Recoleta Cemetery", text: "Four thousand above-ground mausoleums arranged as city blocks, including Eva Perón's. It is genuinely a maze; go in the morning." },
      { title: "See a match at La Bombonera", text: "Boca Juniors' stadium is famous for standing terraces that visibly bounce. Tickets are hard for non-members — go through a legitimate agency, not the street." }
    ],
    gallery: [
      { article: "Teatro Colón", caption: "Teatro Colón's acoustics are rated among the five best of any opera house in the world." },
      { article: "La Boca", caption: "La Boca's Caminito was painted in leftover ship paint by dockworkers who could not afford better." },
      { article: "La Recoleta Cemetery", caption: "Recoleta Cemetery is laid out as streets of mausoleums, some of them four storeys deep." },
      { article: "Casa Rosada", caption: "The Casa Rosada's pink is said to come from mixing ox blood into the whitewash." },
      { article: "Puerto Madero", caption: "Puerto Madero turned derelict brick docks into the city's newest and priciest neighbourhood." },
      { article: "El Ateneo Grand Splendid", caption: "El Ateneo Grand Splendid is a 1919 theatre turned bookshop; you can read in the old boxes." }
    ],
    facts: {
      Population: "15.5 million (metro)",
      Founded: "1580 (second founding)",
      Language: "Spanish",
      Currency: "Peso (ARS)",
      "Best time": "March–May, September–November",
      "Order this": "Choripán"
    }
  },
  {
    id: "reykjavik",
    name: "Reykjavík",
    country: "Iceland",
    region: "Northern Europe",
    accent: "#4a8fc0",
    tagline: "The world's northernmost capital",
    intro:
      "Reykjavík holds about a third of Iceland's population in a low, brightly painted town heated almost entirely by geothermal water pumped from underground. In June it barely gets dark; in December the sun is up for four hours. Everything else on the island is within a day's drive.",
    famousFor: ["Northern lights", "Geothermal pools", "Midnight sun", "Volcanoes", "Sagas"],
    thingsToDo: [
      { title: "Use the neighbourhood pool, not the tourist lagoon", text: "Every district has a geothermal swimming pool with hot tubs at graded temperatures. It's where the city socialises, costs a few euros, and you must shower unclothed before entering." },
      { title: "Drive the Golden Circle in a day", text: "Þingvellir's rift valley where the tectonic plates separate, the Geysir hot springs, and Gullfoss waterfall — about 300 km round trip on good roads." },
      { title: "Climb Hallgrímskirkja's tower", text: "The lift goes up 74 m for the only high view of the city, with the coloured rooftops laid out against the sea and Mount Esja behind." },
      { title: "Chase the aurora between September and March", text: "You need dark, clear sky and solar activity. Drive twenty minutes out of town, check the Icelandic Met Office forecast, and be prepared to wait." }
    ],
    gallery: [
      { article: "Hallgrímskirkja", caption: "Hallgrímskirkja's facade is modelled on the basalt columns formed by cooling Icelandic lava." },
      { article: "Harpa (concert hall)", caption: "Harpa's glass shell was designed with Olafur Eliasson and echoes basalt crystal geometry." },
      { article: "Blue Lagoon (geothermal spa)", caption: "The Blue Lagoon is man-made — runoff from a geothermal plant, milky with silica." },
      { article: "Sun Voyager", caption: "Sun Voyager is not a Viking ship but a dreamboat, an ode to the idea of undiscovered territory." },
      { article: "Þingvellir", caption: "Þingvellir hosted the world's oldest running parliament from 930, in a rift between two continents." },
      { article: "Gullfoss", caption: "Gullfoss drops 32 m in two stages and was saved from a hydro scheme by a farmer's daughter." }
    ],
    facts: {
      Population: "140,000",
      Founded: "874 (traditional)",
      Language: "Icelandic",
      Currency: "Króna (kr)",
      "Best time": "June–August, or Feb for aurora",
      "Order this": "Plokkfiskur"
    }
  },
  {
    id: "hanoi",
    name: "Hanoi",
    country: "Vietnam",
    region: "Southeast Asia",
    accent: "#c8863d",
    tagline: "A thousand years old and still on the pavement",
    intro:
      "Hanoi has been a capital for a millennium and wears the layers openly: an Old Quarter of guild streets each named for the trade once practised on it, French colonial boulevards, Soviet-era blocks, and an unbroken street-food culture conducted from plastic stools eighteen inches off the ground.",
    famousFor: ["Phở", "Old Quarter", "Egg coffee", "Motorbikes", "Water puppetry"],
    thingsToDo: [
      { title: "Eat phở for breakfast", text: "It is a morning dish here, not a dinner one. Northern phở is clearer and plainer than the southern version — no hoisin, no basil pile, just broth, beef and a squeeze of lime." },
      { title: "Walk the Old Quarter's 36 streets", text: "Hàng Bạc is silver, Hàng Mã is paper goods, Hàng Thiếc is tin. Many still sell what they're named for, six centuries later." },
      { title: "Drink cà phê trứng", text: "Egg coffee — yolk whipped with condensed milk over strong Vietnamese coffee — was invented here in 1946 when milk was scarce." },
      { title: "Circle Hoàn Kiếm Lake at 06:00", text: "The lake is the city's living room. At dawn it fills with tai chi, badminton and running clubs; at weekends the surrounding roads close to traffic entirely." }
    ],
    gallery: [
      { article: "Hoàn Kiếm Lake", caption: "Legend says a golden turtle reclaimed a magic sword here, which is why it's the Lake of the Returned Sword." },
      { article: "Temple of Literature", caption: "The Temple of Literature was Vietnam's first university, founded in 1070." },
      { article: "Ho Chi Minh Mausoleum", caption: "The mausoleum was built against Hồ Chí Minh's own wishes; he had asked to be cremated." },
      { article: "One Pillar Pagoda", caption: "The One Pillar Pagoda is designed to resemble a lotus rising from the water." },
      { article: "Phở", caption: "Phở broth is simmered for hours with charred ginger and onion; northern versions stay clear." },
      { article: "Long Biên Bridge", caption: "Long Biên Bridge was designed in 1899 by the Daydé & Pillé firm and bombed repeatedly in the war." }
    ],
    facts: {
      Population: "8.5 million",
      Founded: "1010 (as Thăng Long)",
      Language: "Vietnamese",
      Currency: "Đồng (₫)",
      "Best time": "October–December, March–April",
      "Order this": "Bún chả"
    }
  },
  {
    id: "varanasi",
    name: "Varanasi",
    country: "India",
    region: "South Asia",
    accent: "#cc7a33",
    tagline: "One of the oldest continuously lived-in cities on earth",
    intro:
      "Varanasi has been inhabited for perhaps 3,000 years and is the holiest city in Hinduism, where the Ganges runs briefly northward. Pilgrims come to bathe, and many come to die — dying here is believed to end the cycle of rebirth. Everything happens on the eighty-odd stone ghats that step down to the water.",
    famousFor: ["The Ganges ghats", "Ganga Aarti", "Silk weaving", "Hindu pilgrimage", "Sanskrit learning"],
    thingsToDo: [
      { title: "Take a rowboat at sunrise", text: "Hire a boat around 05:30 and drift along the ghats as the city bathes. It is the only vantage point from which Varanasi makes visual sense." },
      { title: "Watch the Ganga Aarti", text: "At Dashashwamedh Ghat every evening, priests perform a choreographed fire ceremony with brass lamps. Arrive an hour early or watch from a boat." },
      { title: "Walk to Sarnath", text: "Ten kilometres out, this is where the Buddha gave his first sermon after enlightenment. The Dhamek Stupa dates to 500 AD and the site is calm in a way the city is not." },
      { title: "Buy Banarasi silk from a weaver", text: "The city's brocade weaving uses gold and silver thread and takes weeks per sari. Go to a workshop in Madanpura rather than a showroom." }
    ],
    gallery: [
      { article: "Dashashwamedh Ghat", caption: "Dashashwamedh is the main ghat, said to be where Brahma sacrificed ten horses." },
      { article: "Ghats in Varanasi", caption: "Around 84 ghats line roughly 6.5 km of riverbank, most built by regional rulers in the 1700s." },
      { article: "Kashi Vishwanath Temple", caption: "Kashi Vishwanath is one of the twelve Jyotirlinga shrines and has been rebuilt many times." },
      { article: "Ganges", caption: "The Ganges turns north at Varanasi — a reversal that made the site sacred." },
      { article: "Sarnath", caption: "Sarnath is where the Buddha first taught the dharma, around 528 BC." },
      { article: "Manikarnika Ghat", caption: "Manikarnika is the principal cremation ghat, where fires are said never to have gone out." }
    ],
    facts: {
      Population: "1.6 million",
      Founded: "c. 1200 BC",
      Language: "Hindi, Bhojpuri",
      Currency: "Rupee (₹)",
      "Best time": "October–March",
      "Order this": "Kachori sabzi"
    }
  },
  {
    id: "prague",
    name: "Prague",
    country: "Czech Republic",
    region: "Central Europe",
    accent: "#a8703f",
    tagline: "The city of a hundred spires",
    intro:
      "Prague came through the twentieth century almost undamaged, which left a thousand years of architecture standing side by side — Romanesque cellars under Gothic houses with Baroque fronts, and a functioning Art Nouveau quarter around them. The castle above the river is the largest ancient castle complex in the world.",
    famousFor: ["Charles Bridge", "Beer", "Astronomical clock", "Bohemian glass", "Kafka"],
    thingsToDo: [
      { title: "Cross Charles Bridge at 06:00", text: "By nine it is shoulder to shoulder. At dawn you get the thirty Baroque statues, the mist off the Vltava and the castle behind, with almost nobody on it." },
      { title: "Drink beer where the locals do", text: "Czechs drink more beer per head than anyone. Skip the Old Town Square terraces for a Vinohrady or Žižkov pub, and order a desítka if you want to keep going." },
      { title: "See the castle from the back", text: "Enter via the Old Castle Steps from Malostranská and work uphill — you arrive at St Vitus from the quiet side instead of queueing at the main gate." },
      { title: "Wander Vyšehrad", text: "The second castle, on a rock south of the centre. Almost empty, free to walk, with a cemetery holding Dvořák and Mucha and the best view along the river." }
    ],
    gallery: [
      { article: "Charles Bridge", caption: "Charles Bridge was begun in 1357 at 5:31 on 9 July — a palindromic number sequence chosen by astrologers." },
      { article: "Prague Castle", caption: "Prague Castle covers 70,000 m², making it the largest ancient castle complex in the world." },
      { article: "Old Town Square (Prague)", caption: "The Old Town Square has been a marketplace since the 10th century." },
      { article: "Prague astronomical clock", caption: "The astronomical clock has run since 1410 and shows the position of the sun, moon and zodiac." },
      { article: "St. Vitus Cathedral", caption: "St Vitus took nearly 600 years to finish — begun 1344, completed 1929." },
      { article: "Vyšehrad", caption: "Vyšehrad is the legendary seat of the first Czech princes and holds a national cemetery." }
    ],
    facts: {
      Population: "1.4 million",
      Founded: "9th century",
      Language: "Czech",
      Currency: "Koruna (Kč)",
      "Best time": "April–June, September–October",
      "Order this": "Svíčková"
    }
  },
  {
    id: "edinburgh",
    name: "Edinburgh",
    country: "Scotland",
    region: "Northern Europe",
    accent: "#6f7fae",
    tagline: "A capital built on a volcano",
    intro:
      "Edinburgh is two cities side by side: a medieval Old Town of tenements and closes running down the spine of an extinct volcano, and a Georgian New Town laid out in 1767 as one of the most complete pieces of neoclassical planning in Europe. In August the population roughly doubles for the festivals.",
    famousFor: ["The Fringe", "Edinburgh Castle", "Whisky", "Hogmanay", "Literature"],
    thingsToDo: [
      { title: "Climb Arthur's Seat", text: "An extinct volcano 251 m high, inside the city, reachable in 45 minutes from Holyrood. The whole city, the Firth of Forth and the hills of Fife are laid out from the top." },
      { title: "Explore the closes off the Royal Mile", text: "Narrow alleys drop away on both sides of the main street. Mary King's Close is a whole 17th-century street sealed under the City Chambers." },
      { title: "Do the Fringe deliberately", text: "3,000+ shows across August. Pick two or three a day, book one, and let the rest be free 'pay what you want' shows found by walking around." },
      { title: "Taste whisky by region", text: "A proper tasting compares Speyside, Islay and Highland side by side — the peat difference is the whole point. Many Old Town bars will pour flights." }
    ],
    gallery: [
      { article: "Edinburgh Castle", caption: "Edinburgh Castle sits on a plug of 340-million-year-old volcanic rock and has seen 26 sieges." },
      { article: "Royal Mile", caption: "The Royal Mile runs from the castle to Holyrood and is, in fact, about a Scots mile long." },
      { article: "Arthur's Seat", caption: "Arthur's Seat is the eroded remains of a volcano that was active around 350 million years ago." },
      { article: "Palace of Holyroodhouse", caption: "Holyroodhouse is the monarch's official Scottish residence and was Mary, Queen of Scots' home." },
      { article: "Calton Hill", caption: "Calton Hill holds an unfinished replica of the Parthenon, abandoned in 1829 when the money ran out." },
      { article: "Edinburgh Festival Fringe", caption: "The Fringe began in 1947 when eight companies turned up uninvited to the official festival." }
    ],
    facts: {
      Population: "530,000",
      Founded: "7th century",
      Language: "English, Scots, Gaelic",
      Currency: "Pound (£)",
      "Best time": "May–June, August for festivals",
      "Order this": "Cullen skink"
    }
  },
  {
    id: "cusco",
    name: "Cusco",
    country: "Peru",
    region: "South America",
    accent: "#c26644",
    tagline: "The navel of the Inca world",
    intro:
      "Cusco was the capital of the Inca empire and was laid out, according to tradition, in the shape of a puma. The Spanish demolished the temples and built churches on top, but the Inca foundations were better engineering and survived every earthquake since. It sits at 3,400 m, so the first day is for doing nothing.",
    famousFor: ["Machu Picchu", "Inca stonework", "Andean textiles", "Ceviche & cuy", "Inti Raymi"],
    thingsToDo: [
      { title: "Acclimatise before anything else", text: "At 3,400 m altitude sickness is common. Spend the first 24 hours flat, drink coca tea, and save the Sacred Valley — which is lower — for day two." },
      { title: "Reach Machu Picchu", text: "Either the train from Ollantaytambo or a four-day trek on the Inca Trail, which is permit-limited and books out months ahead. Get the earliest possible entry slot." },
      { title: "Find the twelve-angled stone", text: "On Hatun Rumiyoc, a single block cut with twelve angles fits its neighbours without mortar so precisely that a blade won't enter the joint." },
      { title: "Go to the Sunday market at Chinchero", text: "A weaving village an hour out, where cooperatives still dye alpaca wool with cochineal and plants and will show you the whole process." }
    ],
    gallery: [
      { article: "Machu Picchu", caption: "Machu Picchu was built around 1450 and abandoned within a century; the Spanish never found it." },
      { article: "Sacsayhuamán", caption: "Sacsayhuamán's largest stones weigh over 100 tonnes and are fitted without any mortar." },
      { article: "Qorikancha", caption: "Qorikancha, the Inca sun temple, was once sheathed in gold plate; a convent sits on it now." },
      { article: "Sacred Valley", caption: "The Sacred Valley's terraces created dozens of microclimates for breeding crop varieties." },
      { article: "Vinicunca", caption: "Vinicunca's stripes are mineral layers — iron, copper and sulphur — exposed by retreating ice." },
      { article: "Ollantaytambo", caption: "Ollantaytambo is the only Inca town whose original street grid is still lived in." }
    ],
    facts: {
      Population: "430,000",
      Founded: "c. 1100",
      Language: "Spanish, Quechua",
      Currency: "Sol (S/)",
      "Best time": "May–September (dry)",
      "Order this": "Lomo saltado"
    }
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    region: "Western Europe",
    accent: "#c9803f",
    tagline: "A city engineered out of a swamp",
    intro:
      "Amsterdam's centre is a planned 17th-century ring of canals dug during the Dutch Golden Age, with the merchant houses along them still standing on wooden piles driven into the mud. There are more bicycles than residents, and the city is built at the scale of a person on one.",
    famousFor: ["Canals", "Cycling", "Dutch Masters", "Anne Frank House", "Brown cafés"],
    thingsToDo: [
      { title: "Rent a bike and behave like a local", text: "Stay in the red lanes, signal with your arm, don't stop on the tram tracks. It is genuinely the fastest way across the centre and the city is entirely flat." },
      { title: "See the Night Watch at the Rijksmuseum", text: "Rembrandt's four-metre canvas is at the end of the Gallery of Honour and gets a room to itself. Book a timed slot and go at opening." },
      { title: "Book the Anne Frank House months ahead", text: "Tickets are released online on a rolling schedule and sell out immediately. The secret annexe is left unfurnished, on Otto Frank's instruction." },
      { title: "Sit in a brown café", text: "Bruine kroegen are old, wood-panelled and tobacco-stained neighbourhood pubs. Order a small beer with a two-finger head and stay for hours." }
    ],
    gallery: [
      { article: "Canals of Amsterdam", caption: "Amsterdam has 165 canals and roughly 1,500 bridges over about 100 km of water." },
      { article: "Rijksmuseum", caption: "The Rijksmuseum holds 8,000 objects on display out of a collection of about a million." },
      { article: "Van Gogh Museum", caption: "The Van Gogh Museum has 200 paintings and 500 drawings — the largest collection anywhere." },
      { article: "Anne Frank House", caption: "The Franks hid behind a bookcase in this canal house for 761 days." },
      { article: "Jordaan", caption: "The Jordaan was built for workers and immigrants and is now the city's most expensive quarter." },
      { article: "Vondelpark", caption: "Vondelpark takes around 10 million visits a year in a park of just 47 hectares." }
    ],
    facts: {
      Population: "930,000",
      Founded: "c. 1275",
      Language: "Dutch",
      Currency: "Euro (€)",
      "Best time": "April–May, September",
      "Order this": "Bitterballen"
    }
  },
  {
    id: "seoul",
    name: "Seoul",
    country: "South Korea",
    region: "East Asia",
    accent: "#5f7fd0",
    tagline: "Six hundred years of capital, rebuilt in fifty",
    intro:
      "Seoul was flattened in the Korean War and rebuilt into one of the densest, fastest and most wired cities on earth — while keeping five Joseon palaces and a hanok village in the middle of it. Mountains ring the city on every side, so a subway ride puts you at a trailhead in half an hour.",
    famousFor: ["Korean BBQ", "K-pop", "Palaces", "Jjimjilbang", "24-hour city"],
    thingsToDo: [
      { title: "Watch the guard change at Gyeongbokgung", text: "Twice daily in reconstructed Joseon uniform. Renting a hanbok gets you into the palace free, which is why half the courtyard is in costume." },
      { title: "Eat BBQ then go for round two", text: "Korean nights move in cha — first round grilled pork belly, second round somewhere else entirely. Follow whoever you're with." },
      { title: "Spend a night in a jjimjilbang", text: "A 24-hour bathhouse with hot pools, dry saunas at graded heat, sleeping halls and snack bars. Cheaper than a hotel and a completely normal thing to do." },
      { title: "Hike Bukhansan", text: "A national park inside the city limits, with granite peaks and about five million visitors a year. The Baegundae route takes three to four hours return." }
    ],
    gallery: [
      { article: "Gyeongbokgung", caption: "Gyeongbokgung was built in 1395, razed by invasion, and is still being reconstructed today." },
      { article: "Bukchon Hanok Village", caption: "Bukchon's hanok houses are lived in — residents ask visitors to keep quiet after 17:00." },
      { article: "N Seoul Tower", caption: "N Seoul Tower sits on Namsan, so its 236 m puts the observation deck 480 m above sea level." },
      { article: "Cheonggyecheon", caption: "Cheonggyecheon was an elevated motorway until 2005, when it was torn out to uncover the stream." },
      { article: "Bukhansan", caption: "Bukhansan is one of the most-visited national parks per square metre in the world." },
      { article: "Myeong-dong", caption: "Myeongdong's street stalls open in the evening and are the city's cosmetics and snack centre." }
    ],
    facts: {
      Population: "9.6 million (26m metro)",
      Founded: "18 BC",
      Language: "Korean",
      Currency: "Won (₩)",
      "Best time": "April–May, September–November",
      "Order this": "Samgyeopsal"
    }
  },
  {
    id: "cairo",
    name: "Cairo",
    country: "Egypt",
    region: "North Africa",
    accent: "#c99a3c",
    tagline: "The mother of the world",
    intro:
      "Cairo is the largest city in the Arab world, built along the Nile beside a plateau of 4,500-year-old pyramids that are now on the edge of the suburbs. Islamic Cairo holds one of the densest concentrations of medieval architecture anywhere, and the traffic is a genuinely famous phenomenon.",
    famousFor: ["Pyramids of Giza", "The Nile", "Khan el-Khalili", "Coptic Cairo", "Shisha cafés"],
    thingsToDo: [
      { title: "Go to Giza at opening", text: "The site opens at 08:00 and the heat and crowds both build fast. The Great Pyramid held the record for tallest structure on earth for 3,800 years." },
      { title: "Give the Grand Egyptian Museum a full day", text: "The new museum by the plateau holds the complete Tutankhamun collection — over 5,000 objects — shown together for the first time." },
      { title: "Drink tea in Khan el-Khalili", text: "A souk since 1382. El Fishawy has reportedly been open continuously for over two centuries; sit, order karkade, and watch the lane." },
      { title: "Climb the Cairo Tower at sunset", text: "187 m of lattice concrete with a 360° view: the Nile below, and on a clear evening the pyramids on the horizon." }
    ],
    gallery: [
      { article: "Giza pyramid complex", caption: "The Great Pyramid contains about 2.3 million blocks and was finished around 2560 BC." },
      { article: "Great Sphinx of Giza", caption: "The Sphinx is carved from a single limestone ridge — it was quarried down, not built up." },
      { article: "Khan el-Khalili", caption: "Khan el-Khalili has traded on the same lanes since the late 14th century." },
      { article: "Mosque of Muhammad Ali", caption: "The alabaster mosque in the Citadel was modelled on Ottoman designs from Istanbul." },
      { article: "Nile", caption: "The Nile runs 6,650 km; Cairo sits where it fans out into the delta." },
      { article: "Al-Azhar Mosque", caption: "Al-Azhar, founded in 970, runs one of the oldest continuously operating universities on earth." }
    ],
    facts: {
      Population: "22 million (metro)",
      Founded: "969 (Fatimid city)",
      Language: "Arabic",
      Currency: "Pound (E£)",
      "Best time": "October–April",
      "Order this": "Koshari"
    }
  },
  {
    id: "sydney",
    name: "Sydney",
    country: "Australia",
    region: "Oceania",
    accent: "#2f97b8",
    tagline: "A city arranged around a harbour",
    intro:
      "Sydney is built around one of the world's largest natural harbours, with an opera house on a headland and ocean beaches inside the city limits. It is the oldest European settlement in Australia, founded as a penal colony in 1788, on land the Gadigal people had lived on for tens of thousands of years.",
    famousFor: ["Opera House", "Bondi Beach", "Harbour Bridge", "Coastal walks", "Flat whites"],
    thingsToDo: [
      { title: "Walk Bondi to Coogee", text: "Six kilometres of clifftop path past four beaches and an ocean pool at Bronte. Takes about two hours; go early and swim at the far end." },
      { title: "Take the Manly ferry", text: "Thirty minutes across the harbour on a normal public transport fare, with the Opera House and Bridge from the water. The best-value view in the city." },
      { title: "Climb the Harbour Bridge — or don't", text: "The paid BridgeClimb goes over the arch at 134 m. The Pylon Lookout costs a fraction of it and gets you almost as high." },
      { title: "Swim in an ocean pool", text: "Sydney has more than thirty tidal rock pools along its coast. Bondi Icebergs is the famous one; Wylie's Baths at Coogee is the better swim." }
    ],
    gallery: [
      { article: "Sydney Opera House", caption: "The Opera House's shells are clad in over a million self-cleaning Swedish tiles." },
      { article: "Sydney Harbour Bridge", caption: "The Harbour Bridge holds six million rivets and expands enough to rise 18 cm on a hot day." },
      { article: "Bondi Beach", caption: "Bondi is home to the world's oldest surf lifesaving club, founded in 1907." },
      { article: "Royal Botanic Garden, Sydney", caption: "The Royal Botanic Garden has been continuously cultivated since 1816, on the site of the first farm." },
      { article: "Darling Harbour", caption: "Darling Harbour was a container terminal until it was redeveloped for the 1988 bicentenary." },
      { article: "Blue Mountains (New South Wales)", caption: "The Blue Mountains look blue because eucalyptus oil scatters light in the air above them." }
    ],
    facts: {
      Population: "5.4 million",
      Founded: "1788",
      Language: "English",
      Currency: "Dollar (A$)",
      "Best time": "September–November, March–May",
      "Order this": "A flat white"
    }
  },
  {
    id: "new-orleans",
    name: "New Orleans",
    country: "United States",
    region: "North America",
    accent: "#a97fc4",
    tagline: "The city that invented jazz",
    intro:
      "New Orleans was French, then Spanish, then French again before the United States bought it in 1803, and the mix never resolved — which is why the architecture is Caribbean, the law is partly Napoleonic, and the music is its own. It sits mostly below sea level in a bend of the Mississippi.",
    famousFor: ["Jazz", "Mardi Gras", "Creole & Cajun food", "French Quarter", "Second lines"],
    thingsToDo: [
      { title: "Hear live music on Frenchmen Street", text: "Bourbon Street is for tourists; Frenchmen, a few blocks downriver in the Marigny, is where the brass bands and jazz trios actually play, most nights, most of the year." },
      { title: "Eat beignets at 03:00", text: "Café du Monde has been open essentially around the clock since 1862. Coffee with chicory, three beignets, an unsurvivable quantity of powdered sugar." },
      { title: "Ride the St. Charles streetcar", text: "The oldest continuously operating streetcar line in the world, running since 1835, past the oak-shaded mansions of the Garden District." },
      { title: "Follow a second line", text: "Sunday afternoon parades organised by social aid and pleasure clubs, with a brass band and anyone who wants to join. Ask locally where this week's is." }
    ],
    gallery: [
      { article: "French Quarter", caption: "The French Quarter's wrought-iron balconies are mostly Spanish — the French buildings burned in 1788." },
      { article: "St. Louis Cathedral (New Orleans)", caption: "St Louis Cathedral is the oldest continuously active cathedral in the United States." },
      { article: "Jackson Square (New Orleans)", caption: "Jackson Square was the parade ground where Louisiana was formally transferred to the US in 1803." },
      { article: "Mardi Gras in New Orleans", caption: "Mardi Gras krewes have paraded since 1857; purple, green and gold mean justice, faith and power." },
      { article: "Garden District, New Orleans", caption: "The Garden District was built by wealthy Americans who were not welcome in the Creole Quarter." },
      { article: "Preservation Hall", caption: "Preservation Hall has staged traditional jazz nightly since 1961, with no drinks and no amplification." }
    ],
    facts: {
      Population: "370,000 (1.3m metro)",
      Founded: "1718",
      Language: "English, Louisiana French",
      Currency: "Dollar ($)",
      "Best time": "February–May, October–November",
      "Order this": "Gumbo"
    }
  },
  {
    id: "bergen",
    name: "Bergen",
    country: "Norway",
    region: "Northern Europe",
    accent: "#4e93a8",
    tagline: "The gateway to the fjords",
    intro:
      "Bergen was Norway's capital in the 13th century and the northernmost office of the Hanseatic League, which left a row of wooden trading houses on the wharf that are now a World Heritage site. It is surrounded by seven mountains, sits at the mouth of the fjord country, and rains roughly 230 days a year.",
    famousFor: ["Bryggen wharf", "Fjords", "Fish market", "Seven mountains", "Rain"],
    thingsToDo: [
      { title: "Walk the alleys behind Bryggen", text: "The painted facades are the postcard; the wooden passages behind them, leaning at angles after 900 years of settling, are the actual experience. Free to walk through." },
      { title: "Take the Fløibanen up Fløyen", text: "A funicular climbs 320 m in eight minutes to a view over the harbour and islands. Walk back down through the woods in about 45 minutes." },
      { title: "Day-trip into the Nærøyfjord", text: "The narrowest arm of the Sognefjord, 250 m wide with 1,700 m walls. Reachable by boat and train from Bergen in a long day." },
      { title: "Buy fish at the Fisketorget", text: "The market on the harbour has traded since the 1200s. Fish soup and shrimp sandwiches from the counters; the indoor hall runs year-round." }
    ],
    gallery: [
      { article: "Bryggen", caption: "Bryggen's wooden houses have burned and been rebuilt on the same medieval foundations repeatedly." },
      { article: "Fløyen", caption: "Fløyen is one of Bergen's seven mountains; the funicular to it opened in 1918." },
      { article: "Nærøyfjord", caption: "The Nærøyfjord narrows to about 250 m between walls rising 1,700 m." },
      { article: "Ulriken", caption: "Ulriken is the highest of the seven mountains at 643 m, reached by cable car." },
      { article: "Bergen", caption: "Bergen was Norway's largest city until the 1830s and its capital in the 13th century." },
      { article: "Troldhaugen", caption: "Troldhaugen was Edvard Grieg's home; he composed in a hut at the bottom of the garden." }
    ],
    facts: {
      Population: "290,000",
      Founded: "1070",
      Language: "Norwegian",
      Currency: "Krone (kr)",
      "Best time": "May–September",
      "Order this": "Fiskesuppe"
    }
  },
  {
    id: "jaipur",
    name: "Jaipur",
    country: "India",
    region: "South Asia",
    accent: "#d1683f",
    tagline: "The Pink City",
    intro:
      "Jaipur was founded in 1727 as one of the first planned cities in India, laid out on a nine-block grid according to Vastu principles, with the whole old town painted terracotta pink in 1876 to welcome the Prince of Wales. The colour is now required by law.",
    famousFor: ["Hawa Mahal", "Amber Fort", "Block printing", "Gemstones", "Rajasthani thali"],
    thingsToDo: [
      { title: "See Hawa Mahal from across the street", text: "Its 953 windows were built so royal women could watch street festivals unseen. The famous facade is the back of the building — the view is from the road opposite, best before 09:00." },
      { title: "Go up to Amber Fort early", text: "Twelve kilometres out, a sandstone and marble fort above a lake. Get there for opening; the Sheesh Mahal's mirror work lights up from a single candle." },
      { title: "Read the instruments at Jantar Mantar", text: "Nineteen astronomical instruments built in stone in the 1730s, including the world's largest stone sundial — accurate to two seconds." },
      { title: "Buy block-printed cloth in Sanganer", text: "The villages south of the city have hand-carved wooden blocks and natural dyes going back generations. Workshops will show you the printing." }
    ],
    gallery: [
      { article: "Hawa Mahal", caption: "Hawa Mahal's 953 windows were designed to funnel breeze through the building in summer." },
      { article: "Amer Fort", caption: "Amber Fort's Sheesh Mahal is inlaid with mirrors that multiply a single flame across the ceiling." },
      { article: "City Palace, Jaipur", caption: "The City Palace is still partly a royal residence, nearly 300 years after it was built." },
      { article: "Jantar Mantar, Jaipur", caption: "The Samrat Yantra sundial here stands 27 m high and tells time to within two seconds." },
      { article: "Jal Mahal", caption: "Jal Mahal has four of its five storeys underwater when Man Sagar Lake is full." },
      { article: "Nahargarh Fort", caption: "Nahargarh sits on the Aravalli ridge and was built as a retreat and defensive line for the city." }
    ],
    facts: {
      Population: "4.1 million",
      Founded: "1727",
      Language: "Hindi, Rajasthani",
      Currency: "Rupee (₹)",
      "Best time": "October–March",
      "Order this": "Dal baati churma"
    }
  },
  {
    id: "havana",
    name: "Havana",
    country: "Cuba",
    region: "Caribbean",
    accent: "#3f9bb0",
    tagline: "A Caribbean capital held in amber",
    intro:
      "Havana was the richest port in the Spanish Americas, the place where treasure fleets gathered before crossing the Atlantic. Sixty years of embargo froze the city: Spanish colonial squares, Art Deco and 1950s modernism stand side by side, weathered, with 1950s American cars still running on improvised parts.",
    famousFor: ["Vintage cars", "Son and rumba", "Cigars", "Malecón", "Rum cocktails"],
    thingsToDo: [
      { title: "Walk the Malecón in the evening", text: "Eight kilometres of sea wall where the whole city comes to sit — fishermen, couples, trumpet players. Waves break over the road when the wind turns north." },
      { title: "Hear son in a neighbourhood bar", text: "Skip the tourist band playing Guantanamera and find a Centro Habana casa de la música. The rumba at Callejón de Hamel on Sunday afternoons is free and genuine." },
      { title: "Walk Habana Vieja's four squares", text: "Plaza Vieja, Plaza de Armas, Plaza de San Francisco and the Cathedral square, restored over three decades and each in a different century's style." },
      { title: "Stay in a casa particular", text: "Licensed rooms in private homes. Cheaper than hotels, and the reason most people come away understanding anything about the city." }
    ],
    gallery: [
      { article: "Old Havana", caption: "Old Havana holds around 900 protected buildings across five centuries of architecture." },
      { article: "Malecón", caption: "The Malecón took 50 years to build and now runs 8 km along the seafront." },
      { article: "El Capitolio", caption: "El Capitolio was completed in 1929 and is slightly taller than the US Capitol it resembles." },
      { article: "Plaza Vieja, Havana", caption: "Plaza Vieja was a residential square, never military — hence the balconies on every side." },
      { article: "Hotel Nacional de Cuba", caption: "The Hotel Nacional opened in 1930 and hosted a famous 1946 meeting of American mob bosses." },
      { article: "Havana Cathedral", caption: "Havana Cathedral's baroque facade is asymmetrical: its two bell towers are deliberately different sizes." }
    ],
    facts: {
      Population: "2.1 million",
      Founded: "1519",
      Language: "Spanish",
      Currency: "Peso (CUP)",
      "Best time": "November–April",
      "Order this": "Ropa vieja"
    }
  },
  {
    id: "tbilisi",
    name: "Tbilisi",
    country: "Georgia",
    region: "Caucasus",
    accent: "#9a6fb0",
    tagline: "Founded on a hot spring",
    intro:
      "Tbilisi was founded in the 5th century where sulphur springs come out of the ground, and has been sacked roughly forty times by everyone who passed through the Caucasus. What survived is a wildly mixed old town — Persian bathhouses, an Armenian quarter, wooden balconies, Soviet concrete and sharp new glass, all within a few streets.",
    famousFor: ["Sulphur baths", "8,000 years of wine", "Khinkali", "Polyphonic singing", "Balconies"],
    thingsToDo: [
      { title: "Take a sulphur bath in Abanotubani", text: "Domed brick bathhouses over natural hot springs, the reason the city exists. Book a private room; add the kisa scrub, which is brutal and excellent." },
      { title: "Drink qvevri wine", text: "Georgians have made wine in buried clay vessels for 8,000 years — the oldest known winemaking tradition. Amber wine, made on the skins, is the local style to ask for." },
      { title: "Eat khinkali correctly", text: "Hold the twisted top knot, bite a small hole, drink the broth, then eat the rest and leave the knot on the plate. Counting the knots is how the bill is worked out." },
      { title: "Ride the cable car to Narikala", text: "From Rike Park up to the 4th-century fortress, for the old town roofs, the river and Mother Georgia holding a sword and a bowl of wine." }
    ],
    gallery: [
      { article: "Narikala", caption: "Narikala fortress has guarded the city since the 4th century and was rebuilt by Arabs and Mongols." },
      { article: "Abanotubani", caption: "Abanotubani's domes are the roofs of bathhouses sunk into the ground over sulphur springs." },
      { article: "Bridge of Peace", caption: "The Bridge of Peace carries 30,000 LEDs that run a light pattern for 90 minutes at sunset." },
      { article: "Holy Trinity Cathedral of Tbilisi", caption: "Sameba Cathedral, finished in 2004, is among the tallest Orthodox churches in the world." },
      { article: "Rustaveli Avenue", caption: "Rustaveli Avenue is the city's spine — opera house, parliament, and a century of protests." },
      { article: "Khinkali", caption: "Khinkali are soup dumplings twisted at the top; the knot is a handle, not a part of the meal." }
    ],
    facts: {
      Population: "1.2 million",
      Founded: "5th century",
      Language: "Georgian",
      Currency: "Lari (₾)",
      "Best time": "May–June, September–October",
      "Order this": "Khachapuri adjaruli"
    }
  }
];
