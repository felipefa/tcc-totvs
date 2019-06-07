$(document).ready(function () {
	$('#btnNovoTrajeto').on('click', function () {
		// let idaPrevista = $('#idaPrevista').val();
		// let voltaPrevista = $('#voltaPrevista').val();

		// Validação comentada
		// if (!estaVazio(idaPrevista) && !estaVazio(voltaPrevista)) {
		let trajeto = wdkAddChild('itinerario');
		$('.trajetos').show();
		$('#trajeto___' + trajeto).val(trajeto);

		esconderUltimaHr('hrTrajeto___', trajeto);

		estanciaCalendarioFluig([
			'dataSaidaOrigem___' + trajeto, 'dataChegadaDestino___' + trajeto,
		]);
		FLUIGC.utilities.scrollTo('#trajeto___' + trajeto, 500);
		// } else {
		// 	if (idaPrevista == '') {
		// 		toast('A ida prevista da viagem deve estar preenchida.', '', 'warning');
		// 	} else if (voltaPrevista == '') {
		// 		toast('A volta prevista da viagem deve estar preenchida.', '', 'warning');
		// 	}
		// }
	});

	$('#idaPrevista, #voltaPrevista').on('blur', function () {
		let input = $(this);
		let mensagem = '';
		let idaPrevista = '';
		let voltaPrevista = '';

		if (input.prop('id') == 'idaPrevista') {
			idaPrevista = $(this).val();
			voltaPrevista = $('#voltaPrevista').val();
			mensagem = 'A data da ida deve ser anterior ou igual a volta prevista.';
		} else if (input.prop('id') == 'voltaPrevista') {
			idaPrevista = $('#idaPrevista').val();
			voltaPrevista = $(this).val();
			mensagem = 'A data da volta deve ser posterior ou igual a ida prevista.'
		}

		if (!estaVazio(idaPrevista) && !estaVazio(voltaPrevista) && !compararDatas(idaPrevista, voltaPrevista)) {
			toast(mensagem, '', 'warning');
			input.val('');
		}
	});
});

/**
 * @function adicionarDespesa Adiciona um novo filho no painel Despesas da Viagem.
 * 
 * @param {Object} elemento Objeto do JQuery com o botão de adicionar despesa clicado.
 */
function adicionarDespesa(elemento) {
	let trajeto = $(elemento).prop('id').split('___')[1];
	let campoVazioTrajeto = [];

	$('#tdTrajeto___' + trajeto).find('input').each(function () {
		campoVazioTrajeto.push(validarCampoVazio($(this)));
	});

	if (campoVazioTrajeto.includes(true)) {
		toast('Preencha todos os campos do trajeto ' + trajeto + '.', '', 'warning');
	} else {
		let numeroIdDespesa = wdkAddChild('despesasViagem');

		// TO DO: testar calendario com id na div 
		estanciaCalendarioFluig([
			'dataIdaVoo___' + numeroIdDespesa, 'dataChegadaVoo___' + numeroIdDespesa,
			'checkin___' + numeroIdDespesa, 'checkout___' + numeroIdDespesa,
			'dataPrevista___' + numeroIdDespesa, 'dataVoo___' + numeroIdDespesa,
			'dataEfetiva___' + numeroIdDespesa
		]);
		estanciaCalendarioFluig([
			'dataRetirada___' + numeroIdDespesa, 'dataDevolucao___' + numeroIdDespesa
		], true);

		if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
			$('#despesaPrevista___' + numeroIdDespesa).val('nao');
		}
		$('#numeroTrajeto___' + numeroIdDespesa).val(trajeto);
		let cidadeOrigem = $('#cidadeOrigem___' + trajeto).val();
		let cidadeDestino = $('#cidadeDestino___' + trajeto).val();
		let origemDestino = cidadeOrigem + ' > ' + cidadeDestino;
		$('#origemDestino___' + numeroIdDespesa).html(origemDestino);

		$('#panelDespesasViagem').show();
		FLUIGC.utilities.scrollTo('#numeroTrajeto___' + numeroIdDespesa, 500);

		esconderUltimaHr('hrDespesa___', numeroIdDespesa);

		$('.real').maskMoney({
			prefixMoney: 'R$ ',
			placeholder: 'R$ 0,00'
		});
		$('.calendario').mask('00/00/0000');
	}
}