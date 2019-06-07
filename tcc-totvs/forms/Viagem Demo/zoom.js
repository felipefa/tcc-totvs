function setSelectedZoomItem(selectedItem) {
	let idCampoZoom = selectedItem.inputId;
	let numeroIdPaiFilho = idCampoZoom.indexOf('___') != -1 ? idCampoZoom.split('___')[1] : null;

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
	if (idCampoZoom.indexOf('cidadeOrigem') != -1) {
		$('#estadoOrigem___' + numeroIdPaiFilho).val(selectedItem.estado);
	}

	// Preenche o campo de estado de destino ao selecionar a cidade de destino do trajeto
	if (idCampoZoom.indexOf('cidadeDestino') != -1) {
		$('#estadoDestino___' + numeroIdPaiFilho).val(selectedItem.estado);
	}

	// Caso a cidade de origem ou destino seja alterada, altera a rota nas suas despesas associadas
	if (idCampoZoom.indexOf('cidadeOrigem') != -1 || idCampoZoom.indexOf('cidadeDestino') != -1) {
		let cidadeOrigem = $('#cidadeOrigem___' + numeroIdPaiFilho).val();
		let cidadeDestino = $('#cidadeDestino___' + numeroIdPaiFilho).val();
		let origemDestino = cidadeOrigem + ' > ' + cidadeDestino;

		$('[id*=origemDestino___]').each(function () {
			let elementoOrigemDestino = $(this);
			let numeroIdDespesa = elementoOrigemDestino.prop('id').split('___')[1];

			if ($('#numeroTrajeto___' + numeroIdDespesa).val() == numeroIdPaiFilho) {
				elementoOrigemDestino.html(origemDestino);
			}
		});
	}
	/** Fim de campos zoom do painel Itinerário */


	/** Início de campos zoom do painel Despesas da Viagem */
	// Atualiza o zoom de fornecedores com apenas aqueles do tipo selecionado
	if (idCampoZoom.indexOf('tipoFornecedor') != -1) {
		$('#possuiLimite___' + numeroIdPaiFilho).val(selectedItem.possuiLimite);
		$('#valorLimite___' + numeroIdPaiFilho).val(selectedItem.valorLimite);
		atualizarZoom('nomeFornecedor___' + numeroIdPaiFilho, 'zoomTipoFornecedor', selectedItem.ramoAtividade);
		controlarDetalhesTipoDespesa(selectedItem.ramoAtividade);
	}

	// Preenche campos ocultos com os dados do fornecedor selecionado
	if (idCampoZoom.indexOf('fornecedor') != -1) {
		$('#cnpjFornecedor___' + numeroIdPaiFilho).val(selectedItem.cnpj);
	}
	/** Fim de campos zoom do painel Despesas da Viagem */
}

function removedZoomItem(removedItem) {
	let idCampoZoom = removedItem.inputId;
	let numeroIdPaiFilho = idCampoZoom.indexOf('___') != -1 ? idCampoZoom.split('___')[1] : null;

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
	if (idCampoZoom.indexOf('cidadeOrigem') != -1) {
		$('#estadoOrigem___' + numeroIdPaiFilho).val('');
	}

	// Limpa o campo do estado de destino do trajeto em questão
	if (idCampoZoom.indexOf('cidadeDestino') != -1) {
		$('#estadoDestino___' + numeroIdPaiFilho).val('');
	}
	/** Fim de campos zoom do painel Itinerário */


	/** Início de campos zoom do painel Despesas da Viagem */
	// Atualiza o zoom de fornecedores com apenas aqueles do tipo selecionado
	if (idCampoZoom.indexOf('tipoFornecedor') != -1) {
		$('#possuiLimite___' + numeroIdPaiFilho).val('');
		$('#valorLimite___' + numeroIdPaiFilho).val('');
		atualizarZoom('nomeFornecedor___' + numeroIdPaiFilho, null);
		alternarDetalhesTipoDespesa(null);
	}

	// Preenche campos ocultos com os dados do fornecedor selecionado
	if (idCampoZoom.indexOf('fornecedor') != -1) {
		$('#cnpjFornecedor___' + numeroIdPaiFilho).val('');
	}
	/** Fim de campos zoom do painel Despesas da Viagem */
}

/**
 * @function atualizarZoom Atualiza os valores do campo zoom informado de acordo com o filtro informado.
 * 
 * @param {String} inputName Name do campo zoom que deve ser atualizado
 * @param {String} campo Nome do campo filtro
 * @param {String} valor Valor que deve ser filtrado
 */
function atualizarZoom(inputName, campo, valor) {
	reloadZoomFilterValues(inputName, campo + ',' + valor);
}