function createDataset(fields, constraints, sortFields) {
	try {
		var dsCidadesBrasil = DatasetBuilder.newDataset();

		dsCidadesBrasil.addColumn('id');
		dsCidadesBrasil.addColumn('cidade');
		dsCidadesBrasil.addColumn('estado');
		dsCidadesBrasil.addColumn('uf');

		// var buscarCidade = '';
		// var buscarEstado = '';
		// var buscarUf = '';
		var consulta = {
			'tipo': 'municipios',
			'buscar': ''
		};
		var sqlLimit = 0;

		// TO DO: Buscar por estado e UF
		if (constraints != null) {
			for (var indexConstraints = 0; indexConstraints < constraints.length; indexConstraints++) {
				if (constraints[indexConstraints].fieldName == 'cidade') {
					consulta.buscar = constraints[indexConstraints].initialValue;
				}
				// if (constraints[indexConstraints].fieldName == 'estado') {
				// 	buscarEstado = constraints[indexConstraints].initialValue.toLowerCase();
				// }
				// if (constraints[indexConstraints].fieldName == 'uf') {
				// 	buscarUf = constraints[indexConstraints].initialValue.toLowerCase();
				// }
				if (constraints[indexConstraints].fieldName == 'sqlLimit') {
					sqlLimit = constraints[indexConstraints].initialValue;
				}
			}
		}

		var localidades = JSON.parse(consultarApi(consulta));

		if (localidades.length > 0) {
			var quantidadeLinhas = localidades.length;

			if (sqlLimit != 0 && sqlLimit <= quantidadeLinhas) {
				quantidadeLinhas = parseInt(sqlLimit);
			}

			for (var indexCidades = 0; indexCidades < quantidadeLinhas; indexCidades++) {
				var cidade = localidades[indexCidades];

				dsCidadesBrasil.addRow([
					cidade.id,
					cidade.nome,
					cidade.microrregiao.mesorregiao.UF.nome,
					cidade.microrregiao.mesorregiao.UF.sigla
				]);
			}
		} else {
			dsCidadesBrasil.addColumn('erro');
			dsCidadesBrasil.addRow(['', '', '', '', 'true']);
		}

		return dsCidadesBrasil;
	} catch (e) {
		log.warn('--Debug dsCidadesBrasil-- Erro: ' + e + '; Linha: ' + e.lineNumber);
		var dataset = DatasetBuilder.newDataset();
		dataset.addColumn('Erro');
		dataset.addColumn('Linha');
		dataset.addRow([e, e.lineNumber]);
		return dataset;
	}
}

/**
 * @function consultarApi Consulta a API de localidades do IBGE cadastrada nos serviços do fluig.
 * 
 * @param {Object} consulta Objeto com dados que devem ser consultados.
 */
function consultarApi(consulta) {
	try {
		var endpoint = '/' + consulta.tipo;
		if (consulta.buscar != '') {
			endpoint += '?q=' + consulta.buscar.replace(' ', '%20');
		}
		var clientService = fluigAPI.getAuthorizeClientService();
		var data = {
			companyId: getValue('WKCompany') + '',
			serviceCode: 'API_LOCALIDADES',
			endpoint: endpoint,
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
		log.warn('----- Erro ao consultar API - dsCidadesBrasil: ' + e);
	}
}