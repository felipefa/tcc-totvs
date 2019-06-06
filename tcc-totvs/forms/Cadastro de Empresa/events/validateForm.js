function validateForm(form) {
	var campos = '';

	// Informações básicas da empresa
	if (form.getValue('cnpj') == '') {
		campos += '<br>' + i18n.translate('cnpj');
	} else if (form.getFormMode() == 'ADD') {
		var cnpj = form.getValue('cnpj');
		var constraintsCnpj = [
			DatasetFactory.createConstraint('cnpj', cnpj, cnpj, ConstraintType.MUST),
			DatasetFactory.createConstraint('dataset', 'felipe_CadastroEmpresa', 'felipe_CadastroEmpresa', ConstraintType.MUST),
			DatasetFactory.createConstraint('campoCnpj', 'cnpj', 'cnpj', ConstraintType.MUST),
			DatasetFactory.createConstraint('campoNomeEmpresa', 'nomeFantasia', 'nomeFantasia', ConstraintType.MUST),
		];
		var dsValidaCnpj = DatasetFactory.getDataset('dsValidaCnpj', null, constraintsCnpj, null);

		if (dsValidaCnpj.rowsCount > 0) {
			if (dsValidaCnpj.getValue(0, 'sucesso') == 'false') {
				throw dsValidaCnpj.getValue(0, 'mensagem') + '.';
			}
		} else {
			throw 'Erro ao validar CNPJ.';
		}
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
	} else {
		var email = form.getValue('email');
		if (email.indexOf('@') == -1 || email.indexOf('.') == -1) {
			throw 'O e-mail informado &eacute; inv&aacute;lido.';
		}
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
		throw '<script>cardPublisherFrame.validarCampos()</script>' + cabecalhoMsg + '<br>' + campos;
	}
}