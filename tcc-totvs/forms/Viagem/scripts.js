var quantidadeIdsVoos = 1;

$(document).ready(function () {
	$(document).on('blur', '.obrigatorio, .validacaoZoom .select2-search__field', function () {
		validarCampoVazio($(this));
	});

	$('#btnAdicionarDespesa').on('click', function () {
		adicionarDespesa();
	});

	$('#idaPrevista, #voltaPrevista').on('blur', function () {
		let input = $(this);
		let mensagem = '';
		let idaPrevista = '';
		let voltaPrevista = '';

		if (input.prop('id') == 'idaPrevista') {
			idaPrevista = input.val();
			voltaPrevista = $('#voltaPrevista').val();
			mensagem = 'A data da ida deve ser anterior ou igual a volta prevista.';
		} else if (input.prop('id') == 'voltaPrevista') {
			idaPrevista = $('#idaPrevista').val();
			voltaPrevista = input.val();
			mensagem = 'A data da volta deve ser posterior ou igual a ida prevista.'
		}

		if (!estaVazio(idaPrevista) && !estaVazio(voltaPrevista) && !compararDatas(idaPrevista, voltaPrevista)) {
			toast(mensagem, '', 'warning');
			input.val('');
		}
	});
});

// APIs para busca de aeroportos:
// https://any-api.com/?query=airport
// http://iatacodes.org/#/get_started

/**
 * @function adicionarDespesa Adiciona uma nova despesa no painel de despesas.
 */
function adicionarDespesa() {
	$('[id^=despesa___]').each(function () {
		$(this).collapse('hide');
	});

	const numeroIdDespesa = wdkAddChild('despesas');
	// let quantidadeDespesas = $('[id^=despesa___]').length;

	$('#btnDetalhesDespesa___' + numeroIdDespesa).attr('href', '#despesa___' + numeroIdDespesa);

	if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
		$('#despesaPrevista___' + numeroIdDespesa).val('nao');
	}

	$('.bodyDespesas').show();
	limparZoom('tipoFornecedor___' + numeroIdDespesa);
	limparZoom('nomeFornecedor___' + numeroIdDespesa);
	desativarZoom('nomeFornecedor___' + numeroIdDespesa);
	FLUIGC.calendar('.calendario', {
		pickDate: true,
		pickTime: false
	});
	FLUIGC.calendar('.calendarioHora', {
		pickDate: true,
		pickTime: true,
		sideBySide: true
	});
	FLUIGC.utilities.scrollTo('#despesa___' + numeroIdDespesa, 500);

	$('.real').unmask();
	$('.real').maskMoney({
		prefixMoney: 'R$ ',
		placeholder: 'R$ 0,00'
	});
}

/**
 * @function excluirDespesa Exclui uma despesa do painel de despesas.
 * 
 * @param {Object} elemento Elemento do DOM clicado para realizar a remoção da despesa.
 */
function excluirDespesa(elemento) {
	FLUIGC.message.confirm({
		message: 'Tem certeza que deseja excluir esta despesa?',
		title: 'Excluir Despesa',
		labelYes: 'Excluir',
		labelNo: 'Cancelar'
	}, function (confirmar) {
		if (confirmar) {
			fnWdkRemoveChild(elemento);

			const quantidadeDespesas = $('[id^=despesa___]').length;
			if (quantidadeDespesas == 0) $('.bodyDespesas').hide();
		}
	});
}

/**
 * @function cadastrarVoo Adiciona ou edita um voo existente de acordo com os parâmetros informados.
 * 
 * @param {Object} elemento Objeto que pode ser o botão de adicionar voo do DOM ou dados contendo o numero do id da despesa e do voo, no caso de edição.
 * @param {String} tipo Aceita dois parâmetros de acordo com o que deve ser feito, sendo eles:
 * - adicionar
 * - editar
 */
function cadastrarVoo(elemento, tipo) {
	let numeroIdDespesa = null;
	let numeroIdVoo = null;
	if (tipo == 'adicionar') {
		numeroIdDespesa = getPosicaoPaiFilho(elemento);
	} else if (tipo == 'editar') {
		numeroIdDespesa = elemento.numeroIdDespesa;
		numeroIdVoo = elemento.numeroIdVoo;
		elemento = JSON.parse($('#jsonVoos___' + numeroIdDespesa).val());
		elemento = elemento[elemento.findIndex(voo => voo.numeroIdDespesa == numeroIdDespesa && voo.numeroIdVoo == numeroIdVoo)];
	}
	let fornecedor = $('#nomeFornecedor___' + numeroIdDespesa).val();

	// Só permite adicionar um voo se um fornecedor estiver selecionado
	if (!estaVazio(fornecedor)) {
		const html = $('.cadastroVoo').html();
		const dados = {
			aeroportoOrigem: estaVazio(elemento.aeroportoOrigem) ? '' : elemento.aeroportoOrigem,
			aeroportoDestino: estaVazio(elemento.aeroportoDestino) ? '' : elemento.aeroportoDestino,
			dataHoraVoo: estaVazio(elemento.dataHoraVoo) ? '' : elemento.dataHoraVoo,
			numeroVoo: estaVazio(elemento.numeroVoo) ? '' : elemento.numeroVoo
		}
		const template = Mustache.render(html, dados);

		const modalVoo = FLUIGC.modal({
			title: 'Cadastro de Voo',
			content: template,
			id: 'modalVoo',
			size: 'full',
			actions: [{
				'label': 'Salvar',
				'bind': 'data-salvar-voo'
			}, {
				'label': 'Cancelar',
				'autoClose': true
			}]
		});

		FLUIGC.calendar('.calendarioHora', {
			pickDate: true,
			pickTime: true,
			sideBySide: true
		});

		$(document).on('blur', '#modalVoo .obrigatorio', function () {
			validarCampoVazio($(this));
		});

		$('[data-salvar-voo]').on('click', function () {
			const salvou = salvarVoo(numeroIdDespesa, (estaVazio(numeroIdVoo) ? quantidadeIdsVoos : numeroIdVoo), tipo);
			if (salvou) {
				criarTabelaVoos(numeroIdDespesa);
				estaVazio(numeroIdVoo) ? quantidadeIdsVoos++ : null;
				modalVoo.remove();
				toast('Voo salvo com sucesso.', '', 'success');
			} else {
				$('#modalVoo .obrigatorio').blur();
				toast('Preencha os campos em vermelho.', '', 'warning');
			}
		});
	} else {
		toast('Selecione um fornecedor antes de adicionar um voo.', '', 'warning');
	}

}

/**
 * @function excluirVoo Exclui um voo de acordo com os parâmetros informados.
 * 
 * @param {Number} numeroIdDespesa Número do id da despesa ao qual o voo pertence.
 * @param {Number} numeroIdVoo Número do id do voo.
 */
function excluirVoo(numeroIdDespesa, numeroIdVoo) {
	FLUIGC.message.confirm({
		message: 'Tem certeza que deseja excluir esta despesa?',
		title: 'Excluir Despesa',
		labelYes: 'Excluir',
		labelNo: 'Cancelar'
	}, function (confirmar) {
		if (confirmar) {
			let jsonVoos = JSON.parse($('#jsonVoos___' + numeroIdDespesa).val());
			jsonVoos.splice(jsonVoos.findIndex(voo => voo.numeroIdDespesa == numeroIdDespesa && voo.numeroIdVoo == numeroIdVoo), 1);
			$('#jsonVoos___' + numeroIdDespesa).val(JSON.stringify(jsonVoos));
			criarTabelaVoos(numeroIdDespesa);
		}
	});
}

/**
 * @function criarTabelaVoos Monta a tabela com os voos cadastrados pelo usuário de acordo com o que foi salvo no campo jsonVoos de uma determinada despesa.
 * 
 * @param {Number} numeroIdDespesa Número do id da despesa.
 */
function criarTabelaVoos(numeroIdDespesa) {
	let jsonVoos = $('#jsonVoos___' + numeroIdDespesa).val();
	jsonVoos = estaVazio(jsonVoos) ? [] : JSON.parse(jsonVoos);

	FLUIGC.datatable('#voos___' + numeroIdDespesa, {
		dataRequest: jsonVoos,
		renderContent: '.tabelaVoos',
		header: [{
			'title': 'Origem',
			'size': 'col-md-3'
		}, {
			'title': 'Destino',
			'size': 'col-md-3'
		}, {
			'title': 'Data do Voo',
			'size': 'col-md-3'
		}, {
			'title': 'Voo',
			'size': 'col-md-1'
		}, {
			'title': 'Opções',
			'size': 'col-md-2 opcoesVoo'
		}],
		search: {
			enabled: false,
		},
		navButtons: {
			enabled: false,
		},
		tableStyle: 'table-condensed'
	});

	// Se não estiver no início, esconde as opções de editar e excluir voo
	if (codigoAtividade != ATIVIDADE.INICIO && codigoAtividade != 0) {
		$('.opcoesVoo').hide();
	}
}

/**
 * @function salvarVoo Salva um voo de acordo com os parâmetros informados.
 * 
 * @param {Number} numeroIdDespesa Número do id da despesa.
 * @param {Number} numeroIdVoo Número do id do voo.
 * @param {String} tipo Tipo de operação que será realizada, podendo ser:
 * - adicionar
 * - editar
 */
function salvarVoo(numeroIdDespesa, numeroIdVoo, tipo) {
	let jsonVoos = $('#jsonVoos___' + numeroIdDespesa).val();
	const aeroportoOrigem = $('#aeroportoOrigem').val();
	const aeroportoDestino = $('#aeroportoDestino').val();
	const dataHoraVoo = $('#dataHoraVoo').val();
	const numeroVoo = $('#numeroVoo').val();

	if (estaVazio(aeroportoOrigem) || estaVazio(aeroportoDestino) || estaVazio(dataHoraVoo) || estaVazio(numeroVoo)) {
		return false;
	} else {
		if (!estaVazio(jsonVoos)) jsonVoos = JSON.parse(jsonVoos);
		else jsonVoos = [];

		if (tipo == 'adicionar') {
			jsonVoos.push({
				numeroIdDespesa: parseInt(numeroIdDespesa),
				numeroIdVoo: numeroIdVoo,
				aeroportoOrigem: aeroportoOrigem,
				aeroportoDestino: aeroportoDestino,
				dataHoraVoo: dataHoraVoo,
				numeroVoo: numeroVoo
			});
		} else if (tipo == 'editar') {
			let index = jsonVoos.findIndex(voo => voo.numeroIdDespesa == numeroIdDespesa && voo.numeroIdVoo == numeroIdVoo);
			jsonVoos[index].aeroportoOrigem = aeroportoOrigem;
			jsonVoos[index].aeroportoDestino = aeroportoDestino;
			jsonVoos[index].dataHoraVoo = dataHoraVoo;
			jsonVoos[index].numeroVoo = numeroVoo;
		}

		jsonVoos = JSON.stringify(jsonVoos);
		$('#jsonVoos___' + numeroIdDespesa).val(jsonVoos);
		return true;
	}
}

/**
 * @function verificarAprovacao Verifica aprovação do gestor ou do financeiro por despesa e adiciona um layout conforme seu status.
 * 
 * @param {String} idTipo Tipo de aprovação a ser verificada, podendo ser:
 * - Gestor
 * - Financeiro
 */
function verificarAprovacao(idTipo) {
	$('[id^=panelDespesa___]').each(function () {
		const panelDespesa = $(this);
		const numeroIdDespesa = getPosicaoPaiFilho(panelDespesa);
		const elementoAprovacao = $('#aprovacao' + idTipo + '___' + numeroIdDespesa);
		const aprovacao = elementoAprovacao.val();

		if (!estaVazio(aprovacao)) {
			if (codigoAtividade == ATIVIDADE.INICIO || codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
				elementoAprovacao.attr('readonly', true);
				if (elementoAprovacao.prop("tagName") == 'SELECT') {
					elementoAprovacao.css({
						'pointer-events': 'none',
						'touch-action': 'none'
					});
				}
			}
			const tituloDespesa = $('#tituloDespesa___' + numeroIdDespesa);
			let classe = 'text-success';
			let cor = '#38cf5a';
			let icone = 'fluigicon-check-circle-on';

			if (aprovacao == 'reprovar') {
				classe = 'text-danger';
				cor = '#f64445';
				icone = 'fluigicon-remove icon-sm';
				$('#btnExcluirDespesa___' + numeroIdDespesa).prop('disabled', true);
			} else if (aprovacao == 'ajustar') {
				classe = 'text-warning';
				cor = '#dfaa1e';
				icone = 'fluigicon-warning-sign';
			}

			panelDespesa.css('border', '1px solid ' + cor);
			tituloDespesa.css('color', cor);
			tituloDespesa.append(' <i class="fluigicon ' + icone + ' icon-sm ' + classe + '"></i>');
		}
	});
}

/**
 * @function calcularValorTotal Calcula o valor total das despesas de acordo com o tipo informado.
 * 
 * @param {String} tipo  Tipo de valor calculado, podendo ser:
 * - Previsto
 * - Efetivo
 */
function calcularValorTotal(tipo) {
	let valorTotal = 0;
	$('[id^=valor' + tipo + 'SM___]').each(function () {
		valorTotal += parseFloat($(this).val());
	});
	$('#total' + tipo + 'SM').val(valorTotal);
	$('#total' + tipo).val(valorTotal);
	$('.real').unmask();
	$('.real').maskMoney({
		prefixMoney: 'R$ ',
		placeholder: 'R$ 0,00'
	});
}

/**
 * @function salvarValorSemMascara Salva o valor em reais digitado em um campo com máscara em outro campo escondido sem máscara.
 * 
 * @param {Object} elemento Objeto do DOM que contém o valor em reais com máscara.
 * @param {String} tipo Tipo de valor calculado, podendo ser:
 * - Previsto
 * - Efetivo
 */
function salvarValorSemMascara(elemento, tipo) {
	const numeroIdDespesa = getPosicaoPaiFilho(elemento);
	const valor = removerMascaraReal(elemento);
	$('#valor' + tipo + 'SM___' + numeroIdDespesa).val(valor);
	calcularValorTotal(tipo);
}

/**
 * @function removerMascaraReal Remove a máscara de reais sobre o valor de um campo especificado por parâmetro.
 * 
 * @param {Object} elemento Campo do DOM que contém o valor em reais com máscara.
 */
function removerMascaraReal(elemento) {
	const valor = $(elemento).cleanVal();
	return parseFloat(valor.substring(0, valor.length - 2) + '.' + valor.substr(-2));
}





// /**
//  * @deprecated
//  * @function adicionarDespesa_OLD Adiciona um novo filho no painel Despesas da Viagem.
//  * 
//  * @param {Object} elemento Objeto do JQuery com o botão de adicionar despesa clicado.
//  */
// function adicionarDespesa_OLD(elemento) {
// 	let trajeto = $(elemento).prop('id').split('___')[1];
// 	let campoVazioTrajeto = [];

// 	$('#trTrajeto___' + trajeto).find('input').each(function () {
// 		campoVazioTrajeto.push(validarCampoVazio($(this)));
// 	});

// 	if (campoVazioTrajeto.includes(true)) {
// 		toast('Preencha todos os campos do trajeto ' + trajeto + '.', '', 'warning');
// 	} else {
// 		let numeroIdDespesa = wdkAddChild('despesasViagem');

// 		FLUIGC.calendar('.calendario', {
// 			pickDate: true,
// 			pickTime: false
// 		});
// 		FLUIGC.calendar('.calendarioHora', {
// 			pickDate: true,
// 			pickTime: true,
// 			sideBySide: true
// 		});

// 		if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
// 			$('#despesaPrevista___' + numeroIdDespesa).val('nao');
// 		}
// 		$('#numeroTrajetoDespesa___' + numeroIdDespesa).val(trajeto);
// 		let cidadeOrigem = $('#cidadeOrigem___' + trajeto).val();
// 		let cidadeDestino = $('#cidadeDestino___' + trajeto).val();
// 		let origemDestino = cidadeOrigem + ' > ' + cidadeDestino;
// 		$('#origemDestino___' + numeroIdDespesa).html(origemDestino);
// 		desativarZoom('nomeFornecedor___' + numeroIdDespesa);

// 		$('#panelDespesasViagem').show();
// 		FLUIGC.utilities.scrollTo('#numeroTrajetoDespesa___' + numeroIdDespesa, 500);

// 		esconderUltimaHr('hrDespesa___');
// 		$('#panelDespesasViagem').show();
// 		atualizarZoom('fornecedor___' + numeroIdDespesa);
// 		atualizarZoom('tipoFornecedor___' + numeroIdDespesa);

// 		$('.real').maskMoney({
// 			prefixMoney: 'R$ ',
// 			placeholder: 'R$ 0,00'
// 		});
// 	}
// }

// /**
//  * @deprecated
//  * @function adicionarTrajeto Adiciona um novo trajeto ao pai filho do painel de itinerário caso as datas previstas da viagem estejam preenchidas.
//  */
// function adicionarTrajeto() {
// 	let idaPrevista = $('#idaPrevista').val();
// 	let voltaPrevista = $('#voltaPrevista').val();

// 	if (!estaVazio(idaPrevista) && !estaVazio(voltaPrevista)) {
// 		let trajeto = wdkAddChild('itinerario');
// 		$('.trajetos').show();
// 		$('#trajeto___' + trajeto).val(trajeto);

// 		atualizarZoom('cidadeOrigem___' + trajeto);
// 		atualizarZoom('cidadeDestino___' + trajeto);

// 		esconderUltimaHr('hrTrajeto___');

// 		FLUIGC.calendar('.calendario', {
// 			pickDate: true,
// 			pickTime: false
// 		});
// 		$('.trajetos').show();
// 		FLUIGC.utilities.scrollTo('#trajeto___' + trajeto, 500);
// 	} else {
// 		if (idaPrevista == '') {
// 			toast('A ida prevista da viagem deve estar preenchida.', '', 'warning');
// 		} else if (voltaPrevista == '') {
// 			toast('A volta prevista da viagem deve estar preenchida.', '', 'warning');
// 		}
// 	}
// }

// /**
//  * @deprecated
//  * @function excluirDespesa Exclui uma despesa do pai filho.
//  * 
//  * @param {Object} elemento Objeto do JQuery que é acionado ao excluir uma despesa.
//  */
// function excluirDespesa_OLD(elemento) {
// 	fnWdkRemoveChild(elemento);
// 	let quantidadeDespesas = $('[id^=numeroTrajetoDespesa___]').length;
// 	if (quantidadeDespesas == 0) $('#panelDespesasViagem').hide();
// 	else esconderUltimaHr('hrDespesa___');
// }

// /**
//  * @deprecated
//  * @function excluirTrajeto Exclui um trajeto do pai filho do painel de Itinerário se ele não tiver despesas associadas.
//  * 
//  * @param {Object} elemento Objeto do JQuery que é acionado ao excluir um trajeto.
//  */
// function excluirTrajeto(elemento) {
// 	let numeroIdTrajeto = getPosicaoPaiFilho(elemento);
// 	let existeDespesa = false;

// 	$('[id^=numeroTrajetoDespesa___]').each(function () {
// 		if ($(this).val() == numeroIdTrajeto) existeDespesa = true;
// 	});

// 	if (!existeDespesa) {
// 		fnWdkRemoveChild(elemento);
// 		let quantidadeTrajetos = $('[id^=trajeto___]').length;
// 		if (quantidadeTrajetos == 0) $('.trajetos').hide();
// 		else esconderUltimaHr('hrTrajetos___');
// 	} else toast('É necessário excluir todas as despesas deste trajeto antes de removê-lo.', '', 'warning');
// }