// === LÓGICA DO MODO MANAGER ===

const ManagerMode = {
    init: () => {
        const content = document.getElementById('main-content');
        content.innerHTML = ManagerMode.renderDashboard();
        // Não precisa de updateUI específico pois o render já faz tudo
    },

    renderDashboard: () => {
        return `
            <div class="manager-dashboard">
                <div class="finance-panel">
                    <div class="finance-item">
                        <label>Orçamento Semanal</label>
                        <span>${Utils.formatMoney(state.cash)}</span>
                    </div>
                    <div class="finance-item">
                        <label>Salários</label>
                        <span class="neg">-${Utils.formatMoney(ManagerMode.calculateWages())}</span>
                    </div>
                </div>

                <h3 style="margin: 10px 0 5px 0; font-size:1rem; color:#aaa">Infraestrutura</h3>
                <div class="upgrade-grid">
                    ${ManagerMode.renderUpgrades()}
                </div>

                <div style="margin-top:20px; text-align:center">
                    <button class="btn-full primary" onclick="ui.renderTab('market')">
                        IR PARA MERCADO DE TRANSFERÊNCIAS
                    </button>
                </div>
            </div>
        `;
    },

    renderUpgrades: () => {
        // Se state.upgrades não existir (saves antigos), cria
        if(!state.upgrades) state.upgrades = { stadium: 1, training: 1, academy: 1, marketing: 1 };

        return DB.upgrades.map(u => {
            const currentLvl = state.upgrades[u.id] || 1;
            const cost = u.cost * currentLvl; // Fica mais caro a cada nível
            
            return `
                <div class="upgrade-card">
                    <div class="upgrade-info">
                        <h4>${u.name}</h4>
                        <p>${u.desc}</p>
                        <span class="upgrade-lvl">Nível ${currentLvl}</span>
                    </div>
                    <button class="btn-small" onclick="ManagerMode.buyUpgrade('${u.id}', ${cost})">
                        ${Utils.formatMoney(cost)}
                    </button>
                </div>
            `;
        }).join('');
    },

    calculateWages: () => {
        // Soma salários baseados no OVR do time
        return state.team.squad.reduce((acc, p) => acc + (p.val * 0.01), 0);
    },

    buyUpgrade: (id, cost) => {
        if(state.cash >= cost) {
            state.cash -= cost;
            state.upgrades[id] = (state.upgrades[id] || 1) + 1;
            ui.notify("Melhoria construída!", "success");
            ManagerMode.init(); // Re-renderiza
            SaveSystem.save();
        } else {
            ui.notify("Verba insuficiente para obras.", "error");
        }
    }
};
