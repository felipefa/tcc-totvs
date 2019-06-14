var beforeSendValidate = function (numState, nextState) {
	try {
		if (numState == ATIVIDADE.INICIO || numState == 0) {
			if (!validarCamposPanel('#panelDadosSolicitacao', '.atividadeInicio')) {
				toast('Atenção!', 'Preencha todos os dados da solicitação.', 'warning');
				return false;
			}

			if (!validarCamposPanel('#panelItinerario', '.atividadeInicio')) {
				toast('Atenção!', 'Preencha todo o itinerário.', 'warning');
				return false;
			}

			const quantidadeDespesas = $('[id^=despesa___]').length;
			if (quantidadeDespesas == 0) {
				toast('Atenção!', 'Ao menos uma despesa deve ser incluída.', 'warning');
				return false;
			} else {
				let valido = true;
				$('[id^=despesa___]').each(function () {
					const numeroIdDespesa = getPosicaoPaiFilho($(this));
					if (!validarCamposPanel('#despesa___' + numeroIdDespesa, '.atividadeInicio')) valido = false;
				});
				if (!valido) {
					toast('Atenção!', 'Preencha todos os dados da(s) despesa(s).', 'warning');
					return false;
				}
			}

			return true;
		}

		if (numState == ATIVIDADE.APROVACAO_GESTOR) {
			if (verificarAprovacoes('Gestor')) return true;
			toast('Atenção!', 'Todas as despesas devem ser verificadas.', 'warning');
			return false;
		}

		if (numState == ATIVIDADE.APROVACAO_FINANCEIRO) {
			if (verificarAprovacoes('Financeiro')) return true;
			toast('Atenção!', 'Todas as despesas devem ser verificadas.', 'warning');
			return false;
		}

		if (numState == ATIVIDADE.ACERTO_VIAGEM) {}
	} catch (e) {
		throw (e.toString());
	}
}

function validarCamposPanel(id, classeAtividade) {
	let valido = true;

	$(id + ' .obrigatorio' + classeAtividade + ', ' + id + ' .validacaoZoom' + classeAtividade + ' .select2-search__field').each(function () {
		const vazio = validarCampoVazio($(this));
		if (vazio) valido = false;
	});

	// Valida despesas na atividade início
	if (valido && id.indexOf('despesa') != -1) {
		const numeroIdDespesa = getPosicaoPaiFilho(id);
		const tipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa).val()[0];
		switch (tipoFornecedor) {
			case 'Aluguel de Veículos':
				valido = !estaVazio($('#dataRetirada___' + numeroIdDespesa).val());
				valido = valido?!estaVazio($('#dataDevolucao___' + numeroIdDespesa).val()):false;
				break;
			case 'Hospedagem':
				valido = !estaVazio($('#hospedagemCheckin___' + numeroIdDespesa).val());
				valido = valido?!estaVazio($('#hospedagemCheckout___' + numeroIdDespesa).val()):false;
				valido = valido?!estaVazio($('#hospedagemDiarias___' + numeroIdDespesa).val()):false;
				break;
			case 'Próprio':
				valido = !estaVazio($('#proprioOrigem___' + numeroIdDespesa).val());
				valido = valido?!estaVazio($('#proprioDestino___' + numeroIdDespesa).val()):false;
				valido = valido?!estaVazio($('#proprioData___' + numeroIdDespesa).val()):false;
				valido = valido?!estaVazio($('#proprioDistancia___' + numeroIdDespesa).val()):false;
				break;
			case 'Transporte Aéreo':
			case 'Transporte Terrestre':
				valido = !estaVazio($('#jsonTrajetos___' + numeroIdDespesa).val());
				break;
			default:
				valido = !estaVazio($('#dataPrevista___' + numeroIdDespesa).val());
				break;
		}
	}

	return valido;
}

function verificarAprovacoes(tipo) {
	const aprovacoes = [];

	$('[id^=aprovacao' + tipo + '___]').each(function () {
		aprovacoes.push($(this).val());
	});

	if (aprovacoes.indexOf('') != -1 || aprovacoes.indexOf(null) != -1) {
		return false;
	} else if (aprovacoes.indexOf('ajustar') != -1) {
		$('#aprovacao' + tipo + 'Final').val('ajustar');
	} else if (aprovacoes.indexOf('aprovar') != -1) {
		$('#aprovacao' + tipo + 'Final').val('aprovar');
	} else {
		$('#aprovacao' + tipo + 'Final').val('reprovar');
	}
	return true;
}