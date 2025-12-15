// === CORE DO JOGO: LÓGICA CENTRAL (v17.0 - Quantum Leap) ===

// === ESTADO GLOBAL DO JOGO ===
const state = {
    mode: 'manager', 
    name: '',
    team: null,
    countryId: null,
    leagueId: null,
    week: 1,
    cash: 0, // Caixa do clube ou dinheiro pessoal do jogador
    energy: 100,
    morale: 80, 
    market: [], 
    news: "World Pro: Universe carregado e pronto para o Salto Quântico!",
    tactics: 'balance', 
    upgrades: { stadium: 1, training: 1, academy: 1, marketing: 1 }, 
    myScore: 6.0, 
    history: [],
    currentRival: null,
    currency: 'EUR', // Moeda inicial
    // Referência direta ao jogador da carreira
    player: null 
};

// === SISTEMA DE SAVE (LOCAL STORAGE) ===
const SaveSystem = {
    save: () => {
        // Usa o ID único e a moeda para garantir que o PlayerMode.data seja salvo corretamente
        const player = state.team ? state.team.squad.find(p => p.isMe) : null;
        if(player) state.player = player; // Atualiza a referência do jogador no state

        const data = { 
            state: state, 
            playerData: (typeof PlayerMode !== 'undefined' && PlayerMode.data) ? PlayerMode.data : null,
            savedAt: new Date().getTime() 
        };
        localStorage.setItem('WPU_Save_v17', JSON.stringify(data));
        ui.notify("Jogo guardado com sucesso!", "success");
    },
    load: () => {
        const raw = localStorage.getItem('WPU_Save_v17');
        if (!raw) return ui.notify("Nenhum save encontrado.", "error");
        
        const data = JSON.parse(raw);
        Object.assign(state, data.state);
        
        // Restaura dados do modo Jogador se existirem
        if (data.playerData && typeof PlayerMode !== 'undefined') {
            Object.assign(PlayerMode.data, data.playerData);
        }
        
        // Reconstrói referências
        const country = DB.countries.find(c => c.id === state.countryId);
        if (country) {
            const league = country.leagues.find(l => l.id === state.leagueId);
            if (league) {
                state.team = league.clubs.find(c => c.name === state.team.name);
                // Reconecta a referência do jogador da carreira dentro do squad carregado
                state.player = state.team.squad.find(p => p.isMe) || null;
            }
        }
        
        ui.show('screen-hub');
        ui.updateAll();
        Utils.pickNextRival();
    },
    hasSave: () => localStorage.getItem('WPU_Save_v17') !== null
};

// === INICIALIZAÇÃO ===
document.addEventListener('DOMContentLoaded', () => {
    if (typeof DB === 'undefined') return alert("ERRO CRÍTICO: database.js não carregado.");
    
    // Verifica Save
    if (SaveSystem.hasSave()) document.getElementById('btn-continue').classList.remove('hidden');

    // Popula Países
    const selNation = document.getElementById('input-nation');
    DB.countries.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.innerText = c.name;
        selNation.appendChild(opt);
    });

    // Popula Moedas na Criação
    const selCurrency = document.getElementById('input-currency');
    if (selCurrency) {
        selCurrency.innerHTML = '';
        ['EUR', 'BRL', 'USD', 'GBP'].forEach(code => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.innerText = `${code} (${Utils.getCurrencySymbol(code)})`;
            selCurrency.appendChild(opt);
        });
        selCurrency.value = 'EUR';
    }


    // === EVENTOS E BINDINGS ===
    document.getElementById('btn-new-game').onclick = () => ui.show('screen-create');
    document.getElementById('btn-continue').onclick = SaveSystem.load;
    document.getElementById('btn-back-menu').onclick = () => ui.show('screen-menu');
    document.getElementById('btn-start-career').onclick = Game.start;
    
    // Botões de Configuração (Modais)
    document.getElementById('btn-settings').onclick = () => ui.showModal('modal-settings');
    document.getElementById('action-save').onclick = SaveSystem.save;
    document.getElementById('action-quit').onclick = () => ui.show('screen-menu');
    document.getElementById('action-currency').onclick = Utils.toggleCurrency;

    // Lógica de Posição (Manager vs Player)
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.mode = e.currentTarget.dataset.mode;
            
            const posGroup = document.getElementById('pos-group');
            if (state.mode === 'manager') posGroup.classList.add('hidden');
            else posGroup.classList.remove('hidden');
        };
    });

    document.getElementById('btn-pre-match').onclick = () => {
        if (state.energy < 15) return ui.notify("Energia insuficiente para jogar!", "error");
        
        if (state.mode === 'manager') ui.showTacticsModal();
        else Match.setup('balance'); 
    };

    // Navegação Abas
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = (e) => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            ui.renderTab(e.currentTarget.dataset.tab);
        };
    });

    // Match e Modais
    document.getElementById('btn-finish-match').onclick = Match.finish;
    document.querySelector('#modal-tactics .btn-close-modal').onclick = () => ui.hideModal('modal-tactics');
    document.getElementById('btn-event-action').onclick = () => ui.hideModal('modal-event');
    
    Utils.pickNextRival();
});

// === NÚCLEO DO JOGO ===
const Game = {
    start: () => {
        const nameInput = document.getElementById('input-name').value;
        const nationId = document.getElementById('input-nation').value;
        const currencyInput = document.getElementById('input-currency').value;
        
        if(!nameInput || !nationId) return alert("Por favor preencha todos os dados.");

        state.name = nameInput;
        state.countryId = nationId;
        state.currency = currencyInput; // Define a moeda
        
        let targetTier = 1; 
        const country = DB.countries.find(c => c.id === nationId);
        const leagueData = country.leagues.find(l => l.tier === targetTier) || country.leagues[0];
        state.leagueId = leagueData.id;

        // Gera Clubes Híbridos (Elencos)
        leagueData.clubs.forEach(club => {
            club.pts = 0;
            club.played = 0;
            club.squad = Utils.generateSquad(club, nationId);
        });

        state.team = leagueData.clubs[Math.floor(Math.random() * leagueData.clubs.length)];
        
        // Configuração Inicial de Caixa
        if (state.mode === 'player') {
            const pos = document.getElementById('input-pos').value;
            const newPlayer = {
                id: Utils.generateID(), // ID ÚNICO
                name: state.name, pos: pos, ovr: 72, val: 0, isMe: true, age: 18,
                stats: { goals: 0, assists: 0, cards: 0 },
                attrs: Utils.getInitialPlayerAttributes(pos)
            };
            state.team.squad.unshift(newPlayer);
            state.player = newPlayer; // Define a referência do jogador
            state.cash = 2000; // Dinheiro Pessoal
        } else {
            state.cash = state.team.budget; // Budget do Clube
        }
        
        // Inicializa a escalação do time
        if (typeof TransferMode !== 'undefined') {
            TransferMode.setupInitialLineup();
        }

        Game.refreshMarket();
        Utils.pickNextRival();
        ui.show('screen-hub');
        ui.updateAll();
        SaveSystem.save();
    },

    advanceWeek: () => {
        state.week++;
        state.energy = Math.min(100, state.energy + 25);
        
        // DÉBITO SEMANAL (Manager)
        if(state.mode === 'manager' && typeof ManagerMode !== 'undefined') {
            const wages = ManagerMode.calculateWages();
            state.cash -= wages; 
        }
        
        // Simulação da Liga
        const country = DB.countries.find(c => c.id === state.countryId);
        const league = country.leagues.find(l => l.id === state.leagueId);
        
        league.clubs.forEach(club => {
            if (club !== state.team) {
                const luck = Math.random() * 100;
                if (luck + club.power > 130) club.pts += 3;
                else if (luck + club.power > 100) club.pts += 1;
                club.played++;
            }
        });

        // Ganho Semanal (Modo Jogador)
        if (state.mode === 'player') {
            state.cash += 5000; 
            ui.notify("Recebeste o teu salário semanal.", "info");
        }

        Utils.pickNextRival();
        Game.refreshMarket();
        if(Math.random() < 0.15) Utils.triggerEvent();
        SaveSystem.save();
    },

    refreshMarket: () => { 
        state.market = [];
        const randomCountry = DB.countries[Math.floor(Math.random() * DB.countries.length)];
        const names = DB.names[randomCountry.id] || DB.names.en;
        
        for (let i = 0; i < 8; i++) {
            const positions = ['GK', 'DEF', 'MID', 'ATT'];
            const pos = positions[Math.floor(Math.random() * positions.length)];
            const ovr = 70 + Math.floor(Math.random() * 18);
            
            state.market.push({
                name: names[Math.floor(Math.random() * names.length)],
                pos: pos, ovr: ovr, val: ovr * 200000, from: randomCountry.name,
                id: Utils.generateID()
            });
        }
    }
};

// === PARTIDA ===
const Match = {
    timer: null,
    min: 0,
    score: [0, 0],

    setup: (tacticId) => {
        if (state.energy < 15) return ui.notify("Energia insuficiente. Descansa!", "error");
        
        Match.score = [0, 0];
        Match.min = 0;
        
        state.tactics = tacticId;
        
        ui.show('screen-match');
        ui.hideModal('modal-tactics');
        document.getElementById('match-feed-list').innerHTML = '';
        document.getElementById('btn-finish-match').classList.add('hidden');
        
        const rival = state.currentRival;

        document.getElementById('match-home-badge').src = state.team.logo;
        document.getElementById('match-away-badge').src = rival.logo;
        document.getElementById('score-home').innerText = Match.score[0];
        document.getElementById('score-away').innerText = Match.score[1];

        state.energy -= 15;
        
        Match.timer = setInterval(Match.loop, 70);
    },

    loop: () => {
        Match.min++;
        document.getElementById('match-timer').innerText = Match.min + "'";
        
        const ball = document.getElementById('ball');
        ball.style.left = Math.random() * 90 + '%';
        ball.style.top = Math.random() * 90 + '%';

        let tacticBonus = 0;
        if(state.mode === 'manager' && window.DB) {
            const tac = DB.tactics.find(t => t.id === state.tactics);
            if(tac) tacticBonus = tac.bonus / 100;
        }

        if (Math.random() < 0.035) {
            const myChance = 0.5 + tacticBonus + ((state.morale - 50) / 200);
            
            if (Math.random() < myChance) {
                Match.score[0]++;
                Match.log(`GOL DO ${state.team.name.toUpperCase()}!`, 'goal');
                state.morale = Math.min(100, state.morale + 2);
                
                // Atualiza estatísticas do jogador da carreira (simplificado)
                if (state.mode === 'player' && state.player) {
                    state.player.stats.goals = (state.player.stats.goals || 0) + 1;
                }
            } else {
                Match.score[1]++;
                Match.log("Golo do adversário...", 'bad');
                state.morale = Math.max(0, state.morale - 2);
            }
            document.getElementById('score-home').innerText = Match.score[0];
            document.getElementById('score-away').innerText = Match.score[1];
        }

        if (Match.min >= 90) Match.end();
    },

    end: () => {
        clearInterval(Match.timer);
        document.getElementById('btn-finish-match').classList.remove('hidden');
    },

    finish: () => {
        if (Match.score[0] > Match.score[1]) {
            state.team.pts += 3;
            if(state.mode === 'manager') state.cash += 300000;
            state.news = `Vitória contra o ${state.currentRival.name} por ${Match.score[0]}x${Match.score[1]}!`;
        } else if (Match.score[0] === Match.score[1]) {
            state.team.pts += 1;
            if(state.mode === 'manager') state.cash += 100000;
            state.news = `Empate sofrido contra o ${state.currentRival.name}.`;
        } else {
            state.news = `Derrota para o ${state.currentRival.name}. É preciso levantar a cabeça.`;
        }
        state.team.played++;
        
        Game.advanceWeek();
        ui.show('screen-hub');
        ui.updateAll();
        ui.renderTab('league');
    },

    log: (msg, type) => {
        const list = document.getElementById('match-feed-list');
        const li = document.createElement('li');
        li.innerText = `${Match.min}' ${msg}`;
        if (type) li.classList.add(type);
        list.prepend(li);
    }
};

// === INTERFACE (UI) ===
const ui = {
    show: (id) => {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active'); s.classList.add('hidden');
        });
        const el = document.getElementById(id);
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('active'), 50);
    },
    
    showModal: (id) => document.getElementById(id).classList.remove('hidden'),
    hideModal: (id) => document.getElementById(id).classList.add('hidden'),

    updateAll: () => {
        if(!state.team) return;
        const country = DB.countries.find(c => c.id === state.countryId);
        const league = country.leagues.find(l => l.id === state.leagueId);

        document.getElementById('ui-team-name').innerText = state.team.name;
        document.getElementById('ui-badge').src = state.team.logo;
        document.getElementById('ui-league-name').innerText = league.name;
        
        // Exibe a moeda correta e o valor formatado
        document.getElementById('ui-cash').innerText = Utils.formatMoney(state.cash);
        document.getElementById('ui-currency-symbol').innerText = Utils.getCurrencySymbol(state.currency);

        document.getElementById('ui-energy').innerText = state.energy;
        document.getElementById('ui-news').innerText = state.news;
        
        const rival = state.currentRival || { name: 'Aguardando Sorteio...', logo: '', power: 0 };
        const vsAreaImg = document.querySelector('.vs-area img:nth-child(3)');
        const vsAreaBadge = document.querySelector('.vs-area .badge');

        if(vsAreaImg) vsAreaImg.src = rival.logo;
        if(vsAreaBadge) vsAreaBadge.innerText = rival.name;
    },

    renderTab: (tab) => {
        const container = document.getElementById('main-content');
        container.innerHTML = ''; 

        if (tab === 'home') {
            const moraleColor = state.morale > 70 ? '#22c55e' : (state.morale < 40 ? '#ef4444' : '#fbbf24');
            container.innerHTML = `
                <div class="card highlight">
                    <h3>ESTADO ATUAL (Jornada ${state.week})</h3>
                    <div style="margin-top:10px;">
                        <p>Moral da Equipa</p>
                        <div style="background:#333; height:10px; border-radius:5px; margin-top:5px;">
                            <div style="width:${state.morale}%; background:${moraleColor}; height:100%; border-radius:5px;"></div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <h3 style="color:#aaa">PRÓXIMO JOGO</h3>
                    <div class="vs-area">
                        <img src="${state.team.logo}" width="50">
                        <span>VS</span>
                        <img src="${state.currentRival.logo}" width="50">
                    </div>
                    <p style="text-align:center; font-weight:bold">${state.currentRival.name}</p>
                </div>
            `;
        } else if (tab === 'club') {
            if (state.mode === 'player') {
                if(typeof PlayerMode !== 'undefined') PlayerMode.init();
                else container.innerHTML = "Erro: Módulo Jogador não carregado.";
            } else {
                if(typeof ManagerMode !== 'undefined') ManagerMode.init();
                else container.innerHTML = "Erro: Módulo Manager não carregado.";
            }
        } else if (tab === 'squad') {
             // Roteia para o módulo Transfer para gerenciar o elenco completo
            if(typeof TransferMode !== 'undefined') TransferMode.initSquadView();
            else container.innerHTML = `<div class="card"><p>Erro: Módulo de Elenco não carregado.</p></div>`;
            
        } else if (tab === 'transfer' || tab === 'market') {
            // Roteia para o módulo Transfer para gerenciar negociações e mercado
             if(typeof TransferMode !== 'undefined') TransferMode.initMarketView();
             else container.innerHTML = `<div class="card"><p>Erro: Módulo de Transferências não carregado.</p></div>`;

        } else if (tab === 'training') {
            // Roteia para o módulo Jogador para Treinamento (mesmo no Manager, se for focado no treino individual)
             if(state.mode === 'player' && typeof PlayerMode !== 'undefined') PlayerMode.initTrainingView();
             else container.innerHTML = `<div class="card"><p>Treinamento avançado disponível apenas para o modo Carreira Jogador.</p></div>`;
            
        } else if (tab === 'league') {
            const country = DB.countries.find(c => c.id === state.countryId);
            const league = country.leagues.find(l => l.id === state.leagueId);
            const sorted = [...league.clubs].sort((a,b) => b.pts - a.pts);

            sorted.forEach((club, i) => {
                let style = club.name === state.team.name ? 'background: rgba(59,130,246,0.2); border: 1px solid #3b82f6;' : '';
                container.innerHTML += `
                    <div class="card small" style="${style}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <strong>${i+1}º</strong>
                                <img src="${club.logo}" width="20">
                                <span>${club.name}</span>
                            </div>
                            <strong>${club.pts}</strong>
                        </div>
                    </div>
                `;
            });
        }
    },

    showTacticsModal: () => {
        const modal = document.getElementById('modal-tactics');
        const list = document.getElementById('tactics-list');
        list.innerHTML = '';
        
        DB.tactics.forEach(t => {
            list.innerHTML += `
                <div class="card clickable" onclick="Match.setup('${t.id}')">
                    <h4>${t.name}</h4>
                    <p style="font-size:0.8rem; color:#aaa">${t.desc}</p>
                    <div style="margin-top:5px; font-size:0.8rem;">
                        <span style="color:#4ade80">Bónus: ${t.bonus}%</span> | 
                        <span style="color:#ef4444">Risco: ${t.risk}%</span>
                    </div>
                </div>
            `;
        });
        ui.showModal('modal-tactics');
    },

    notify: (msg, type) => {
        state.news = msg;
        const newsEl = document.getElementById('ui-news');
        if(newsEl) newsEl.innerText = msg;
    }
};

// === UTILITÁRIOS ===
const Utils = {
    getCurrencySymbol: (code) => {
        switch(code) {
            case 'EUR': return '€';
            case 'BRL': return 'R$';
            case 'USD': return '$';
            case 'GBP': return '£';
            default: return 'C';
        }
    },
    
    toggleCurrency: () => {
        state.currency = (state.currency === 'EUR' ? 'BRL' : (state.currency === 'BRL' ? 'USD' : 'EUR'));
        document.getElementById('action-currency').innerText = `MUDAR MOEDA (${state.currency})`;
        ui.updateAll();
        SaveSystem.save();
    },
    
    formatMoney: (val) => {
        const code = state.currency;
        // Usa Intl.NumberFormat para formatação profissional
        try {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
        } catch (e) {
            // Fallback para símbolos simples
            return Utils.getCurrencySymbol(code) + val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
    },

    pickNextRival: () => {
        if (!state.team) return; 

        const country = DB.countries.find(c => c.id === state.countryId);
        const league = country.leagues.find(l => l.id === state.leagueId);
        
        const rivals = league.clubs.filter(c => c.name !== state.team.name);
        
        if (rivals.length > 0) {
            const randomIndex = Math.floor(Math.random() * rivals.length);
            state.currentRival = rivals[randomIndex];
        } else {
            state.currentRival = { name: "Adversário Genérico", logo: "", power: 70 };
        }
        ui.updateAll();
    },

    generateID: () => {
        return Math.random().toString(36).substring(2, 9);
    },
    
    // Geração de Atributos Iniciais para o jogador da carreira
    getInitialPlayerAttributes: (pos) => {
        const baseAttrs = { finishing: 60, passing: 60, tackling: 60, speed: 65, stamina: 65, handling: 40 };
        const initialRating = 72; // OVR de um jovem promissor
        const boost = (initialRating - 60) * 1.5; // Ajusta o boost baseado no OVR inicial

        if (pos === 'ATT') baseAttrs.finishing += boost;
        else if (pos === 'MID') baseAttrs.passing += boost;
        else if (pos === 'DEF') baseAttrs.tackling += boost;
        else if (pos === 'GK') baseAttrs.handling += boost;

        return baseAttrs;
    },
    
    // Geração de elenco híbrido para times da IA
    generateSquad: (club, countryId) => {
        let squad = [];
        if (typeof RealPlayers !== 'undefined' && RealPlayers[club.name]) {
            squad = JSON.parse(JSON.stringify(RealPlayers[club.name]));
            squad.forEach(p => { 
                p.id = Utils.generateID(); // Garante ID único
                if(!p.val) p.val = p.ovr * 150000; 
                // Inicializa stats se estiverem faltando (para jogadores reais)
                if(!p.stats) p.stats = { goals: 0, assists: 0, cards: 0 };
            });
        }
        const minPlayers = 15;
        if (squad.length < minPlayers) {
            const needed = minPlayers - squad.length;
            const names = DB.names[countryId] || DB.names.en;
            const positions = ['GK', 'DEF', 'MID', 'ATT'];
            for(let i=0; i < needed; i++) {
                const pos = positions[Math.floor(Math.random() * positions.length)];
                const ovr = Math.max(55, club.power - 10 + Math.floor(Math.random() * 10));
                squad.push({
                    id: Utils.generateID(),
                    name: names[Math.floor(Math.random() * names.length)],
                    pos: pos, ovr: ovr, val: ovr * 100000, isGenerated: true, age: 25,
                    stats: { goals: 0, assists: 0, cards: 0 }
                });
            }
        }
        return squad;
    },
    
    triggerEvent: () => {
        const modal = document.getElementById('modal-event');
        document.getElementById('evt-title').innerText = "Notícia";
        document.getElementById('evt-desc').innerText = "A direção está satisfeita com o teu trabalho.";
        ui.showModal('modal-event');
    }
};