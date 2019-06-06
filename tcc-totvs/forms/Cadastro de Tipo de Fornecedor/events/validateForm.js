function validateForm(form) {
	var campos = '';

	if (form.getValue('ramoAtividade') == '') {
		campos += '<br>' + i18n.translate('ramoAtividade');
	}
	if (form.getValue('possuiLimite') == '' || form.getValue('possuiLimite') == null) {
		campos += '<br>' + i18n.translate('possuiLimite');
	} else if (form.getValue('possuiLimite') == 'sim') {
		if (form.getValue('valorLimite') == '') {
			campos += '<br>' + i18n.translate('valorLimite');
		}
	}

	if (campos != '') {
		var cabecalhoMsg = i18n.translate('msgCampoVazio');
		var quantidadeCampos = campos.split('<br>').length - 1; // -1 para remover posição do array com string vazia
		if (quantidadeCampos > 1) {
			cabecalhoMsg = i18n.translate('msgCamposVazios');
		}
		throw '<script>cardPublisherFrame.validarCampos()</script>' + cabecalhoMsg + '<br>' + campos;
	}
}