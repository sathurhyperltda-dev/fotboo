// === LÓGICA DO MODO JOGADOR (RPG) ===

const PlayerMode = {
    // Estado específico do Jogador
    data: {
        skills: { attack: 60, defense: 40, physical: 60 },
        relationships: { coach: 50, team: 50, fans: 10 }, // 0 a 100
        lifestyle: [], // Itens comprados
        fame: 0
    },

    // Inicializa a interface do Jogador
    init: () => {
        const content = document.getElementById('main-content');
        content.innerHTML = PlayerMode.renderDashboard();
        PlayerMode.updateUI();
    },

    renderDashboard: () => {
        const p = state.team.squad.find(x => x.isMe);
        return `
            <div class="player-dashboard">
                <div class="profile-card">
                    <div class="profile-pic-area">
                        <img src="https://ui-avatars.com/api/?name=${p.name}&background=random" alt="Player">
                        <div class="ovr-badge">${p.ovr}</div>
                    </div>
                    <div class="profile-stats">
                        <h2>${p.name}</h2>
                        <p>${p.pos} | ${state.team.name}</p>
                        <div style="margin-top:5px; font-size:0.9rem; color:#4ade80">
                            Salário: ${Utils.formatMoney(5000)}/sem
                        </div>
                    </div>
                </div>

                <div class="relationship-box">
                    <div class="rel-item">
                        <div class="rel-label"><span>Treinador (Titularidade)</span> <span>${PlayerMode.data.relationships.coach}%</span></div>
                        <div class="progress-track"><div class="progress-fill fill-coach" style="width:${PlayerMode.data.relationships.coach}%"></div></div>
                    </div>
                    <div class="rel-item">
                        <div class="rel-label"><span>Elenco (Entrosamento)</span> <span>${PlayerMode.data.relationships.team}%</span></div>
                        <div class="progress-track"><div class="progress-fill fill-team" style="width:${PlayerMode.data.relationships.team}%"></div></div>
                    </div>
                    <div class="rel-item">
                        <div class="rel-label"><span>Torcida (Fama)</span> <span>${PlayerMode.data.relationships.fans}%</span></div>
                        <div class="progress-track"><div class="progress-fill fill-fans" style="width:${PlayerMode.data.relationships.fans}%"></div></div>
                    </div>
                </div>

                <h3 style="margin: 10px 0 5px 0; font-size:1rem; color:#aaa">Centro de Treinamento</h3>
                <div class="action-grid">
                    <div class="action-card" onclick="PlayerMode.train('attack')">
                        <span class="action-icon">⚽</span>
                        <div>Finalização</div>
                        <div class="action-cost">-15 Energia</div>
                    </div>
                    <div class="action-card" onclick="PlayerMode.train('physical')">
                        <span class="action-icon">💪</span>
                        <div>Academia</div>
                        <div class="action-cost">-20 Energia</div>
                    </div>
                    <div class="action-card" onclick="PlayerMode.interact('coach')">
                        <span class="action-icon">🤝</span>
                        <div>Falar c/ Chefe</div>
                        <div class="action-cost">-10 Energia</div>
                    </div>
                    <div class="action-card" onclick="PlayerMode.interact('social')">
                        <span class="action-icon">📱</span>
                        <div>Redes Sociais</div>
                        <div class="action-cost">-5 Energia</div>
                    </div>
                </div>

                <h3 style="margin: 20px 0 5px 0; font-size:1rem; color:#aaa">Estilo de Vida</h3>
                <div id="lifestyle-list">
                    ${PlayerMode.renderLifestyleItems()}
                </div>
            </div>
        `;
    },

    renderLifestyleItems: () => {
        const items = [
            { id: 'shoe', name: "Chuteira Elite", price: 20000, benefit: "+2 Finalização" },
            { id: 'watch', name: "Relógio de Ouro", price: 50000, benefit: "+5 Fama" },
            { id: 'car', name: "Carro Esportivo", price: 150000, benefit: "Recupera Energia" }
        ];

        return items.map(item => {
            const owned = PlayerMode.data.lifestyle.includes(item.id);
            const btn = owned 
                ? `<span style="color:#22c55e; font-size:0.8rem">COMPRADO</span>` 
                : `<button class="btn-small" onclick="PlayerMode.buyItem('${item.id}', ${item.price})">${Utils.formatMoney(item.price)}</button>`;
            
            return `
                <div class="lifestyle-item ${owned ? 'owned' : ''}">
                    <div>
                        <div style="font-weight:bold">${item.name}</div>
                        <div style="font-size:0.7rem; color:#888">${item.benefit}</div>
                    </div>
                    ${btn}
                </div>
            `;
        }).join('');
    },

    // AÇÕES
    train: (type) => {
        if(state.energy < 20) return ui.notify("Muito cansado para treinar!", "error");
        
        state.energy -= 20;
        const me = state.team.squad.find(x => x.isMe);
        
        // Evolução baseada no tipo
        if(Math.random() > 0.4) {
            me.ovr += 1;
            PlayerMode.data.relationships.coach += 2; // Treinador gosta de esforço
            ui.notify(`Evoluiu! OVR ${me.ovr}`, "success");
        } else {
            ui.notify("Treino bom, mas sem evolução.", "info");
        }
        
        PlayerMode.init(); // Re-renderiza
    },

    interact: (target) => {
        if(state.energy < 10) return ui.notify("Sem energia.", "error");
        state.energy -= 10;

        if(target === 'coach') {
            PlayerMode.data.relationships.coach += 5;
            ui.notify("Conversa produtiva com o Mister.", "success");
        } else if (target === 'social') {
            PlayerMode.data.relationships.fans += 3;
            ui.notify("Postou foto no Instagram (+Fama)", "success");
        }
        PlayerMode.init();
    },

    buyItem: (id, price) => {
        // No modo jogador, state.cash é o dinheiro PESSOAL
        if(state.cash >= price) {
            state.cash -= price;
            PlayerMode.data.lifestyle.push(id);
            ui.notify("Item comprado! Vida de luxo.", "success");
            
            // Aplica bônus imediato (simplificado)
            if(id === 'shoe') state.team.squad.find(x=>x.isMe).ovr += 2;
            if(id === 'watch') PlayerMode.data.relationships.fans += 10;
            
            PlayerMode.init();
        } else {
            ui.notify("Sem dinheiro na conta pessoal.", "error");
        }
    }
};
