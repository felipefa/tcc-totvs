/**
 * @function ativarZoom Remove o atributo disabled de um campo zoom.
 * 
 * @param {String} id String com o id do campo zoom que deve ser ativado.
 */
function ativarZoom(id) {
	window[id].disable(false);
}

/**
 * @function atualizarZoom Atualiza os valores do campo zoom informado de acordo com o filtro informado.
 * 
 * @param {String} inputName Name do campo zoom que deve ser atualizado
 * @param {String} campo Nome do campo filtro
 * @param {String} valor Valor que deve ser filtrado
 */
function atualizarZoom(id, campo = '', valor = '') {
	let estaAtivo = $('#' + id).prop('disabled') ? false : true;
	reloadZoomFilterValues(id, campo + ',' + valor);
	// Se o zoom estiver desativado, desativa-o novamente após atualizá-lo
	if (!estaAtivo) desativarZoom(id);
}

/**
 * @function desativarZoom Adiciona o atributo disabled a um campo zoom.
 * 
 * @param {String} id String com o id do campo zoom que deve ser desativado.
 */
function desativarZoom(id) {
	limparZoom(id);
	window[id].disable(true);
}

/**
 * @function limparZoom Limpa os valores de um campo zoom.
 * 
 * @param {String} id String com o id do campo zoom que deve ser ativado.
 */
function limparZoom(id) {
	window[id].clear();
}

/**
 * @function setSelectedZoomItem Função executa na seleção de um item de um campo zoom.
 * 
 * @param {Object} selectedItem Objeto com o conteúdo relacionado ao campo zoom.
 */
function setSelectedZoomItem(selectedItem) {
	let idCampoZoom = selectedItem.inputId;
	let numeroIdPaiFilho = null;
	if (idCampoZoom.indexOf('___') != -1) {
		let dadosZoom = idCampoZoom.split('___');
		idCampoZoom = dadosZoom[0];
		numeroIdPaiFilho = dadosZoom[1];
	}

	/** Início de campos zoom do painel Dados da Solicitação */
	// Preenche os campos ocultos relacionados ao solicitante selecionado
	if (idCampoZoom == 'nomeSolicitante') {
		$('#loginSolicitante').val(selectedItem.nomeSolicitante);
	}

	// Preenche os campos ocultos relacionados ao centro de custo selecionado
	if (idCampoZoom == 'centroCusto') {
		$('#loginGestor').val(selectedItem.loginGestor);
		$('#nomeGestor').val(selectedItem.zoomGestor);
	}
	/** Fim de campos zoom do painel Dados da Solicitação */


	/** Início de campos zoom do painel Itinerário */
	// Preenche o campo de estado de origem ao selecionar a cidade de origem do trajeto
	if (idCampoZoom == 'cidadeOrigem' && !estaVazio(numeroIdPaiFilho)) {
		$('#estadoOrigem___' + numeroIdPaiFilho).val(selectedItem.estado);
	}

	// Preenche o campo de estado de destino ao selecionar a cidade de destino do trajeto
	if (idCampoZoom == 'cidadeDestino' && !estaVazio(numeroIdPaiFilho)) {
		$('#estadoDestino___' + numeroIdPaiFilho).val(selectedItem.estado);
	}

	// Caso a cidade de origem ou destino seja alterada, altera a rota nas suas despesas associadas
	if ((idCampoZoom == 'cidadeOrigem' || idCampoZoom == 'cidadeDestino') && !estaVazio(numeroIdPaiFilho)) {
		let cidadeOrigem = $('#cidadeOrigem___' + numeroIdPaiFilho).val();
		let cidadeDestino = $('#cidadeDestino___' + numeroIdPaiFilho).val();
		let origemDestino = cidadeOrigem + ' > ' + cidadeDestino;

		$('[id^=origemDestino___]').each(function () {
			let elementoOrigemDestino = $(this);
			let numeroIdDespesa = getPosicaoPaiFilho(elementoOrigemDestino); //elementoOrigemDestino.prop('id').split('___')[1];

			if ($('#numeroTrajetoDespesa___' + numeroIdDespesa).val() == numeroIdPaiFilho) {
				elementoOrigemDestino.html(origemDestino);
			}
		});
	}
	/** Fim de campos zoom do painel Itinerário */


	/** Início de campos zoom do painel Despesas da Viagem */
	// Atualiza o zoom de fornecedores com apenas aqueles do tipo selecionado
	if (idCampoZoom == 'tipoFornecedor' && !estaVazio(numeroIdPaiFilho)) {
		let tituloDespesa = numeroIdPaiFilho + ' - ' + selectedItem.ramoAtividade;
		$('#tituloDespesa___' + numeroIdPaiFilho).html(tituloDespesa);
		$('#possuiLimite___' + numeroIdPaiFilho).val(selectedItem.possuiLimite);
		$('#valorLimite___' + numeroIdPaiFilho).val(selectedItem.valorLimite);
		controlarDetalhesTipoDespesa(selectedItem.ramoAtividade, numeroIdPaiFilho);
		ativarZoom('nomeFornecedor___' + numeroIdPaiFilho);
		atualizarZoom('nomeFornecedor___' + numeroIdPaiFilho, 'zoomTipoFornecedor', selectedItem.ramoAtividade);
	}

	// Preenche campos ocultos com os dados do fornecedor selecionado
	if (idCampoZoom == 'nomeFornecedor' && !estaVazio(numeroIdPaiFilho)) {
		let tipoFornecedor = $('#tipoFornecedor___'+numeroIdPaiFilho).val();
		let tituloDespesa = numeroIdPaiFilho + ' - ' + tipoFornecedor + ' - ' + selectedItem.nomeFornecedor;
		$('#tituloDespesa___' + numeroIdPaiFilho).html(tituloDespesa);
		$('#cnpjFornecedor___' + numeroIdPaiFilho).val(selectedItem.cnpj);
	}
	/** Fim de campos zoom do painel Despesas da Viagem */
}

/**
 * @function removedZoomItem Função executa na remoção de um item de um campo zoom.
 * 
 * @param {Object} removedItem Objeto com o conteúdo relacionado ao campo zoom.
 */
function removedZoomItem(removedItem) {
	let idCampoZoom = removedItem.inputId;
	let numeroIdPaiFilho = null;
	if (idCampoZoom.indexOf('___') != -1) {
		let dadosZoom = idCampoZoom.split('___');
		idCampoZoom = dadosZoom[0];
		numeroIdPaiFilho = dadosZoom[1];
	}

	/** Início de campos zoom do painel Dados da Solicitação */
	// Limpa os campos ocultos relacionados ao gestor selecionado anteriormente
	if (idCampoZoom == 'nomeSolicitante') {
		$('#loginSolicitante').val('');
	}

	// Limpa os campos ocultos relacionados ao gestor selecionado anteriormente
	if (idCampoZoom == 'nomeGestor') {
		$('#loginGestor').val('');
	}
	/** Fim de campos zoom do painel Dados da Solicitação */


	/** Início de campos zoom do painel Itinerário */
	// Limpa o campo do estado de origem do trajeto em questão
	if (idCampoZoom == 'cidadeOrigem' && !estaVazio(numeroIdPaiFilho)) {
		$('#estadoOrigem___' + numeroIdPaiFilho).val('');
	}

	// Limpa o campo do estado de destino do trajeto em questão
	if (idCampoZoom == 'cidadeDestino' && !estaVazio(numeroIdPaiFilho)) {
		$('#estadoDestino___' + numeroIdPaiFilho).val('');
	}
	/** Fim de campos zoom do painel Itinerário */


	/** Início de campos zoom do painel Despesas da Viagem */
	// Atualiza o zoom de fornecedores com apenas aqueles do tipo selecionado
	if (idCampoZoom == 'tipoFornecedor' && !estaVazio(numeroIdPaiFilho)) {
		let tituloDespesa = numeroIdPaiFilho + ' - Preencha a despesa';
		$('#tituloDespesa___' + numeroIdPaiFilho).html(tituloDespesa);
		$('#possuiLimite___' + numeroIdPaiFilho).val('');
		$('#valorLimite___' + numeroIdPaiFilho).val('');
		desativarZoom('nomeFornecedor___' + numeroIdPaiFilho);
		alternarDetalhesTipoDespesa(null, numeroIdPaiFilho);
	}

	// Preenche campos ocultos com os dados do fornecedor selecionado
	if (idCampoZoom == 'nomeFornecedor' && !estaVazio(numeroIdPaiFilho)) {
		let tipoFornecedor = $('#tipoFornecedor___'+numeroIdPaiFilho).val();
		let tituloDespesa = numeroIdPaiFilho + ' - ' + tipoFornecedor;
		$('#tituloDespesa___' + numeroIdPaiFilho).html(tituloDespesa);
		$('#cnpjFornecedor___' + numeroIdPaiFilho).val('');
	}
	/** Fim de campos zoom do painel Despesas da Viagem */
}