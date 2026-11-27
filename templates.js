// Plantillas editoriales de PREMIAZO. {SKIN} = skin/tema, {CODE} = código, {MAP} = nombre corto del mapa.
// "needs" = ids de hechos que deben estar verificados para poder usar la plantilla.
window.PZ_CATS = {
  FREE_SKIN:        {label:'Skin nueva',            color:'#a06bff', accent:'#ffd400', music:'epic reveal, synth swell, energetic gaming, instrumental'},
  SKIN_BUNDLE:      {label:'Conjunto de skins',     color:'#ffcc33', accent:'#ffffff', music:'upbeat trap, gold luxury vibe, instrumental'},
  STREAMER_REACTION:{label:'Reacción de streamer',  color:'#ff4d4d', accent:'#ffd400', music:'hype funny meme beat, instrumental'},
  FREE_VBUCKS:      {label:'Pavos / V-Bucks',       color:'#29d3ff', accent:'#ffffff', music:'bright electronic, coins, energetic, instrumental'},
  FREE_TOKEN:       {label:'Token / Pirate Shop',   color:'#ff9a1f', accent:'#ffe14d', music:'pirate adventure, fast orchestral hybrid, instrumental'},
  PICKAXE_ITEM:     {label:'Pico / objeto',         color:'#b388ff', accent:'#c0f0ff', music:'mysterious shimmering electronic, instrumental'},
  FORTNITE_GLITCH:  {label:'Glitch / bug',          color:'#39ff88', accent:'#ff3df2', music:'glitchy dubstep, digital errors, instrumental'},
  FORTNITE_NEWS:    {label:'Novedades / tendencia', color:'#3b82ff', accent:'#ffd400', music:'breaking news intro, punchy electronic, instrumental'},
  TOP_COMPARISON:   {label:'Top / comparación',     color:'#ff3b3b', accent:'#3b8bff', music:'competitive hype countdown, instrumental'},
  MAP_REWARD:       {label:'Mira lo que sale en mi mapa', color:'#ffb300', accent:'#ffe14d', music:'suspense build up then big reward hit, energetic gaming, instrumental'},
  MACHINE_SKIN:     {label:'Máquina / caja fuerte → sale skin', color:'#7a3cff', accent:'#ffd400', music:'suspense riser then big reveal hit, energetic gaming, instrumental'},
  MAP_DISCOVERY:    {label:'Descubrir el mapa',     color:'#ff4fb8', accent:'#2ee6d6', music:'fun adventurous gaming, playful, instrumental'}
};

window.PZ_TEMPLATES = {
  es: {
    FREE_SKIN: [
      {hook:'¡NUEVA SKIN!', voice:'Ha salido {SKIN} y es una pasada. Mira cómo se ve. Y si quieres subir de nivel rápido, entra al mapa {MAP} con el código {CODE}.', title:'{SKIN} YA ESTÁ AQUÍ', cover:'{SKIN} NUEVA', needs:['xp_en_mapa']},
      {hook:'¿LA TIENES YA?', voice:'Esta es {SKIN}, la skin de la que habla todo el mundo. Fíjate en los estilos. Ahora pon el código {CODE} y prueba el mapa {MAP}.', title:'MIRA ESTA SKIN', cover:'¿LA TIENES?', needs:[]}
    ],
    SKIN_BUNDLE: [
      {hook:'TODAS ESTAS SKINS', voice:'Mira todas estas skins de golpe. ¿Cuál es tu favorita? Te leo en comentarios. Y para subir de nivel, entra a {MAP} con el código {CODE}.', title:'¿CUÁL ELIGES?', cover:'¿CUÁL ELIGES?', needs:['xp_en_mapa']}
    ],
    STREAMER_REACTION: [
      {hook:'¡MIRA SU CARA!', voice:'Así reaccionó al ver {SKIN}. No se lo podía creer. Ahora te toca a ti: pon el código {CODE} y entra en {MAP}.', title:'SU REACCIÓN', cover:'¡NO SE LO CREE!', needs:[]}
    ],
    FREE_VBUCKS: [
      {hook:'PAVOS EN FORTNITE', voice:'Todo el mundo quiere pavos. Mira lo que sale en este mapa. Pon el código {CODE} en {MAP} y compruébalo tú mismo.', title:'MIRA ESTO', cover:'¿PAVOS?', needs:[]}
    ],
    FREE_TOKEN: [
      {hook:'¡TOKEN PIRATA!', voice:'Así se consigue el token pirata. Entra en el mapa {MAP}, sube con el XP y abre la máquina. Pon el código {CODE} y consíguelo tú también.', title:'TOKEN PIRATA', cover:'TOKEN PIRATA', needs:['token_pirata_en_mapa','xp_en_mapa']},
      {hook:'¿NO TIENES EL TOKEN?', voice:'Si todavía no tienes el token pirata, mira esto. En {MAP} se consigue jugando. Código {CODE}, corre antes de que lo quiten.', title:'CONSIGUE EL TOKEN', cover:'CONSIGUE EL TOKEN', needs:['token_pirata_en_mapa']}
    ],
    PICKAXE_ITEM: [
      {hook:'¡ESTE PICO!', voice:'Mira este objeto, es de los más buscados. Fíjate bien en cómo se ve. Y luego entra en {MAP} con el código {CODE}.', title:'¿LO QUIERES?', cover:'ESTE PICO', needs:[]}
    ],
    FORTNITE_GLITCH: [
      {hook:'ESTO NO DEBERÍA PASAR', voice:'Mira lo que pasa aquí, nadie se lo esperaba. Fortnite tiene secretos que casi nadie conoce. Prueba nuestro mapa {MAP} con el código {CODE}.', title:'¿UN BUG?', cover:'¿UN BUG?', needs:[]}
    ],
    FORTNITE_NEWS: [
      {hook:'¡ÚLTIMA HORA!', voice:'Novedad en Fortnite: {SKIN}. Esto es lo que tienes que saber. Y mientras tanto, sube de nivel en {MAP} con el código {CODE}.', title:'NOVEDAD', cover:'¡ÚLTIMA HORA!', needs:['xp_en_mapa']}
    ],
    TOP_COMPARISON: [
      {hook:'¿CUÁL ES MEJOR?', voice:'Esta o esta. Las dos son increíbles, pero solo una gana. Comenta tu elección y entra en {MAP} con el código {CODE}.', title:'¿CUÁL GANA?', cover:'¿CUÁL ES MEJOR?', needs:[]}
    ],
    MAP_REWARD: [
      {hook:'MIRA LO QUE SALE EN MI MAPA…', mid:'VE A LA MÁQUINA…', reveal:'¡TOKEN PIRATA CONSEGUIDO!', reward:'token', voice:'Mira lo que sale en mi mapa. Pon el código {CODE}, entra en {MAP}, ve a la máquina y dale al botón. ¡Token pirata conseguido! Pruébalo tú.', title:'MIRA LO QUE SALE', cover:'MIRA LO QUE SALE', needs:['token_pirata_en_mapa']},
      {hook:'MIRA LO QUE SALE EN MI MAPA…', mid:'VE A LA MÁQUINA…', reveal:'+XP SIN PARAR', reward:'xp', voice:'Mira lo que sale en mi mapa. Entro en {MAP}, voy a la máquina y… ¡XP sin parar! Sube de nivel rapidísimo con el código {CODE}.', title:'MIRA LO QUE SALE', cover:'XP SIN PARAR', needs:['xp_en_mapa']}
    ],
    MACHINE_SKIN: [
      {hook:'MIRA LO QUE SALE AL FINAL…', reveal:'¡NO ME LO CREO!', reveal2:'{SKIN}', mid:'+XP SIN PARAR', voice:'Pon el código {CODE} y entra en {MAP}. Subes con el XP sin parar, llegas a la caja fuerte, le doy a la X y… ¡no me lo creo! ¡{SKIN}!', title:'¿QUÉ SALE AQUÍ?', cover:'¿QUÉ SALE?', needs:['xp_en_mapa']},
      {hook:'ESPERA AL FINAL…', reveal:'¡NO ME LO CREO!', reveal2:'{SKIN}', mid:'+XP SIN PARAR', voice:'Código {CODE}, entra en {MAP} y sube de nivel rapidísimo con el XP. Y ahora, la máquina: le doy a la X y… ¡no me lo creo! Mira, {SKIN}.', title:'MIRA LO QUE SALE', cover:'¡DALE A LA X!', needs:['xp_en_mapa']},
      {hook:'¿QUÉ HAY EN LA CAJA FUERTE?', reveal:'¡NO ME LO CREO!', reveal2:'{SKIN}', mid:'¡TOKEN PIRATA!', voice:'Pon el código {CODE} y entra en {MAP}: ahí te llevas el token pirata. Pero mira la caja fuerte… le doy a la X y… ¡no me lo creo! ¡{SKIN}!', title:'¿QUÉ HAY DENTRO?', cover:'¿QUÉ HAY DENTRO?', needs:['token_pirata_en_mapa']}
    ],
    MAP_DISCOVERY: [
      {hook:'MIRA ESTE MAPA', voice:'Este es {MAP}. Subes con el XP, pasas por las salas y llegas a la máquina. Mira lo que sale. Código {CODE}.', title:'MIRA LO QUE SALE', cover:'MIRA ESTE MAPA', needs:['xp_en_mapa']}
    ]
  },
  en: {
    FREE_SKIN: [
      {hook:'NEW SKIN!', voice:'{SKIN} just dropped and it looks insane. Check out the styles. Want to level up fast? Jump into {MAP} with code {CODE}.', title:'{SKIN} IS HERE', cover:'NEW {SKIN}', needs:['xp_en_mapa']},
      {hook:'DO YOU HAVE IT?', voice:'This is {SKIN}, the skin everyone is talking about. Look at these styles. Now enter code {CODE} and try {MAP}.', title:'LOOK AT THIS SKIN', cover:'DO YOU HAVE IT?', needs:[]}
    ],
    SKIN_BUNDLE: [
      {hook:'ALL THESE SKINS', voice:'Look at all these skins at once. Which one is your favorite? Tell me in the comments. To level up, play {MAP} with code {CODE}.', title:'WHICH ONE?', cover:'PICK ONE!', needs:['xp_en_mapa']}
    ],
    STREAMER_REACTION: [
      {hook:'LOOK AT HIS FACE!', voice:'This is how he reacted to {SKIN}. He could not believe it. Your turn: enter code {CODE} and jump into {MAP}.', title:'HIS REACTION', cover:'NO WAY!', needs:[]}
    ],
    FREE_VBUCKS: [
      {hook:'V-BUCKS IN FORTNITE', voice:'Everyone wants V-Bucks. See what drops in this map. Enter code {CODE} in {MAP} and check it yourself.', title:'LOOK AT THIS', cover:'V-BUCKS?', needs:[]}
    ],
    FREE_TOKEN: [
      {hook:'PIRATE TOKEN!', voice:'This is how you get the Pirate Shop Token. Jump into {MAP}, level up with the XP and open the machine. Enter code {CODE} and get it too.', title:'PIRATE TOKEN', cover:'PIRATE TOKEN', needs:['token_pirata_en_mapa','xp_en_mapa']}
    ],
    PICKAXE_ITEM: [
      {hook:'THIS PICKAXE!', voice:'Look at this item, one of the most wanted. Check how it looks. Then play {MAP} with code {CODE}.', title:'WANT IT?', cover:'THIS PICKAXE', needs:[]}
    ],
    FORTNITE_GLITCH: [
      {hook:'THIS SHOULD NOT HAPPEN', voice:'Look what happens here, nobody expected it. Fortnite has secrets almost nobody knows. Try our map {MAP} with code {CODE}.', title:'A BUG?', cover:'A BUG?', needs:[]}
    ],
    FORTNITE_NEWS: [
      {hook:'BREAKING NEWS!', voice:'Fortnite news: {SKIN}. Here is what you need to know. Meanwhile, level up in {MAP} with code {CODE}.', title:'NEW IN FORTNITE', cover:'BREAKING!', needs:['xp_en_mapa']}
    ],
    TOP_COMPARISON: [
      {hook:'WHICH IS BETTER?', voice:'This one or this one. Both are amazing, but only one wins. Comment your pick and play {MAP} with code {CODE}.', title:'WHO WINS?', cover:'WHICH IS BETTER?', needs:[]}
    ],
    MAP_REWARD: [
      {hook:'SEE WHAT DROPS IN MY MAP…', mid:'GO TO THE MACHINE…', reveal:'PIRATE TOKEN UNLOCKED!', reward:'token', voice:'Look what drops in my map. Enter code {CODE}, jump into {MAP}, go to the machine and press the button. Pirate token unlocked! Try it yourself.', title:'SEE WHAT YOU GET', cover:'SEE WHAT YOU GET', needs:['token_pirata_en_mapa']},
      {hook:'SEE WHAT DROPS IN MY MAP…', mid:'GO TO THE MACHINE…', reveal:'NONSTOP XP', reward:'xp', voice:'Look what drops in my map. I jump into {MAP}, go to the machine and… nonstop XP! Level up super fast with code {CODE}.', title:'SEE WHAT YOU GET', cover:'NONSTOP XP', needs:['xp_en_mapa']}
    ],
    MACHINE_SKIN: [
      {hook:'WAIT FOR THE END…', reveal:'NO WAY!', reveal2:'{SKIN}', mid:'NONSTOP XP', voice:'Enter code {CODE} and jump into {MAP}. Level up with nonstop XP, reach the safe, press X and… no way! {SKIN}!', title:'WHAT DROPS HERE?', cover:'WHAT DROPS?', needs:['xp_en_mapa']},
      {hook:'WATCH UNTIL THE END…', reveal:'NO WAY!', reveal2:'{SKIN}', mid:'NONSTOP XP', voice:'Code {CODE}, jump into {MAP} and level up super fast with the XP. And now the machine: I press X and… no way! Look, {SKIN}.', title:'SEE WHAT DROPS', cover:'PRESS X!', needs:['xp_en_mapa']},
      {hook:'WHAT IS IN THE SAFE?', reveal:'NO WAY!', reveal2:'{SKIN}', mid:'PIRATE TOKEN!', voice:'Enter code {CODE} and jump into {MAP}: you get the pirate token there. But look at the safe… I press X and… no way! {SKIN}!', title:'WHAT IS INSIDE?', cover:'WHAT IS INSIDE?', needs:['token_pirata_en_mapa']}
    ],
    MAP_DISCOVERY: [
      {hook:'CHECK THIS MAP', voice:'This is {MAP}. Level up with the XP, run through the rooms and reach the machine. See what drops. Code {CODE}.', title:'SEE WHAT DROPS', cover:'CHECK THIS MAP', needs:['xp_en_mapa']}
    ]
  }
};

// Textos de publicación por idioma
window.PZ_PUB = {
  es:{name:'Español', how:'Cómo entrar: Fortnite → Descubrir → busca el código {CODE}', cta:'¡Prueba el mapa y comenta qué te sale!', tags:'fortnite,fortnite españa,codigo fortnite,mapa fortnite,skins fortnite,fortnite gratis,{SKINTAG},lucky 1v1,premiazo,shorts', hash:'#fortnite #shorts #fortnitecodigo'},
  en:{name:'English', how:'How to play: Fortnite → Discover → search code {CODE}', cta:'Try the map and comment what you get!', tags:'fortnite,fortnite map code,fortnite creative,fortnite skins,free fortnite,{SKINTAG},lucky 1v1,premiazo,shorts', hash:'#fortnite #shorts #fortnitecreative'},
  pt:{name:'Português (BR)', how:'Como entrar: Fortnite → Descobrir → procure o código {CODE}', cta:'Teste o mapa e comente o que saiu pra você!', tags:'fortnite,codigo fortnite,mapa fortnite,skins fortnite,{SKINTAG},lucky 1v1,premiazo,shorts', hash:'#fortnite #shorts #fortnitebrasil'},
  fr:{name:'Français', how:'Comment jouer : Fortnite → Découvrir → cherche le code {CODE}', cta:'Teste la map et dis-moi ce que tu obtiens !', tags:'fortnite,code fortnite,map fortnite,skins fortnite,{SKINTAG},lucky 1v1,premiazo,shorts', hash:'#fortnite #shorts #fortnitefr'}
};

// Títulos y cierres traducidos para PT y FR (se basan en la versión EN)
window.PZ_TITLE_TR = {
  pt:{'NEW SKIN!':'SKIN NOVA!','PIRATE TOKEN':'TOKEN PIRATA','WHICH ONE?':'QUAL VOCÊ ESCOLHE?','HIS REACTION':'A REAÇÃO DELE','LOOK AT THIS':'OLHA ISSO','WANT IT?':'VOCÊ QUER?','A BUG?':'UM BUG?','NEW IN FORTNITE':'NOVIDADE NO FORTNITE','WHO WINS?':'QUAL GANHA?','SEE WHAT DROPS':'OLHA O QUE SAI','LOOK AT THIS SKIN':'OLHA ESSA SKIN','SEE WHAT YOU GET':'OLHA O QUE VOCÊ GANHA','WHAT DROPS HERE?':'O QUE SAI AQUI?','WHAT IS INSIDE?':'O QUE TEM DENTRO?'},
  fr:{'NEW SKIN!':'NOUVEAU SKIN !','PIRATE TOKEN':'JETON PIRATE','WHICH ONE?':'LEQUEL TU CHOISIS ?','HIS REACTION':'SA RÉACTION','LOOK AT THIS':'REGARDE ÇA','WANT IT?':'TU LE VEUX ?','A BUG?':'UN BUG ?','NEW IN FORTNITE':'NOUVEAU SUR FORTNITE','WHO WINS?':'QUI GAGNE ?','SEE WHAT DROPS':'REGARDE CE QUI TOMBE','LOOK AT THIS SKIN':'REGARDE CE SKIN','SEE WHAT YOU GET':'REGARDE CE QUE TU GAGNES','WHAT DROPS HERE?':"QU'EST-CE QUI TOMBE ?",'WHAT IS INSIDE?':"QU'Y A-T-IL DEDANS ?"}
};

window.PZ_DEFAULT_FACTS = [
  {feature_id:'codigo_isla', claim:'El código del mapa es 2678-6238-9804', verified:true},
  {feature_id:'xp_en_mapa', claim:'En el mapa se consigue XP', verified:true},
  {feature_id:'token_pirata_en_mapa', claim:'En el mapa se consigue el Pirate Shop Token', verified:true}
];
