$(document).ready(function () {
	if (codigoAtividade == 0) {
		$('#dataSolicitacao').val(getDataHoje());
	}

	if (codigoAtividade == ATIVIDADE.INICIO || codigoAtividade == 0) {
		FLUIGC.calendar('.calendario', {
			pickDate: true,
			pickTime: false
		});
	}

	if (codigoAtividade == ATIVIDADE.APROVACAO_GESTOR) {
		atribuirReadOnly('.dadosFornecedor, .dadosSolicitacao, .detalhesDespesa, .trajetos');
		$('#btnNovoTrajeto').prop('disabled', true);
		$('[id^=btnAdicionarDespesa___]').each(function () {
			$(this).prop('disabled', true);
		});
		$('.bpm-mobile-trash-column').remove();
		$('.aprovacaoGestor').show();
	}

	if (codigoAtividade == ATIVIDADE.APROVACAO_FINANCEIRO) {
		atribuirReadOnly('.aprovacaoGestor, .dadosFornecedor, .dadosSolicitacao, .detalhesDespesa, .trajetos');
		$('#btnNovoTrajeto').prop('disabled', true);
		$('[id^=btnAdicionarDespesa___]').each(function () {
			$(this).prop('disabled', true);
		});
		$('.bpm-mobile-trash-column').remove();
		$('.aprovacaoFinanceiro').show()
	}

	if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
		atribuirReadOnly('.aprovacaoGestor, .aprovacaoFinanceiro, .dadosFornecedor, .dadosSolicitacao, .detalhesDespesa, .trajetos');
		$('.bpm-mobile-trash-column').remove(); // Remover apenas as lixeiras de despesas e trajetos já cadastrados
		$('.acertoViagem').show()
	}
});

/**
 * Enum para os códigos das atividades.
 * @enum {string}
 */
const ATIVIDADE = {
	INICIO: 4,
	APROVACAO_GESTOR: 5,
	APROVACAO_FINANCEIRO: 12,
	ACERTO_VIAGEM: 16
}