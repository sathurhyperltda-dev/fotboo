// === WORLD PRO UNIVERSE: REAL PLAYERS DATABASE (v13) ===
// Este arquivo conecta os nomes reais aos clubes definidos no database.js

const RealPlayers = {
    // ===================== BRASIL SÉRIE A =====================
    "Flamengo": [
        { name: "Pedro", pos: "ATT", ovr: 85 }, { name: "G. Barbosa", pos: "ATT", ovr: 83 },
        { name: "Arrascaeta", pos: "MID", ovr: 86 }, { name: "De La Cruz", pos: "MID", ovr: 84 },
        { name: "L. Pereira", pos: "DEF", ovr: 82 }, { name: "Rossi", pos: "GK", ovr: 80 }
    ],
    "Palmeiras": [
        { name: "Estêvão", pos: "ATT", ovr: 84 }, { name: "F. Anderson", pos: "MID", ovr: 82 },
        { name: "Veiga", pos: "MID", ovr: 85 }, { name: "G. Gomez", pos: "DEF", ovr: 84 },
        { name: "Weverton", pos: "GK", ovr: 83 }
    ],
    "Botafogo": [
        { name: "Luiz Henrique", pos: "ATT", ovr: 85 }, { name: "Igor Jesus", pos: "ATT", ovr: 82 },
        { name: "Almada", pos: "MID", ovr: 83 }, { name: "Bastos", pos: "DEF", ovr: 80 },
        { name: "John", pos: "GK", ovr: 81 }
    ],
    "São Paulo": [
        { name: "Calleri", pos: "ATT", ovr: 83 }, { name: "Lucas", pos: "MID", ovr: 84 },
        { name: "L. Gustavo", pos: "MID", ovr: 80 }, { name: "Arboleda", pos: "DEF", ovr: 81 },
        { name: "Rafael", pos: "GK", ovr: 80 }
    ],
    "Corinthians": [
        { name: "Memphis", pos: "ATT", ovr: 84 }, { name: "Yuri Alberto", pos: "ATT", ovr: 80 },
        { name: "Garro", pos: "MID", ovr: 83 }, { name: "Hugo Souza", pos: "GK", ovr: 79 }
    ],
    "Atlético-MG": [
        { name: "Hulk", pos: "ATT", ovr: 84 }, { name: "Paulinho", pos: "ATT", ovr: 82 },
        { name: "Scarpa", pos: "MID", ovr: 81 }, { name: "Everson", pos: "GK", ovr: 79 }
    ],
    "Grêmio": [
        { name: "Braithwaite", pos: "ATT", ovr: 81 }, { name: "Soteldo", pos: "ATT", ovr: 82 },
        { name: "Villasanti", pos: "MID", ovr: 81 }, { name: "Marchesín", pos: "GK", ovr: 78 }
    ],
    "Internacional": [
        { name: "Borré", pos: "ATT", ovr: 82 }, { name: "Alan Patrick", pos: "MID", ovr: 83 },
        { name: "Valencia", pos: "ATT", ovr: 81 }, { name: "Rochet", pos: "GK", ovr: 81 }
    ],
    "Vasco": [
        { name: "Vegetti", pos: "ATT", ovr: 81 }, { name: "Coutinho", pos: "MID", ovr: 82 },
        { name: "Payet", pos: "MID", ovr: 81 }, { name: "Léo Jardim", pos: "GK", ovr: 80 }
    ],
    "Cruzeiro": [
        { name: "Cássio", pos: "GK", ovr: 81 }, { name: "M. Pereira", pos: "MID", ovr: 83 },
        { name: "Kaio Jorge", pos: "ATT", ovr: 79 }
    ],
    "Fluminense": [
        { name: "Cano", pos: "ATT", ovr: 81 }, { name: "Arias", pos: "MID", ovr: 83 },
        { name: "Thiago Silva", pos: "DEF", ovr: 84 }, { name: "Ganso", pos: "MID", ovr: 80 }
    ],
    "Fortaleza": [
        { name: "Lucero", pos: "ATT", ovr: 80 }, { name: "Pikachu", pos: "MID", ovr: 79 },
        { name: "João Ricardo", pos: "GK", ovr: 78 }
    ],

    // ===================== BRASIL SÉRIE B =====================
    "Santos": [
        { name: "Guilherme", pos: "ATT", ovr: 76 }, { name: "Furch", pos: "ATT", ovr: 75 },
        { name: "Pituca", pos: "MID", ovr: 75 }, { name: "Gil", pos: "DEF", ovr: 74 }
    ],
    "Sport": [
        { name: "G. Coutinho", pos: "ATT", ovr: 74 }, { name: "Lucas Lima", pos: "MID", ovr: 75 },
        { name: "Thyere", pos: "DEF", ovr: 73 }
    ],
    "Ceará": [
        { name: "Saulo", pos: "ATT", ovr: 74 }, { name: "Erick Pulga", pos: "ATT", ovr: 75 },
        { name: "Lourenço", pos: "MID", ovr: 72 }
    ],

    // ===================== INGLATERRA PREMIER LEAGUE =====================
    "Man City": [
        { name: "Haaland", pos: "ATT", ovr: 94 }, { name: "Foden", pos: "MID", ovr: 90 },
        { name: "De Bruyne", pos: "MID", ovr: 92 }, { name: "Rodri", pos: "MID", ovr: 91 },
        { name: "Ruben Dias", pos: "DEF", ovr: 89 }, { name: "Ederson", pos: "GK", ovr: 89 }
    ],
    "Liverpool": [
        { name: "Salah", pos: "ATT", ovr: 90 }, { name: "Luis Diaz", pos: "ATT", ovr: 86 },
        { name: "Mac Allister", pos: "MID", ovr: 85 }, { name: "Van Dijk", pos: "DEF", ovr: 89 },
        { name: "Alisson", pos: "GK", ovr: 90 }
    ],
    "Arsenal": [
        { name: "Saka", pos: "ATT", ovr: 89 }, { name: "Havertz", pos: "ATT", ovr: 85 },
        { name: "Odegaard", pos: "MID", ovr: 88 }, { name: "Saliba", pos: "DEF", ovr: 87 }
    ],
    "Chelsea": [
        { name: "Palmer", pos: "MID", ovr: 86 }, { name: "Nkunku", pos: "ATT", ovr: 84 },
        { name: "Enzo", pos: "MID", ovr: 83 }, { name: "Caicedo", pos: "MID", ovr: 83 }
    ],
    "Man Utd": [
        { name: "B. Fernandes", pos: "MID", ovr: 87 }, { name: "Rashford", pos: "ATT", ovr: 83 },
        { name: "Garnacho", pos: "ATT", ovr: 82 }, { name: "Onana", pos: "GK", ovr: 82 }
    ],

    // ===================== ESPANHA LA LIGA =====================
    "Real Madrid": [
        { name: "Mbappé", pos: "ATT", ovr: 94 }, { name: "Vini Jr", pos: "ATT", ovr: 92 },
        { name: "Bellingham", pos: "MID", ovr: 91 }, { name: "Rodrygo", pos: "ATT", ovr: 87 },
        { name: "Valverde", pos: "MID", ovr: 89 }, { name: "Courtois", pos: "GK", ovr: 90 }
    ],
    "Barcelona": [
        { name: "Yamal", pos: "ATT", ovr: 88 }, { name: "Lewandowski", pos: "ATT", ovr: 89 },
        { name: "Raphinha", pos: "ATT", ovr: 86 }, { name: "Pedri", pos: "MID", ovr: 87 },
        { name: "Gavi", pos: "MID", ovr: 84 }, { name: "Ter Stegen", pos: "GK", ovr: 88 }
    ],
    "Atlético Madrid": [
        { name: "Griezmann", pos: "ATT", ovr: 87 }, { name: "Alvarez", pos: "ATT", ovr: 85 },
        { name: "Oblak", pos: "GK", ovr: 87 }
    ],

    // ===================== OUTRAS LIGAS =====================
    "Bayer Leverkusen": [
        { name: "Wirtz", pos: "MID", ovr: 88 }, { name: "Xhaka", pos: "MID", ovr: 85 },
        { name: "Frimpong", pos: "DEF", ovr: 84 }
    ],
    "Bayern": [
        { name: "Kane", pos: "ATT", ovr: 92 }, { name: "Musiala", pos: "MID", ovr: 88 },
        { name: "Neuer", pos: "GK", ovr: 87 }
    ],
    "Inter": [
        { name: "Lautaro", pos: "ATT", ovr: 88 }, { name: "Barella", pos: "MID", ovr: 86 },
        { name: "Bastoni", pos: "DEF", ovr: 85 }
    ],
    "Al-Hilal": [
        { name: "Neymar Jr", pos: "ATT", ovr: 89 }, { name: "Mitrovic", pos: "ATT", ovr: 85 },
        { name: "Cancelo", pos: "DEF", ovr: 86 }, { name: "Bono", pos: "GK", ovr: 86 }
    ],
    "Al-Nassr": [
        { name: "C. Ronaldo", pos: "ATT", ovr: 88 }, { name: "Mané", pos: "ATT", ovr: 85 },
        { name: "Laporte", pos: "DEF", ovr: 85 }
    ],
    "Inter Miami": [
        { name: "Messi", pos: "ATT", ovr: 92 }, { name: "Suarez", pos: "ATT", ovr: 84 },
        { name: "Busquets", pos: "MID", ovr: 82 }, { name: "Jordi Alba", pos: "DEF", ovr: 81 }
    ]
};
