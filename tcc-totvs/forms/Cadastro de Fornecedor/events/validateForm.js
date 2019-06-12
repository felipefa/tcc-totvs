function validateForm(form) {
	var campos = '';

	// Informações básicas do fornecedor
	if (form.getValue('zoomTipoFornecedor') == '' || form.getValue('zoomTipoFornecedor') == null) {
		campos += '<br>' + i18n.translate('zoomTipoFornecedor');
	}
	if (form.getValue('cnpj') == '') {
		campos += '<br>' + i18n.translate('cnpj');
	} else if (form.getFormMode() == 'ADD') {
		var cnpj = form.getValue('cnpj');
		var constraintsCnpj = [
			DatasetFactory.createConstraint('cnpj', cnpj, cnpj, ConstraintType.MUST),
			DatasetFactory.createConstraint('dataset', 'felipe_CadastroFornecedor', 'felipe_CadastroFornecedor', ConstraintType.MUST),
			DatasetFactory.createConstraint('campoCnpj', 'cnpj', 'cnpj', ConstraintType.MUST),
			DatasetFactory.createConstraint('campoNomeEmpresa', 'nomeFornecedor', 'nomeFornecedor', ConstraintType.MUST),
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
	if (form.getValue('nomeFornecedor') == '') {
		campos += '<br>' + i18n.translate('nomeFornecedor');
	}

	// Informações de contato
	if (form.getValue('email') != '') {
		var email = form.getValue('email');
		if (email.indexOf('@') == -1 || email.indexOf('.') == -1) {
			throw 'O e-mail informado &eacute; inv&aacute;lido.';
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