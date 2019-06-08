function createDataset(fields, constraints, sortFields) {
	try {
		var dsCidadesBrasil = DatasetBuilder.newDataset();
		var buscar = '';
		var tipoConsulta = 'municipios';
		var sqlLimit = 0;

		if (constraints != null) {
			for (var indexConstraints = 0; indexConstraints < constraints.length; indexConstraints++) {
				if (constraints[indexConstraints].fieldName == 'cidade') {
					tipoConsulta = 'municipios';
					buscar = constraints[indexConstraints].initialValue.toLowerCase();
				}
				if (constraints[indexConstraints].fieldName == 'estado') {
					tipoConsulta = 'estados';
					buscar = constraints[indexConstraints].initialValue.toLowerCase();
				}
				// if (constraints[indexConstraints].fieldName == 'uf') {
				// 	buscar = constraints[indexConstraints].initialValue.toLowerCase();
				// }
				if (constraints[indexConstraints].fieldName == 'sqlLimit') {
					sqlLimit = parseInt(constraints[indexConstraints].initialValue);
				}
			}
		}

		var localidades = JSON.parse(consultarApi(tipoConsulta, buscar));
		var quantidadeLinhas = localidades.length;

		if (quantidadeLinhas > 0) {
			dsCidadesBrasil.addColumn('id');
			dsCidadesBrasil.addColumn('estado');
			dsCidadesBrasil.addColumn('uf');			

			if (sqlLimit != 0 && sqlLimit <= quantidadeLinhas) {
				quantidadeLinhas = sqlLimit;
			}

			if (tipoConsulta == 'municipios') {
				dsCidadesBrasil.addColumn('cidade');

				for (var indexCidades = 0; indexCidades < quantidadeLinhas; indexCidades++) {
					var cidade = localidades[indexCidades];

					dsCidadesBrasil.addRow([
						cidade.id,
						cidade.microrregiao.mesorregiao.UF.nome,
						cidade.microrregiao.mesorregiao.UF.sigla,
						cidade.nome
					]);
				}
			} else if (tipoConsulta == 'estados') {
				for (var indexEstados = 0; indexEstados < quantidadeLinhas; indexEstados++) {
					var estado = localidades[indexEstados];

					dsCidadesBrasil.addRow([
						estado.id,
						estado.nome,
						estado.sigla
					]);
				}
			}
		} else {
			dsCidadesBrasil.addColumn('erro');
			dsCidadesBrasil.addColumn('mensagem');
			dsCidadesBrasil.addRow(['true', 'Nenhum dado encontrado']);
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
 * @param {String} tipo Tipo de dado a ser buscado, podendo ser:
 * - municipios
 * - estados
 * @param {String} buscar Texto que será buscado.
 * 
 * @returns {Object} Resultado da consulta à API.
 */
function consultarApi(tipo, buscar) {
	try {
		var endpoint = '/' + tipo;
		if (buscar != '') endpoint += '?q=' + buscar.replace(' ', '%20');
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