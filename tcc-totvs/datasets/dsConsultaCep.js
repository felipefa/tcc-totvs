function createDataset(fields, constraints, sortFields) {
	try {
		var dsConsultaCep = DatasetBuilder.newDataset();
		var cep = '';

		dsConsultaCep.addColumn('cep');
		dsConsultaCep.addColumn('logradouro');
		dsConsultaCep.addColumn('complemento');
		dsConsultaCep.addColumn('bairro');
		dsConsultaCep.addColumn('localidade');
		dsConsultaCep.addColumn('uf');
		dsConsultaCep.addColumn('unidade');
		dsConsultaCep.addColumn('ibge');
		dsConsultaCep.addColumn('gia');

		if (constraints != null) {
			for (var indexConstraints = 0; indexConstraints < constraints.length; indexConstraints++) {
				if (constraints[indexConstraints].fieldName == 'cep') {
					cep = constraints[indexConstraints].initialValue;
				}
			}

			if (cep != '') {
				var dados = JSON.parse(consultarCep(cep));

				if (!dados.erro) {
					dsConsultaCep.addRow([
						dados.cep,
						dados.logradouro,
						dados.complemento,
						dados.bairro,
						dados.localidade,
						dados.uf,
						dados.unidade,
						dados.ibge,
						dados.gia
					]);
				}
			}
		}

		if (cep == '') {
			dsConsultaCep.addColumn('erro');
			dsConsultaCep.addRow(['', '', '', '', '', '', '', '', '', 'true']);
		}

		return dsConsultaCep;
	} catch (e) {
		log.warn('--Debug dsConsultaCep-- Erro: ' + e + '; Linha: ' + e.lineNumber);
		var dataset = DatasetBuilder.newDataset();
		dataset.addColumn('Erro');
		dataset.addColumn('Linha');
		dataset.addRow([e, e.lineNumber]);
		return dataset;
	}
}

function consultarCep(cep) {
	try {
		var clientService = fluigAPI.getAuthorizeClientService();
		var data = {
			companyId: getValue('WKCompany') + '',
			serviceCode: 'ViaCep',
			endpoint: '/' + cep + '/json',
			method: 'get',
			timeoutService: '100'
		}

		var vo = clientService.invoke(JSON.stringify(data));

		if (vo.getResult() == null || vo.getResult().isEmpty()) {
			throw new Exception('Retorno vazio');
		} else {
			return vo.getResult();
		}
	} catch (e) {
		log.warn('----- Erro ao buscar o cep informado: ' + e);
	}
}