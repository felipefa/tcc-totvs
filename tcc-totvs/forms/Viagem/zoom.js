/**
 * Remove o atributo disabled de um campo zoom.
 * 
 * @param {String} id String com o id do campo zoom que deve ser ativado.
 */
function ativarZoom(id) {
	window[id].disable(false);
}

/**
 * Atualiza os valores do campo zoom informado de acordo com o filtro informado.
 * 
 * @param {String} id Id do campo zoom que deve ser atualizado
 * @param {String} campo Nome do campo filtro
 * @param {String} valor Valor que deve ser filtrado
 */
function atualizarZoom(id, campo = '', valor = '') {
	const estaAtivo = $('#' + id).prop('disabled') ? false : true;
	reloadZoomFilterValues(id, campo + ',' + valor);
	// Se o zoom estiver desativado, desativa-o novamente após atualizá-lo
	if (!estaAtivo) {
		limparZoom(id);
		desativarZoom(id);
	}
}

/**
 * Adiciona o atributo disabled a um campo zoom.
 * 
 * @param {String} id String com o id do campo zoom que deve ser desativado.
 */
function desativarZoom(id) {
	window[id].disable(true);
}

/**
 * Limpa os valores de um campo zoom.
 * 
 * @param {String} id String com o id do campo zoom que deve ser ativado.
 */
function limparZoom(id) {
	window[id].clear();
}

/**
 * Função executa na seleção de um item de um campo zoom.
 * 
 * @param {Object} selectedItem Objeto com o conteúdo relacionado ao campo zoom.
 */
function setSelectedZoomItem(selectedItem) {
	let idCampoZoom = selectedItem.inputId;
	let numeroIdPaiFilho = null;

	if (idCampoZoom.indexOf('___') != -1) {
		const dadosZoom = idCampoZoom.split('___');
		idCampoZoom = dadosZoom[0];
		numeroIdPaiFilho = dadosZoom[1];
	}

	/** Início de campos zoom do painel Dados da Solicitação */
	// Preenche os campos ocultos relacionados ao solicitante selecionado
	if (idCampoZoom == 'nomeSolicitante') {
		$('#loginSolicitante').val(selectedItem.login);
	}

	// Preenche os campos ocultos relacionados ao centro de custo selecionado
	if (idCampoZoom == 'centroCusto') {
		$('#loginGestor').val(selectedItem.loginGestor);
		$('#nomeGestor').val(selectedItem.zoomGestor);
	}
	/** Fim de campos zoom do painel Dados da Solicitação */


	/** Início de campos zoom do painel Itinerário */
	// Atualiza o zoom Cidade de Origem de acordo com o Estado de Origem escolhido.
	if (idCampoZoom == 'estadoOrigem') {
		ativarZoom('cidadeOrigem');
		atualizarZoom('cidadeOrigem', 'estado', selectedItem.estado);
	}

	// Atualiza o zoom Cidade de Destino de acordo com o Estado de Destino escolhido.
	if (idCampoZoom == 'estadoDestino') {
		ativarZoom('cidadeDestino');
		atualizarZoom('cidadeDestino', 'estado', selectedItem.estado);
	}

	// Caso a cidade de origem ou destino seja alterada, altera a rota nas suas despesas associadas
	if ((idCampoZoom == 'cidadeOrigem' || idCampoZoom == 'cidadeDestino') && !estaVazio(numeroIdPaiFilho)) {
		const cidadeOrigem = $('#cidadeOrigem___' + numeroIdPaiFilho).val();
		const cidadeDestino = $('#cidadeDestino___' + numeroIdPaiFilho).val();
		const origemDestino = cidadeOrigem + ' > ' + cidadeDestino;

		$('[id^=origemDestino___]').each(function () {
			const elementoOrigemDestino = $(this);
			const numeroIdDespesa = getPosicaoPaiFilho(elementoOrigemDestino);

			if ($('#numeroTrajetoDespesa___' + numeroIdDespesa).val() == numeroIdPaiFilho) {
				elementoOrigemDestino.html(origemDestino);
			}
		});
	}
	/** Fim de campos zoom do painel Itinerário */
}

/**
 * Função executa na remoção de um item de um campo zoom.
 * 
 * @param {Object} removedItem Objeto com o conteúdo relacionado ao campo zoom.
 */
function removedZoomItem(removedItem) {
	let idCampoZoom = removedItem.inputId;
	let numeroIdPaiFilho = null;

	if (idCampoZoom.indexOf('___') != -1) {
		const dadosZoom = idCampoZoom.split('___');
		idCampoZoom = dadosZoom[0];
		numeroIdPaiFilho = dadosZoom[1];
	}

	/** Início de campos zoom do painel Dados da Solicitação */
	// Limpa os campos ocultos relacionados ao gestor selecionado anteriormente
	if (idCampoZoom == 'nomeSolicitante') {
		$('#loginSolicitante').val('');
	}

	// Limpa os campos ocultos relacionados ao gestor selecionado anteriormente
	if (idCampoZoom == 'centroCusto') {
		$('#loginGestor').val('');
		$('#nomeGestor').val('');
	}
	/** Fim de campos zoom do painel Dados da Solicitação */


	/** Início de campos zoom do painel Itinerário */
	// Limpa o zoom Cidade de Origem se o Estado de Origem for excluído
	if (idCampoZoom == 'estadoOrigem') {
		limparZoom('cidadeOrigem');
		desativarZoom('cidadeOrigem');
	}

	// Limpa o zoom Cidade de Destino se o Estado de Destino for excluído
	if (idCampoZoom == 'estadoDestino') {
		limparZoom('cidadeDestino');
		desativarZoom('cidadeDestino');
	}
	/** Fim de campos zoom do painel Itinerário */
}