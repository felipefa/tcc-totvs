var codigoAtividade = 0;

$(document).ready(function () {
	$('#btnNovoTrajeto').on('click', function () {
		var trajeto = wdkAddChild('itinerario');
		$('#bodyItinerario').show();
		$('#trajeto___' + trajeto).val(trajeto);
		FLUIGC.calendar('.calendario', {
			pickDate: true,
			pickTime: false
		});
		FLUIGC.utilities.scrollTo('#trajeto___' + trajeto, 500);
	});

	$('.aprovacaoGestor').show();
	$('.aprovacaoFinanceiro').show();
	$('.acertoViagem').show();

	$('[name*=cidadeOrigem___]').on('blur', function() {
		console.log(this);
	});
});

function adicionarDespesa(elemento) {
	var trajeto = $(elemento)
		.prop('id')
		.split('___')[1];
	var numeroIdDespesa = wdkAddChild('despesasViagem');

	FLUIGC.calendar('.calendario', {
		pickDate: true,
		pickTime: false
	});

	FLUIGC.calendar('.calendarioHora', {
		pickDate: true,
		pickTime: true
	});

	if (codigoAtividade == 16) {
		$('#despesaPrevista___' + numeroIdDespesa).val('nao');
	}
	$('#numeroTrajeto___' + numeroIdDespesa).val(trajeto);
	var cidadeOrigem = $('#cidadeOrigem___' + trajeto).val();
	var cidadeDestino = $('#cidadeDestino___' + trajeto).val();
	var origemDestino = cidadeOrigem + ' > ' + cidadeDestino;
	$('#origemDestino___' + numeroIdDespesa).html(origemDestino);

	$('#paneldespesasViagem').show();
	FLUIGC.utilities.scrollTo('#numeroTrajeto___' + numeroIdDespesa, 500);
}