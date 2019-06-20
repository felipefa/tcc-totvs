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

		$('#idaEfetiva, #voltaEfetiva').on('blur', function () {
			const input = $(this);
			const inputId = input.prop('id');
			let mensagem = '';
			let ida = '';
			let volta = '';

			if (inputId.indexOf('ida') != -1) {
				ida = input.val();
				if (inputId.indexOf('Prevista') != -1) volta = $('#voltaPrevista').val();
				else volta = $('#voltaEfetiva').val();
				mensagem = 'A ida deve ser anterior ou no mesmo dia da volta.';
			} else if (inputId.indexOf('volta') != -1) {
				volta = input.val();
				if (inputId.indexOf('Prevista') != -1) ida = $('#idaPrevista').val();
				else ida = $('#idaEfetiva').val();
				mensagem = 'A volta deve ser no mesmo dia ou posterior a ida.'
			}

			if (!estaVazio(ida) && !estaVazio(volta) && !compararDatas(ida, volta)) {
				toast('Atenção!', mensagem, 'warning');
				input.val('');
				input.blur();
			}
		});

		$(document).on('blur', '.obrigatorio', function () {
			validarCampoVazio($(this));
		});
	}
});

var modalSolicitacao = null;
var numeroNovoIdDespesa = 0;
var quantidadeIdsTrajetos = 1;
const loading = FLUIGC.loading(window, {
	textMessage: 'Carregando...'
});

/**
 * 
 * @param {Object} elemento 
 */
function abrirModalAnexos(numeroIdDespesa) {
	const despesaEfetuada = $('#despesaEfetuada___' + numeroIdDespesa).val()

	if (estaVazio(despesaEfetuada)) {
		toast('Atenção!', 'Informe se a despesa foi efetuada ou não.', 'warning');
	} else if (despesaEfetuada == 'sim') {
		const html = $('.templateModalAnexos').html();
		const template = Mustache.render(html, {
			numeroIdDespesa: numeroIdDespesa
		});

		const modalAnexos = FLUIGC.modal({
			title: 'Anexo de Comprovantes',
			content: template,
			id: 'modalAnexos',
			size: 'full',
			actions: [{
				'label': 'Fechar',
				'autoClose': true
			}]
		}, function (erro) {
			if (erro) {
				toast('Ops...', 'Erro ao abrir modal de anexos.', 'warning');
			} else {
				criarTabelaAnexos(numeroIdDespesa);
			}
		});
	}
}

function abrirModalSolicitacao(numeroSolicitacao) {
	const html = $('.modalSolicitacao').html();
	const dadosSolicitacao = buscarDadosSolicitacao(numeroSolicitacao);
	const dadosPaiFilho = buscarDadosPaiFilho(dadosSolicitacao.documentid);

	if (estaVazio(dadosSolicitacao)) {
		toast('Atenção!', 'Solicitação ' + numeroSolicitacao + ' não encontrada.', 'warning');
	} else {
		const templateModal = Mustache.render(html, dadosSolicitacao);

		modalSolicitacao = FLUIGC.modal({
			title: 'Solicitação de Viagem - ' + dadosSolicitacao.numeroSolicitacao,
			content: templateModal,
			id: 'modalSolicitacao',
			size: 'full',
			actions: [{
				'label': 'Finalizar Solicitação',
				'bind': 'data-enviar-solicitacao'
			}, {
				'label': 'Cancelar',
				'bind': 'data-cancelar-modal'
			}]
		}, function (erro) {
			if (erro) toast('Ops...', 'Erro ao abrir a modal.', 'warning');
		});

		montarHtmlPaiFilho(dadosPaiFilho);

		$('[data-enviar-solicitacao]').on('click', function () {
			FLUIGC.message.confirm({
				message: 'Tem certeza que deseja enviar a solicitação?\nAo confirmar o envio, a solicitação será finalizada.',
				title: 'Enviar Solicitação',
				labelYes: 'Enviar',
				labelNo: 'Cancelar'
			}, function (confirmar) {
				if (confirmar) {
					loading.show();

					const dadosAlterados = montarArrayDados();
					let dsWorkflowService = null;

					if (!dadosAlterados) {
						toast('Atenção!', 'Preencha os campos em vermelho.', 'warning');
					} else {
						const constraintsAlteraForm = [
							DatasetFactory.createConstraint('tipo', 'update', 'update', ConstraintType.MUST),
							DatasetFactory.createConstraint('id', dadosSolicitacao.documentid, dadosSolicitacao.documentid, ConstraintType.MUST),
							DatasetFactory.createConstraint('dados', dadosAlterados, dadosAlterados, ConstraintType.MUST)
						];
						const dsCrudForm = getDatasetOAuth('dsCrudForm', null, constraintsAlteraForm, null);
						if (estaVazio(dsCrudForm)) {
							toast('Atenção!', 'Erro ao salvar solicitação ' + numeroSolicitacao + '.', 'danger');
						} else if (dsCrudForm.values[0].sucesso) {
							const login = $('#login').val();
							const constraintsWorkflowService = [
								DatasetFactory.createConstraint('numeroSolicitacao', numeroSolicitacao, null, ConstraintType.MUST),
								DatasetFactory.createConstraint('matriculaUsuario', login, null, ConstraintType.MUST)
							];
							dsWorkflowService = getDatasetOAuth('dsWorkflowService', null, constraintsWorkflowService, null);
						}
					}

					loading.hide();

					if (estaVazio(dsWorkflowService)) {
						toast('Atenção!', 'Erro ao enviar solicitação ' + numeroSolicitacao + '.', 'danger');
					} else if (dsWorkflowService.values[0].sucesso) {
						mostrarSolicitacoes();
						modalSolicitacao.remove();
						toast('OK!', 'Solicitação ' + numeroSolicitacao + ' movimentada com sucesso.', 'success');
					}
				}
			});
		});

		/* // Possível melhoria: Salvar alterações sem movimentar solicitação
		$('[data-salvar-solicitacao]').on('click', function () {
			loading.show();
			const dadosAlterados = montarArrayDados('salvar');
			if (!dadosAlterados) {
				toast('Atenção!', 'Preencha os campos em vermelho.', 'warning');
			} else {
				const constraintsAlteraForm = [
					DatasetFactory.createConstraint('tipo', 'update', 'update', ConstraintType.MUST),
					DatasetFactory.createConstraint('id', dadosSolicitacao.documentid, dadosSolicitacao.documentid, ConstraintType.MUST),
					DatasetFactory.createConstraint('dados', dadosAlterados, dadosAlterados, ConstraintType.MUST)
				];
				const dsCrudForm = getDatasetOAuth('dsCrudForm', null, constraintsAlteraForm, null);
				if (estaVazio(dsCrudForm)) {
					toast('Atenção!', 'Erro ao salvar solicitação ' + numeroSolicitacao + '.', 'danger');
				} else if (dsCrudForm.values[0].sucesso) {
					mostrarSolicitacoes();
					toast('OK!', 'Solicitação ' + numeroSolicitacao + ' salva com sucesso.', 'success');
				}
			}
			loading.hide();
		});
		*/

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

		calcularValorTotal('Previsto');
		calcularValorTotal('Efetivo');
		criarTabelaTrajetos();

		FLUIGC.calendar('.calendario', {
			pickDate: true,
			pickTime: false
		});
		$('.real').unmask();
		$('.real').maskMoney({
			prefixMoney: 'R$ ',
			placeholder: 'R$ 0,00'
		});

		$('[id^=dataEfetiva___]').each(function () {
			$(this).on('blur', function () {
				verificarDataEfetiva($(this));
			});
		});
	}
}

/**
 * Adiciona uma nova despesa no painel de despesas.
 */
function adicionarDespesa() {
	$('[id^=despesa___]').each(function () {
		$(this).collapse('hide');
	});

	const numeroIdDespesa = parseInt(getPosicaoPaiFilho($('[id^=trDespesa___]:last'))) + 1;

	const html = $('.templateNovaDespesa').html();
	const templateNovaDespesa = Mustache.render(html, {
		numeroIdDespesa: numeroIdDespesa
	});
	$('#tbodyDespesas').append(templateNovaDespesa);

	$('#despesaEfetuada___' + numeroIdDespesa).css({
		'pointer-events': 'none',
		'touch-action': 'none'
	});

	const tiposFornecedores = [];
	const felipe_CadastroTipoFornecedor = getDatasetOAuth('felipe_CadastroTipoFornecedor', null, null, null);
	if (!estaVazio(felipe_CadastroTipoFornecedor)) {
		felipe_CadastroTipoFornecedor.values.forEach(tipo => {
			tiposFornecedores.push({
				value: tipo.ramoAtividade,
				possuiLimite: tipo.possuiLimite,
				valorLimite: tipo.valorLimite,
				json: tipo
			});
		});
	}

	const elementoTipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa);
	const elementoFornecedor = $('#nomeFornecedor___' + numeroIdDespesa);

	elementoTipoFornecedor.autocomplete({
		minLength: 0,
		source: tiposFornecedores,
		select: function (event, tipo) {
			elementoTipoFornecedor.val(tipo.item.value);
			$('#possuiLimite___' + numeroIdDespesa).val(tipo.item.possuiLimite);
			$('#valorLimite___' + numeroIdDespesa).val(tipo.item.valorLimite);
			controlarDetalhesTipoDespesa(tipo.item.value, numeroIdDespesa);
			const fornecedores = [];
			const constraintFornecedor = [DatasetFactory.createConstraint('zoomTipoFornecedor', tipo.item.value, tipo.item.value, ConstraintType.MUST)];
			const felipe_CadastroFornecedor = getDatasetOAuth('felipe_CadastroFornecedor', null, constraintFornecedor, null);
			elementoFornecedor.attr('readonly', false);
			if (!estaVazio(felipe_CadastroFornecedor)) {
				felipe_CadastroFornecedor.values.forEach(fornecedor => {
					fornecedores.push({
						value: fornecedor.nomeFornecedor,
						cnpj: fornecedor.cnpj,
						json: JSON.stringify(fornecedor)
					});
				});
				elementoFornecedor.val('');
				elementoFornecedor.autocomplete({
					minLength: 0,
					source: fornecedores,
					select: function (event, fornecedor) {
						$('#cnpjFornecedor___' + numeroIdDespesa).val(fornecedor.item.cnpj);
					}
				});
			}
			atribuirTituloDespesa(numeroIdDespesa);
		}
	});

	elementoTipoFornecedor.on('blur', function () {
		if (estaVazio(elementoTipoFornecedor.val())) {
			controlarDetalhesTipoDespesa('', numeroIdDespesa);
			elementoFornecedor.val('');
			elementoFornecedor.attr('readonly', true);
		} else {
			controlarDetalhesTipoDespesa(elementoTipoFornecedor.val(), numeroIdDespesa);
			elementoFornecedor.attr('readonly', false);
		}
		atribuirTituloDespesa(numeroIdDespesa);
	});

	elementoFornecedor.on('blur', function () {
		atribuirTituloDespesa(numeroIdDespesa);
	});

	FLUIGC.calendar('.calendario', {
		pickDate: true,
		pickTime: false
	});
	FLUIGC.calendar('.calendarioHora', {
		pickDate: true,
		pickTime: true,
		sideBySide: true
	});
	FLUIGC.utilities.scrollTo('#panelDespesa___' + numeroIdDespesa, 500);

	$('.real').unmask();
	$('.real').maskMoney({
		prefixMoney: 'R$ ',
		placeholder: 'R$ 0,00'
	});

	$('#dataEfetiva___' + numeroIdDespesa).on('blur', function () {
		verificarDataEfetiva($(this));
	});
}

/**
 * Exibe os elementos relacionados ao tipo de fornecedor informado e oculta os outros não relacionados.
 * 
 * @param {String} exibirId Prefixo do id do grupo de elementos que devem ser exibidos.
 * @param {String} numeroIdPaiFilho Número contido no id do elemento no pai filho.
 */
function alternarDetalhesTipoDespesa(exibirId, numeroIdPaiFilho) {
	const idsTipos = ['tipoAluguelVeiculos', 'tipoHospedagem', 'tipoProprio', 'tipoTransporte', 'tipoPadrao'];

	idsTipos.map(function (id) {
		if (exibirId == id) $('#' + exibirId + '___' + numeroIdPaiFilho).show();
		else $('#' + id + '___' + numeroIdPaiFilho).hide();
	});
}

/**
 * Função para anexar documentos na página através do diretório /ecm/upload.
 * 
 * @param {Object} elemento 
 * @param {String} numeroIdDespesa 
 */
function anexarComprovantes(elemento, numeroIdDespesa) {
	$(function () {
		$(elemento).fileupload({
			dataType: 'json',
			send: function (e, data) {
				loading.show();
			},
			done: function (e, data) {
				const codigoPastaDespesa = verificarCriarPasta(numeroIdDespesa);
				$.each(data.result.files, function (index, file) {
					gravarArquivo(codigoPastaDespesa, file.name);
				});
				criarTabelaAnexos(numeroIdDespesa);
				loading.hide();
			}
		});
	});
}

function atribuirTituloDespesa(numeroIdDespesa) {
	const tipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa).val();
	const nomeFornecedor = $('#nomeFornecedor___' + numeroIdDespesa).val();
	let tituloDespesa = 'Preencha a despesa';
	if (!estaVazio(tipoFornecedor) && !estaVazio(nomeFornecedor)) {
		tituloDespesa = `${numeroIdDespesa} - ${tipoFornecedor} - ${nomeFornecedor} - Despesa não prevista`;
	}
	$('#tituloDespesa___' + numeroIdDespesa).html(tituloDespesa);
}

/**
 * 
 * @param {String} numeroIdDespesa 
 */
function buscarArquivos(numeroIdDespesa) {
	const codigoPastaDespesa = verificarCriarPasta(numeroIdDespesa);
	const arquivos = ajaxEcm('listarDocumentos', codigoPastaDespesa);
	return arquivos.content;
}

function buscarDadosPaiFilho(documentid) {
	const constraintPaiFilho = [
		DatasetFactory.createConstraint('idForm', documentid, null, ConstraintType.MUST),
		DatasetFactory.createConstraint('datasetName', 'felipe_Viagem', null, ConstraintType.MUST),
		DatasetFactory.createConstraint('dataTable', 'despesas', null, ConstraintType.MUST)
	];
	const dsConsultaTable = getDatasetOAuth('dsConsultaTable', null, constraintPaiFilho, null);

	if (!estaVazio(dsConsultaTable.values) && dsConsultaTable.values.length > 0) {
		return dsConsultaTable;
	}

	return [];
}

function buscarDadosSolicitacao(numeroSolicitacao) {
	const constraintsSolicitacao = [
		DatasetFactory.createConstraint('numeroSolicitacao', numeroSolicitacao, numeroSolicitacao, ConstraintType.MUST),
	];
	const felipe_Viagem = getDatasetOAuth('felipe_Viagem', null, constraintsSolicitacao, null);

	if (!estaVazio(felipe_Viagem.values) && felipe_Viagem.values.length > 0) {
		return felipe_Viagem.values[0];
	}

	return [];
}

/**
 * Função que busca uma pasta específica através da descrição à partir de uma pasta pai.
 * 
 * @param {string} codigoPastaPai Código da pasta pai no fluig 
 * @param {string} codItemBuscado Código do item buscado. Podendo ser:
 * - Número de uma solicitação
 * - Número do id de uma despesa
 * @param {string} descricaoItemBuscado descrição (nome) do item buscado. Podendo ser:
 * - Nome do solicitante
 * - Nome do fornecedor
 * 
 * @return {string} Retorna o código da pasta encontrada ou null caso não exista.
 */
function buscarPasta(codigoPastaPai, codItemBuscado, descricaoItemBuscado) {
	const listaDePastasFilhas = ajaxEcm('listarDocumentos', codigoPastaPai);
	const descricaoPasta = `${codItemBuscado} - ${descricaoItemBuscado}`;
	let idPasta = null;

	listaDePastasFilhas.content.forEach(pasta => {
		if (pasta.description == descricaoPasta) {
			idPasta = pasta.id;
		}
	});

	return idPasta;
}

/**
 * @function cadastrarTrajeto Adiciona ou edita um trajeto existente de acordo com os parâmetros informados.
 * 
 * @param {Object} elemento Objeto que pode ser o botão de adicionar trajeto do DOM ou dados contendo o numero do id da despesa e do trajeto, no caso de edição.
 * @param {String} tipo Aceita dois parâmetros de acordo com o que deve ser feito, sendo eles:
 * - adicionar
 * - editar
 */
function cadastrarTrajeto(elemento, tipo) {
	let numeroIdDespesa = null;
	let numeroIdTrajeto = null;
	if (tipo == 'adicionar') {
		numeroIdDespesa = getPosicaoPaiFilho(elemento);
	} else if (tipo == 'editar') {
		numeroIdDespesa = elemento.numeroIdDespesa;
		numeroIdTrajeto = elemento.numeroIdTrajeto;
		elemento = JSON.parse($('#jsonTrajetos___' + numeroIdDespesa).val());
		elemento = elemento[elemento.findIndex(trajeto => trajeto.numeroIdDespesa == numeroIdDespesa && trajeto.numeroIdTrajeto == numeroIdTrajeto)];
	}
	const fornecedor = $('#nomeFornecedor___' + numeroIdDespesa).val();

	// Só permite adicionar um trajeto se um fornecedor estiver selecionado
	if (!estaVazio(fornecedor)) {
		const html = $('.templateCadastroTrajeto').html();
		const dados = {
			origem: estaVazio(elemento.origem) ? '' : elemento.origem,
			destino: estaVazio(elemento.destino) ? '' : elemento.destino,
			dataHoraTrajeto: estaVazio(elemento.dataHoraTrajeto) ? '' : elemento.dataHoraTrajeto,
			identificador: estaVazio(elemento.identificador) ? '' : elemento.identificador
		}
		const template = Mustache.render(html, dados);

		const modalTrajeto = FLUIGC.modal({
			title: 'Cadastro de Trajeto',
			content: template,
			id: 'modalTrajeto',
			size: 'full',
			actions: [{
				'label': 'Salvar',
				'bind': 'data-salvar-trajeto'
			}, {
				'label': 'Cancelar',
				'autoClose': true
			}]
		});

		FLUIGC.calendar('.calendarioHora', {
			pickDate: true,
			pickTime: true,
			sideBySide: true
		});

		$(document).on('blur', '#modalTrajeto .obrigatorio', function () {
			validarCampoVazio($(this));
		});

		$('[data-salvar-trajeto]').on('click', function () {
			const salvou = salvarTrajeto(numeroIdDespesa, (estaVazio(numeroIdTrajeto) ? quantidadeIdsTrajetos : numeroIdTrajeto), tipo);
			if (salvou) {
				criarTabelaTrajetos(numeroIdDespesa);
				estaVazio(numeroIdTrajeto) ? quantidadeIdsTrajetos++ : null;
				modalTrajeto.remove();
				toast('OK!', 'Trajeto salvo com sucesso.', 'success');
			} else {
				$('#modalTrajeto .obrigatorio').blur();
				toast('Atenção!', 'Preencha os campos em vermelho.', 'warning');
			}
		});
	} else {
		toast('Atenção!', 'Selecione um fornecedor antes de adicionar um trajeto.', 'warning');
	}
}

/**
 * @function calcularValorTotal Calcula o valor total das despesas de acordo com o tipo informado.
 * 
 * @param {String} tipo  Tipo de valor calculado, podendo ser:
 * - Previsto
 * - Efetivo
 */
function calcularValorTotal(tipo) {
	let valorTotal = 0;
	$('[id^=valor' + tipo + 'SM___]').each(function () {
		const valor = $(this).val();
		if (!estaVazio(valor) && valor != 'NaN') valorTotal += parseFloat(valor);
	});
	$('#total' + tipo + 'SM').val(valorTotal.toFixed(2));
	$('.real').unmask();
	$('#total' + tipo).val(valorTotal.toFixed(2));
	$('.real').maskMoney({
		prefixMoney: 'R$ ',
		placeholder: 'R$ 0,00'
	});
}

/**
 * Pode ser executada de duas formas:
 * - Quando chamada passando apenas data inicial e final, verifica se a primeira é anterior a segunda.
 * - Quando os todos os parâmetro são informados, verifica se a terceira data está entre as duas anteriores.
 * 
 * @param {String} dataInicial Data inicial a ser comparada.
 * @param {String} dataFinal Data final a ser comparada.
 * @param {String} dataIntervalar Data a ser comparada entre a inicial e a final.
 * 
 * @returns {Boolean} True se a data inicial for anterior a final e não houver uma terceira data, senão verifica se a última está entre as duas primeiras.
 */
function compararDatas(dataInicial, dataFinal, dataIntervalar = null) {
	if (!estaVazio(dataInicial) && !estaVazio(dataFinal)) {
		const timestampDataInicial = transformarEmTimestamp(dataInicial);
		const timestampDataFinal = transformarEmTimestamp(dataFinal);
		if (estaVazio(dataIntervalar)) {
			if (timestampDataInicial <= timestampDataFinal) return true;
		} else {
			const timestampDataIntervalar = transformarEmTimestamp(dataIntervalar);
			if (timestampDataInicial <= timestampDataIntervalar && timestampDataIntervalar <= timestampDataFinal) return true;
		}
	}
	return false;
}

/**
 * Faz o controle de qual grupo de elementos deve ser exibido conforme o tipo de fornecedor selecionado.
 * Os seguintes tipos de fornecedores possuem grupos específicos:
 * - Aluguel de Veículos;
 * - Hospedagem;
 * - Próprio;
 * - Transporte Aéreo;
 * - Transporte Terrestre;
 * 
 * Para outros tipos de fornecedores, o grupo padrão será exibido.
 * 
 * @param {String} ramoAtividade Ramo de atividade a ser verificado.
 * @param {String} numeroIdPaiFilho Número contido no id do elemento no pai filho.
 */
function controlarDetalhesTipoDespesa(ramoAtividade, numeroIdPaiFilho) {
	switch (ramoAtividade) {
		case 'Aluguel de Veículos':
			alternarDetalhesTipoDespesa('tipoAluguelVeiculos', numeroIdPaiFilho);
			break;
		case 'Hospedagem':
			alternarDetalhesTipoDespesa('tipoHospedagem', numeroIdPaiFilho);
			break;
		case 'Próprio':
			alternarDetalhesTipoDespesa('tipoProprio', numeroIdPaiFilho);
			break;
		case 'Transporte Aéreo':
		case 'Transporte Terrestre':
			alternarDetalhesTipoDespesa('tipoTransporte', numeroIdPaiFilho);
			criarTabelaTrajetos(numeroIdPaiFilho);
			break;
		default:
			alternarDetalhesTipoDespesa('tipoPadrao', numeroIdPaiFilho);
			break;
	}
}

/**
 * Função que cria pasta utilizando a API 2.0
 * 
 * @param {string} codigoPastaPai Código da pasta pai no fluig 
 * @param {string} codItemBuscado Código do item buscado. Podendo ser:
 * - Número de uma solicitação
 * - Número do id de uma despesa
 * @param {string} descricaoItemBuscado descrição (nome) do item buscado. Podendo ser:
 * - Nome do solicitante
 * - Nome do fornecedor
 * 
 * @return {string} Retorna o código da pasta criada.
 */
function criaPasta(codigoPastaPai, codItemBuscado, descricaoItemBuscado) {
	const dados = montarDadosPasta(codigoPastaPai, codItemBuscado, descricaoItemBuscado);
	return ajaxEcm('criarPasta', JSON.stringify(dados));
}

/**
 * 
 * @param {String} numeroIdDespesa 
 */
function criarTabelaAnexos(numeroIdDespesa) {
	const anexos = buscarArquivos(numeroIdDespesa);
	const linhas = [];

	anexos.forEach(anexo => {
		linhas.push({
			codigo: anexo.id,
			descricao: anexo.description,
			fileURL: anexo.fileURL,
			numeroIdDespesa: numeroIdDespesa
		});
	});

	FLUIGC.datatable('.divTabelaAnexos', {
		dataRequest: linhas,
		renderContent: '.templateTabelaAnexos',
		header: [{
			'title': 'Código',
			'size': 'col-md-1'
		}, {
			'title': 'Descrição',
			'size': 'col-md-9'
		}, {
			'title': 'Opções',
			'size': 'col-md-2'
		}],
		search: {
			enabled: false,
		},
		navButtons: {
			enabled: false,
		},
		tableStyle: 'table-condensed'
	});
}

/**
 * Monta a tabela com os trajetos cadastrados pelo usuário de acordo com o que foi salvo no campo jsonTrajetos de uma determinada despesa.
 */
function criarTabelaTrajetos() {
	$('[id^=jsonTrajetos___]').each(function () {
		const json = $(this);
		const numeroIdDespesa = getPosicaoPaiFilho(json);
		const jsonTrajetos = estaVazio(json.val()) ? [] : JSON.parse(json.val());

		FLUIGC.datatable('#trajetos___' + numeroIdDespesa, {
			dataRequest: jsonTrajetos,
			renderContent: '.templateTabelaTrajetos',
			header: [{
				'title': 'Origem',
				'size': 'col-md-3'
			}, {
				'title': 'Destino',
				'size': 'col-md-3'
			}, {
				'title': 'Data',
				'size': 'col-md-3'
			}, {
				'title': 'Identificador',
				'size': 'col-md-1'
			}, {
				'title': 'Opções',
				'size': 'col-md-2 opcoesTrajeto'
			}],
			search: {
				enabled: false,
			},
			navButtons: {
				enabled: false,
			},
			tableStyle: 'table-condensed'
		});

		const aprovacaoFinanceiro = $('[name=aprovacaoFinanceiro___' + numeroIdDespesa + ']').val();
		if (estaVazio(aprovacaoFinanceiro)) {
			$('#btnCadastrarTrajeto___' + numeroIdDespesa).attr('disabled', false);
			$('#btnExcluirTrajeto___' + numeroIdDespesa).attr('disabled', false);
		}
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

/**
 * @function excluirDespesa Exclui uma despesa do painel de despesas.
 * 
 * @param {Number} numeroIdDespesa Elemento do DOM clicado para realizar a remoção da despesa.
 */
function excluirDespesa(numeroIdDespesa) {
	FLUIGC.message.confirm({
		message: 'Tem certeza que deseja excluir esta despesa?',
		title: 'Excluir Despesa',
		labelYes: 'Excluir',
		labelNo: 'Cancelar'
	}, function (confirmar) {
		if (confirmar) {
			$('#trDespesa___' + numeroIdDespesa).remove();
		}
	});
}

/**
 * Exclui um trajeto de acordo com os parâmetros informados.
 * 
 * @param {Number} numeroIdDespesa Número do id da despesa ao qual o trajeto pertence.
 * @param {Number} numeroIdTrajeto Número do id do trajeto.
 */
function excluirTrajeto(numeroIdDespesa, numeroIdTrajeto) {
	FLUIGC.message.confirm({
		message: 'Tem certeza que deseja excluir este trajeto?',
		title: 'Excluir Trajeto',
		labelYes: 'Excluir',
		labelNo: 'Cancelar'
	}, function (confirmar) {
		if (confirmar) {
			const jsonTrajetos = JSON.parse($('#jsonTrajetos___' + numeroIdDespesa).val());
			jsonTrajetos.splice(jsonTrajetos.findIndex(trajeto => trajeto.numeroIdDespesa == numeroIdDespesa && trajeto.numeroIdTrajeto == numeroIdTrajeto), 1);
			$('#jsonTrajetos___' + numeroIdDespesa).val(JSON.stringify(jsonTrajetos));
			criarTabelaTrajetos(numeroIdDespesa);
		}
	});
}

/**
 * @function getPosicaoPaiFilho Busca o número do id de um elemento em um pai filho.
 * 
 * @param {Object} elemento Objeto do JQuery que contém um elemento do pai filho.
 * 
 * @returns {String} String com o número contido no id do elemento do pai filho.
 */
function getPosicaoPaiFilho(elemento) {
	const numeroId = $(elemento).prop('id').split('___')[1];
	return $('#numeroIdDespesa___' + numeroId).val();
}

/**
 * Função usada para gravar um arquivo no ECM.
 * 
 * @param {string} codigoPasta Id da pasta onde o arquivo deve ser gravado.
 * @param {string} nomeArquivo Descrição do arquivo no ECM.
 * 
 * @returns O resultado da requisição ajax.
 */
function gravarArquivo(codigoPasta, nomeArquivo) {
	const dados = JSON.stringify({
		'description': nomeArquivo,
		'parentId': codigoPasta,
		'activeVersion': true,
		'attachments': [{
			'fileName': nomeArquivo,
			'principal': true
		}],
	});

	return ajaxEcm('criarArquivo', dados);
}

function montarArrayDados(tipo = 'enviar') {
	const dados = [];
	let valido = true;

	$('#modalSolicitacao').find('input, select, textarea').each(function () {
		const elemento = $(this);
		const nome = elemento.prop('name');
		const valor = elemento.val();
		if (!estaVazio(nome) && !estaVazio(valor)) {
			dados.push({
				'nome': nome,
				'valor': valor
			});
		} else if (elemento.hasClass('obrigatorio') && tipo == 'enviar') {
			if (nome.indexOf('dataEfetiva') == -1 && nome.indexOf('valorEfetivo') == -1) {
				valido = !validarCampoVazio(elemento);
			} else {
				const numeroIdDespesa = getPosicaoPaiFilho(elemento);
				if ($('#despesaEfetuada___' + numeroIdDespesa).val() == 'sim') {
					valido = !validarCampoVazio(elemento);
				}
			}
		}
	});

	if (valido) return JSON.stringify(dados);
	else return valido;
}

/**
 * Função que monta os dados para criação de uma pasta em um JSON.
 * 
 * @param {string} codigoPastaPai Código da pasta pai no fluig 
 * @param {string} codItemBuscado Código do item buscado. Podendo ser:
 * - Número de uma solicitação
 * - Número do id de uma despesa
 * @param {string} descricaoItemBuscado descrição (nome) do item buscado. Podendo ser:
 * - Nome do solicitante
 * - Nome do fornecedor
 * 
 * @return {Object} Retorna JSON com os dados que serão enviados na requisição.
 */
function montarDadosPasta(codigoPastaPai, codItemBuscado, descricaoItemBuscado) {
	return {
		'publisherId': 'admin',
		'documentDescription': `${codItemBuscado} - ${descricaoItemBuscado}`,
		'parentFolderId': codigoPastaPai,
		'publisherId': 'admin',
		'additionalComments': 'Pasta criada automaticamente pelo fluig.',
		'inheritSecurity': true,
		'permissionType': 12345,
		'restrictionType': 12345
	};
}

function montarHtmlPaiFilho(dadosPaiFilho) {
	const template = $('.templateDespesaPreenchida').html();
	let html = '';

	dadosPaiFilho.values.forEach((despesa) => {
		let border = null;
		let classe = null;
		let cor = 'inherit';
		let icone = null;

		if (despesa['aprovacaoFinanceiro'] == 'aprovar') {
			classe = 'text-success';
			cor = '#38cf5a';
			border = 'border: 1px solid ' + cor;
			icone = '<i class="fluigicon fluigicon-check-circle-on icon-sm ' + classe + '"></i>';
		} else if (despesa['aprovacaoFinanceiro'] == 'reprovar') {
			classe = 'text-danger';
			cor = '#f64445';
			border = 'border: 1px solid ' + cor;
			icone = '<i class="fluigicon fluigicon-remove icon-sm ' + classe + '"></i>';
		}

		despesa['border'] = border;
		despesa['classe'] = classe;
		despesa['cor'] = cor;
		despesa['icone'] = icone;

		html += Mustache.render(template, despesa);
	});

	$('#tbodyDespesas').html(html);

	// TO DO: Criar tabela trajetos
	// TO DO: Criar modal anexos
}

/**
 * Função para exibir as solicitações de acerto de viagem do usuário logado.
 */
function mostrarSolicitacoes() {
	const login = $('#login').val();

	if (!estaVazio(login)) {
		const contraintsSolicitacoes = [
			DatasetFactory.createConstraint('loginSolicitante', login, login, ConstraintType.MUST),
			DatasetFactory.createConstraint('codigoAtividade', 16, 16, ConstraintType.MUST),
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
 * Função para remover arquivo ou pasta de acordo com o id informado.
 * 
 * @param {string} codigo Código do arquivo/pasta do fluig que deve ser removido.
 * 
 * @returns O retorno do método ajax de remoção de arquivo ou pasta.
 */
function removerArquivoPasta(numeroIdDespesa, codigo) {
	FLUIGC.message.confirm({
		message: 'Tem certeza que deseja excluir este arquivo?',
		title: 'Excluir Arquivo',
		labelYes: 'Excluir',
		labelNo: 'Cancelar'
	}, function (confirmar) {
		if (confirmar) {
			loading.show();
			const dado = JSON.stringify({
				'id': codigo
			});
			ajaxEcm('remover', dado);
			criarTabelaAnexos(numeroIdDespesa);
			loading.hide();
		}
	});
}

/**
 * @function removerMascaraReal Remove a máscara de reais sobre o valor de um campo especificado por parâmetro.
 * 
 * @param {Object} elemento Campo do DOM que contém o valor em reais com máscara.
 */
function removerMascaraReal(elemento) {
	const valor = $(elemento).cleanVal();
	return parseFloat(valor.substring(0, valor.length - 2) + '.' + valor.substr(-2)).toFixed(2);
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
 * Salva um trajeto de acordo com os parâmetros informados.
 * 
 * @param {Number} numeroIdDespesa Número do id da despesa.
 * @param {Number} numeroIdTrajeto Número do id do trajeto.
 * @param {String} tipo Tipo de operação que será realizada, podendo ser:
 * - adicionar
 * - editar
 */
function salvarTrajeto(numeroIdDespesa, numeroIdTrajeto, tipo) {
	let jsonTrajetos = $('#jsonTrajetos___' + numeroIdDespesa).val();
	const origem = $('#origem').val();
	const destino = $('#destino').val();
	const dataHoraTrajeto = $('#dataHoraTrajeto').val();
	const identificador = $('#identificador').val();

	if (estaVazio(origem) || estaVazio(destino) || estaVazio(dataHoraTrajeto)) {
		return false;
	} else {
		if (!estaVazio(jsonTrajetos)) jsonTrajetos = JSON.parse(jsonTrajetos);
		else jsonTrajetos = [];

		if (tipo == 'adicionar') {
			jsonTrajetos.push({
				numeroIdDespesa: parseInt(numeroIdDespesa),
				numeroIdTrajeto: parseInt(numeroIdTrajeto),
				origem: origem,
				destino: destino,
				dataHoraTrajeto: dataHoraTrajeto,
				identificador: identificador
			});
		} else if (tipo == 'editar') {
			const index = jsonTrajetos.findIndex(trajeto => trajeto.numeroIdDespesa == numeroIdDespesa && trajeto.numeroIdTrajeto == numeroIdTrajeto);
			jsonTrajetos[index].origem = origem;
			jsonTrajetos[index].destino = destino;
			jsonTrajetos[index].dataHoraTrajeto = dataHoraTrajeto;
			jsonTrajetos[index].identificador = identificador;
		}

		jsonTrajetos = JSON.stringify(jsonTrajetos);
		$('#jsonTrajetos___' + numeroIdDespesa).val(jsonTrajetos);
		return true;
	}
}

/**
 * @function salvarValorSemMascara Salva o valor em reais digitado em um campo com máscara em outro campo escondido sem máscara.
 * 
 * @param {Object} elemento Objeto do DOM que contém o valor em reais com máscara.
 * @param {String} tipo Tipo de valor calculado, podendo ser:
 * - Previsto
 * - Efetivo
 */
function salvarValorSemMascara(elemento, tipo) {
	const numeroIdDespesa = getPosicaoPaiFilho(elemento);
	const valor = removerMascaraReal(elemento);
	$('#valor' + tipo + 'SM___' + numeroIdDespesa).val(valor);
	calcularValorTotal(tipo);
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
 * Converte uma data em string no formato DD/MM/AAAA em timestamp.
 * 
 * @param {String} data String com data no formato DD/MM/AAAA.
 * 
 * @return {Number} Timestamp da data convertida.
 */
function transformarEmTimestamp(data) {
	let dataSplit = data.split('/');
	let novaData = dataSplit[1] + '/' + dataSplit[0] + '/' + dataSplit[2];
	return new Date(novaData).getTime();
}

/**
 * @function validarCampoVazio Altera a borda e label do campo vazio para vermelhas.
 * 
 * @param {Object} input Elemento do DOM que deve ser validado.
 * 
 * @returns {Boolean} True se o campo estiver vazio.
 */
function validarCampoVazio(input) {
	if (estaVazio(input.val()) && !input.prop('readonly')) {
		if (input.hasClass('calendario') || input.hasClass('calendarioHora')) {
			input.parent().parent().addClass('has-error');
		} else {
			input.parent().addClass('has-error');
		}
		return true;
	} else {
		if (input.hasClass('calendario') || input.hasClass('calendarioHora')) {
			input.parent().parent().removeClass('has-error');
		} else {
			input.parent().removeClass('has-error');
		}
		return false;
	}
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

/**
 * Função à ser executada antes de salvar arquivos. 
 * Busca e cria pastas no ECM de acordo com o número da solicitação e o nome do solicitante, sendo que cada despesa também possui sua pasta.
 * 
 * @param {String} numeroIdDespesa
 * 
 * @return {string} Código da pasta existente ou já criada para os comprovantes da solicitação.
 */
function verificarCriarPasta(numeroIdDespesa) {
	const codigoAnexosComprovantes = '44'; //44 no fluig local
	const numeroSolicitacao = $('#numeroSolicitacao').val();
	const nomeSolicitante = $('#nomeSolicitante').val();
	const nomeFornecedor = $('[name=nomeFornecedor___' + numeroIdDespesa + ']').val();

	let codigoPastaSolicitacao = buscarPasta(codigoAnexosComprovantes, numeroSolicitacao, nomeSolicitante);
	if (estaVazio(codigoPastaSolicitacao)) {
		codigoPastaSolicitacao = (criaPasta(codigoAnexosComprovantes, numeroSolicitacao, nomeSolicitante)).content.documentId;
	}

	let codigoPastaDespesa = buscarPasta(codigoPastaSolicitacao, numeroIdDespesa, nomeFornecedor);
	if (estaVazio(codigoPastaDespesa)) {
		codigoPastaDespesa = (criaPasta(codigoPastaSolicitacao, numeroIdDespesa, nomeFornecedor)).content.documentId;
	}

	return codigoPastaDespesa;
}

function verificarDataEfetiva(dataEfetiva) {
	const idaEfetiva = $('#idaEfetiva').val();
	const voltaEfetiva = $('#voltaEfetiva').val();

	if (estaVazio(idaEfetiva)) {
		toast('Atenção!', 'Informe a data efetiva da ida.', 'warning');
		dataEfetiva.val('');
	} else if (estaVazio(voltaEfetiva)) {
		toast('Atenção!', 'Informe a data efetiva da volta.', 'warning');
		dataEfetiva.val('');
	} else if (!compararDatas(idaEfetiva, voltaEfetiva, dataEfetiva.val())) {
		toast('Atenção!', 'A data efetiva deve estar entre a ida e a volta efetiva.', 'warning');
		dataEfetiva.val('');
	}
}