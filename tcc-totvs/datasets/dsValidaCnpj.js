function createDataset(fields, constraints, sortFields) {
	try {
		var buscarCnpj = '';
		var mensagem = 'CNPJ válido';
		var sucesso = 'true';
		var dsValidaCnpj = DatasetBuilder.newDataset();

		dsValidaCnpj.addColumn('cnpj');
		dsValidaCnpj.addColumn('sucesso');
		dsValidaCnpj.addColumn('mensagem');

		if (constraints != null) {
			for (var indexConstraints = 0; indexConstraints < constraints.length; indexConstraints++) {
				if (constraints[indexConstraints].fieldName == 'cnpj') {
					buscarCnpj = constraints[indexConstraints].initialValue;
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
					}
				}
			}
		}

		dsValidaCnpj.addRow([buscarCnpj, sucesso, mensagem]);

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