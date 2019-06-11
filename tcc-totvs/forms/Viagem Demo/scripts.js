var quantidadeIdsVoos = 1;

$(document).ready(function () {
	$('#btnNovoTrajeto').on('click', function () {
		adicionarTrajeto();
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

function adicionarDespesa() {
	$('[id^=despesa___]').each(function () {
		$(this).collapse('hide');
	});

	let numeroIdDespesa = wdkAddChild('despesas');
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

	$('.real').maskMoney({
		prefixMoney: 'R$ ',
		placeholder: 'R$ 0,00'
	});
}

function excluirDespesa(elemento) {
	fnWdkRemoveChild(elemento);

	let quantidadeDespesas = $('[id^=despesa___]').length;
	if (quantidadeDespesas == 0) $('.bodyDespesas').hide();
}

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
		let html = `<div class="row">
						<div class="form-group col-md-4">
							<label class="control-label" for="aeroportoOrigem">Aeroporto de Origem</label>
							<input id="aeroportoOrigem" class="form-control"
								type="text" name="aeroportoOrigem" value="${estaVazio(elemento.aeroportoOrigem)?'':elemento.aeroportoOrigem}">
						</div>
						<div class="form-group col-md-4">
							<label class="control-label" for="aeroportoDestino">Aeroporto de Destino</label>
							<input id="aeroportoDestino" class="form-control"
								type="text" name="aeroportoDestino" value="${estaVazio(elemento.aeroportoDestino)?'':elemento.aeroportoDestino}">
						</div>
						<div class="form-group col-md-3">
							<label class="control-label" for="dataHoraVoo">Data do Voo</label>
							<div class="input-group" style="cursor: pointer;">
								<input type="text"
									class="form-control calendarioHora"
									placeholder="Selecione" name="dataHoraVoo"
									id="dataHoraVoo" value="${estaVazio(elemento.dataHoraVoo)?'':elemento.dataHoraVoo}">
								<span class="input-group-addon">
									<span class="fluigicon fluigicon-calendar"></span>
								</span>
							</div>
						</div>
						<div class="form-group col-md-1">
							<label class="control-label" for="numeroVoo">Voo</label>
							<input id="numeroVoo" class="form-control"
								type="text" name="numeroVoo" value="${estaVazio(elemento.numeroVoo)?'':elemento.numeroVoo}">
						</div>
					</div>`;

		FLUIGC.modal({
			title: 'Cadastro de Voo',
			content: html,
			id: 'modalVoo',
			size: 'full',
			actions: [{
				'label': 'Salvar',
				'bind': 'data-salvar-voo',
				'autoClose': true
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

		$('[data-salvar-voo]').on('click', function () {
			salvarVoo(numeroIdDespesa, (estaVazio(numeroIdVoo) ? quantidadeIdsVoos : numeroIdVoo), tipo);
			criarTabelaVoos(numeroIdDespesa);
			estaVazio(numeroIdVoo) ? quantidadeIdsVoos++ : null;
		});

	} else {
		toast('Selecione um fornecedor antes de adicionar um voo.', '', 'warning');
	}

}

function excluirVoo(numeroIdDespesa, numeroIdVoo) {
	let jsonVoos = JSON.parse($('#jsonVoos___' + numeroIdDespesa).val());
	jsonVoos.splice(jsonVoos.findIndex(voo => voo.numeroIdDespesa == numeroIdDespesa && voo.numeroIdVoo == numeroIdVoo), 1);
	// jsonVoos = jsonVoos.filter(voo => voo.numeroIdVoo != numeroIdVoo && voo.numeroIdDespesa != numeroIdDespesa);
	$('#jsonVoos___' + numeroIdDespesa).val(JSON.stringify(jsonVoos));
	criarTabelaVoos(numeroIdDespesa);
}

function criarTabelaVoos(numeroIdDespesa) {
	let jsonVoos = $('#jsonVoos___' + numeroIdDespesa).val();
	jsonVoos = estaVazio(jsonVoos) ? [] : JSON.parse(jsonVoos);

	FLUIGC.datatable('#voos___' + numeroIdDespesa, {
		dataRequest: jsonVoos,
		renderContent: '.tabelaVoos',
		header: [{
				'title': 'Origem',
				'size': 'col-md-3'
			},
			{
				'title': 'Destino',
				'size': 'col-md-3'
			},
			{
				'title': 'Data do Voo',
				'size': 'col-md-3'
			},
			{
				'title': 'Voo',
				'size': 'col-md-1'
			},
			{
				'title': 'Opções',
				'size': 'col-md-2 opcoesVoo'
			}
		],
		search: {
			enabled: false,
		},
		navButtons: {
			enabled: false,
		},
		tableStyle: 'table-condensed'
	});

	if (codigoAtividade != ATIVIDADE.INICIO && codigoAtividade != 0) {
		$('.opcoesVoo').hide();
	}
}

function salvarVoo(numeroIdDespesa, numeroIdVoo, tipo) {
	let jsonVoos = $('#jsonVoos___' + numeroIdDespesa).val();
	let aeroportoOrigem = $('#aeroportoOrigem').val();
	let aeroportoDestino = $('#aeroportoDestino').val();
	let dataHoraVoo = $('#dataHoraVoo').val();
	let numeroVoo = $('#numeroVoo').val();

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
}

function verificarAprovacao(idTipo) {
	$('[id^=panelDespesa___]').each(function () {
		let panelDespesa = $(this);
		let numeroIdDespesa = getPosicaoPaiFilho(panelDespesa);
		let aprovacao = $('#aprovacao' + idTipo + '___' + numeroIdDespesa).val();

		if (!estaVazio(aprovacao)) {
			let tituloDespesa = $('#tituloDespesa___' + numeroIdDespesa);
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

function calcularValorTotal(tipo) {
	let valorTotal = 0;
	$('[id^=valor' + tipo + 'SM___]').each(function () {
		valorTotal += $(this).val();
	});
	$('#valorTotal' + tipo).val(valorTotal);
}

function salvarValorSemMascara(elemento, tipo) {
	const numeroIdDespesa = getPosicaoPaiFilho(elemento);
	const valor = removerMascaraReal(elemento);
	$('#valor' + tipo + 'SM___' + numeroIdDespesa).val(valor);
	calcularValorTotal(tipo);
}

function removerMascaraReal(elemento) {
	const valor = $(elemento).cleanVal();
	return parseFloat(valor.substring(0, valor.length - 2) + '.' + valor.substr(-2));
}





/**
 * @deprecated
 * @function adicionarDespesa_OLD Adiciona um novo filho no painel Despesas da Viagem.
 * 
 * @param {Object} elemento Objeto do JQuery com o botão de adicionar despesa clicado.
 */
function adicionarDespesa_OLD(elemento) {
	let trajeto = $(elemento).prop('id').split('___')[1];
	let campoVazioTrajeto = [];

	$('#trTrajeto___' + trajeto).find('input').each(function () {
		campoVazioTrajeto.push(validarCampoVazio($(this)));
	});

	if (campoVazioTrajeto.includes(true)) {
		toast('Preencha todos os campos do trajeto ' + trajeto + '.', '', 'warning');
	} else {
		let numeroIdDespesa = wdkAddChild('despesasViagem');

		FLUIGC.calendar('.calendario', {
			pickDate: true,
			pickTime: false
		});
		FLUIGC.calendar('.calendarioHora', {
			pickDate: true,
			pickTime: true,
			sideBySide: true
		});

		if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
			$('#despesaPrevista___' + numeroIdDespesa).val('nao');
		}
		$('#numeroTrajetoDespesa___' + numeroIdDespesa).val(trajeto);
		let cidadeOrigem = $('#cidadeOrigem___' + trajeto).val();
		let cidadeDestino = $('#cidadeDestino___' + trajeto).val();
		let origemDestino = cidadeOrigem + ' > ' + cidadeDestino;
		$('#origemDestino___' + numeroIdDespesa).html(origemDestino);
		desativarZoom('nomeFornecedor___' + numeroIdDespesa);

		$('#panelDespesasViagem').show();
		FLUIGC.utilities.scrollTo('#numeroTrajetoDespesa___' + numeroIdDespesa, 500);

		esconderUltimaHr('hrDespesa___');
		$('#panelDespesasViagem').show();
		atualizarZoom('fornecedor___' + numeroIdDespesa);
		atualizarZoom('tipoFornecedor___' + numeroIdDespesa);

		$('.real').maskMoney({
			prefixMoney: 'R$ ',
			placeholder: 'R$ 0,00'
		});
	}
}

/**
 * @deprecated
 * @function adicionarTrajeto Adiciona um novo trajeto ao pai filho do painel de itinerário caso as datas previstas da viagem estejam preenchidas.
 */
function adicionarTrajeto() {
	let idaPrevista = $('#idaPrevista').val();
	let voltaPrevista = $('#voltaPrevista').val();

	if (!estaVazio(idaPrevista) && !estaVazio(voltaPrevista)) {
		let trajeto = wdkAddChild('itinerario');
		$('.trajetos').show();
		$('#trajeto___' + trajeto).val(trajeto);

		atualizarZoom('cidadeOrigem___' + trajeto);
		atualizarZoom('cidadeDestino___' + trajeto);

		esconderUltimaHr('hrTrajeto___');

		FLUIGC.calendar('.calendario', {
			pickDate: true,
			pickTime: false
		});
		$('.trajetos').show();
		FLUIGC.utilities.scrollTo('#trajeto___' + trajeto, 500);
	} else {
		if (idaPrevista == '') {
			toast('A ida prevista da viagem deve estar preenchida.', '', 'warning');
		} else if (voltaPrevista == '') {
			toast('A volta prevista da viagem deve estar preenchida.', '', 'warning');
		}
	}
}

/**
 * @deprecated
 * @function excluirDespesa Exclui uma despesa do pai filho.
 * 
 * @param {Object} elemento Objeto do JQuery que é acionado ao excluir uma despesa.
 */
function excluirDespesa_OLD(elemento) {
	fnWdkRemoveChild(elemento);
	let quantidadeDespesas = $('[id^=numeroTrajetoDespesa___]').length;
	if (quantidadeDespesas == 0) $('#panelDespesasViagem').hide();
	else esconderUltimaHr('hrDespesa___');
}

/**
 * @deprecated
 * @function excluirTrajeto Exclui um trajeto do pai filho do painel de Itinerário se ele não tiver despesas associadas.
 * 
 * @param {Object} elemento Objeto do JQuery que é acionado ao excluir um trajeto.
 */
function excluirTrajeto(elemento) {
	let numeroIdTrajeto = getPosicaoPaiFilho(elemento);
	let existeDespesa = false;

	$('[id^=numeroTrajetoDespesa___]').each(function () {
		if ($(this).val() == numeroIdTrajeto) existeDespesa = true;
	});

	if (!existeDespesa) {
		fnWdkRemoveChild(elemento);
		let quantidadeTrajetos = $('[id^=trajeto___]').length;
		if (quantidadeTrajetos == 0) $('.trajetos').hide();
		else esconderUltimaHr('hrTrajetos___');
	} else toast('É necessário excluir todas as despesas deste trajeto antes de removê-lo.', '', 'warning');
}