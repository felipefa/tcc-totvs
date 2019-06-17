var AcertoViagem = SuperWidget.extend({
	variavelNumerica: null,
	variavelCaracter: null,

	init: function () {
		$('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
		$('.logado').hide();
		$('#panelLogin').show();

		$('#btnLogin').on('click', function () {
			loading.show();
			const login = $('#login').val();
			if (estaVazio(login)) {
				toast('Atenção!', 'Informe o login.', 'warning');
			} else {
				if (validarLogin(login)) {
					if (mostrarSolicitacoes()) {
						$('#panelLogin').hide();
						$('.logado').show();
					} else toast('Atenção!', 'Nenhuma solicitação de Viagem na atividade Acerto de Viagem foi encontrada.', 'warning');
				} else toast('Atenção!', 'Login inválido.', 'warning');
			}
			loading.hide();
		});

		$('#btnSair').on('click', function () {
			sair();
		});

		// Fazer login ao pressionar enter
		$('#login').keypress(function (e) {
			if (e.which == 13) $('#btnLogin').click();
		});
	}
});

var modalSolicitacao = null;
const loading = FLUIGC.loading(window, {
	textMessage: 'Carregando...'
});

function abrirModalSolicitacao(numeroSolicitacao) {
	const html = $('.modalSolicitacao').html();
	const template = Mustache.render(html, null);

	modalSolicitacao = FLUIGC.modal({
		title: 'Solicitação de Viagem',
		content: template,
		id: 'modalSolicitacao',
		size: 'full',
		actions: [{
			'label': 'Enviar',
			'bind': 'data-enviar-solicitacao'
		}, {
			'label': 'Cancelar',
			'bind': 'data-cancelar-modal'
		}]
	}, function (erro) {
		if (erro) toast('Atenção!', 'Erro ao abrir a modal.', 'warning');
	});

	$('[data-enviar-solicitacao]').on('click', function () {
		FLUIGC.message.confirm({
			message: 'Tem certeza que deseja enviar a solicitação?\nAo confirmar o envio, a solicitação será finalizada.',
			title: 'Enviar Solicitação',
			labelYes: 'Enviar',
			labelNo: 'Cancelar'
		}, function (confirmar) {
			if (confirmar) {
				loading.show();
				// TO DO: validar e movimentar solicitação aqui.
				const dados = montarArrayDados();
				const login = $('#login').val();
				const constraintsWorkflowService = [
					DatasetFactory.createConstraint('numeroSolicitacao', numeroSolicitacao, null, ConstraintType.MUST),
					DatasetFactory.createConstraint('matriculaUsuario', login, null, ConstraintType.MUST),
					DatasetFactory.createConstraint('dados', dados, null, ConstraintType.MUST)
				];
				const dsWorkflowService = getDatasetOAuth('dsWorkflowService', null, constraintsWorkflowService, null);
				mostrarSolicitacoes();
				modalSolicitacao.remove();
				loading.hide();
				toast('Acertô mizeravi!', '', 'success');
			}
		});
	});

	$('[data-cancelar-modal]').on('click', function () {
		FLUIGC.message.confirm({
			message: 'Tem certeza que deseja fechar a solicitação?\nTodas as alterações realizadas serão perdidas.',
			title: 'Fechar Solicitação',
			labelYes: 'Fechar',
			labelNo: 'Cancelar'
		}, function (confirmar) {
			if (confirmar) {
				modalSolicitacao.remove();
			}
		});
	});
}

/**
 * Verifica se um valor está vazio, é null ou undefined.
 * 
 * @param {*} valor Valor a ser verificado.
 * 
 * @returns {Boolean} True se estiver vazio.
 */
function estaVazio(valor) {
	if (valor == '' || valor == null || valor == undefined || valor == []) return true;
	return false;
}

function montarArrayDados() {
	const dados = [];
	$('#modalSolicitacao').find('input, select, textarea').each(function () {
		const elemento = $(this);
		if (elemento.prop('name') != '') {
			dados.push({
				'nome': elemento.prop('name'),
				'valor': elemento.val()
			});
		}
	});
	return JSON.stringify(dados);
}

/**
 * Função para exibir as solicitações de acerto de viagem do usuário logado.
 */
function mostrarSolicitacoes() {
	const login = $('#login').val();

	if (!estaVazio(login)) {
		const contraintsSolicitacoes = [
			DatasetFactory.createConstraint('loginSolicitante', login, login, ConstraintType.MUST),
			DatasetFactory.createConstraint('codigoAtividade', 12, 12, ConstraintType.MUST),
			DatasetFactory.createConstraint('aprovacaoFinanceiroFinal', 'aprovar', 'aprovar', ConstraintType.MUST)
		];
		const felipe_Viagem = getDatasetOAuth('felipe_Viagem', null, contraintsSolicitacoes, null);

		if (!estaVazio(felipe_Viagem.values) && felipe_Viagem.values.length > 0) {
			const solicitacoes = [];

			felipe_Viagem.values.forEach(viagem => {
				if (!estaVazio(viagem.numeroSolicitacao)) {
					solicitacoes.push({
						numeroSolicitacao: viagem.numeroSolicitacao,
						origem: viagem.cidadeOrigem + ', ' + viagem.estadoOrigem,
						destino: viagem.cidadeDestino + ', ' + viagem.estadoDestino,
						idaPrevista: viagem.idaPrevista,
						voltaPrevista: viagem.voltaPrevista
					});
				}
			});

			$('#qtdSolicitacoes').html(solicitacoes.length);

			FLUIGC.datatable('#tabelaSolicitacoes', {
				dataRequest: solicitacoes,
				renderContent: '.templateTabelaSolicitacoes',
				header: [{
					'title': 'Solicitação',
					'standard': true,
					'size': 'col-md-1'
				}, {
					'title': 'Origem',
					'size': 'col-md-3'
				}, {
					'title': 'Destino',
					'size': 'col-md-3'
				}, {
					'title': 'Ida',
					'size': 'col-md-2'
				}, {
					'title': 'Volta',
					'size': 'col-md-2'
				}, {
					'title': 'Opções',
					'size': 'col-md-1'
				}],
				search: {
					enabled: false
				},
				navButtons: {
					enabled: false,
				},
				tableStyle: 'table-condensed'
			});

			return true;
		}
	}
	return false;
}

/**
 * Função que redireciona para a página de login.
 */
function sair() {
	// $('#login').val('');
	// $('#usuario').html('Usuário');
	// $('#qtdSolicitacoes').html(0);
	// $('.logado').hide();
	// $('#panelLogin').show();
	location.reload();
}

/**
 * Função genérica para gerar toast.
 * 
 * @param {String} titulo Título em negrito que aparecerá no toast.
 * @param {String} msg Mensagem que aparecerá no toast.
 * @param {String} tipo São aceitos: 
 * - danger
 * - info
 * - success
 * - warning
 */
function toast(titulo, msg, tipo) {
	FLUIGC.toast({
		title: titulo,
		message: msg,
		type: tipo
	});
}

/**
 * Função para validação dos dados de login.
 * 
 * @param {String} login Login do usuário.
 * 
 * @return {boolean} Retorna 'true' para dados válidos e 'false' para dados inconsistentes.
 */
function validarLogin(login) {
	let valido = true;

	if (estaVazio(login)) {
		valido = false;
		$('#inputLogin').addClass('has-error');
	} else {
		$('#inputLogin').removeClass('has-error');
		const constraint = [DatasetFactory.createConstraint('login', login, login, ConstraintType.MUST)];
		const colleague = getDatasetOAuth('colleague', null, constraint, null);
		if (!estaVazio(colleague.values) && colleague.values.length > 0) {
			$('#usuario').html(`${colleague.values[0].colleagueName} (${login})`);
		} else valido = false;
	}

	return valido;
}