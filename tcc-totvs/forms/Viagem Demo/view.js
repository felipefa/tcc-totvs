$(document).ready(function () {
	setTimeout(function () {
		desativarZoom('cidadeOrigem');
		desativarZoom('cidadeDestino');
	}, 500);

	if (codigoAtividade == 0) {
		$('#dataSolicitacao').val(getDataHoje());
	}

	if (codigoAtividade == ATIVIDADE.INICIO || codigoAtividade == 0) {
		FLUIGC.calendar('.calendario', {
			pickDate: true,
			pickTime: false
		});
	}

	if (codigoAtividade != ATIVIDADE.INICIO && codigoAtividade != 0) {
		setTimeout(function () {
			desativarZoom('nomeSolicitante');
			desativarZoom('centroCusto');
			desativarZoom('cidadeOrigem');
			desativarZoom('cidadeDestino');
		}, 500);
	}

	if (codigoAtividade == ATIVIDADE.APROVACAO_GESTOR) {
		atribuirReadOnly('.dadosFornecedor, .dadosSolicitacao, .detalhesDespesa, .trajetos');
		$('#btnNovoTrajeto').prop('disabled', true);
		$('[id^=btnExcluirDespesa___]').each(function () {
			$(this).prop('disabled', true);
		});
		$('.aprovacaoGestor').show();
	}

	if (codigoAtividade == ATIVIDADE.APROVACAO_FINANCEIRO) {
		atribuirReadOnly('.aprovacaoGestor, .dadosFornecedor, .dadosSolicitacao, .detalhesDespesa, .trajetos');
		$('#btnNovoTrajeto').prop('disabled', true);
		$('[id^=btnExcluirDespesa___]').each(function () {
			$(this).prop('disabled', true);
		});
		$('.aprovacaoFinanceiro').show()
		$('[id^=aprovadorFinanceiro___]').each(function () {
			$(this).val(top.WCMAPI.user);
		});
	}

	if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
		atribuirReadOnly('.aprovacaoGestor, .aprovacaoFinanceiro, .dadosFornecedor, .dadosSolicitacao, .detalhesDespesa, .trajetos');
		$('[id^=btnExcluirDespesa___]').each(function () {
			$(this).prop('disabled', true);
		});
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