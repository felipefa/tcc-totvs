function validateForm(form) {
	var campos = '';

	// Informações básicas da empresa
	if (form.getValue('cnpj') == '') {
		campos += '<br>' + i18n.translate('cnpj');
	}
	if (form.getValue('razaoSocial') == '') {
		campos += '<br>' + i18n.translate('razaoSocial');
	}
	if (form.getValue('nomeFantasia') == '') {
		campos += '<br>' + i18n.translate('nomeFantasia');
	}
	if (form.getValue('tipoUnidade') == '' || form.getValue('tipoUnidade') == null) {
		campos += '<br>' + i18n.translate('tipoUnidade');
	}

	// Endereço da empresa
	if (form.getValue('cep') == '') {
		campos += '<br>' + i18n.translate('cep');
	}
	if (form.getValue('logradouro') == '') {
		campos += '<br>' + i18n.translate('logradouro');
	}
	if (form.getValue('bairro') == '') {
		campos += '<br>' + i18n.translate('bairro');
	}
	if (form.getValue('localidade') == '') {
		campos += '<br>' + i18n.translate('localidade');
	}
	if (form.getValue('uf') == '') {
		campos += '<br>' + i18n.translate('uf');
	}

	// Informações de contato
	if (form.getValue('email') == '') {
		campos += '<br>' + i18n.translate('email');
	}
	if (form.getValue('telefone1') == '') {
		campos += '<br>' + i18n.translate('telefone') + ' 1';
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