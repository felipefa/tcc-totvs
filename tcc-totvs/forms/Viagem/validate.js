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
			return false;
		}

		if (numState == ATIVIDADE.APROVACAO_FINANCEIRO) {
			if (verificarAprovacoes('Financeiro')) return true;
			return false;
		}

		if (numState == ATIVIDADE.ACERTO_VIAGEM) {
			let valido = true;
			let mensagem = 'Informe a data da ida efetiva.';
			const idaEfetiva = $('#idaEfetiva');

			if (validarCampoVazio(idaEfetiva)) valido = false;
			else {
				const voltaEfetiva = $('#voltaEfetiva');
				if (validarCampoVazio(voltaEfetiva)) {
					valido = false;
					mensagem = 'Informe a data da volta efetiva.'
				} else {
					mensagem = 'Informe se a despesa foi efetuada.';
					const quantidadeDespesas = $('[id^=despesaEfetuada___]').length;

					$('[id^=despesaEfetuada___]').each(function () {
						const elementoEfetuado = $(this);
						const numeroIdDespesa = getPosicaoPaiFilho(elementoEfetuado);

						if (validarCampoVazio(elementoEfetuado)) {
							valido = false;
							if (quantidadeDespesas == 1) mensagem = 'Informe se a despesa foi efetuada.';
							else mensagem = 'Informe se todas as despesas foram efetuadas.';
						} else if (elementoEfetuado.val() == 'sim') {
							const valorEfetivo = $('#valorEfetivo___' + numeroIdDespesa);
							if (validarCampoVazio(valorEfetivo)) {
								valido = false;
								if (quantidadeDespesas == 1) mensagem = 'Informe o valor efetivo da despesa.';
								else mensagem = 'Informe os valores efetivos das despesas.';
							} else {
								const dataEfetiva = $('#dataEfetiva___' + numeroIdDespesa).val();
								if (estaVazio(dataEfetiva)) {
									validarCamposPanel('#despesa___' + numeroIdDespesa, '.atividadeAcerto');
									valido = false;
									if (quantidadeDespesas == 1) mensagem = 'Informe a data efetiva da despesa.';
									else mensagem = 'Informe as datas efetivas das despesas.';
								}
							}
						}
					});
				}
			}

			if (!valido) toast('Atenção!', mensagem, 'warning');

			return valido;
		}
	} catch (e) {
		throw (e.toString());
	}
}

/**
 * Valida os campos de um painel.
 * 
 * @param {String} id Id do painel que deve ser verificado.
 * @param {String} classeAtividade Classe com o nome da atividade que será verificada.
 */
function validarCamposPanel(id, classeAtividade) {
	let valido = true;

	$(id + ' .obrigatorio' + classeAtividade + ', ' + id + ' .validacaoZoom' + classeAtividade + ' .select2-search__field').each(function () {
		const vazio = validarCampoVazio($(this));
		if (vazio) valido = false;
	});

	// Valida despesas na atividade início
	if (valido && id.indexOf('despesa') != -1) {
		const numeroIdDespesa = getPosicaoPaiFilho(id);
		const tipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa).val();
		switch (tipoFornecedor) {
			case 'Aluguel de Veículos':
				valido = !estaVazio($('#dataRetirada___' + numeroIdDespesa).val());
				valido = valido ? !estaVazio($('#dataDevolucao___' + numeroIdDespesa).val()) : false;
				break;
			case 'Hospedagem':
				valido = !estaVazio($('#hospedagemCheckin___' + numeroIdDespesa).val());
				valido = valido ? !estaVazio($('#hospedagemCheckout___' + numeroIdDespesa).val()) : false;
				valido = valido ? !estaVazio($('#hospedagemDiarias___' + numeroIdDespesa).val()) : false;
				break;
			case 'Km Rodado':
				valido = !estaVazio($('#proprioOrigem___' + numeroIdDespesa).val());
				valido = valido ? !estaVazio($('#proprioDestino___' + numeroIdDespesa).val()) : false;
				valido = valido ? !estaVazio($('#proprioData___' + numeroIdDespesa).val()) : false;
				valido = valido ? !estaVazio($('#proprioDistancia___' + numeroIdDespesa).val()) : false;
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

/**
 * Verifica as aprovações das despesas para determinar a próxima atividade.
 * 
 * @param {String} tipo Tipo de aprovação. São aceitos: 
 * - Gestor
 * - Financeiro
 */
function verificarAprovacoes(tipo) {
	const aprovacoes = [];
	let possuiJustificativa = true;
	let valido = true;

	$('[id^=aprovacao' + tipo + '___]').each(function () {
		const elementoAprovacao = $(this);
		const numeroIdDespesa = getPosicaoPaiFilho(elementoAprovacao);
		const justificativa = $('#justificativa' + tipo + '___' + numeroIdDespesa).val();
		aprovacoes.push(elementoAprovacao.val());
		if (estaVazio(justificativa) && elementoAprovacao.val() != 'aprovar') possuiJustificativa = false;
	});

	if (aprovacoes.indexOf('') != -1 || aprovacoes.indexOf(null) != -1) {
		valido = false;
		toast('Atenção!', 'Todas as despesas devem ser verificadas.', 'warning');
	} else if (possuiJustificativa) {
		if (aprovacoes.indexOf('ajustar') != -1) {
			$('#aprovacao' + tipo + 'Final').val('ajustar');
		} else if (aprovacoes.indexOf('aprovar') != -1) {
			$('#aprovacao' + tipo + 'Final').val('aprovar');
		} else {
			$('#aprovacao' + tipo + 'Final').val('reprovar');
		}
	} else {
		valido = false;
		toast('Atenção!', 'É necessário informar uma justificativa para despesas não aprovadas.', 'warning');
	}

	return valido;
}