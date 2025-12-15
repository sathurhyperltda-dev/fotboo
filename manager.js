// === MÓDULO DE GESTÃO: LÓGICA DO MANAGER (v17.1 - Ultimate Update) ===

const ManagerMode = {
    // ONDE A CORREÇÃO COMEÇA: Gerencia a navegação por abas dentro do modo Manager
    init: (activeTab = 'clube') => {
        const content = document.getElementById('main-content');
        content.innerHTML = ManagerMode.renderDashboard(activeTab);
        
        // Inicializa o staff e o mercado se não existirem
        if (!state.staffs) state.staffs = ManagerMode.initializeStaffs();
        if (state.market.length === 0) ManagerMode.generateMarket();
    },
    
    // Novo: Gera a lista de jogadores do mercado
    generateMarket: () => {
        const league = DB.countries.find(c => c.id === state.countryId).leagues.find(l => l.id === state.leagueId);
        const avgPower = league.clubs.reduce((sum, c) => sum + c.power, 0) / league.clubs.length;
        
        for (let i = 0; i < 8; i++) {
            const pos = ['GK', 'DEF', 'MID', 'ATT'][random(0, 3)];
            state.market.push(Utils.generatePlayer(avgPower, pos));
        }
    },
    
    // === RENDERIZAÇÃO PRINCIPAL COM ABAS ===
    renderDashboard: (activeTab) => {
        const totalWages = ManagerMode.calculateWages();
        const tabs = [
            { id: 'clube', name: '💰 Clube & Finanças' },
            { id: 'elenco', name: '📋 Elenco & Táticas' }, // CORRIGIDO
            { id: 'treino', name: '🏋️ Treino & Staff' }, // CORRIGIDO
            { id: 'transferencias', name: '🤝 Mercado' } // CORRIGIDO
        ];

        let contentHtml = '';
        if (activeTab === 'clube') contentHtml = ManagerMode.renderClubOverview();
        else if (activeTab === 'elenco') contentHtml = ManagerMode.renderSquad();
        else if (activeTab === 'treino') contentHtml = ManagerMode.renderTraining();
        else if (activeTab === 'transferencias') contentHtml = ManagerMode.renderTransferMarket();

        // Novo: Painel de Resultados
        const lastMatch = state.lastMatchResult;
        const matchDisplay = lastMatch 
            ? `<div class="card" style="padding:10px; text-align:center;">Última Partida: <strong>${state.team.club.name} ${lastMatch.scoreA} x ${lastMatch.scoreB} ${lastMatch.rival}</strong></div>`
            : '';

        return `
            <div class="manager-dashboard">
                ${matchDisplay}
                
                <div class="tab-navigation card">
                    ${tabs.map(tab => `
                        <button class="btn-tab ${activeTab === tab.id ? 'active' : ''}" 
                                onclick="ManagerMode.init('${tab.id}')">
                            ${tab.name}
                        </button>
                    `).join('')}
                </div>
                <div id="manager-content-area">
                    ${contentHtml}
                </div>
                
                <div class="card action-panel">
                    <h3>Próxima Semana</h3>
                    <p>Custo semanal: ${Utils.formatMoney(totalWages + state.upgrades.stadium * 50000)}</p>
                    <button class="btn-full primary" onclick="GameLoop.advanceWeek()">
                        ➡️ AVANÇAR SEMANA ${state.week}
                    </button>
                </div>
            </div>
        `;
    },
    
    // === 1. TELA ELENCO (CORREÇÃO DE "ELENCO NAO ABRE") ===
    renderSquad: () => {
        // Melhoria: Tabela de elenco formatada com status
        const playerList = state.team.squad.map((p, index) => {
            const status = p.injured ? `<span class="tag danger">🚑 ${p.injuryWeeks} Sem</span>` : 
                           p.energy < 70 ? `<span class="tag warning">😴 ${p.energy}%</span>` : 
                           `<span class="tag success">✅ ${p.energy}%</span>`;
            
            return `
                <tr>
                    <td>${p.pos}</td>
                    <td>${p.name}</td>
                    <td>${p.ovr}</td>
                    <td>${p.age}</td>
                    <td>${status}</td>
                    <td>${Utils.formatMoney(p.val)}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="card">
                <h4>Estatísticas do Plantel</h4>
                <div class="squad-stats">
                    <p>OVR Médio: <strong>${Math.round(state.team.squad.reduce((sum, p) => sum + p.ovr, 0) / state.team.squad.length)}</strong></p>
                    <p>Táticas: ${state.tactics}</p>
                    <button class="btn-small secondary" onclick="ManagerMode.handleTacticChange()">Mudar Tática</button>
                </div>
                
                <h4 style="margin-top:20px;">Jogadores (${state.team.squad.length})</h4>
                <table class="data-table">
                    <thead><tr><th>POS</th><th>NOME</th><th>OVR</th><th>IDADE</th><th>STATUS</th><th>VALOR</th></tr></thead>
                    <tbody>${playerList}</tbody>
                </table>
            </div>
        `;
    },
    
    // === 2. TELA TREINO (CORREÇÃO DE "TREINO NAO ABRE") ===
    renderTraining: () => {
        // Novo: Staff de Treinamento
        const coach = state.staffs.coach;
        
        return `
            <div class="card">
                <h4>🏋️ Opções de Treino Semanal</h4>
                <p>O nível do seu Centro de Treinamento (Nível ${state.upgrades.training}) influencia no ganho de OVR.</p>
                <p>Treinador Principal: ${coach.name} (Skill ${coach.skill})</p>

                <div class="action-grid">
                    <button class="btn-full primary" onclick="ManagerMode.handleTraining('low')">
                        TREINO LEVE<br><small>Baixo ganho, Baixo risco. Recupera energia.</small>
                    </button>
                    <button class="btn-full secondary" onclick="ManagerMode.handleTraining('medium')">
                        TREINO TÁTICO<br><small>Ganho moderado, Risco médio de lesão.</small>
                    </button>
                    <button class="btn-full danger" onclick="ManagerMode.handleTraining('high')">
                        TREINO INTENSO<br><small>Alto ganho, Alto risco de lesão. Alto desgaste.</small>
                    </button>
                </div>
            </div>
            ${ManagerMode.renderStaffs()}
        `;
    },
    
    // === 3. TELA TRANSFERÊNCIAS (CORREÇÃO DE "TRANSFERENCIA NAO ABRE") ===
    renderTransferMarket: () => {
        // Novo: Venda de Jogadores do seu elenco
        const sellList = state.team.squad.map(p => {
            if (p.isMe) return '';
            return `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.pos}</td>
                    <td>${p.ovr}</td>
                    <td>${Utils.formatMoney(p.val)}</td>
                    <td><button class="btn-small danger" onclick="ManagerMode.handleSell('${p.id}')">VENDER</button></td>
                </tr>
            `;
        }).join('');

        // Novo: Compra de Jogadores no mercado
        const buyList = state.market.map((p, index) => `
            <tr>
                <td>${p.name}</td>
                <td>${p.pos}</td>
                <td>${p.ovr}</td>
                <td>${Utils.formatMoney(p.val)}</td>
                <td><button class="btn-small success" onclick="ManagerMode.handleBuy('${p.id}')">COMPRAR</button></td>
            </tr>
        `).join('');

        return `
            <div class="card">
                <h4>💸 Venda de Jogadores</h4>
                <table class="data-table">
                    <thead><tr><th>NOME</th><th>POS</th><th>OVR</th><th>PREÇO</th><th>AÇÃO</th></tr></thead>
                    <tbody>${sellList}</tbody>
                </table>
            </div>
            
            <div class="card" style="margin-top:20px;">
                <h4>🤝 Jogadores Disponíveis (Mercado)</h4>
                <p>Orçamento Atual: <strong>${Utils.formatMoney(state.cash)}</strong></p>
                <table class="data-table">
                    <thead><tr><th>NOME</th><th>POS</th><th>OVR</th><th>PREÇO</th><th>AÇÃO</th></tr></thead>
                    <tbody>${buyList}</tbody>
                </table>
            </div>
            
            <div style="text-align:center; margin-top:10px;">
                <button class="btn-small secondary" onclick="ManagerMode.refreshMarket()">
                    🔄 ATUALIZAR LISTA (Custo: ${Utils.formatMoney(100000)})
                </button>
            </div>
        `;
    },

    // === LÓGICA DE AÇÕES (Melhorias nas Mecânicas) ===
    
    // Lógica para Treino (Substitui a lógica de Treino anterior)
    handleTraining: (type) => {
        let ovrGainBase = 0;
        let injuryChance = 0;
        let energyLoss = 0;
        
        const trainingLvl = state.upgrades.training;
        
        if (type === 'low') { ovrGainBase = 0; injuryChance = 1; energyLoss = -5; }
        if (type === 'medium') { ovrGainBase = 1; injuryChance = 5; energyLoss = 10; }
        if (type === 'high') { ovrGainBase = 2; injuryChance = 15; energyLoss = 20; }

        let totalGain = 0;
        let injuredCount = 0;

        state.team.squad.forEach(p => {
            if (p.injured) return; // Não treina lesionado
            
            // Fator de ganho: Treinador + Nível de Treinamento
            const finalGain = ovrGainBase * (1 + (trainingLvl * 0.1));
            
            // Novo: Lógica de evolução
            if (p.ovr < p.potential) {
                p.ovr = Math.min(p.potential, p.ovr + finalGain);
                totalGain += finalGain;
            }
            
            // Perda/Ganho de Energia (Leve recupera, Intenso desgasta)
            p.energy = Math.max(0, Math.min(100, p.energy - energyLoss)); 
            
            // Novo: Checagem de Lesão com risco
            if (random(1, 100) < injuryChance) {
                p.injured = true;
                p.injuryWeeks = random(2, 6) - state.upgrades.medical; // Médico melhora recuperação
                injuredCount++;
            }
        });
        
        ui.notify(`Treino ${type.toUpperCase()} concluído! ${Math.round(totalGain)} OVR de ganho total. ${injuredCount} jogadores lesionados.`, "info");
        ManagerMode.init('treino');
    },

    // Lógica para Compra
    handleBuy: (playerId) => {
        const player = state.market.find(p => p.id === playerId);
        if (!player) return ui.notify("Jogador não encontrado no mercado.", "error");

        if (state.cash >= player.val) {
            state.cash -= player.val;
            state.team.squad.push(player);
            state.market = state.market.filter(p => p.id !== playerId);
            ui.notify(`✅ ${player.name} contratado por ${Utils.formatMoney(player.val)}!`, "success");
            ManagerMode.init('transferencias');
            SaveSystem.save();
        } else {
            ui.notify("Verba insuficiente para esta contratação.", "error");
        }
    },
    
    // Lógica para Venda (Mecânica de Venda)
    handleSell: (playerId) => {
        const index = state.team.squad.findIndex(p => p.id === playerId);
        if (index === -1) return ui.notify("Jogador não encontrado no elenco.", "error");

        const player = state.team.squad[index];
        const sellPrice = Math.round(player.val * random(60, 90) / 100); // Vende por 60-90% do valor
        
        state.cash += sellPrice;
        state.team.squad.splice(index, 1);
        
        ui.notify(`💰 ${player.name} vendido por ${Utils.formatMoney(sellPrice)}. Bom negócio!`, "success");
        ManagerMode.init('transferencias');
        SaveSystem.save();
    },

    // Lógica para Tática (Simplificada)
    handleTacticChange: () => {
        const newTactic = prompt("Insira a nova tática (ex: 4-3-3, 4-4-2, 3-5-2):");
        if (newTactic) {
            state.tactics = newTactic;
            ui.notify(`Tática alterada para ${newTactic}.`, "success");
        }
        ManagerMode.init('elenco');
    },
    
    // Lógica para Atualizar Mercado (Custo de Scouting)
    refreshMarket: () => {
        const cost = 100000;
        if (state.cash >= cost) {
            state.cash -= cost;
            state.market = [];
            ManagerMode.generateMarket();
            ui.notify("Lista de transferências atualizada!", "info");
            ManagerMode.init('transferencias');
            SaveSystem.save();
        } else {
            ui.notify("Você precisa de verba para pagar o olheiro (Scouting).", "error");
        }
    },

    // ... (Mantém a lógica de Staffs e Upgrades, mas adiciona o Medical e Academia)
    
    // Novo: Renderização de Visão Geral do Clube (Clube & Finanças)
    renderClubOverview: () => {
        const upgradeDefinitions = {
            stadium: { name: "Estádio", baseCost: 500000, effect: "Aumenta a receita do Dia do Jogo." },
            training: { name: "Centro de Treinamento", baseCost: 750000, effect: "Melhora o ganho de OVR nos treinos." },
            academy: { name: "Academia de Jovens", baseCost: 1000000, effect: "Aumenta a chance de encontrar jovens talentos." },
            medical: { name: "Departamento Médico", baseCost: 400000, effect: "Reduz o tempo de lesão e aumenta a recuperação de energia." }
        };
        
        const upgradeHtml = Object.keys(upgradeDefinitions).map(id => {
            const def = upgradeDefinitions[id];
            const currentLvl = state.upgrades[id] || 1;
            const cost = def.baseCost * currentLvl * 1.5;

            return `
                <div class="upgrade-card">
                    <div class="upgrade-info">
                        <h4>${def.name} (Nível ${currentLvl})</h4>
                        <p>${def.effect}</p>
                    </div>
                    <div>
                        <p style="font-size:0.8rem; color:var(--text-muted)">Próximo Custo: ${Utils.formatMoney(cost)}</p>
                        <button class="btn-small primary" onclick="ManagerMode.handleUpgrade('${id}', ${cost})">
                            UPGRADE
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="card finance-panel" style="margin-bottom: 20px;">
                <div class="finance-item">
                    <label>Orçamento Clube</label>
                    <span>${Utils.formatMoney(state.cash)}</span>
                </div>
                <div class="finance-item">
                    <label>Salários/Semana</label>
                    <span class="neg">${Utils.formatMoney(ManagerMode.calculateWages())}</span>
                </div>
            </div>
            
            <div class="card">
                <h4>🏟️ Infraestrutura do Clube</h4>
                <div class="upgrade-grid">${upgradeHtml}</div>
            </div>
            
        `;
    },
    
    // Lógica para Upgrades
    handleUpgrade: (id, cost) => {
        const currentLvl = state.upgrades[id];
        if (state.cash >= cost) {
            state.cash -= cost;
            state.upgrades[id] = currentLvl + 1;
            ui.notify(`Upgrade de \"${id.toUpperCase()}\" concluído para Nível ${currentLvl + 1}!`, "success");
            ManagerMode.init('clube');
            SaveSystem.save();
        } else {
            ui.notify("Verba insuficiente para construir.", "error");
        }
    },
    
    // Lógica para Staffs (Simplificada)
    initializeStaffs: () => {
        return {
            coach: { id: 'coach', name: 'Mestre Tite', specialty: 'Tático', skill: random(70, 90) },
            scout: { id: 'scout', name: 'O Olheiro', specialty: 'Transferências', skill: random(60, 85) }
        };
    },
    
    renderStaffs: () => {
        const coach = state.staffs.coach;
        return `
            <div class="card" style="margin-top: 20px;">
                <h4>👤 Staff Contratado</h4>
                <div class="upgrade-card">
                    <div class="upgrade-info">
                        <h4>${coach.name}</h4>
                        <p>Especialidade: ${coach.specialty}</p>
                        <span class="upgrade-lvl">SKILL ${coach.skill}</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Cálculo de Salários
    calculateWages: () => {
        if (!state.team || !state.team.squad) return 0;
        return state.team.squad.reduce((sum, p) => sum + p.salary, 0);
    },
    
    // Novo: Seleciona um clube adversário (temporário para simulação)
    getCompetitor: () => {
        const league = DB.countries.find(c => c.id === state.countryId).leagues.find(l => l.id === state.leagueId);
        const nonPlayerClubs = league.clubs.filter(c => c.name !== state.team.club.name);
        return nonPlayerClubs[random(0, nonPlayerClubs.length - 1)];
    }
};

// NOTA: Ações de Contratar e Demitir staff foram simplificadas, mas a estrutura está pronta para expansão.
