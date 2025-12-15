// === MÓDULO DE GESTÃO: LÓGICA DO MANAGER (v17.0) ===

const ManagerMode = {
    // Inicializa a interface do Manager (Aba 'Clube')
    init: () => {
        const content = document.getElementById('main-content');
        content.innerHTML = ManagerMode.renderDashboard();
        
        // Garante que o estado dos upgrades e staff exista
        if (!state.upgrades) state.upgrades = { stadium: 1, training: 1, academy: 1, marketing: 1 };
        if (!state.staffs) state.staffs = ManagerMode.initializeStaffs();
    },
    
    // Cria o staff inicial baseado no DB (se não houver)
    initializeStaffs: () => {
        const initialStaffs = {};
        DB.staff.forEach(s => {
            // Contrata um staff inicial no nível mínimo
            initialStaffs[s.id] = {
                ...s,
                skill: s.baseSkill + Math.floor(Math.random() * 5), // Habilidade inicial
                cost: s.cost
            };
        });
        return initialStaffs;
    },
    
    // === RENDERIZAÇÃO PRINCIPAL ===
    renderDashboard: () => {
        const totalWages = ManagerMode.calculateWages();
        
        return `
            <div class="manager-dashboard">
                
                <div class="card finance-panel">
                    <div class="finance-item">
                        <label>Orçamento Clube</label>
                        <span>${Utils.formatMoney(state.cash)}</span>
                    </div>
                    <div class="finance-item">
                        <label>Salários Semanais (Time)</label>
                        <span style="color:${totalWages > 0 ? 'var(--danger)' : 'var(--success)'}">
                            -${Utils.formatMoney(totalWages)}
                        </span>
                    </div>
                    <div class="finance-item">
                        <label>Renda Passiva Estimada</label>
                        <span style="color:var(--success)">
                            +${Utils.formatMoney(ManagerMode.calculateIncome())}
                        </span>
                    </div>
                </div>

                <h3 style="margin: 20px 0 10px 0; font-size:1.1rem; color:var(--text-muted)">INFRAESTRUTURA</h3>
                <div class="upgrade-grid">
                    ${ManagerMode.renderUpgrades()}
                </div>

                <h3 style="margin: 20px 0 10px 0; font-size:1.1rem; color:var(--text-muted)">EQUIPE TÉCNICA</h3>
                <div class="staff-grid">
                    ${ManagerMode.renderStaffs()}
                </div>

                <div style="margin-top:20px; text-align:center">
                    <button class="btn-full secondary" onclick="ui.renderTab('transfer')">
                        GERENCIAR CONTRATOS E VENDAS
                    </button>
                </div>
            </div>
        `;
    },
    
    // === LÓGICA DE FINANÇAS ===
    calculateWages: () => {
        // Salário do Jogador (val * 1%) + Salário do Staff
        const playerWages = state.team.squad.reduce((acc, p) => acc + (p.val * 0.01), 0);
        
        const staffWages = Object.values(state.staffs).reduce((acc, s) => acc + s.cost * 0.05, 0);
        
        return Math.round(playerWages + staffWages);
    },
    
    calculateIncome: () => {
        const stadiumLvl = state.upgrades.stadium || 1;
        const marketingLvl = state.upgrades.marketing || 1;
        
        // Renda base do estádio + Bônus de Marketing
        let baseIncome = state.team.budget * 0.01 * stadiumLvl;
        let marketingIncome = 100000 * marketingLvl;
        
        return Math.round(baseIncome + marketingIncome);
    },
    
    // === RENDERIZAÇÃO DE UPGRADES ===
    renderUpgrades: () => {
        return DB.upgrades.map(u => {
            const currentLvl = state.upgrades[u.id] || 1;
            const cost = u.cost * currentLvl * 1.5; // Fica mais caro (150% do custo base * nível)
            const isMax = currentLvl >= u.maxLevel;
            
            return `
                <div class="upgrade-card ${isMax ? 'maxed' : ''}">
                    <div class="upgrade-info">
                        <h4>${u.name}</h4>
                        <p>${u.desc}</p>
                        <span class="upgrade-lvl">Nível ${currentLvl} / ${u.maxLevel}</span>
                    </div>
                    ${isMax ? 
                        `<span class="btn-text" style="color:var(--accent)">MAXIMO</span>` : 
                        `<button class="btn-small" style="background:var(--primary)" onclick="ManagerMode.buyUpgrade('${u.id}', ${cost}, ${currentLvl})">
                            ${Utils.formatMoney(cost)}
                        </button>`
                    }
                </div>
            `;
        }).join('');
    },
    
    buyUpgrade: (id, cost, currentLvl) => {
        const upgradeDef = DB.upgrades.find(u => u.id === id);
        
        if (currentLvl >= upgradeDef.maxLevel) return ui.notify("Este upgrade já está no nível máximo!", "info");
        
        if (state.cash >= cost) {
            state.cash -= cost;
            state.upgrades[id] = currentLvl + 1;
            ui.notify(`Upgrade "${upgradeDef.name}" concluído para Nível ${currentLvl + 1}!`, "success");
            ManagerMode.init();
            SaveSystem.save();
        } else {
            ui.notify("Verba insuficiente para construir.", "error");
        }
    },
    
    // === RENDERIZAÇÃO DE STAFF ===
    renderStaffs: () => {
        return Object.values(state.staffs).map(s => {
            const skillColor = s.skill > 80 ? 'var(--success)' : (s.skill > 65 ? 'var(--primary)' : 'var(--accent)');
            
            return `
                <div class="upgrade-card">
                    <div class="upgrade-info">
                        <h4>${s.name}</h4>
                        <p>Especialidade: ${s.specialty}</p>
                        <span class="upgrade-lvl" style="background:${skillColor}; color:#000;">SKILL ${s.skill}</span>
                    </div>
                    <div>
                        <p style="font-size:0.8rem; color:var(--text-muted)">Custo: ${Utils.formatMoney(s.cost * 0.05)}/sem</p>
                        <button class="btn-small" style="background:var(--danger)">
                            DEMITIR
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // NOTA: Ações de Contratar/Demitir Staff serão implementadas no Módulo Transfer
};