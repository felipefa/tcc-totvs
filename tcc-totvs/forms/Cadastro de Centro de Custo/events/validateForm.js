function validateForm(form) {
	var campos = '';

	if (form.getValue('zoomEmpresa') == '' || form.getValue('zoomEmpresa') == null) {
		campos += '<br>' + i18n.translate('zoomEmpresa');
	}
	if (form.getValue('nomeCentroCusto') == '') {
		campos += '<br>' + i18n.translate('nomeCentroCusto');
	}
	if (form.getValue('zoomGestor') == '' || form.getValue('zoomGestor') == null) {
		campos += '<br>' + i18n.translate('zoomGestor');
	}
	
	if (campos != '') {
		var cabecalhoMsg = i18n.translate('msgCampoVazio');
		var quantidadeCampos = campos.split('<br>').length - 1; // -1 para remover posição do array com string vazia
		if (quantidadeCampos > 1) {
			cabecalhoMsg = i18n.translate('msgCamposVazios');
		}
		throw cabecalhoMsg + '<br>' + campos;
	}
}