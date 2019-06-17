$(document).ready(function () {
	setTimeout(function () {
		if (codigoAtividade == 0 || codigoAtividade == ATIVIDADE.INICIO) {
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
				atribuirReadOnlyAposAprovacao('Financeiro');
				$('.aprovacaoFinanceiro').show();
			} else {
				verificarAprovacao('Gestor');
				atribuirReadOnly('.aprovacaoGestor');
				atribuirReadOnlyAposAprovacao('Gestor');
			}
			$('.aprovacaoGestor').show();
			desativarZoomDespesa();
		}

		if (codigoAtividade != ATIVIDADE.INICIO && codigoAtividade != 0) {
			$('[id^=btnExcluirDespesa___], [id^=btnAdicionar]').each(function () {
				$(this).prop('disabled', true);
			});
		}

		if (codigoAtividade == ATIVIDADE.APROVACAO_GESTOR) {
			verificarAprovacao('Gestor');
			atribuirReadOnly('.dadosFornecedor, .dadosSolicitacao, .detalhesDespesa');
			desativarZoomDespesa();
			$('.aprovacaoGestor').show();
		}


		if (codigoAtividade == ATIVIDADE.APROVACAO_FINANCEIRO) {
			$('.aprovacaoGestor').show();
			$('.aprovacaoFinanceiro').show()
			verificarAprovacao('Gestor');
			atribuirReadOnlyAposAprovacao('Gestor');
			$('[id^=aprovadorFinanceiro___]').each(function () {
				const numeroIdDespesa = getPosicaoPaiFilho($(this));
				$(this).val(top.WCMAPI.user);
				$('#loginFinanceiro___' + numeroIdDespesa).val(top.WCMAPI.userLogin);
				$('#aprovacaoFinanceiro___' + numeroIdDespesa).attr('readonly', false);
				$('#aprovacaoFinanceiro___' + numeroIdDespesa).attr('style', '');
				$('#justificativaFinanceiro___' + numeroIdDespesa).attr('readonly', false);
			});
			atribuirReadOnly('.aprovacaoGestor, .dadosFornecedor, .dadosSolicitacao, .detalhesDespesa');
			desativarZoomDespesa();
		}

		// TO DO: Desativar interações com campos de despesas reprovadas pelo financeiro e atribuir o valor não no select despesa efetuada
		if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
			$('.aprovacaoGestor').show();
			$('.aprovacaoFinanceiro').show()
			$('.acertoViagem').show();
			verificarAprovacao('Financeiro');
			atribuirReadOnlyAposAprovacao('Financeiro');
			FLUIGC.calendar('#idaEfetiva, #voltaEfetiva', {
				pickDate: true,
				pickTime: false
			});
			atribuirReadOnly('.aprovacaoGestor, .aprovacaoFinanceiro, .dadosSolicitacao, .detalhesDespesa');
			desativarZoomDespesa();
			$('#btnAdicionarDespesa').prop('disabled', false);
		}
	}, 500);
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