// === MÓDULO JOGADOR: LÓGICA DA CARREIRA (v17.0) ===

const PlayerMode = {
    // Inicializa a interface do Jogador (Aba 'Carreira' e 'Treino')
    init: () => {
        const playerContent = document.getElementById('main-content');
        playerContent.innerHTML = PlayerMode.renderPlayerHub();
    },

    // Renderiza a aba principal (Carreira/Stats)
    renderPlayerHub: () => {
        const p = state.player;
        
        return `
            <div class="player-hub">
                <div class="card player-summary highlight">
                    <div class="stats-player-header">
                        <div class="pos-badge ${p.pos}">${p.pos}</div>
                        <div>
                            <h3 style="margin:0">${p.name}</h3>
                            <p style="margin:0; font-size:0.9rem; color:var(--text-muted)">Idade: ${p.age}</p>
                        </div>
                        <div class="stats-ovr">${p.ovr}</div>
                    </div>
                    
                    <h4 style="margin-top:10px; color:var(--accent)">Estatísticas da Temporada</h4>
                    <div class="stats-table">
                        <table>
                            <tr><td>Gols</td><td>${p.stats.goals}</td></tr>
                            <tr><td>Assistências</td><td>${p.stats.assists}</td></tr>
                            <tr><td>Valor de Mercado</td><td>${Utils.formatMoney(p.val)}</td></tr>
                        </table>
                    </div>
                </div>

                ${PlayerMode.renderTrainingPanel()}

                <div class="card" style="text-align:center">
                    <h4 style="margin:0">Reputação e Agente</h4>
                    <p style="font-size:0.9rem; color:var(--text-muted)">Seu agente está trabalhando em propostas...</p>
                    <button class="btn-full primary" onclick="PlayerMode.checkProposals()">
                        VER PROPOSTAS (Futuro)
                    </button>
                </div>
            </div>
        `;
    },

    // Renderiza o painel de treino
    renderTrainingPanel: () => {
        const p = state.player;
        const availableFocus = DB.attributes.filter(attr => p.pos.includes(attr.pos[0]) || p.pos.includes(attr.pos[1]) || attr.pos.length === 0);
        const currentFocus = state.trainingFocus || availableFocus[0].id;
        const energyRequired = 5; // Custo de energia por treino

        return `
            <h3 style="margin: 20px 0 10px 0; font-size:1.1rem; color:var(--text-muted)">FOCO DE TREINO (CUSTO: ${energyRequired} ENERGIA)</h3>
            <div class="card training-focus-card">
                <p>Selecione um atributo para focar. O OVR e o valor de mercado aumentam conforme o treino.</p>
                <div class="training-grid">
                    ${availableFocus.map(attr => `
                        <div class="training-option ${currentFocus === attr.id ? 'active' : ''}" onclick="PlayerMode.setTrainingFocus('${attr.id}')">
                            <span class="material-icons training-icon">${PlayerMode.getAttrIcon(attr.id)}</span>
                            ${attr.name}<br>(${p.attrs[attr.id]})
                        </div>
                    `).join('')}
                </div>
                <button class="btn-full primary" style="margin-top:15px;" onclick="PlayerMode.train()">
                    TREINAR AGORA
                </button>
            </div>
        `;
    },

    // Define o foco de treino
    setTrainingFocus: (attrId) => {
        state.trainingFocus = attrId;
        PlayerMode.init();
    },

    // Lógica do treino e crescimento do jogador
    train: () => {
        const energyRequired = 5;
        if (state.energy < energyRequired) {
            return ui.notify("Energia insuficiente. Descanse um dia ou jogue uma partida.", "error");
        }

        const focusAttrId = state.trainingFocus;
        if (!focusAttrId) return ui.notify("Selecione um foco de treino primeiro.", "error");

        const p = state.player;
        const attrDef = DB.attributes.find(a => a.id === focusAttrId);
        
        let growth = attrDef.growth * 100; // Taxa base (ex: 15 para Finalização)

        // Aplica fator de aleatoriedade no crescimento
        const randomFactor = 1 + (Math.random() - 0.5) * 0.1; // +/- 5%
        growth = Math.round(growth * randomFactor);

        // Crescimento de atributo (sempre cresce pelo menos 1, mas o foco é mais forte)
        p.attrs[focusAttrId] += Math.max(1, growth);
        
        // Atualiza o OVR e valor de mercado com base no novo atributo
        PlayerMode.updateOVR(p);
        p.val = p.ovr * 2500000; // Recalcula valor

        state.energy -= energyRequired;
        
        ui.notify(`Treino concluído! ${attrDef.name} subiu ${Math.max(1, growth)} pontos. OVR: ${p.ovr}.`, "success");
        PlayerMode.init();
        SaveSystem.save();
    },

    // Função para atualizar o OVR do jogador com base em seus atributos
    updateOVR: (player) => {
        const attrs = player.attrs;

        let ovrCalc = 0;
        // OVR é a média ponderada de 4 atributos principais (como no database_Jo.js)
        if (player.pos === 'ATT') ovrCalc = (attrs.finishing * 3 + attrs.speed * 2 + attrs.passing + attrs.stamina) / 7;
        else if (player.pos === 'MID') ovrCalc = (attrs.passing * 3 + attrs.stamina * 2 + attrs.tackling * 1.5 + attrs.speed) / 7.5;
        else if (player.pos === 'DEF') ovrCalc = (attrs.tackling * 3 + attrs.passing * 2 + attrs.stamina + attrs.finishing) / 7;
        else if (player.pos === 'GK') ovrCalc = (attrs.handling * 4 + attrs.tackling * 2 + attrs.speed) / 7;
        
        player.ovr = Math.round(ovrCalc);
    },

    // Simulação de Propostas de Transferência (Apenas Notificação por enquanto)
    checkProposals: () => {
        const p = state.player;
        if (p.ovr >= 85) {
            ui.notify("Seu agente conseguiu propostas da Liga dos Campeões! Negocie sua transferência no próximo mês.", "info");
        } else if (p.ovr >= 75) {
            ui.notify("Boas propostas de clubes estrangeiros. Continue se destacando!", "info");
        } else {
            ui.notify("Sem propostas significativas no momento. Foco no treino e na partida.", "info");
        }
    },

    // Função auxiliar para ícones
    getAttrIcon: (attrId) => {
        switch(attrId) {
            case 'finishing': return 'sports_soccer';
            case 'passing': return 'send';
            case 'tackling': return 'security';
            case 'speed': return 'directions_run';
            case 'stamina': return 'heart_plus';
            case 'handling': return 'sports_handball';
            default: return 'star';
        }
    }
};