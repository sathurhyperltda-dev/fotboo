// === MÓDULO DE TRANSFERÊNCIA E TÁTICA (v17.0) ===

const TransferMode = {
    // Inicializa o painel de transferência/escalação
    init: () => {
        const content = document.getElementById('main-content');
        content.innerHTML = TransferMode.renderTransferHub();
        
        // Garante que a escalação tática padrão exista no estado (4-4-2)
        if (!state.team.lineup) {
            TransferMode.setupInitialLineup();
        }
    },

    // Define uma escalação inicial com o time titular
    setupInitialLineup: () => {
        // Posições base para 4-4-2
        const positions = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'ATT', 'ATT'];
        const initialLineup = {};
        
        // Filtra e ordena os jogadores
        const sortedSquad = state.team.squad.sort((a, b) => b.ovr - a.ovr);
        
        // Preenche o time titular com os melhores OVRs por posição
        positions.forEach((pos, index) => {
            const player = sortedSquad.find(p => p.pos === pos && !Object.values(initialLineup).includes(p));
            if (player) {
                initialLineup[`pos${index + 1}`] = player;
            }
        });
        
        state.team.lineup = initialLineup;
        state.team.tactic = 'balance'; // Tática inicial
    },

    // Renderiza o Hub Principal (Escalação e Lista de Transferência)
    renderTransferHub: () => {
        return `
            <div class="transfer-hub">
                
                <div class="card" style="margin-bottom: 20px;">
                    <h3>Escalação e Tática</h3>
                    ${TransferMode.renderTacticSelector()}
                    ${TransferMode.renderLineupField()}
                </div>

                <h3 style="margin: 20px 0 10px 0; font-size:1.1rem; color:var(--text-muted)">ELENCO COMPLETO</h3>
                <div class="transfer-list">
                    ${TransferMode.renderSquadList()}
                </div>
                
                ${state.mode === 'Manager' ? `
                    <h3 style="margin: 20px 0 10px 0; font-size:1.1rem; color:var(--text-muted)">MERCADO DE ATLETAS</h3>
                    <div class="transfer-list">
                        ${TransferMode.renderMarketList()}
                    </div>
                ` : ''}

            </div>
            
            ${ui.renderModal('negotiationModal', 'negociação-avançada')}
        `;
    },

    // === RENDERIZAÇÃO DE TÁTICA ===
    renderTacticSelector: () => {
        const currentTactic = state.team.tactic;
        return `
            <div class="input-box">
                <label>Tática Principal</label>
                <select id="tactic-selector" onchange="TransferMode.setTactic(this.value)">
                    ${DB.tactics.map(t => 
                        `<option value="${t.id}" ${currentTactic === t.id ? 'selected' : ''}>
                            ${t.name} (${t.desc})
                        </option>`
                    ).join('')}
                </select>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-top:5px;">
                    Bonus OVR: +${DB.tactics.find(t=>t.id === currentTactic).bonus} | Risco: ${DB.tactics.find(t=>t.id === currentTactic).risk}%
                </p>
            </div>
        `;
    },

    setTactic: (tacticId) => {
        state.team.tactic = tacticId;
        ui.notify(`Tática alterada para: ${DB.tactics.find(t=>t.id === tacticId).name}`, 'info');
        SaveSystem.save();
    },

    // === RENDERIZAÇÃO DE ESCALAÇÃO ===
    renderLineupField: () => {
        // Simplificando o campo para mostrar apenas 11 posições clicáveis (pos1 a pos11)
        const lineup = state.team.lineup;
        const tacticDef = DB.tactics.find(t => t.id === state.team.tactic);

        let formationHTML = '';
        for (let i = 1; i <= 11; i++) {
            const player = lineup[`pos${i}`];
            const badgeClass = player ? player.pos : 'NO';
            const playerName = player ? `${player.name.split(' ')[0]} (${player.ovr})` : 'VAZIO';
            
            formationHTML += `
                <div class="lineup-spot" 
                     onclick="TransferMode.showPlayerDetail('${player ? player.id : 'empty_spot'}', 'pos${i}')">
                    <div class="pos-badge ${badgeClass}" id="spot-pos${i}">${badgeClass}</div>
                    <span style="font-size:0.7rem; color: ${player ? 'white' : 'var(--danger)'}">${playerName}</span>
                </div>
            `;
        }

        // NOVO: Renderiza um campo de jogo visual (simples)
        return `
            <div class="field-visual-small">
                ${formationHTML}
            </div>
            <style>
                /* Estilos temporários para o campo de escalação */
                .field-visual-small {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr); /* 4 colunas para simular posições */
                    gap: 10px;
                    padding: 20px;
                    background: #10602f; /* Verde Escuro */
                    border-radius: 8px;
                    position: relative;
                }
                .lineup-spot {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    cursor: pointer;
                    padding: 5px;
                }
            </style>
        `;
    },

    // Lista de jogadores no elenco (para substituir no campo)
    renderSquadList: () => {
        // Exibe todos os jogadores, exceto o jogador da carreira no Modo Jogador
        const playersToRender = state.team.squad.filter(p => state.mode === 'Manager' || p !== state.player);

        return playersToRender.map(p => `
            <div class="player-row transfer-item">
                <div class="player-row-info">
                    <div class="pos-badge ${p.pos}">${p.pos}</div>
                    <div>
                        <span style="font-weight:bold">${p.name} (${p.age})</span>
                        <div class="transfer-stats">OVR: ${p.ovr} | Salário: ${Utils.formatMoney(p.val * 0.01)}/sem</div>
                    </div>
                </div>
                <button class="btn-small" style="background:var(--accent)" 
                    onclick="TransferMode.startNegotiation('${p.id}', 'sell')">
                    ${state.mode === 'Manager' ? 'VENDER' : 'INFO'}
                </button>
            </div>
        `).join('');
    },

    // Lista de jogadores disponíveis para contratação (mercado)
    renderMarketList: () => {
        // NOVO: Mercado simplificado (apenas a lista de RealPlayers)
        const marketPlayers = Object.values(RealPlayers).flat()
            .filter(p => p.ovr > 80) // Apenas craques acima de 80 OVR
            .sort((a, b) => b.ovr - a.ovr)
            .slice(0, 10);

        return marketPlayers.map(p => `
            <div class="player-row transfer-item" style="border-left-color:var(--primary)">
                <div class="player-row-info">
                    <div class="pos-badge ${p.pos}">${p.pos}</div>
                    <div>
                        <span style="font-weight:bold">${p.name}</span>
                        <div class="transfer-stats">OVR: ${p.ovr} | Valor: ${Utils.formatMoney(p.val)}</div>
                    </div>
                </div>
                <button class="btn-small" style="background:var(--success)" 
                    onclick="TransferMode.startNegotiation('${p.id}', 'buy')">
                    CONTRATAR
                </button>
            </div>
        `).join('');
    },
    
    // === LÓGICA DE NEGOCIAÇÃO ===
    
    // Mostra o modal de negociação
    startNegotiation: (playerId, type) => {
        const player = state.team.squad.find(p => p.id === playerId) || Object.values(RealPlayers).flat().find(p => p.id === playerId);
        if (!player) return ui.notify("Jogador não encontrado.", 'error');

        // Salva o estado da negociação
        state.negotiation = { player, type, targetPrice: player.val, currentOffer: player.val };

        const headerTitle = type === 'buy' ? `Negociar ${player.name}` : `Vender ${player.name}`;
        const targetLabel = type === 'buy' ? 'Preço Mínimo Estimado:' : 'Valor de Mercado Estimado:';
        
        // Conteúdo do Modal
        const modalBody = `
            <p style="color:var(--text-muted); text-align:center;">
                OVR: ${player.ovr} | Valor: ${Utils.formatMoney(player.val)}
            </p>
            <div class="negotiation-panel">
                <div class="offer-side">
                    <h4>Proposta de Transferência</h4>
                    <p style="font-size:0.9rem">${targetLabel} ${Utils.formatMoney(player.val)}</p>
                    <div class="input-box offer-input">
                        <label>Valor Oferecido</label>
                        <input type="number" id="transfer-offer" value="${player.val}" min="${player.val * 0.5}" step="100000">
                    </div>
                </div>
                <div class="offer-side">
                    <h4>Salário Semanal</h4>
                    <p style="font-size:0.9rem">Salário Atual: ${Utils.formatMoney(player.val * 0.01)}</p>
                    <div class="input-box offer-input">
                        <label>Proposta Salarial</label>
                        <input type="number" id="wage-offer" value="${player.val * 0.01}" min="${player.val * 0.005}" step="5000">
                    </div>
                </div>
            </div>

            <div class="negotiation-action" style="margin-top:20px;">
                <button class="btn-full confirm" onclick="TransferMode.submitOffer()">
                    ENVIAR PROPOSTA
                </button>
                <button class="btn-full danger" onclick="ui.closeModal('negotiationModal')">
                    CANCELAR
                </button>
            </div>
        `;

        ui.openModal('negotiationModal', headerTitle, modalBody, 'large');
    },

    // Submete a oferta de negociação
    submitOffer: () => {
        const { player, type, targetPrice } = state.negotiation;
        const transferOffer = parseInt(document.getElementById('transfer-offer').value);
        const wageOffer = parseInt(document.getElementById('wage-offer').value);

        if (isNaN(transferOffer) || isNaN(wageOffer)) {
            return ui.notify("Insira valores válidos para a proposta.", 'error');
        }

        // Lógica de Compra (Manager)
        if (type === 'buy') {
            if (state.cash < transferOffer) {
                return ui.notify("Orçamento insuficiente para essa oferta!", 'error');
            }

            const successChance = TransferMode.calculateSuccessChance(transferOffer, targetPrice, player.ovr);

            if (Math.random() * 100 < successChance) {
                // Sucesso na Contratação
                state.cash -= transferOffer;
                
                // NOVO: Cria uma cópia profunda do jogador para evitar referência
                const newPlayer = JSON.parse(JSON.stringify(player));
                newPlayer.id = Utils.generateID(); // Novo ID único
                newPlayer.val = transferOffer; // Atualiza o valor de mercado (compra)
                newPlayer.wage = wageOffer; // Adiciona o salário negociado
                
                state.team.squad.push(newPlayer);
                
                ui.notify(`${newPlayer.name} contratado com sucesso por ${Utils.formatMoney(transferOffer)}!`, 'success');
            } else {
                // Falha na Contratação
                ui.notify(`Proposta recusada. Tente aumentar o valor de transferência ou o salário.`, 'danger');
            }
        } 
        
        // Lógica de Venda (Manager/Player) - Simplificada
        else if (type === 'sell') {
            // Simplificando: Venda é sempre bem-sucedida se a oferta for > 80% do valor
            if (transferOffer >= targetPrice * 0.8) {
                state.cash += transferOffer;
                state.team.squad = state.team.squad.filter(p => p.id !== player.id);
                ui.notify(`${player.name} vendido por ${Utils.formatMoney(transferOffer)}!`, 'success');

                // Se o jogador da carreira foi vendido, o jogo deve encerrar (Modo Jogador)
                if (state.mode === 'Player' && state.player.id === player.id) {
                    ui.notify("Sua carreira neste clube terminou! Aguarde propostas no próximo dia.", 'info');
                    // O MatchEngine precisará lidar com a transição de clube/fim de jogo
                }

            } else {
                 ui.notify("Oferta muito baixa. O outro clube recusou a venda.", 'danger');
            }
        }

        ui.closeModal('negotiationModal');
        TransferMode.init(); 
        SaveSystem.save();
    },

    // Lógica de cálculo de chance de sucesso na negociação
    calculateSuccessChance: (offer, target, ovr) => {
        let chance = 50; // Base
        
        // Bônus pela oferta: +1% a cada 10% acima do preço alvo
        if (offer > target) {
            chance += Math.floor(((offer - target) / target) * 100 / 10);
        } else if (offer < target) {
            // Penalidade: -2% a cada 10% abaixo do preço alvo
            chance -= Math.floor(((target - offer) / target) * 100 / 5);
        }

        // Bônus por OVR (é mais fácil contratar jogadores de OVR menor)
        chance -= (ovr - 70) / 2; 

        // Limita a chance entre 10% e 90%
        return Math.min(90, Math.max(10, chance));
    },

    // Temporário: Função para mostrar detalhes do jogador na escalação
    showPlayerDetail: (playerId, spotId) => {
        if (playerId === 'empty_spot') {
            return ui.notify("Espaço vazio. Clique em um jogador no elenco abaixo para colocá-lo aqui.", "info");
        }
        
        const player = state.team.squad.find(p => p.id === playerId);
        if (!player) return;

        // Implementação simplificada: move o jogador para a reserva e abre a lista de elenco
        ui.notify(`Detalhes de ${player.name}. Clique em um jogador do elenco para movê-lo para esta posição.`, 'info');
        
        // Armazena a posição que será preenchida
        state.selectionSpot = spotId;

        // NOVO: Adicionar uma função de seleção de substituto na próxima etapa
    },
    
};