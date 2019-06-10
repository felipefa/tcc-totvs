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
}

function excluirDespesa(elemento) {
	fnWdkRemoveChild(elemento);

	let quantidadeDespesas = $('[id^=despesa___]').length;
	if (quantidadeDespesas == 0) $('.bodyDespesas').hide();
}

function adicionarVoo(elemento) {
	let numeroIdDespesa = getPosicaoPaiFilho(elemento);
	let fornecedor = $('#nomeFornecedor___' + numeroIdDespesa).val();

	// Só permite adicionar um voo se um fornecedor estiver selecionado
	if (!estaVazio(fornecedor)) {
		let html = `<div class="row" id="voo-${quantidadeIdsVoos}___${numeroIdDespesa}">
						<div class="form-group col-md-1 text-right">
							<label><br></label><br>
							<button class="btn btn-danger" 
								id="btnExcluirVoo-${quantidadeIdsVoos}___${numeroIdDespesa}" 
								name="btnExcluirVoo-${quantidadeIdsVoos}___${numeroIdDespesa}"
								onclick="excluirVoo(${numeroIdDespesa}, ${quantidadeIdsVoos})">
								<i class="fluigicon fluigicon-trash icon-sm"></i>
							</button>
						</div>
						<div class="form-group col-md-3">
							<label class="control-label" for="aeroportoOrigem-${quantidadeIdsVoos}___${numeroIdDespesa}">Aeroporto de Origem</label>
							<input id="aeroportoOrigem-${quantidadeIdsVoos}___${numeroIdDespesa}" class="form-control"
								type="text" name="aeroportoOrigem-${quantidadeIdsVoos}___${numeroIdDespesa}">
						</div>
						<div class="form-group col-md-3">
							<label class="control-label" for="aeroportoDestino-${quantidadeIdsVoos}___${numeroIdDespesa}">Aeroporto de Destino</label>
							<input id="aeroportoDestino-${quantidadeIdsVoos}___${numeroIdDespesa}" class="form-control"
								type="text" name="aeroportoDestino-${quantidadeIdsVoos}___${numeroIdDespesa}">
						</div>
						<div class="form-group col-md-2">
							<label class="control-label" for="dataIdaVoo-${quantidadeIdsVoos}___${numeroIdDespesa}">Ida do Voo</label>
							<div class="input-group" style="cursor: pointer;">
								<input type="text"
									class="form-control calendario"
									placeholder="Selecione" name="dataIdaVoo-${quantidadeIdsVoos}___${numeroIdDespesa}"
									id="dataIdaVoo-${quantidadeIdsVoos}___${numeroIdDespesa}">
								<span class="input-group-addon">
									<span class="fluigicon fluigicon-calendar"></span>
								</span>
							</div>
						</div>
						<div class="form-group col-md-2">
							<label class="control-label"
								for="dataChegadaVoo-${quantidadeIdsVoos}___${numeroIdDespesa}">Chegada do Voo</label>
							<div class="input-group" style="cursor: pointer;">
								<input type="text"
									class="form-control calendario"
									placeholder="Selecione"
									name="dataChegadaVoo-${quantidadeIdsVoos}___${numeroIdDespesa}" id="dataChegadaVoo___${numeroIdDespesa}">
								<span class="input-group-addon">
									<span class="fluigicon fluigicon-calendar"></span>
								</span>
							</div>
						</div>
						<div class="form-group col-md-1">
							<label class="control-label" for="numeroVoo-${quantidadeIdsVoos}___${numeroIdDespesa}">Voo</label>
							<input id="numeroVoo-${quantidadeIdsVoos}___${numeroIdDespesa}" class="form-control"
								type="text" name="numeroVoo-${quantidadeIdsVoos}___${numeroIdDespesa}">
						</div>
					</div>`;

		// Adiciona os campos dos dados do voo dinamicamente
		// $('#voos___' + numeroIdDespesa).append(html);
		FLUIGC.modal({
			title: 'Cadastro de Voo',
			content: html,
			id: 'modalVoo',
			formModal: true,
			actions: [{
				'label': 'Salvar',
				'bind': 'data-open-modal',
			}, {
				'label': 'Cancelar',
				'autoClose': true
			}]
		}, function (err, data) {
			if (err) {
				// do error handling
			} else {
				// do something with data
			}
		});

		FLUIGC.calendar('.calendario', {
			pickDate: true,
			pickTime: false
		});

		quantidadeIdsVoos++;

		// Desativa os campos zoom do fornecedor para evitar inconsistências
		// desativarZoom('tipoFornecedor___'+numeroIdDespesa);
		// desativarZoom('nomeFornecedor___'+numeroIdDespesa);
	} else {
		toast('Selecione um fornecedor antes de adicionar um voo.', '', 'warning');
	}

}

function excluirVoo(numeroIdDespesa, numeroIdVoo) {
	$('#voo-' + numeroIdVoo + '___' + numeroIdDespesa).remove();

	// Verifica se a despesa ainda possui voos, se não possuir, ativa o zoom para a seleção de um novo tipo de fornecedor
	// let quantidadeVoosDespesa = $('[id^=voo___'+numeroIdDespesa+'-]').length;
	// if (quantidadeVoosDespesa == 0) {
	// 	ativarZoom('tipoFornecedor___'+numeroIdDespesa);
	// }
}

function renderizarVoos(numeroIdDespesa) {
	FLUIGC.datatable('#voos___' + numeroIdDespesa, {
		dataRequest: $('#jsonVoo___' + numeroIdDespesa).val(),
		renderContent: ['id', 'voo', 'aeroportoOrigem', 'aeroportoDestino', 'dataIdaVoo', 'dataVoltaVoo'],
		header: [{
				'title': 'ID',
				'size': 'col-md-1'
			},
			{
				'title': 'Voo',
				'size': 'col-md-1'
			},
			{
				'title': 'Origem',
				'size': 'col-md-3'
			},
			{
				'title': 'Destino',
				'size': 'col-md-3'
			},
			{
				'title': 'Ida',
				'size': 'col-md-2'
			},
			{
				'title': 'Volta',
				'size': 'col-md-2'
			}
		],
		search: {
			enabled: false,
		},
		navButtons: {
			enabled: false,
		},
		tableStyle: 'table-condensed'
	}, function (err, data) {
		if (data) {
			dataInit = data;
		} else if (err) {
			FLUIGC.toast({
				message: err,
				type: 'danger'
			});
		}
	});
	// $('[id^=jsonVoos___]').each(function () {
	// 	let jsonVoos = $(this);
	// 	let numeroIdDespesa = getPosicaoPaiFilho(jsonVoos);
	// 	if (!estaVazio(jsonVoos)) {
	// 		let html = ``;
	// 		$('#voos___'+numeroIdDespesa).html(html);
	// 	}
	// });
}

function verificarAprovacao(idTipo) {
	$('[id^=panelDespesa___]').each(function () {
		let panelDespesa = $(this);
		let numeroIdDespesa = getPosicaoPaiFilho(panelDespesa);
		let aprovacao = $('#' + idTipo + numeroIdDespesa).val();

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