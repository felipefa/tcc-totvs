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