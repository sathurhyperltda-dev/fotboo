// === ESTADO GLOBAL DO JOGO ===
const state = {
    mode: 'manager', // 'manager' ou 'player'
    name: '',
    team: null,
    countryId: null,
    leagueId: null,
    week: 1,
    cash: 0,
    energy: 100,
    morale: 80, // Moral da equipe
    market: [], // Jogadores à venda
    news: "World Pro: Universe carregado com sucesso!",
    tactics: 'balance', // Tática ativa
    upgrades: { stadium: 1, training: 1, academy: 1, marketing: 1 }, // Upgrades do Manager
    myScore: 6.0, // Nota do jogador
    history: [],
    // CORRIGIDO: Variável que armazena o adversário da próxima partida
    currentRival: null 
};

// === SISTEMA DE SAVE (LOCAL STORAGE) ===
const SaveSystem = {
    save: () => {
        // NOVO: Salva os dados do Modo Jogador (PlayerMode.data) se ele existir
        const data = { 
            state: state, 
            playerData: (typeof PlayerMode !== 'undefined') ? PlayerMode.data : null,
            savedAt: new Date().getTime() 
        };
        localStorage.setItem('WPU_Save_v16', JSON.stringify(data));
        ui.notify("Jogo guardado com sucesso!", "success");
    },
    load: () => {
        const raw = localStorage.getItem('WPU_Save_v16');
        if (!raw) return ui.notify("Nenhum save encontrado.", "error");
        
        const data = JSON.parse(raw);
        Object.assign(state, data.state);
        
        // Recupera dados do modo Jogador se existirem
        if (data.playerData && typeof PlayerMode !== 'undefined') {
            Object.assign(PlayerMode.data, data.playerData);
        }
        
        // Reconstrói referências do time
        const country = DB.countries.find(c => c.id === state.countryId);
        if (country) {
            const league = country.leagues.find(l => l.id === state.leagueId);
            if (league) {
                // Garante que state.team aponte para o objeto correto dentro da liga
                state.team = league.clubs.find(c => c.name === state.team.name);
            }
        }
        
        ui.show('screen-hub');
        ui.updateAll();
        // Garante que o hub mostre o rival correto ao carregar
        Utils.pickNextRival();
    },
    hasSave: () => localStorage.getItem('WPU_Save_v16') !== null
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

    // === EVENTOS ===
    document.getElementById('btn-new-game').onclick = () => ui.show('screen-create');
    document.getElementById('btn-continue').onclick = SaveSystem.load;
    document.getElementById('btn-back-menu').onclick = () => ui.show('screen-menu');
    document.getElementById('btn-start-career').onclick = Game.start;
    
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

    // Botão JOGAR
    document.getElementById('btn-pre-match').onclick = () => {
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
    document.querySelector('.btn-close-modal').onclick = () => document.getElementById('modal-tactics').classList.add('hidden');
    document.getElementById('btn-event-action').onclick = () => document.getElementById('modal-event').classList.add('hidden');
    
    // Configura o primeiro rival ao carregar a página
    Utils.pickNextRival();
});

// === NÚCLEO DO JOGO ===
const Game = {
    start: () => {
        const nameInput = document.getElementById('input-name').value;
        const nationId = document.getElementById('input-nation').value;
        
        if(!nameInput || !nationId) return alert("Por favor preencha todos os dados.");

        state.name = nameInput;
        state.countryId = nationId;
        
        let targetTier = 1; 
        const country = DB.countries.find(c => c.id === nationId);
        const leagueData = country.leagues.find(l => l.tier === targetTier) || country.leagues[0];
        state.leagueId = leagueData.id;

        // Gera Clubes Híbridos
        leagueData.clubs.forEach(club => {
            club.pts = 0;
            club.played = 0;
            club.squad = Utils.generateSquad(club, nationId);
        });

        state.team = leagueData.clubs[Math.floor(Math.random() * leagueData.clubs.length)];
        
        if (state.mode === 'player') {
            const pos = document.getElementById('input-pos').value;
            state.team.squad.unshift({
                name: state.name, pos: pos, ovr: 72, val: 0, isMe: true
            });
            state.cash = 2000; 
        } else {
            state.cash = state.team.budget;
        }

        Game.refreshMarket();
        Utils.pickNextRival(); // Define o primeiro adversário para o jogo
        ui.show('screen-hub');
        ui.updateAll();
        SaveSystem.save();
    },

    advanceWeek: () => {
        state.week++;
        state.energy = Math.min(100, state.energy + 25);
        
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

        // Salário Semanal (Modo Jogador)
        if (state.mode === 'player') {
            state.cash += 5000; 
            ui.notify("Recebeste o teu salário semanal.", "info");
        }

        Utils.pickNextRival(); // Sorteia novo adversário
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
                pos: pos, ovr: ovr, val: ovr * 200000, from: randomCountry.name
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
        
        // CORREÇÃO CRÍTICA: ZERAR PLACAR E TEMPO ANTES DE INICIAR
        Match.score = [0, 0];
        Match.min = 0;
        
        state.tactics = tacticId;
        
        ui.show('screen-match');
        document.getElementById('modal-tactics').classList.add('hidden');
        document.getElementById('match-feed-list').innerHTML = '';
        document.getElementById('btn-finish-match').classList.add('hidden');
        
        const rival = state.currentRival; // Pega o rival sorteado

        document.getElementById('match-home-badge').src = state.team.logo;
        document.getElementById('match-away-badge').src = rival.logo;
        
        // CORRIGIDO: Zera placar visual
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
            } else {
                Match.score[1]++;
                Match.log("Golo do adversário...", 'bad');
                state.morale = Math.max(0, state.morale - 2);
            }
            // CORRIGIDO: Renderiza placar sempre que há gol
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

// === INTERFACE (UI) e UTILITÁRIOS ===
const ui = {
    show: (id) => {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active'); s.classList.add('hidden');
        });
        const el = document.getElementById(id);
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('active'), 50);
    },

    updateAll: () => {
        if(!state.team) return;
        const country = DB.countries.find(c => c.id === state.countryId);
        const league = country.leagues.find(l => l.id === state.leagueId);

        document.getElementById('ui-team-name').innerText = state.team.name;
        document.getElementById('ui-badge').src = state.team.logo;
        document.getElementById('ui-league-name').innerText = league.name;
        document.getElementById('ui-cash').innerText = Utils.formatMoney(state.cash);
        document.getElementById('ui-energy').innerText = state.energy;
        document.getElementById('ui-news').innerText = state.news;
        
        // NOVO: Atualiza a info do adversário no Hub
        const rival = state.currentRival || { name: 'Sorteando...', logo: '', power: 0 };
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
                    <h3>ESTADO ATUAL</h3>
                    <div style="margin-top:10px;">
                        <p>Moral da Equipa</p>
                        <div style="background:#333; height:10px; border-radius:5px; margin-top:5px;">
                            <div style="width:${state.morale}%; background:${moraleColor}; height:100%; border-radius:5px;"></div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <h3 style="color:#aaa">PRÓXIMO JOGO (Jornada ${state.week})</h3>
                    <div class="vs-area">
                        <img src="${state.team.logo}" width="50">
                        <span>VS</span>
                        <div class="badge">${state.currentRival ? state.currentRival.name : 'Aguardando...'}</div>
                    </div>
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
            state.team.squad.forEach(p => {
                const style = p.isMe ? 'border-left: 3px solid #3b82f6' : '';
                container.innerHTML += `
                    <div class="card" style="${style}">
                        <div class="player-row">
                            <div class="pos-badge ${p.pos}">${p.pos}</div>
                            <div class="player-info">
                                <strong>${p.name}</strong>
                                <small>OVR ${p.ovr} | ${Utils.formatMoney(p.val)}</small>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else if (tab === 'market') {
            if (state.mode === 'player') {
                container.innerHTML = `<div class="card"><p>Apenas Managers podem contratar jogadores.</p></div>`;
                return;
            }
            state.market.forEach((p, idx) => {
                 container.innerHTML += `
                    <div class="card">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <strong>${p.name}</strong>
                                <div style="font-size:0.8rem; color:#aaa">${p.pos} | ${p.from}</div>
                            </div>
                            <button class="btn-small" onclick="Utils.buyPlayer(${idx})">
                                ${Utils.formatMoney(p.val)}
                            </button>
                        </div>
                    </div>
                 `;
             });
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
        modal.classList.remove('hidden');
    },

    notify: (msg, type) => {
        state.news = msg;
        const newsEl = document.getElementById('ui-news');
        if(newsEl) newsEl.innerText = msg;
    }
};

const Utils = {
    // CORRIGIDO: Agora seleciona um adversário diferente a cada chamada
    pickNextRival: () => {
        if (!state.team) return; 

        const country = DB.countries.find(c => c.id === state.countryId);
        const league = country.leagues.find(l => l.id === state.leagueId);
        
        // Filtra times que não são o time do jogador
        const rivals = league.clubs.filter(c => c.name !== state.team.name);
        
        if (rivals.length > 0) {
            const randomIndex = Math.floor(Math.random() * rivals.length);
            state.currentRival = rivals[randomIndex];
        } else {
            // Fallback caso seja a única equipa na liga (improvável)
            state.currentRival = { name: "Adversário Genérico", logo: "", power: 70 };
        }
    },
    
    generateSquad: (club, countryId) => {
        let squad = [];
        if (typeof RealPlayers !== 'undefined' && RealPlayers[club.name]) {
            squad = JSON.parse(JSON.stringify(RealPlayers[club.name]));
            squad.forEach(p => { if(!p.val) p.val = p.ovr * 150000; });
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
                    name: names[Math.floor(Math.random() * names.length)],
                    pos: pos, ovr: ovr, val: ovr * 100000, isGenerated: true
                });
            }
        }
        return squad;
    },
    formatMoney: (val) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
        if (val >= 1000) return (val / 1000).toFixed(1) + "K";
        return val;
    },
    buyPlayer: (idx) => {
        const p = state.market[idx];
        if (state.cash >= p.val) {
            state.cash -= p.val;
            state.team.squad.push(p);
            state.market.splice(idx, 1);
            ui.notify(`Contratado: ${p.name}!`, "success");
            ui.updateAll();
            ui.renderTab('market');
            SaveSystem.save();
        } else {
            ui.notify("Saldo insuficiente!", "error");
        }
    },
    triggerEvent: () => {
        const modal = document.getElementById('modal-event');
        document.getElementById('evt-title').innerText = "Notícia";
        document.getElementById('evt-desc').innerText = "A direção está satisfeita com o teu trabalho.";
        modal.classList.remove('hidden');
    }
};
