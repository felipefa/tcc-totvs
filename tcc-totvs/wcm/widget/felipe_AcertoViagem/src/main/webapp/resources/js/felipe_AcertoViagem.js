var AcertoViagem = SuperWidget.extend({
	//variáveis da widget
	variavelNumerica: null,
	variavelCaracter: null,

	//método iniciado quando a widget é carregada
	init: function () {
		$('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
		mostrarPanel('Login');
		$('#btnSair').hide();

		const inOauth = new Object({
			oauth1_fluig: new Object(),
			consumer_post: new Object({
				'public': 'post',
				'secret': 'secret-post-app'
			}),
			token_post: new Object({
				'public': '8c40af6f-4e6a-49fe-b8de-3c648c3c90da',
				'secret': '16aed677-0530-4b09-ada1-56620a889be18d6fe5ca-6956-4119-8b03-df7b8fb5c5f3'
			}),
			consumer_get: new Object({
				'public': 'get',
				'secret': 'secret-get-app'
			}),
			token_get: new Object({
				'public': 'a6afd78e-17d1-4bec-9d5f-a4ef6d6ea476',
				'secret': '49c5882a-2aee-4a48-9bf3-8ec585f90d02122bec02-8304-4b45-88ae-7cffa2ccbf66'
			})
		});

		$('#btnLogin').on('click', function () {
			const login = $('#login').val();
			if (validarLogin(login)) {
				if (!entrar(login)) {
					toast('Atenção!', 'Nenhuma solicitação de Viagem na atividade Acerto de Viagem foi encontrada.', 'warning');
				}
			} else {
				toast('Atenção!', 'Informe o login.', 'warning');
			}
		});

		$('#btnSair').on('click', function () {
			sair();
		});

		// Fazer login ao pressionar enter
		$('#login').keypress(function (e) {
			if (e.which == 13) {
				$('#btnLogin').click();
			}
		});
	},

	//BIND de eventos
	bindings: {
		local: {
			'execute': ['click_executeAction']
		},
		global: {}
	},

	executeAction: function (htmlElement, event) {}

});

function entrar(login) {
	if (mostrarSolicitacoes(login)) {
		mostrarPanel('Acerto');
		$('#btnSair').show();
		return true;
	}
	return false;
}

/**
 * Função para limpar campos de INPUT login.
 */
function limparCampos() {
	$('.super-widget').find('input').each(function () {
		$(this).val('');
	});
}

/**
 * @function estaVazio Verifica se um valor está vazio, é nulo ou indefinido.
 * 
 * @param {*} valor Valor a ser verificado.
 * 
 * @returns {Boolean} True se estiver vazio.
 */
function estaVazio(valor) {
	if (valor == '' || valor == null || valor == undefined || valor == []) return true;
	return false;
}

/**
 * Função que troca os panels.
 * 
 * @param {String} panel Ações: 'login' e 'emprestimo'
 */
function mostrarPanel(panel) {
	if (panel.toLowerCase() == 'login') {
		panelLogin('show');
		panelAcerto('hide');
	} else {
		panelAcerto('show');
		panelLogin('hide');
	}
}

/**
 * @function mostrarSolicitacoes Função para exibir as solicitações de acerto de viagem do usuário logado.
 * 
 * @param {String} login Login do usuário logado.
 */
function mostrarSolicitacoes(login) {
	if (!estaVazio(login)) {
		const contraintsSolicitacoes = [
			DatasetFactory.createConstraint('loginSolicitante', login, login, ConstraintType.MUST),
			DatasetFactory.createConstraint('codigoAtividade', 16, 16, ConstraintType.MUST)
		];
		const felipe_Viagem = chamaDataset('felipe_Viagem', null, contraintsSolicitacoes, null);

		if (felipe_Viagem.values != undefined && felipe_Viagem.values.length > 0) {
			const solicitacoes = [];

			// TO DO: Buscar solicitações aqui.
			solicitacoes.push({
				numeroSolicitacao:'0',
				cidadeOrigem:'Teste',
				cidadeDestino:'Testando',
				idaPrevista:'30/06/2019',
				voltaPrevista:'02/07/2019'
			})

			$('#qtdSolicitacoes').html(solicitacoes.length);
			const tabelaSolicitacoes = FLUIGC.datatable('#tabelaSolicitacoes', {
				dataRequest: solicitacoes,
				renderContent: '.templateTabelaSolicitacoes',
				header: [{
						'title': 'Solicitação',
						'size': 'col-md-1'
					},{
						'title': 'Origem',
						'size': 'col-md-3'
					},{
						'title': 'Destino',
						'size': 'col-md-3'
					},{
						'title': 'Ida',
						'size': 'col-md-2'
					},{
						'title': 'Volta',
						'size': 'col-md-2'
					},{
						'title': 'Acertar',
						'size': 'col-md-1'
					}
				],
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
 * Função para exibir painel de login.
 * 
 * @param {String} acao Ações: 'hide' e 'show'
 * 
 */
function panelLogin(acao) {
	if (acao == 'show') {
		$('#panelLogin').show();
		$('#btnSair').hide();
	}

	if (acao == 'hide') {
		$('#panelLogin').hide();
		$('#btnSair').show();
	}
}

/**
 * Função para exibir painel com solicitações na atividade Acerto de Viagem do usuário logado.
 * 
 * @param {String} acao Ações: 'hide' e 'show'
 * 
 */
function panelAcerto(acao) {
	if (acao == 'show') {
		$('#panelAcerto').show();
	}

	if (acao == 'hide') {
		$('#panelAcerto').hide();
	}
}

/**
 * Função para executar ações ao sair.
 * Troca os panels, limpa os cookies e recria o recaptcha com o reload da página.
 */
function sair() {
	limparCampos();
	$('#btnSair').hide();
	mostrarPanel('Login');
}

/**
 * Função genérica para gerar toast.
 * 
 * @param {String} titulo Titulo do toast.
 * @param {String} msg Mensagem para informação do toast.
 * @param {String} tipo Tipos: 
 * - danger
 * - info
 * - success
 * - warning
 * 
 * @returns {component} Retorna o toast sem timeout.
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
	} else $('#inputLogin').removeClass('has-error');

	return valido;
}