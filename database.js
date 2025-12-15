// === WORLD PRO UNIVERSE: STRUCTURE DATABASE (v17.0 - Quantum Leap) ===

// CORREÇÃO CRÍTICA: A variável DB deve ser declarada como uma constante global.
const DB = {
    // Gerador de Nomes (Fallback para times sem RealPlayers)
    names: {
        br: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes", "Costa", "Ribeiro"],
        en: ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies", "Robinson", "Wright", "Thompson", "White"],
        es: ["Garcia", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez", "Torres"],
        it: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco"],
        de: ["Muller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Hoffmann", "Schulz"],
        fr: ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent"],
        pt: ["Silva", "Santos", "Ferreira", "Pereira", "Oliveira", "Costa", "Rodrigues", "Martins", "Jesus", "Fernandes"],
        sa: ["Al-Dawsari", "Al-Shahrani", "Al-Faraj", "Kanno", "Bahebri", "Al-Owais", "Al-Ghannam", "Al-Muwallad", "Al-Shehri"]
    },

    // Atributos Detalhados do Jogador (Usado para evolução e treino)
    attributes: [
        { id: 'finishing', name: "Finalização", pos: ['ATT'], growth: 0.15 },
        { id: 'passing', name: "Passe", pos: ['MID', 'DEF'], growth: 0.12 },
        { id: 'tackling', name: "Desarme", pos: ['DEF', 'MID'], growth: 0.10 },
        { id: 'speed', name: "Velocidade", pos: ['ATT', 'MID'], growth: 0.08 },
        { id: 'stamina', name: "Resistência", pos: ['MID'], growth: 0.07 },
        { id: 'handling', name: "Manejo", pos: ['GK'], growth: 0.15 }
    ],

    // Upgrades do Clube (Manager)
    upgrades: [
        { id: 'stadium', name: "Arena Moderna", desc: "Renda de jogos +20%", cost: 15000000, maxLevel: 5 },
        { id: 'training', name: "Centro de Treino", desc: "Melhora o crescimento do OVR (+)", cost: 8000000, maxLevel: 5 },
        { id: 'academy', name: "Academia de Base", desc: "Revela jogadores com Potencial maior", cost: 10000000, maxLevel: 5 },
        { id: 'medical', name: "Depto Médico", desc: "Reduz chance de lesões (Simulado)", cost: 5000000, maxLevel: 5 },
        { id: 'marketing', name: "Loja Oficial", desc: "Renda passiva semanal", cost: 3000000, maxLevel: 5 }
    ],
    
    // Táticas de Jogo
    tactics: [
        { id: 'balance', name: "Equilibrado (4-4-2)", desc: "Jogo seguro. Estabilidade.", bonus: 10, risk: 10 },
        { id: 'attack', name: "Ataque Total (4-3-3)", desc: "Pressão alta. Maior chance de gol.", bonus: 30, risk: 40 },
        { id: 'park', name: "Retranca (5-4-1)", desc: "Fechado. Difícil de ser vazado.", bonus: -10, risk: -20 },
        { id: 'counter', name: "Contra-Ataque (3-5-2)", desc: "Explora velocidade. Bom contra times fortes.", bonus: 20, risk: 20 }
    ],

    // === LISTA DE PAÍSES E LIGAS ===
    countries: [
        {
            id: "br", name: "Brasil",
            leagues: [
                {
                    id: "br_a", name: "Brasileirão Série A", tier: 1, clubs: [
                        { name: "Flamengo", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg", power: 86, budget: 40000000, stadium: 55000 },
                        { name: "Palmeiras", logo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg", power: 85, budget: 35000000, stadium: 43000 },
                        { name: "Botafogo", logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg", power: 85, budget: 32000000, stadium: 45000 },
                        { name: "Atlético-MG", logo: "https://upload.wikimedia.org/wikipedia/commons/2/27/Clube_Atl%C3%A9tico_Mineiro_logo.svg", power: 84, budget: 28000000, stadium: 46000 },
                        { name: "São Paulo", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg", power: 83, budget: 20000000, stadium: 67000 },
                        { name: "Internacional", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Sport_Club_Internacional.svg", power: 82, budget: 18000000, stadium: 50000 },
                        { name: "Grêmio", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Gremio_logo.svg/1024px-Gremio_logo.svg.png", power: 81, budget: 16000000, stadium: 55000 },
                        { name: "Corinthians", logo: "https://upload.wikimedia.org/wikipedia/pt/b/b4/Corinthians_simbolo.png", power: 81, budget: 22000000, stadium: 49000 },
                        { name: "Fluminense", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Fluminense_FC_escudo.png", power: 81, budget: 15000000, stadium: 78000 },
                        { name: "Cruzeiro", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Escudo_do_Cruzeiro_Esporte_Clube_%282021%29.svg", power: 80, budget: 20000000, stadium: 62000 },
                        { name: "Bahia", logo: "https://upload.wikimedia.org/wikipedia/pt/2/20/Bahia_logo.png", power: 80, budget: 30000000, stadium: 50000 },
                        { name: "Vasco", logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Vasco_da_Gama_logo.svg", power: 79, budget: 15000000, stadium: 40000 }
                    ]
                },
                {
                    id: "br_b", name: "Brasileirão Série B", tier: 2, 
                    clubs: [
                        { name: "Santos", logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Santos_Logo.png", power: 77, budget: 12000000, stadium: 16000 },
                        { name: "Sport", logo: "https://upload.wikimedia.org/wikipedia/commons/5/54/Sport_Club_do_Recife.png", power: 75, budget: 8000000, stadium: 45000 },
                        { name: "Ceará", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceara_Sporting_Club_Logo.svg", power: 75, budget: 8000000, stadium: 60000 },
                        { name: "Goiás", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Goias_EC_logo.png", power: 74, budget: 6000000, stadium: 42000 },
                        { name: "Coritiba", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Coritiba_FBC_%282007%29.png", power: 74, budget: 7000000, stadium: 40000 },
                        { name: "América-MG", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Am%C3%A9rica_Mineiro_logo.png", power: 73, budget: 5000000, stadium: 23000 },
                        { name: "Ponte Preta", logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Ponte_Preta_logo.svg", power: 71, budget: 3000000, stadium: 35000 }
                    ]
                }
            ]
        },
        {
            id: "en", name: "Inglaterra",
            leagues: [
                {
                    id: "en_pl", name: "Premier League", tier: 1, 
                    clubs: [
                        { name: "Man City", logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg", power: 95, budget: 200000000, stadium: 55000 },
                        { name: "Liverpool", logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg", power: 91, budget: 150000000, stadium: 53000 },
                        { name: "Arsenal", logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg", power: 92, budget: 140000000, stadium: 60000 },
                        { name: "Chelsea", logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg", power: 87, budget: 180000000, stadium: 40000 },
                        { name: "Man Utd", logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg", power: 86, budget: 160000000, stadium: 74000 },
                        { name: "Newcastle", logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg", power: 85, budget: 180000000, stadium: 52000 },
                        { name: "Aston Villa", logo: "https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg", power: 84, budget: 80000000, stadium: 42000 }
                    ]
                },
                {
                    id: "en_ch", name: "Championship", tier: 2,
                    clubs: [
                        { name: "Leeds", logo: "https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg", power: 78, budget: 30000000, stadium: 37000 },
                        { name: "Sunderland", logo: "https://upload.wikimedia.org/wikipedia/en/7/77/Logo_Sunderland.svg", power: 76, budget: 20000000, stadium: 49000 },
                        { name: "Burnley", logo: "https://upload.wikimedia.org/wikipedia/en/6/62/Burnley_F.C._Logo.svg", power: 77, budget: 25000000, stadium: 22000 }
                    ]
                }
            ]
        },
        {
            id: "es", name: "Espanha",
            leagues: [
                {
                    id: "es_la", name: "La Liga", tier: 1,
                    clubs: [
                        { name: "Real Madrid", logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg", power: 94, budget: 180000000, stadium: 81000 },
                        { name: "Barcelona", logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg", power: 90, budget: 80000000, stadium: 99000 },
                        { name: "Atlético Madrid", logo: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg", power: 88, budget: 70000000, stadium: 68000 },
                        { name: "Girona", logo: "https://upload.wikimedia.org/wikipedia/en/9/90/For_Girona_FC_article.svg", power: 84, budget: 40000000, stadium: 13000 }
                    ]
                }
            ]
        },
        {
            id: "it", name: "Itália",
            leagues: [
                {
                    id: "it_sa", name: "Serie A", tier: 1,
                    clubs: [
                        { name: "Inter", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg", power: 89, budget: 80000000, stadium: 80000 },
                        { name: "Milan", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg", power: 87, budget: 70000000, stadium: 80000 },
                        { name: "Juventus", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Juventus_FC_2017_logo.svg", power: 86, budget: 90000000, stadium: 41000 },
                        { name: "Napoli", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg", power: 85, budget: 60000000, stadium: 54000 }
                    ]
                }
            ]
        },
        // Novas Ligas (Estrutura)
        {
            id: "de", name: "Alemanha",
            leagues: [{
                id: "de_bu", name: "Bundesliga", tier: 1,
                clubs: [
                    { name: "Bayer Leverkusen", logo: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg", power: 90, budget: 70000000, stadium: 30000 },
                    { name: "Bayern", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg", power: 92, budget: 120000000, stadium: 75000 },
                    { name: "Dortmund", logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg", power: 87, budget: 80000000, stadium: 81000 }
                ]
            }]
        },
        {
            id: "sa", name: "Arábia Saudita",
            leagues: [{
                id: "sa_pl", name: "Saudi Pro League", tier: 1,
                clubs: [
                    { name: "Al-Hilal", logo: "https://upload.wikimedia.org/wikipedia/en/f/fa/Al_Hilal_SFC_logo.svg", power: 88, budget: 300000000, stadium: 68000 },
                    { name: "Al-Nassr", logo: "https://upload.wikimedia.org/wikipedia/en/1/11/Al-Nassr_FC_Logo.svg", power: 87, budget: 250000000, stadium: 25000 },
                    { name: "Al-Ahli", logo: "https://upload.wikimedia.org/wikipedia/en/b/b3/Al-Ahli_Saudi_FC_logo.svg", power: 85, budget: 200000000, stadium: 62000 }
                ]
            }]
        }
    ],

    // === ESTRUTURA DE STAFF ===
    staff: [
        { id: 'assistant', name: "Treinador Assistente", specialty: 'Tactics', cost: 500000, baseSkill: 65, maxSkill: 95 },
        { id: 'medical', name: "Chefe Médico", specialty: 'Health', cost: 300000, baseSkill: 70, maxSkill: 90 },
        { id: 'scout', name: "Olheiro Chefe", specialty: 'Scouting', cost: 400000, baseSkill: 60, maxSkill: 85 }
    ]
};