/**
 * @param constraints 
 *      --  tipo :      tipo da operação {create,  update,  delete}
 *      --  id:         id do card (formulário no ECM);
 *      --  dados:       dados que serão inseridos ou atializados no card. (JSON em formato de String)
 * 
 *      Informações sobre os tipos:
 *      -- delete:  usa as constraints tipo e id
 *      -- update:  usa as constraints tipo, id e os DADOS
 *      -- create:  usa as constraints tipo, id, nome e os DADOS
 * 
 * 
 * Ex de uso:
    var obj = {
        'codigoEmpresa':'00001',
        'cnpjEmpresa':'123654896',
        'razaoSocial':'Totvs Brasil Central',
        'nomeFantasia':'Totvs BC'
    }
    var c1 = DatasetFactory.createConstraint('tipo', 'create', 'create', ConstraintType.MUST);
    var c2 = DatasetFactory.createConstraint('id', 627, 627, ConstraintType.MUST);
    var c3 = DatasetFactory.createConstraint('dados', JSON.stringify(obj), JSON.stringify(obj), ConstraintType.MUST);
    var c4 = DatasetFactory.createConstraint('nome', 'Empresa do Mayke', 'Empresa do Mayke', ConstraintType.MUST);
    var constraints = new Array(c1, c2, c3, c4);
    DatasetFactory.getDataset('dsCrudForm', null, constraints);
 */
function createDataset(fields, constraints, sortFields) {
	const COMPANY_ID = 1;
	const USER = 'services';
	const PASS = '!4dm1n!';

	var id = '';
	var dados = ''
	var tipo = '';
	var pasta = '';
	var nome = '';

	try {
		var ECMCardService = ServiceManager.getService('ECMCardService');
		var serviceLocator = ECMCardService.instantiate('com.totvs.technology.ecm.dm.ws.ECMCardServiceService');
		var service = serviceLocator.getCardServicePort();
		var serviceObj = ECMCardService.instantiate('com.totvs.technology.ecm.dm.ws.ObjectFactory');
		var cardFieldDtoArray = serviceObj.createCardFieldDtoArray();
		var dataset = DatasetBuilder.newDataset();

		dataset.addColumn('sucesso');
		dataset.addColumn('mensagem');
		dataset.addColumn('tipo');
		dataset.addColumn('id');

		if (constraints != null) {
			for (var i = 0; i < constraints.length; i++) {
				if (constraints[i].fieldName == 'tipo') {
					tipo = constraints[i].initialValue;
					log.warn('--Debug dsCrudForm-- tipo: ' + tipo);
				}
				if (constraints[i].fieldName == 'id') {
					id = constraints[i].initialValue;
					log.warn('--Debug dsCrudForm-- id: ' + id);
				}
				if (constraints[i].fieldName == 'dados') {
					dados = constraints[i].initialValue;
					log.warn('--Debug dsCrudForm-- dados: ' + dados);
				}
				if (constraints[i].fieldName == 'pasta') {
					pasta = constraints[i].initialValue;
					log.warn('--Debug dsCrudForm-- pasta: ' + pasta);
				}
				if (constraints[i].fieldName == 'nome') {
					nome = constraints[i].initialValue;
					log.warn('--Debug dsCrudForm-- nome: ' + pasta);
				}
			}

			if (tipo == 'delete') {
				if (id == '') throw 'Insira o ID do card que será excluído ';

				var result = service.deleteCard(
					COMPANY_ID,
					USER,
					PASS,
					id
				);

				dataset.addRow([true, result.getItem().get(0).getWebServiceMessage(), tipo, id]);
				return dataset;
			} else if (tipo == 'update') {
				if (id == '') throw 'Insira o ID do card que será atualizado';
				if (dados == '') throw 'Insira o dados do card que será atualizado';

				var obj = JSON.parse(dados);

				for (index in obj) {
					var cardFieldDto = serviceObj.createCardFieldDto();
					cardFieldDto.setField(obj[index].nome.toString());
					cardFieldDto.setValue(obj[index].valor.toString());
					cardFieldDtoArray.getItem().add(cardFieldDto);
					// log.warn('--Debug dsCrudForm-- campo - nome: ' + obj[index].nome.toString() + ', valor: ' + obj[index].valor.toString());
				}

				var result = service.updateCardData(
					COMPANY_ID,
					USER,
					PASS,
					id,
					cardFieldDtoArray
				);

				dataset.addRow([true, result.getItem().get(0).getWebServiceMessage(), tipo, id]);
				return dataset;
			} else if ('create') {
				if (dados == '') throw 'Insira o dados do card que será criado';
				if (pasta == '') throw 'Insira a pasta na qual o card será criado';

				var obj = JSON.parse(dados)
				var campos = Object.keys(obj);

				for (index in campos) {
					var cardFieldDto = serviceObj.createCardFieldDto();
					cardFieldDto.setField(campos[index]);
					cardFieldDto.setValue(obj[campos[index]]);
					cardDto.getCardData().add(cardFieldDto);
				}
				log.warn('Debug dsCrudForm -- Montei os cards')

				var cardDtoArray = serviceObj.createCardDtoArray();
				var cardDto = serviceObj.createCardDto();

				cardDto.setDocumentDescription(nome);
				cardDto.setParentDocumentId(parseInt(pasta));
				cardDto.setColleagueId('teste');
				cardDto.setExpires(false);
				cardDto.setInheritSecurity(false);
				cardDtoArray.getItem().add(cardDto);
				log.warn('Debug dsCrudForm -- Montei os metadados e o array')

				log.warn('Debug dsCrudForm -- Chamei o serviço')
				var result = service.create(
					COMPANY_ID,
					USER,
					PASS,
					cardDtoArray
				);
				log.warn('Debug dsCrudForm -- Serviço executado. Resultado: ')
				log.warn(result.getItem().get(0).getWebServiceMessage())

				dataset.addRow([true, result.getItem().get(0).getWebServiceMessage(), tipo, id]);
				return dataset;
			} else {
				dataset.addRow([false, 'Operação não encontrada', tipo, id]);
				return dataset;
			}
		} else {
			dataset.addRow([false, 'Nenhuma constraint informada', tipo, id]);
			return dataset;
		}
	} catch (erro) {
		log.warn('--Debug dsCrudForm-- Erro: ' + erro);
		log.warn('--Debug dsCrudForm-- Linha: ' + erro.lineNumber);
		var dataset = DatasetBuilder.newDataset();
		dataset.addColumn('erro');
		dataset.addColumn('linha');
		dataset.addRow([erro, erro.lineNumber]);
		return dataset;
	}
}