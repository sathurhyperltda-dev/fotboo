// === WORLD PRO UNIVERSE: STRUCTURE DATABASE (v13) ===
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

    // Upgrades do Clube
    upgrades: [
        { id: 'stadium', name: "Arena Moderna", desc: "Aumenta renda de jogos em 20%", cost: 15000000, type: 'income' },
        { id: 'training', name: "Centro de Treino CT", desc: "Recupera energia mais rápido", cost: 8000000, type: 'energy' },
        { id: 'academy', name: "Academia de Base", desc: "Revela jogadores com mais OVR", cost: 10000000, type: 'scout' },
        { id: 'medical', name: "Departamento Médico", desc: "Reduz chance de lesões (Simulado)", cost: 5000000, type: 'health' },
        { id: 'marketing', name: "Loja Oficial", desc: "Renda passiva semanal", cost: 3000000, type: 'cash' }
    ],

    // Táticas de Jogo
    tactics: [
        { id: 'balance', name: "Equilibrado (4-4-2)", desc: "Sem riscos. Foco na posse de bola.", bonus: 10, risk: 10 },
        { id: 'attack', name: "Ataque Total (4-3-3)", desc: "Pressão alta. Chance de gol alta, defesa exposta.", bonus: 30, risk: 40 },
        { id: 'park', name: "Retranca (5-4-1)", desc: "Estaciona o ônibus. Difícil de levar gol.", bonus: -10, risk: -20 },
        { id: 'counter', name: "Contra-Ataque (3-5-2)", desc: "Explora velocidade. Bom contra times fortes.", bonus: 20, risk: 20 }
    ],

    // === LISTA DE PAÍSES E LIGAS ===
    countries: [
        {
            id: "br", name: "Brasil",
            leagues: [
                {
                    id: "br_a", name: "Brasileirão Série A", tier: 1, 
                    clubs: [
                        { name: "Flamengo", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg", power: 86, budget: 40000000 },
                        { name: "Palmeiras", logo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg", power: 85, budget: 35000000 },
                        { name: "Botafogo", logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg", power: 85, budget: 32000000 },
                        { name: "Atlético-MG", logo: "https://upload.wikimedia.org/wikipedia/commons/2/27/Clube_Atl%C3%A9tico_Mineiro_logo.svg", power: 84, budget: 28000000 },
                        { name: "São Paulo", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg", power: 83, budget: 20000000 },
                        { name: "Internacional", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Sport_Club_Internacional.svg", power: 82, budget: 18000000 },
                        { name: "Grêmio", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Gremio_logo.svg/1024px-Gremio_logo.svg.png", power: 81, budget: 16000000 },
                        { name: "Corinthians", logo: "https://upload.wikimedia.org/wikipedia/pt/b/b4/Corinthians_simbolo.png", power: 81, budget: 22000000 },
                        { name: "Fluminense", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Fluminense_FC_escudo.png", power: 81, budget: 15000000 },
                        { name: "Cruzeiro", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Escudo_do_Cruzeiro_Esporte_Clube_%282021%29.svg", power: 80, budget: 20000000 },
                        { name: "Bahia", logo: "https://upload.wikimedia.org/wikipedia/pt/2/20/Bahia_logo.png", power: 80, budget: 30000000 },
                        { name: "Vasco", logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Vasco_da_Gama_logo.svg", power: 79, budget: 15000000 },
                        { name: "Fortaleza", logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Fortaleza_Esporte_Clube_logo.svg", power: 80, budget: 12000000 },
                        { name: "Athletico-PR", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/CA_Paranaense.svg", power: 79, budget: 14000000 },
                        { name: "Bragantino", logo: "https://upload.wikimedia.org/wikipedia/en/9/9e/Red_Bull_Bragantino.svg", power: 78, budget: 15000000 },
                        { name: "Vitória", logo: "https://upload.wikimedia.org/wikipedia/pt/3/36/Escudo_Esporte_Clube_Vitoria.svg", power: 75, budget: 8000000 }
                    ]
                },
                {
                    id: "br_b", name: "Brasileirão Série B", tier: 2,
                    clubs: [
                        { name: "Santos", logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/Santos_Logo.png", power: 77, budget: 12000000 },
                        { name: "Ceará", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Ceara_Sporting_Club_Logo.svg", power: 75, budget: 8000000 },
                        { name: "Sport", logo: "https://upload.wikimedia.org/wikipedia/commons/5/54/Sport_Club_do_Recife.png", power: 75, budget: 8000000 },
                        { name: "Goiás", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Goias_EC_logo.png", power: 74, budget: 6000000 },
                        { name: "Coritiba", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Coritiba_FBC_%282007%29.png", power: 74, budget: 7000000 },
                        { name: "América-MG", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Am%C3%A9rica_Mineiro_logo.png", power: 73, budget: 5000000 },
                        { name: "Avaí", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Avai_FC_%2805-09%29.svg", power: 72, budget: 4000000 },
                        { name: "Vila Nova", logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Vila_Nova_Futebol_Clube_logo.svg", power: 72, budget: 4000000 },
                        { name: "Ponte Preta", logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Ponte_Preta_logo.svg", power: 71, budget: 3000000 },
                        { name: "Guarani", logo: "https://upload.wikimedia.org/wikipedia/commons/2/26/Guarani_FC_logo.svg", power: 71, budget: 3000000 },
                        { name: "CRB", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9c/CRB_Logo_2016.png", power: 70, budget: 2000000 },
                        { name: "Paysandu", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Paysandu_Sport_Club_logo.svg", power: 70, budget: 2500000 }
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
                        { name: "Man City", logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg", power: 95, budget: 200000000 },
                        { name: "Liverpool", logo: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg", power: 91, budget: 150000000 },
                        { name: "Arsenal", logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg", power: 92, budget: 140000000 },
                        { name: "Chelsea", logo: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg", power: 87, budget: 180000000 },
                        { name: "Man Utd", logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg", power: 86, budget: 160000000 },
                        { name: "Spurs", logo: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg", power: 86, budget: 100000000 },
                        { name: "Newcastle", logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg", power: 85, budget: 180000000 },
                        { name: "Aston Villa", logo: "https://upload.wikimedia.org/wikipedia/en/f/f9/Aston_Villa_FC_crest_%282016%29.svg", power: 84, budget: 80000000 },
                        { name: "West Ham", logo: "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg", power: 82, budget: 70000000 },
                        { name: "Brighton", logo: "https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg", power: 82, budget: 60000000 }
                    ]
                },
                {
                    id: "en_ch", name: "Championship", tier: 2,
                    clubs: [
                        { name: "Leeds", logo: "https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg", power: 78, budget: 30000000 },
                        { name: "Sunderland", logo: "https://upload.wikimedia.org/wikipedia/en/7/77/Logo_Sunderland.svg", power: 76, budget: 20000000 },
                        { name: "Burnley", logo: "https://upload.wikimedia.org/wikipedia/en/6/62/Burnley_F.C._Logo.svg", power: 77, budget: 25000000 },
                        { name: "Norwich", logo: "https://upload.wikimedia.org/wikipedia/en/8/8c/Norwich_City.svg", power: 75, budget: 18000000 }
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
                        { name: "Real Madrid", logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg", power: 94, budget: 180000000 },
                        { name: "Barcelona", logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg", power: 90, budget: 80000000 },
                        { name: "Atlético Madrid", logo: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg", power: 88, budget: 70000000 },
                        { name: "Girona", logo: "https://upload.wikimedia.org/wikipedia/en/9/90/For_Girona_FC_article.svg", power: 84, budget: 40000000 },
                        { name: "Athletic Bilbao", logo: "https://upload.wikimedia.org/wikipedia/en/9/98/Club_Athletic_Bilbao_logo.svg", power: 83, budget: 35000000 },
                        { name: "Real Sociedad", logo: "https://upload.wikimedia.org/wikipedia/en/f/f1/Real_Sociedad_logo.svg", power: 83, budget: 40000000 }
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
                        { name: "Inter", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg", power: 89, budget: 80000000 },
                        { name: "Milan", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg", power: 87, budget: 70000000 },
                        { name: "Juventus", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Juventus_FC_2017_logo.svg", power: 86, budget: 90000000 },
                        { name: "Napoli", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Neapel.svg", power: 85, budget: 60000000 },
                        { name: "Atalanta", logo: "https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg", power: 84, budget: 40000000 },
                        { name: "Roma", logo: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg", power: 83, budget: 50000000 }
                    ]
                }
            ]
        },
        {
            id: "de", name: "Alemanha",
            leagues: [
                {
                    id: "de_bu", name: "Bundesliga", tier: 1,
                    clubs: [
                        { name: "Bayer Leverkusen", logo: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg", power: 90, budget: 70000000 },
                        { name: "Bayern", logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg", power: 92, budget: 120000000 },
                        { name: "Dortmund", logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg", power: 87, budget: 80000000 },
                        { name: "RB Leipzig", logo: "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg", power: 86, budget: 90000000 }
                    ]
                }
            ]
        },
        {
            id: "fr", name: "França",
            leagues: [
                {
                    id: "fr_l1", name: "Ligue 1", tier: 1,
                    clubs: [
                        { name: "PSG", logo: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg", power: 91, budget: 150000000 },
                        { name: "Monaco", logo: "https://upload.wikimedia.org/wikipedia/en/b/ba/AS_Monaco_FC.svg", power: 85, budget: 50000000 },
                        { name: "Marseille", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg", power: 84, budget: 40000000 },
                        { name: "Lille", logo: "https://upload.wikimedia.org/wikipedia/en/6/6f/Lille_OSC_2018_logo.svg", power: 82, budget: 35000000 }
                    ]
                }
            ]
        },
        {
            id: "sa", name: "Arábia Saudita",
            leagues: [
                {
                    id: "sa_pl", name: "Saudi Pro League", tier: 1,
                    clubs: [
                        { name: "Al-Hilal", logo: "https://upload.wikimedia.org/wikipedia/en/f/fa/Al_Hilal_SFC_logo.svg", power: 88, budget: 300000000 },
                        { name: "Al-Nassr", logo: "https://upload.wikimedia.org/wikipedia/en/1/11/Al-Nassr_FC_Logo.svg", power: 87, budget: 250000000 },
                        { name: "Al-Ahli", logo: "https://upload.wikimedia.org/wikipedia/en/b/b3/Al-Ahli_Saudi_FC_logo.svg", power: 85, budget: 200000000 },
                        { name: "Al-Ittihad", logo: "https://upload.wikimedia.org/wikipedia/en/c/c1/Al-Ittihad_Club_logo.svg", power: 85, budget: 200000000 }
                    ]
                }
            ]
        },
        {
            id: "us", name: "Estados Unidos",
            leagues: [
                {
                    id: "us_mls", name: "MLS", tier: 1,
                    clubs: [
                        { name: "Inter Miami", logo: "https://upload.wikimedia.org/wikipedia/en/5/5c/Inter_Miami_CF_logo.svg", power: 84, budget: 60000000 },
                        { name: "LA Galaxy", logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Los_Angeles_Galaxy_logo.svg", power: 78, budget: 40000000 },
                        { name: "LAFC", logo: "https://upload.wikimedia.org/wikipedia/en/b/b1/Los_Angeles_FC_logo.svg", power: 79, budget: 45000000 },
                        { name: "New York City", logo: "https://upload.wikimedia.org/wikipedia/en/e/e9/New_York_City_FC.svg", power: 77, budget: 50000000 }
                    ]
                }
            ]
        }
    ]
};
