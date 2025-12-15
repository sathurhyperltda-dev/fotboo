// === CORE DO JOGO: LÓGICA CENTRAL (v17.1 - Ultimate Update) ===

// === ESTADO GLOBAL DO JOGO (Expandido com novos atributos) ===
const state = {
    mode: 'manager', 
    name: '',
    team: null,
    countryId: null,
    leagueId: null,
    week: 1,
    cash: 20000000, // Orçamento inicial ajustado para Manager
    energy: 100,
    morale: 80, 
    market: [], 
    news: "World Pro: Universe carregado e pronto para o Salto Quântico!",
    tactics: 'balance', 
    // Melhoria: Upgrades de Infraestrutura
    upgrades: { stadium: 1, training: 1, academy: 1, medical: 1, marketing: 1 }, 
    myScore: 6.0, 
    history: [],
    currentRival: null,
    currency: 'EUR', 
    player: null,
    // Novo: Estatísticas da Liga
    leagueStandings: [],
    lastMatchResult: null,
    staffs: null, // Será inicializado no manager.js
};

// === SISTEMA DE SAVE (LOCAL STORAGE) ===
const SaveSystem = {
    save: () => {
        const player = state.team ? state.team.squad.find(p => p.isMe) : null;
        if(player) state.player = player;

        const data = { 
            state: state, 
            playerData: (typeof PlayerMode !== 'undefined' && PlayerMode.data) ? PlayerMode.data : null,
            savedAt: new Date().getTime() 
        };
        localStorage.setItem('worldProSave', JSON.stringify(data));
        ui.notify("Jogo guardado com sucesso!", "success");
    },
    load: () => {
        const savedData = localStorage.getItem('worldProSave');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.assign(state, data.state);
            
            // Re-renderiza a tela principal após carregar
            ui.showScreen('screen-game'); 
            ManagerMode.init();
            return true;
        }
        return false;
    }
};

// === UTILITÁRIOS (Expansão) ===
const Utils = {
    formatMoney: (amount) => {
        const symbol = state.currency === 'EUR' ? '€' : '$';
        return `${symbol} ${Math.round(amount).toLocaleString('pt-PT')}`;
    },
    generateID: () => '_' + Math.random().toString(36).substr(2, 9),
    
    // Novo: Gerador de jogadores com ênfase em atributos
    generatePlayer: (clubPower, pos, isMe = false, name = null) => {
        const countryId = state.countryId || 'en';
        const names = DB.names[countryId] || DB.names.en;
        const ovr = Math.max(50, clubPower - 15 + Math.floor(Math.random() * 20));
        const baseVal = ovr * 100000;
        const age = isMe ? 20 : random(17, 34);
        const potential = ovr + random(0, 15);
        
        return {
            id: Utils.generateID(),
            name: name || names[Math.floor(Math.random() * names.length)] + ' ' + names[Math.floor(Math.random() * names.length)],
            pos: pos, 
            ovr: ovr, 
            val: baseVal, 
            isGenerated: !isMe, 
            age: age,
            potential: potential, 
            energy: 100,         
            morale: 100,         
            injured: false,      
            injuryWeeks: 0,      
            stats: { goals: 0, assists: 0, cards: 0 },
            isMe: isMe,
            salary: parseInt(baseVal * 0.01 / 5000) * 5000, 
        };
    },
};

// Função de Randomização
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


// === MÓDULO DE GERAÇÃO DE LIGA/CLUBES ===
const GameUtils = {
    // Inicializa o elenco para o clube
    getSquadForClub: (club, countryId) => {
        const squad = [];
        // NOTA: É necessário que o arquivo database_Jo.js seja carregado ANTES
        const isRealPlayer = (typeof RealPlayers !== 'undefined') ? RealPlayers[club.name] : null; 
        
        if (isRealPlayer) {
            isRealPlayer.forEach(p => {
                const newPlayer = Utils.generatePlayer(club.power, p.pos, false, p.name);
                newPlayer.ovr = p.ovr; // Usa OVR real
                newPlayer.val = newPlayer.ovr * 150000; // Recalcula valor
                newPlayer.salary = parseInt(newPlayer.val * 0.01 / 5000) * 5000;
                squad.push(newPlayer);
            });
        }
        
        const minPlayers = 22; 
        if (squad.length < minPlayers) {
            const needed = minPlayers - squad.length;
            const positions = ['GK', 'DEF', 'DEF', 'LAT', 'MID', 'MID', 'ATT', 'ATT'];
            for(let i=0; i < needed; i++) {
                const pos = positions[Math.floor(Math.random() * positions.length)];
                squad.push(Utils.generatePlayer(club.power, pos));
            }
        }
        
        club.cash = club.budget;
        club.points = 0; // Novo: Tabela de pontos
        
        return squad;
    },
    
    // Novo: Lógica de simulação de partida
    simulateMatch: (clubA, clubB) => {
        // OVR médio é agora dinâmico (apenas jogadores aptos)
        const getOVR = (club) => {
            const aptSquad = club.squad.filter(p => !p.injured && p.energy > 50).slice(0, 11);
            if (aptSquad.length < 7) return club.club.power * 0.7; // Penalidade por falta de jogadores
            return aptSquad.reduce((sum, p) => sum + p.ovr, 0) / aptSquad.length;
        };
        
        const ovrA = getOVR(clubA);
        const ovrB = clubB.club.power; // OVR do clube CPU é simplificado
        
        let scoreA = 0;
        let scoreB = 0;
        const diff = ovrA - ovrB;
        
        // Geração de gols probabilística
        const baseGoals = random(1, 4); 
        for (let i = 0; i < baseGoals; i++) {
            // Chance de gol aumenta com OVR (ajuste para 50% + diferença)
            if (random(0, 100) < 50 + diff * 1.5) { 
                scoreA++;
            } else {
                scoreB++;
            }
        }
        
        return { scoreA, scoreB };
    },
};


// === LÓGICA DO AVANÇO DE SEMANA (CORE DO JOGO) ===
const GameLoop = {
    // Melhoria: Centraliza toda a lógica semanal
    advanceWeek: () => {
        state.week++;
        
        // 1. Pagar Salários e Manutenção
        const totalWages = ManagerMode.calculateWages();
        const maintenance = state.upgrades.stadium * 50000;
        const totalExpenses = totalWages + maintenance;
        state.cash -= totalExpenses;
        
        ui.notify(`💸 Despesas Semanais: -${Utils.formatMoney(totalExpenses)}. Salário e manutenção pagos.`, "info");
        
        // 2. Simular Partida e Receita
        const rival = { club: ManagerMode.getCompetitor(), name: "Rival Aleatório" }; 
        const { scoreA, scoreB } = GameUtils.simulateMatch(state.team, rival);
        
        state.lastMatchResult = { scoreA, scoreB, rival: rival.club.name };

        let matchRevenue = state.upgrades.stadium * 100000; 
        
        if (scoreA > scoreB) {
            state.team.points += 3;
            matchRevenue *= 1.5; 
            ui.notify(`🏆 Vitória! ${scoreA} x ${scoreB} contra ${rival.club.name}. +3 pontos.`, "success");
        } else if (scoreA === scoreB) {
            state.team.points += 1;
            ui.notify(`🤝 Empate. ${scoreA} x ${scoreB} contra ${rival.club.name}. +1 ponto.`, "info");
        } else {
            ui.notify(`😞 Derrota. ${scoreA} x ${scoreB} contra ${rival.club.name}.`, "danger");
        }
        
        state.cash += matchRevenue;
        ui.notify(`💰 Receita do Dia do Jogo: +${Utils.formatMoney(matchRevenue)}.`, "success");

        // 3. Atualizar Jogadores e Lesões (Decaimento e Recuperação)
        state.team.squad.forEach(p => {
            if (p.injured) {
                p.injuryWeeks -= 1;
                if (p.injuryWeeks <= 0) {
                    p.injured = false;
                    ui.notify(`✅ ${p.name} se recuperou da lesão!`, "info");
                }
            } else {
                // Recuperação de energia baseada no nível médico
                const recoveryRate = 10 + (state.upgrades.medical * 5); 
                p.energy = Math.min(100, p.energy + recoveryRate);
                
                // Pequeno decaimento de moral e potencial por idade
                p.morale = Math.max(50, p.morale - 1); 
                if (p.age > 30 && p.ovr > p.potential) p.ovr = Math.max(50, p.ovr - 1); // Atletas velhos caem de nível
            }
        });
        
        // 4. Resetar mercado
        state.market = [];
        ManagerMode.generateMarket();
        
        // 5. Atualiza a UI
        ManagerMode.init('clube'); // Retorna para a aba principal
        SaveSystem.save();
    },
};

// === INTERFACE DO USUÁRIO (UI) ===
const ui = {
    showScreen: (screenId) => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        
        // Atualiza cabeçalho e rodapé quando entra no jogo
        if (screenId === 'screen-game') {
            ui.updateHeader();
            // Inicia a renderização do Manager na aba Clube
            if (state.mode === 'manager') ManagerMode.init('clube');
            else if (state.mode === 'player') PlayerMode.init(); 
        }
        
        // Renderiza a lista de países na seleção inicial
        if (screenId === 'screen-select-club') {
            ui.renderCountryList();
        }
    },
    
    // Novo: Atualização em tempo real do cabeçalho
    updateHeader: () => {
        const teamHeader = document.getElementById('team-header');
        const statusCash = document.getElementById('status-cash');
        const statusWeek = document.getElementById('status-week');

        if (state.team && state.team.club) {
            teamHeader.innerHTML = `
                <img src="${state.team.club.logo}" class="club-logo-header" onerror="this.src='icons/default_logo.png'"/>
                <div class="header-titles">
                    <h4 style="margin:0">${state.team.club.name}</h4>
                    <p style="margin:0; font-size:0.7rem; color:var(--text-muted)">${state.team.club.leagueName}</p>
                </div>
            `;
        } else if (state.player) {
             teamHeader.innerHTML = `<h4 style="margin:0">Carreira de Jogador</h4>`;
        }
        
        statusCash.textContent = `💰 ${Utils.formatMoney(state.cash)}`;
        statusWeek.textContent = `📅 Semana ${state.week}`;
    },
    
    // Sistema de Notificação
    notify: (message, type = 'info') => {
        const notification = document.getElementById('notification-area');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        notification.appendChild(alert);
        
        setTimeout(() => {
            alert.classList.add('fade-out');
            alert.addEventListener('transitionend', () => alert.remove());
        }, 4000);
    },
    
    // Gerenciamento de Modais
    showModal: (modalId) => {
        document.getElementById(modalId).classList.remove('hidden');
    },
    hideModal: (modalId) => {
        document.getElementById(modalId).classList.add('hidden');
    },
    
    // Novo: Renderiza lista de países para seleção
    renderCountryList: () => {
        const list = document.getElementById('country-list');
        list.innerHTML = DB.countries.map(country => `
            <div class="country-card" onclick="ui.selectCountry('${country.id}')">
                <span class="material-icons">${country.id === 'br' ? 'flag_circle' : 'public'}</span>
                <h3>${country.name}</h3>
            </div>
        `).join('');
    },
    
    // Novo: Seleciona País e mostra Ligas
    selectCountry: (countryId) => {
        state.countryId = countryId;
        const country = DB.countries.find(c => c.id === countryId);
        
        const leagueList = document.getElementById('league-list');
        leagueList.innerHTML = country.leagues.map(league => `
            <div class="league-card" onclick="ui.selectLeague('${league.id}')">
                <h3>${league.name}</h3>
                <p>Tier ${league.tier}</p>
            </div>
        `).join('');
        
        document.getElementById('country-list').style.display = 'none';
        document.getElementById('league-title').style.display = 'block';
        leagueList.style.display = 'grid';
        
        document.getElementById('club-title').style.display = 'none';
        document.getElementById('club-list').style.display = 'none';
        document.getElementById('btn-start-manager').style.display = 'none';
    },

    // Novo: Seleciona Liga e mostra Clubes
    selectLeague: (leagueId) => {
        state.leagueId = leagueId;
        const league = DB.countries.find(c => c.id === state.countryId).leagues.find(l => l.id === leagueId);
        
        const clubList = document.getElementById('club-list');
        clubList.innerHTML = league.clubs.map(club => `
            <div class="club-card" onclick="ui.selectClub('${club.name}')">
                <img src="${club.logo}" alt="${club.name} Logo" onerror="this.src='icons/default_logo.png'"/>
                <h3>${club.name}</h3>
                <p>OVR: ${club.power}</p>
                <p>Estádio: ${club.stadium.toLocaleString('pt-PT')}</p>
            </div>
        `).join('');
        
        document.getElementById('league-list').style.display = 'none';
        document.getElementById('club-title').style.display = 'block';
        clubList.style.display = 'grid';
    },

    // Novo: Seleciona Clube (apenas para exibir botão Iniciar)
    selectClub: (clubName) => {
        const league = DB.countries.find(c => c.id === state.countryId).leagues.find(l => l.id === state.leagueId);
        const club = league.clubs.find(c => c.name === clubName);
        
        // Define o clube no estado (temporariamente)
        state.team = { club: club, league: league, squad: [], points: 0 }; 
        
        document.querySelectorAll('.club-card').forEach(card => card.classList.remove('active'));
        document.querySelector(`.club-card h3:contains("${clubName}")`).closest('.club-card').classList.add('active');

        document.getElementById('btn-start-manager').style.display = 'block';
    }
};

// Polifill/Helper para :contains (usado no selectClub)
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}
Element.prototype.closest = function(selector) {
    var el = this;
    while (el && el.nodeType === 1) {
        if (el.matches(selector)) {
            return el;
        }
        el = el.parentNode;
    }
    return null;
};
// Simples helper para o seletor :contains
NodeList.prototype.forEach = Array.prototype.forEach;
// Adiciona um método 'contains' simplificado para strings (apenas para o seletor acima)
Element.prototype.contains = function(str) {
    return this.textContent.includes(str);
};

// Inicialização principal
window.onload = () => {
    // Tenta carregar o jogo
    if (!SaveSystem.load()) {
        ui.showScreen('screen-menu');
    }
};

// NOTA: O arquivo manager.js (enviado na resposta anterior) contém a lógica ManagerMode.handleStartGame()
