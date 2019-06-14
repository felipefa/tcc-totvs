$(document).ready(function () {

	if (codigoAtividade == ATIVIDADE.INICIO || codigoAtividade == 0) {
		FLUIGC.calendar('.calendario', {
			pickDate: true,
			pickTime: false
		});
	}

	if (codigoAtividade == 0) {
		$('#dataSolicitacao').val(getDataHoje());
		setTimeout(function () {
			desativarZoom('cidadeOrigem');
			desativarZoom('cidadeDestino');
		}, 500);
	}

	if (codigoAtividade != 0) {
		corrigirIndicesPaiFilho();
		calcularValorTotal('Previsto');
		$('.bodyDespesas').show();

		setTimeout(function () {
			desativarZoom('nomeSolicitante');
			desativarZoom('centroCusto');
			desativarZoom('estadoOrigem');
			desativarZoom('cidadeOrigem');
			desativarZoom('estadoDestino');
			desativarZoom('cidadeDestino');
		}, 500);

		$('#idaPrevista').attr('readonly', true);
		$('#voltaPrevista').attr('readonly', true);
		$('#justificativaViagem').attr('readonly', true);
	}

	if (codigoAtividade == ATIVIDADE.INICIO) {
		let aprovacaoFinanceiroPreenchida = false;
		$('[id^=aprovacaoFinanceiro___]').each(function () {
			if (!estaVazio($(this).val())) aprovacaoFinanceiroPreenchida = true;
		});
		if (aprovacaoFinanceiroPreenchida) {
			verificarAprovacao('Financeiro');
			atribuirReadOnly('.aprovacaoGestor, .aprovacaoFinanceiro');
			$('[id^=btnExcluirDespesa___], [id^=btnAdicionarTrajeto___]').each(function () {
				const elementoBotao = $(this);
				const numeroIdDespesa = getPosicaoPaiFilho(elementoBotao);
				if ($('#aprovacaoFinanceiro___' + numeroIdDespesa).val() != 'ajustar') {
					elementoBotao.prop('disabled', true);
				}
			});
			$('.aprovacaoFinanceiro').show();
		} else {
			verificarAprovacao('Gestor');
			atribuirReadOnly('.aprovacaoGestor');
			// TO DO: Verificar por aprovacao para colocar os campos readonly se não for ajustar
			$('[id^=btnExcluirDespesa___], [id^=btnAdicionarTrajeto___]').each(function () {
				const elementoBotao = $(this);
				const numeroIdDespesa = getPosicaoPaiFilho(elementoBotao);
				if ($('#aprovacaoGestor___' + numeroIdDespesa).val() != 'ajustar') {
					elementoBotao.prop('disabled', true);
				}
			});
		}
		$('.aprovacaoGestor').show();
	}

	if (codigoAtividade != ATIVIDADE.INICIO && codigoAtividade != 0) {
		$('[id^=btnExcluirDespesa___], [id^=btnAdicionar]').each(function () {
			$(this).prop('disabled', true);
		});
	}

	if (codigoAtividade == ATIVIDADE.APROVACAO_GESTOR) {
		verificarAprovacao('Gestor');
		atribuirReadOnly('.dadosFornecedor, .dadosSolicitacao, .detalhesDespesa');
		$('.aprovacaoGestor').show();
	}


	// TO DO: Desativar interações com campos de despesas reprovadas pelo gestor e diminuir valor previsto da despesa do total
	if (codigoAtividade == ATIVIDADE.APROVACAO_FINANCEIRO) {
		atribuirReadOnly('.aprovacaoGestor, .dadosFornecedor, .dadosSolicitacao, .detalhesDespesa');
		$('.aprovacaoGestor').show();
		$('.aprovacaoFinanceiro').show()
		$('[id^=aprovadorFinanceiro___]').each(function () {
			const numeroIdDespesa = getPosicaoPaiFilho($(this));
			$(this).val(top.WCMAPI.user);
			$('#loginFinanceiro___' + numeroIdDespesa).val(top.WCMAPI.userLogin);
		});
		verificarAprovacao('Gestor');
	}

	// TO DO: Desativar interações com campos de despesas reprovadas pelo financeiro e atribuir o valor não no select despesa efetuada
	if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
		atribuirReadOnly('.aprovacaoGestor, .aprovacaoFinanceiro, .dadosFornecedor, .dadosSolicitacao, .detalhesDespesa');
		$('.aprovacaoGestor').show();
		$('.aprovacaoFinanceiro').show()
		$('.acertoViagem').show();
		verificarAprovacao('Financeiro');
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