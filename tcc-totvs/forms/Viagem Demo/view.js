$(document).ready(function() {
	if (codigoAtividade == 0) {
		$('#dataSolicitacao').val(getDataHoje());
	}
	if (codigoAtividade == ATIVIDADE.INICIO || codigoAtividade == 0) {
	// $('.aprovacaoGestor').show();
	// $('.aprovacaoFinanceiro').show();
	// $('.acertoViagem').show();
	}
	if (codigoAtividade == ATIVIDADE.APROVACAO_GESTOR) {
		$('.aprovacaoGestor').show()
	}
	if (codigoAtividade == ATIVIDADE.APROVACAO_FINANCEIRO) {
		$('.aprovacaoFinanceiro').show()
	}
	if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
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