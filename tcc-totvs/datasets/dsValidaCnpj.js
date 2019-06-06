function createDataset(fields, constraints, sortFields) {
	try {
		var buscarCnpj = '';
		var buscarDataset = '';
		var campoCnpj = '';
		var campoNomeEmpresa = '';
		var mensagem = 'CNPJ válido';
		var sucesso = 'true';
		var dsValidaCnpj = DatasetBuilder.newDataset();

		dsValidaCnpj.addColumn('cnpj');
		dsValidaCnpj.addColumn('sucesso');
		dsValidaCnpj.addColumn('mensagem');
		dsValidaCnpj.addColumn('dataset');
		dsValidaCnpj.addColumn('campoCnpj');
		dsValidaCnpj.addColumn('campoNomeEmpresa');

		if (constraints != null) {
			/**
			 * Constraints aceitas:
			 * cnpj - CNPJ que deve ser validado (obrigatório)
			 * 
			 * Para também validar se o CNPJ já foi cadastrado em um formulário, obrigatoriamente as seguintes constraints também devem ser informadas:
			 * dataset - Nome do dataset do formulário a ser verificado
			 * campoCnpj - Nome do campo que contém o CNPJ no formulário
			 * campoNomeEmpresa - Nome do campo com o nome da empresa no formulário (opcional, usado na customização da mensagem de retorno)
			 * 
			 * Exemplo:
			 * constraintsValidacao = [
			 * 		DatasetFactory.createConstraint('cnpj', cnpj, cnpj, ConstraintType.MUST),
			 * 		DatasetFactory.createConstraint('dataset', 'formCadastroEmpresa', 'formCadastroEmpresa', ConstraintType.MUST),
			 * 		DatasetFactory.createConstraint('campoCnpj', 'cnpj', 'cnpj', ConstraintType.MUST),
			 * 		DatasetFactory.createConstraint('campoNomeEmpresa', 'nomeFantasia', 'nomeFantasia', ConstraintType.MUST),
			 * ];
			 * DatasetFactory.getDataset('dsValidaCnpj', null, constraintsValidacao, null);
			 */
			for (var indexConstraints = 0; indexConstraints < constraints.length; indexConstraints++) {
				if (constraints[indexConstraints].fieldName == 'cnpj') {
					buscarCnpj = constraints[indexConstraints].initialValue;
				}
				if (constraints[indexConstraints].fieldName == 'dataset') {
					buscarDataset = constraints[indexConstraints].initialValue;
				}
				if (constraints[indexConstraints].fieldName == 'campoCnpj') {
					campoCnpj = constraints[indexConstraints].initialValue;
				}
				if (constraints[indexConstraints].fieldName == 'campoNomeEmpresa') {
					campoNomeEmpresa = constraints[indexConstraints].initialValue;
				}
			}
		}

		if (buscarCnpj == '') {
			mensagem = 'CNPJ não informado';
			sucesso = 'false';
		} else {
			cnpj = buscarCnpj.replace('.', '').replace('/', '').replace('-', '');

			if (cnpj.length() != 14) {
				mensagem = 'CNPJ com ' + cnpj.length() + ' dígitos possui tamanho inválido';
				sucesso = 'false';
			} else if (
				cnpj == '00000000000000' ||
				cnpj == '11111111111111' ||
				cnpj == '22222222222222' ||
				cnpj == '33333333333333' ||
				cnpj == '44444444444444' ||
				cnpj == '55555555555555' ||
				cnpj == '66666666666666' ||
				cnpj == '77777777777777' ||
				cnpj == '88888888888888' ||
				cnpj == '99999999999999') {
				// Elimina CNPJs inválidos conhecidos
				mensagem = 'CNPJ inválido';
				sucesso = 'false';
			} else {
				// Valida dígitos verificadores
				var tamanho = cnpj.length() - 2;
				var numeros = cnpj.substring(0, tamanho);
				var digitos = cnpj.substring(tamanho);
				var soma = 0;
				var pos = tamanho - 7;

				for (i = tamanho; i >= 1; i--) {
					soma += parseInt(numeros.substring(tamanho - i, tamanho - i + 1)) * pos--;

					if (pos < 2) {
						pos = 9;
					}
				}

				resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

				if (resultado != parseInt(digitos.substring(0, 1))) {
					mensagem = 'Dígito verificador inválido';
					sucesso = 'false';
				} else {
					tamanho = tamanho + 1;
					numeros = cnpj.substring(0, tamanho);
					soma = 0;
					pos = tamanho - 7;

					for (i = tamanho; i >= 1; i--) {
						soma += parseInt(numeros.substring(tamanho - i, tamanho - i + 1)) * pos--;

						if (pos < 2) {
							pos = 9;
						}
					}

					resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

					if (resultado != parseInt(digitos.substring(1, 2))) {
						mensagem = 'Dígito verificador inválido';
						sucesso = 'false';
					} else if (buscarDataset != '' && campoCnpj != '') {
						var constraintsCnpj = [DatasetFactory.createConstraint(campoCnpj, buscarCnpj, buscarCnpj, ConstraintType.MUST)];
						var datasetConsultado = DatasetFactory.getDataset(buscarDataset, null, constraintsCnpj, null);

						if (datasetConsultado.rowsCount > 0) {
							mensagem = campoNomeEmpresa == '' ? 
								'CNPJ já usado em outro cadastro' : 
								'CNPJ já usado no cadastro da empresa ' + datasetConsultado.getValue(0, campoNomeEmpresa);
							sucesso = 'false';
						}
					}
				}
			}
		}

		dsValidaCnpj.addRow([buscarCnpj, sucesso, mensagem, buscarDataset, campoCnpj, campoNomeEmpresa]);

		return dsValidaCnpj;
	} catch (e) {
		log.warn('--Debug dsValidaCnpj-- Erro: ' + e + '; Linha: ' + e.lineNumber);
		var dataset = DatasetBuilder.newDataset();
		dataset.addColumn('Erro');
		dataset.addColumn('Linha');
		dataset.addRow([e, e.lineNumber]);
		return dataset;
	}
}