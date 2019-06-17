function createDataset(fields, constraints, sortFields) {
	try {
		var dsWorkflowService = DatasetBuilder.newDataset();
		var sucesso = true;
		var mensagem = '';
		dsWorkflowService.addColumn('sucesso');
		dsWorkflowService.addColumn('mensagem');

		if (constraints !== null) {
			/*
			dados = [{nome: 'nomeDoCampo', valor: 'valorDoCampo'}];
			
			c = [
				DatasetFactory.createConstraint('numeroSolicitacao', 18, null, ConstraintType.MUST),
				DatasetFactory.createConstraint('matriculaUsuario','felipe',null,ConstraintType.MUST),
				DatasetFactory.createConstraint('completarTarefa',false,null,ConstraintType.MUST), // False apenas salva o formulário / True ou sem constraint movimenta o processo
				DatasetFactory.createConstraint('dados',dados,null,ConstraintType.MUST)
			];

			d = DatasetFactory.getDataset('dsWorkflowService', null, c, null);
			*/
			var constraintCompletarTarefa = null;
			var constraintDados = null;
			var constraintNumeroSolicitacao = null;
			var constraintMatriculaUsuario = null;

			for (var indexConstraints = 0; indexConstraints < constraints.length; indexConstraints++) {
				if (constraints[indexConstraints].fieldName == 'numeroSolicitacao') {
					constraintNumeroSolicitacao = constraints[indexConstraints].initialValue;
				}
				if (constraints[indexConstraints].fieldName == 'matriculaUsuario') {
					constraintMatriculaUsuario = constraints[indexConstraints].initialValue;
				}
				if (constraints[indexConstraints].fieldName == 'completarTarefa') {
					constraintCompletarTarefa = constraints[indexConstraints].initialValue;
				}
				if (constraints[indexConstraints].fieldName == 'dados') {
					constraintDados = constraints[indexConstraints].initialValue;
				}
			}

			if (constraintNumeroSolicitacao != null) {
				if (constraintMatriculaUsuario != null) {
					if (constraintDados != null) {
						var ECMWorkflowEngineService = ServiceManager.getService('ECMWorkflowEngineService');
						var serviceLocator = ECMWorkflowEngineService.instantiate('com.totvs.technology.ecm.workflow.ws.ECMWorkflowEngineServiceService');
						var workflowEngineService = serviceLocator.getWorkflowEngineServicePort();
						var metodos = ECMWorkflowEngineService.instantiate('com.totvs.technology.ecm.workflow.ws.ObjectFactory');
						var metodosArray = ECMWorkflowEngineService.instantiate('net.java.dev.jaxb.array.ObjectFactory');

						// Início de parâmetros do método saveAndSendTask
						var usuario = 'services'; // user
						var senha = '!4dm1n!'; // password
						var empresa = 1; // companyId
						var numeroSolicitacao = parseInt(constraintNumeroSolicitacao); // processInstanceId
						var atividadeDestino = 45; // choosedState - Fim == 45

						// Início colleagueIds
						var usuarioRecebedor = metodosArray.createStringArray();
						usuarioRecebedor.getItem().add('services');
						// Fim colleagueIds

						var comentarios = 'Solicitação atualizada pelo dataset dsWorkflowService.'; // comments
						var matriculaUsuario = constraintMatriculaUsuario; // userId
						var completarTarefa = constraintCompletarTarefa == 'false' ? false : true; // completeTask
						var anexos = metodos.createProcessAttachmentDtoArray(); // attachments

						// Início cardData
						var dados = metodosArray.createStringArrayArray();
						// log.warn('--Debug dsWorkflowService-- constraintDados: ' + constraintDados);
						var objetoDados = JSON.parse(constraintDados);
						for (var index in objetoDados) {
							if (objetoDados[index].valor != null && objetoDados[index].valor != '') {
								var campo = metodosArray.createStringArray();
								campo.getItem().add(objetoDados[index].nome.toString());
								campo.getItem().add(objetoDados[index].valor.toString());
								dados.getItem().add(campo);
								// log.warn('--Debug dsWorkflowService-- campo - nome: ' + objetoDados[index].nome.toString() + ', valor: ' + objetoDados[index].valor.toString());
							}
						}
						// Fim cardData

						var apontamentos = metodos.createProcessTaskAppointmentDtoArray(); // appointment
						var modoGestor = false; // managerMode
						var atividadeParalela = 0; // threadSequence
						// Fim de parâmetros do método saveAndSendTask

						workflowEngineService.saveAndSendTask(
							usuario, // user
							senha, // password
							empresa, // companyId
							numeroSolicitacao, // processInstanceId
							atividadeDestino, // choosedState
							usuarioRecebedor, // colleagueIds
							comentarios, // comments
							matriculaUsuario, // userId
							completarTarefa, // completeTask
							anexos, // attachments
							dados, // cardData
							apontamentos, // apontamentos da tarefa
							modoGestor, // managerMode
							atividadeParalela // threadSequence
						);
						
						mensagem = 'Solicitação ' + numeroSolicitacao + ' movimentada com sucesso pelo usuário ' + matriculaUsuario;
					} else {
						sucesso = false;
						mensagem = 'É necessário informar os dados do formulário';
					}
				} else {
					sucesso = false;
					mensagem = 'É necessário informar a matrícula do usuário responsável por executar a tarefa';
				}
			} else {
				sucesso = false;
				mensagem = 'É necessário informar o número da solicitação';
			}
		} else {
			sucesso = false;
			mensagem = 'É necessário informar o número da solicitação, a matrícula do usuário responsável por executar a tarefa e os dados do formulário';
		}

		dsWorkflowService.addRow([sucesso, mensagem]);
		return dsWorkflowService;
	} catch (erro) {
		log.warn('--Debug dsWorkflowService-- Erro: ' + erro);
		log.warn('--Debug dsWorkflowService-- Linha: ' + erro.lineNumber);
		var dataset = DatasetBuilder.newDataset();
		dataset.addColumn('erro');
		dataset.addColumn('linha');
		dataset.addRow([erro, erro.lineNumber]);
		return dataset;
	}
}