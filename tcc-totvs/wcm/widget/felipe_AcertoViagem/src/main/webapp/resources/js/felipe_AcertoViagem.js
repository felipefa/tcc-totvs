var AcertoViagem = SuperWidget.extend({
	variavelNumerica: null,
	variavelCaracter: null,

	init: function () {
		$('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
		$('.logado').hide();
		$('#panelLogin').show();
		verificarCookie();

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
var quantidadeIdsTrajetos = 1;
const loading = FLUIGC.loading(window, {
	textMessage: 'Carregando...'
});

/**
 * Abre a modal de anexos.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
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

/**
 * Abre a modal da solicitação para acerto.
 * 
 * @param {Number} numeroSolicitacao Número da posição do elemento no pai x filho.
 */
function abrirModalSolicitacao(numeroSolicitacao) {
	const html = $('.modalSolicitacao').html();
	const dadosSolicitacao = buscarDadosSolicitacao(numeroSolicitacao);
	const dadosPaiFilho = buscarDadosPaiFilho(dadosSolicitacao.documentid);
	quantidadeIdsTrajetos = 1;

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

		$('[id^=despesa___]').each(function () {
			const numeroIdDespesa = getPosicaoPaiFilho($(this));
			atualizarLabelValorPrevistoPor(numeroIdDespesa);
		});
	}
}

/**
 * Adiciona uma nova despesa no painel de despesas de uma solicitação.
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

	const elementoTipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa);
	const elementoFornecedor = $('#nomeFornecedor___' + numeroIdDespesa);

	instanciarAutocomplete(elementoTipoFornecedor, 'tipoFornecedor', numeroIdDespesa);

	elementoTipoFornecedor.on('blur', function () {
		if (estaVazio(elementoTipoFornecedor.val())) {
			alternarDetalhesTipoDespesa('', numeroIdDespesa);
			elementoFornecedor.val('');
			elementoFornecedor.attr('readonly', true);
		} else {
			controlarDetalhesTipoDespesa(elementoTipoFornecedor.val(), numeroIdDespesa);
			if (elementoTipoFornecedor.val() != 'Km Rodado') elementoFornecedor.attr('readonly', false);
		}
		atribuirTituloDespesa(numeroIdDespesa);
	});

	elementoFornecedor.on('blur', function () {
		atribuirTituloDespesa(numeroIdDespesa);
	});

	$('#proprioDistancia___' + numeroIdDespesa).on('blur', function () {
		calcularValorTotalPrevistoDespesa(numeroIdDespesa);
	});

	instanciarAutocomplete($('#proprioOrigem___' + numeroIdDespesa), 'cidade');
	instanciarAutocomplete($('#proprioDestino___' + numeroIdDespesa), 'cidade');

	FLUIGC.calendar('.calendario', {
		pickDate: true,
		pickTime: false
	});
	FLUIGC.calendar('.calendarioHora', {
		pickDate: true,
		pickTime: true,
		sideBySide: true
	});

	$('.real').unmask();
	$('.real').maskMoney({
		prefixMoney: 'R$ ',
		placeholder: 'R$ 0,00'
	});

	$('#dataEfetiva___' + numeroIdDespesa).on('blur', function () {
		verificarDataEfetiva($(this));
	});

	FLUIGC.utilities.scrollTo('#modalSolicitacao #trDespesa___' + numeroIdDespesa, 500);
}

/**
 * Ativa ou desativa campos relacionados a efetivação da despesa, caso ela tenha sido efetuada ou não.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho. 
 */
function alternarDetalhesDespesaEfetuada(numeroIdDespesa) {
	const despesaEfetuada = $('#despesaEfetuada___' + numeroIdDespesa).val();
	const valorEfetivo = $('#valorEfetivo___' + numeroIdDespesa);
	const dataEfetiva = $('#dataEfetiva___' + numeroIdDespesa);
	const btnAnexos = $('#btnAnexos___' + numeroIdDespesa);
	if (despesaEfetuada == 'nao') {
		valorEfetivo.val('');
		dataEfetiva.val('');
		valorEfetivo.attr('readonly', true);
		FLUIGC.calendar('#dataEfetiva___' + numeroIdDespesa).disable();
		btnAnexos.attr('disabled', true);
	} else {
		valorEfetivo.attr('readonly', false);
		FLUIGC.calendar('#dataEfetiva___' + numeroIdDespesa).enable();
		btnAnexos.attr('disabled', false);
	}
}

/**
 * Exibe os elementos relacionados ao tipo de fornecedor informado e oculta os outros não relacionados.
 * 
 * @param {String} exibirId Prefixo do id do grupo de elementos que devem ser exibidos.
 * @param {String} numeroIdPaiFilho Número contido no id do elemento no pai filho.
 */
function alternarDetalhesTipoDespesa(exibirId, numeroIdPaiFilho) {
	const idsTipos = ['tipoAluguelVeiculos', 'tipoHospedagem', 'tipoCombustivel', 'tipoTransporte', 'tipoPadrao'];

	idsTipos.map(function (id) {
		if (exibirId == id) {
			$('#' + exibirId + '___' + numeroIdPaiFilho).show();
		} else $('#' + id + '___' + numeroIdPaiFilho).hide();
	});

	$('#valorPrevisto___' + numeroIdPaiFilho).attr('readonly', true);
}

/**
 * Função para anexar documentos na página através do diretório /ecm/upload.
 * 
 * @param {Object} elemento Elemento do DOM com o input de arquivos.
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
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

/**
 * Atualiza a label do valor previsto de acordo com o tipo de limite da despesa.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
 */
function atualizarLabelValorPrevistoPor(numeroIdDespesa) {
	const limitePor = $('#limitePor___' + numeroIdDespesa).val();
	if (!estaVazio(limitePor)) $('#labelValorPrevisto___' + numeroIdDespesa).html('Valor Previsto / ' + limitePor);
}

/**
 * Atribui o título ao painel da despesa de acordo com seu tipo, fornecedor e valor total previsto.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
 */
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
 * Busca os anexos de uma determinada despesa.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
 */
function buscarArquivos(numeroIdDespesa) {
	const codigoPastaDespesa = verificarCriarPasta(numeroIdDespesa);
	const arquivos = ajaxEcm('listarDocumentos', codigoPastaDespesa);
	return arquivos.content;
}

/**
 * Busca os dados do pai x filho de despesas de uma solicitação de viagem.
 * 
 * @param {Number} documentid Número do documentid do formulário de viagem.
 * 
 * @returns {Array<Object>} Dados das despesas de uma solicitação de viagem.
 */
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

/**
 * Busca os dados de uma solicitação de viagem.
 * 
 * @param {Number} numeroSolicitacao Número da solicitação.
 * 
 * @returns {Object} Dados da solicitação buscada.
 */
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
 * Adiciona ou edita um trajeto existente de acordo com os parâmetros informados.
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

		instanciarAutocomplete($('#origem'), 'cidade');
		instanciarAutocomplete($('#destino'), 'cidade');

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
 * Calcula a quantidade de dias entre uma data inicial e uma final.
 * 
 * @param {String} dataInicial String com a data inicial no formato DD/MM/AAAA.
 * @param {String} dataFinal String com a data final no formato DD/MM/AAAA.
 * 
 * @returns {Number} Quantidade de dias entre a data inicial e a final.
 */
function calcularDiarias(dataInicial, dataFinal) {
	return transformarDias(transformarEmTimestamp(dataFinal) - transformarEmTimestamp(dataInicial));
}

/**
 * Calcula o valor total das despesas de acordo com o tipo informado.
 * 
 * @param {String} tipo  Tipo de valor calculado, podendo ser:
 * - Previsto
 * - Efetivo
 */
function calcularValorTotal(tipo) {
	let valorTotal = 0;
	let seletor = '[id^=valor' + tipo + 'SM___]';
	if (tipo == 'Previsto') seletor = '[id^=valorTotal' + tipo + 'SM___]';
	$(seletor).each(function () {
		const valor = $(this).val();
		if (!estaVazio(valor) && !isNaN(valor)) valorTotal += parseFloat(valor);
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
 * Calcula o valor total previsto de uma despesa.
 * 
 * @param {Number} numeroIdDespesa Número da posição dos elementos no pai x filho.
 */
function calcularValorTotalPrevistoDespesa(numeroIdDespesa) {
	const tipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa).val();
	const valorPrevistoSM = $('#valorPrevistoSM___' + numeroIdDespesa).val();
	const valor = isNaN(valorPrevistoSM) ? 0.00 : parseFloat(valorPrevistoSM).toFixed(2);
	let multiplicador = 1;

	if (tipoFornecedor.indexOf('Aluguel de Veículos') != -1) {
		multiplicador = parseInt($('#diariasAluguel___' + numeroIdDespesa).val());
	} else if (tipoFornecedor.indexOf('Km Rodado') != -1) {
		multiplicador = parseInt($('#proprioDistancia___' + numeroIdDespesa).val());
	} else if (tipoFornecedor.indexOf('Hospedagem') != -1) {
		multiplicador = parseInt($('#hospedagemDiarias___' + numeroIdDespesa).val());
	} else if (tipoFornecedor.indexOf('Transporte') != -1) {
		const jsonTrajetos = $('#jsonTrajetos___' + numeroIdDespesa).val();
		multiplicador = estaVazio(jsonTrajetos) ? 1 : JSON.parse(jsonTrajetos).length;
	}

	if (multiplicador == 0 || isNaN(multiplicador)) multiplicador = 1;

	const valorTotal = (valor * multiplicador).toFixed(2);

	$('#valorTotalPrevistoSM___' + numeroIdDespesa).val(valorTotal);
	$('.real').unmask();
	$('#valorTotalPrevisto___' + numeroIdDespesa).val(valorTotal);
	$('.real').maskMoney({
		prefixMoney: 'R$ ',
		placeholder: 'R$ 0,00'
	});

	calcularValorTotal('Previsto');
	atribuirTituloDespesa(numeroIdDespesa);
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
 * - Km Rodado;
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
		case 'Km Rodado':
			alternarDetalhesTipoDespesa('tipoCombustivel', numeroIdPaiFilho);
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
 * @param {String} codigoPastaPai Código da pasta pai no fluig 
 * @param {String} codItemBuscado Código do item buscado. Podendo ser:
 * - Número de uma solicitação
 * - Número do id de uma despesa
 * @param {String} descricaoItemBuscado descrição (nome) do item buscado. Podendo ser:
 * - Nome do solicitante
 * - Nome do fornecedor
 * 
 * @return {Number} Retorna o código da pasta criada.
 */
function criaPasta(codigoPastaPai, codItemBuscado, descricaoItemBuscado) {
	const dados = montarDadosPasta(codigoPastaPai, codItemBuscado, descricaoItemBuscado);
	return ajaxEcm('criarPasta', JSON.stringify(dados));
}

/**
 * Monta a tabela de anexos da despesa.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
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
				'size': 'col-md-4'
			}, {
				'title': 'Destino',
				'size': 'col-md-4'
			}, {
				'title': 'Data',
				'size': 'col-md-2'
			}, {
				'title': 'Identificador',
				'size': 'col-md-1'
			}, {
				'title': 'Opções',
				'size': 'col-md-1 opcoesTrajeto'
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
 * Exclui um cookie do browser.
 * 
 * @param {String} nomeCookie Nome do cookie
 */
function excluirCookie(nomeCookie) {
	setCookie(nomeCookie, '');
}

/**
 * Exclui uma despesa do painel de despesas.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
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
 * Função genérica para pegar um cookie.
 * 
 * @param {String} nomeCookie nome do cookie para pegar do cache do navegador.
 * 
 * @returns {String} Valor do cookie.
 */
function getCookie(nomeCookie) {
	var cookie = nomeCookie + '=';
	var cookieDecodificado = decodeURIComponent(document.cookie);
	var ca = cookieDecodificado.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(cookie) == 0) {
			return c.substring(cookie.length, c.length);
		}
	}
	return null;
}

/**
 * Busca o número do id de um elemento em um pai filho.
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
 * @returns {Object} O resultado da requisição ajax.
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

/**
 * Instancia o autocomplete no input (elemento) passado como parâmetro.
 * 
 * @param {Object} elementoCidade Input que receberá o autocomplete (obrigatório para o tipo 'cidade').
 * @param {String} tipo Tipo do input que deve ser instanciado. Podendo ser:
 * - cidades
 * - nomeFornecedor
 * - tipoFornecedor
 * @param {String} numeroIdDespesa Posição do elemento no pai x filho (obrigatório para os tipos 'nomeFornecedor' e 'tipoFornecedor').
 */
function instanciarAutocomplete(elementoCidade = null, tipo, numeroIdDespesa = null) {
	if (tipo == 'cidade' && !estaVazio(elementoCidade)) {
		elementoCidade.autocomplete({
			minLength: 1,
			source: function (request, response) {
				const cidades = [];
				const constraintsCidades = [DatasetFactory.createConstraint('cidade', request.term, null, ConstraintType.MUST)];
				const dsCidadesBrasil = getDatasetOAuth('dsCidadesBrasil', null, constraintsCidades, null);
				if (!estaVazio(dsCidadesBrasil)) {
					dsCidadesBrasil.values.forEach(cidade => {
						cidades.push({
							value: cidade.cidade + ' (' + cidade.uf + ')',
							estado: cidade.estado,
							uf: cidade.uf,
							json: cidade
						});
					});
				}
				response(cidades);
			},
			select: function (event, cidade) {
				elementoCidade.val(cidade.item.value + ' (' + cidade.item.uf + ')');
			},
			close: function (event, ui) {
				if (event.handleObj.type != 'menuselect') {
					elementoCidade.val('');
					elementoCidade.blur();
				}
			}
		});
	} else if (tipo == 'nomeFornecedor' && !estaVazio(numeroIdDespesa)) {
		const elementoTipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa);
		const elementoFornecedor = $('#nomeFornecedor___' + numeroIdDespesa);
		const fornecedores = [];
		const constraintFornecedor = [DatasetFactory.createConstraint('zoomTipoFornecedor', elementoTipoFornecedor.val(), elementoTipoFornecedor.val(), ConstraintType.MUST)];
		const felipe_CadastroFornecedor = getDatasetOAuth('felipe_CadastroFornecedor', null, constraintFornecedor, null);

		$('#valorPrevisto___' + numeroIdDespesa).attr('readonly', false);
		elementoFornecedor.attr('readonly', false);

		if (!estaVazio(felipe_CadastroFornecedor)) {
			felipe_CadastroFornecedor.values.forEach(fornecedor => {
				fornecedores.push({
					value: fornecedor.nomeFornecedor,
					cnpj: fornecedor.cnpj,
					json: fornecedor
				});
			});
		}

		elementoFornecedor.autocomplete({
			minLength: 0,
			source: fornecedores,
			select: function (event, fornecedor) {
				elementoFornecedor.val(fornecedor.item.value);
				$('#cnpjFornecedor___' + numeroIdDespesa).val(fornecedor.item.cnpj);
				return false;
			},
			response: function (event, ui) {
				ui.content.push({
					value: elementoFornecedor.val(),
					label: elementoFornecedor.val()
				});
				return false;
			},
			close: function (event, ui) {
				atribuirTituloDespesa(numeroIdDespesa);
			}
		});
	} else if (tipo == 'tipoFornecedor' && !estaVazio(numeroIdDespesa)) {
		const elementoTipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa);
		const elementoFornecedor = $('#nomeFornecedor___' + numeroIdDespesa);
		const tiposFornecedores = [];
		const felipe_CadastroTipoFornecedor = getDatasetOAuth('felipe_CadastroTipoFornecedor', null, null, null);

		if (!estaVazio(felipe_CadastroTipoFornecedor)) {
			felipe_CadastroTipoFornecedor.values.forEach(tipo => {
				tiposFornecedores.push({
					value: tipo.ramoAtividade,
					possuiLimite: tipo.possuiLimite,
					valorLimite: tipo.valorLimite,
					valorLimiteSM: tipo.valorLimiteSemMascara,
					limitePor: tipo.limitePor,
					json: tipo
				});
			});
		}

		elementoTipoFornecedor.autocomplete({
			minLength: 0,
			source: tiposFornecedores,
			select: function (event, tipo) {
				elementoTipoFornecedor.val(tipo.item.value);
				$('#possuiLimite___' + numeroIdDespesa).val(tipo.item.possuiLimite);
				$('#valorLimiteSM___' + numeroIdDespesa).val(parseFloat(tipo.item.valorLimiteSM).toFixed(2));

				if (tipo.item.value.indexOf('Transporte') != -1) {
					$('#limitePor___' + numeroIdDespesa).val('Trajeto');
					$('#labelValorPrevisto___' + numeroIdDespesa).html('Valor Previsto / Trajeto');
				} else if (!estaVazio(tipo.item.limitePor)) {
					$('#limitePor___' + numeroIdDespesa).val(tipo.item.limitePor);
					$('#labelValorPrevisto___' + numeroIdDespesa).html('Valor Previsto / ' + tipo.item.limitePor);
				}

				controlarDetalhesTipoDespesa(tipo.item.value, numeroIdDespesa);
				if (tipo.item.value == 'Km Rodado') {
					elementoFornecedor.val('Próprio');
					elementoFornecedor.attr('readonly', true);
					$('#valorPrevisto___' + numeroIdDespesa).val(tipo.item.valorLimite);
					$('#valorPrevistoSM___' + numeroIdDespesa).val(parseFloat(tipo.item.valorLimiteSM).toFixed(2));
				} else instanciarAutocomplete(null, 'nomeFornecedor', numeroIdDespesa);
				return false;
			},
			response: function (event, ui) {
				ui.content.push({
					value: elementoTipoFornecedor.val(),
					label: elementoTipoFornecedor.val()
				});
				return false;
			},
			close: function (event, ui) {
				atribuirTituloDespesa(numeroIdDespesa);
			}
		});
	}
}

/**
 * Monta o array com os dados da solicitação que será salva ou enviada. 
 * Se o tipo for enviar, verifica todos os campos obrigatórios da solicitação.
 * 
 * @param {String} tipo Tipo de operação que será realizada. (Padrão: 'enviar')
 * 
 * @returns {String} JSON no formato de string com os dados da solicitação que serão salvos.
 */
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
 * @param {String} codigoPastaPai Código da pasta pai no fluig 
 * @param {String} codItemBuscado Código do item buscado. Podendo ser:
 * - Número de uma solicitação
 * - Número do id de uma despesa
 * @param {String} descricaoItemBuscado descrição (nome) do item buscado. Podendo ser:
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

/**
 * Monta o html que simula o pai x filho de despesas do formulário de solicitação de viagem.
 * 
 * @param {Object} dadosPaiFilho Objeto com os dados do pai x filho de despesas.
 */
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
}

/**
 * Monta a tabela com as solicitações na atividade de acerto de viagem do usuário logado.
 * 
 * @returns {Boolean} True se existirem solicitações na atividade de acerto de viagem para o usuário informado.
 */
function mostrarSolicitacoes() {
	let login = $('#login').val();
	if (estaVazio(login)) login = getCookie('login');

	if (!estaVazio(login)) {
		const contraintsSolicitacoes = [
			DatasetFactory.createConstraint('loginSolicitante', login, login, ConstraintType.MUST),
			DatasetFactory.createConstraint('codigoAtividade', 16, 16, ConstraintType.MUST),
			DatasetFactory.createConstraint('aprovacaoFinanceiroFinal', 'aprovar', 'aprovar', ConstraintType.MUST)
		];
		const felipe_Viagem = getDatasetOAuth('felipe_Viagem', null, contraintsSolicitacoes, null);

		if (!estaVazio(felipe_Viagem) && felipe_Viagem.values.length > 0) {
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
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
 * @param {String} codigo Código do arquivo/pasta do fluig que deve ser removido.
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
 * Remove a máscara de reais sobre o valor de um campo especificado por parâmetro.
 * 
 * @param {Object} elemento Campo do DOM que contém o valor em reais com máscara.
 * 
 * @returns {Number} Valor sem máscara de real e com duas casas decimais.
 */
function removerMascaraReal(elemento) {
	const valor = $(elemento).cleanVal();
	return parseFloat(valor.substring(0, valor.length - 2) + '.' + valor.substr(-2)).toFixed(2);
}

/**
 * Desloga o usuário.
 */
function sair() {
	excluirCookie('login');
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
 * 
 * @returns {Boolean} True se o trajeto for salvo com sucesso.
 */
function salvarTrajeto(numeroIdDespesa, numeroIdTrajeto, tipo) {
	let jsonTrajetos = $('#jsonTrajetos___' + numeroIdDespesa).val();
	const origem = $('#origem').val();
	const destino = $('#destino').val();
	const identificador = $('#identificador').val();
	const elementoData = $('#dataHoraTrajeto');
	const dataHoraTrajeto = verificarDataEmPaiFilho(elementoData, numeroIdDespesa) ? elementoData.val() : null;

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
		calcularValorTotalPrevistoDespesa(numeroIdDespesa);
		return true;
	}
}

/**
 * Salva o valor em reais digitado em um campo com máscara em outro campo escondido sem máscara.
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
 * Seta um cookie no browser.
 * 
 * @param {String} nomeCookie Nome do cookie.
 * @param {String} valorCookie Valor do cookie.
 */
function setCookie(nomeCookie, valorCookie) {
	var qntTempo = new Date();
	qntTempo.setTime(qntTempo.getTime() + (60 * 60 * 1000));
	var expires = 'expires=' + qntTempo.toUTCString();
	document.cookie = nomeCookie + '= ' + valorCookie + ';' + expires + ';path=/';
}

/**
 * Gera um toast na tela de acordo com os parâmetros informados.
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
 * Altera a borda e label do campo vazio para vermelhas.
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
 * @return {boolean} Retorna true para dados válidos e false para dados inconsistentes.
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
		if (!estaVazio(colleague) && colleague.values.length > 0) {
			$('#usuario').html(`${colleague.values[0].colleagueName} (${login})`);
			if (estaVazio(getCookie('login'))) setCookie('login', login);
		} else valido = false;
	}

	return valido;
}

/**
 * Loga o usuário caso o cookie do login esteja salvo.
 */
function verificarCookie() {
	const cookieLogin = getCookie('login');
	if (!estaVazio(cookieLogin)) {
		if (validarLogin(cookieLogin)) {
			if (mostrarSolicitacoes()) {
				$('#panelLogin').hide();
				$('.logado').show();
			}
		} else {
			sair();
		}
	}
}

/**
 * Função à ser executada antes de salvar arquivos. 
 * Busca e cria pastas no ECM de acordo com o número da solicitação e o nome do solicitante, sendo que cada despesa também possui sua pasta.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
 * 
 * @return {string} Código da pasta existente ou já criada para os comprovantes da solicitação.
 */
function verificarCriarPasta(numeroIdDespesa) {
	let codigoAnexosComprovantes = '44'; //44 no fluig local - 3494 no demofluig
	if (top.WCMAPI.serverURL.indexOf('demofluig') != -1) codigoAnexosComprovantes = 3494;
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

/**
 * Verifica se a data efetiva está entre as datas de ida e volta da viagem.
 * 
 * @param {Object} dataEfetiva Elemento do DOM que contém a data efetiva.
 */
function verificarDataEfetiva(dataEfetiva) {
	const idaEfetiva = $('#idaEfetiva').val();
	const voltaEfetiva = $('#voltaEfetiva').val();
	dataEfetiva = $(dataEfetiva);

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

/**
 * Verifica se os campos de datas dentro de um pai x filho foram preenchidos corretamente conforme a ida e a volta da viagem.
 * 
 * @param {Object} elemento Input que será verificado.
 */
function verificarDataEmPaiFilho(elemento, numeroIdDespesa) {
	const elementoData = $(elemento);
	const ida = $('#idaEfetiva').val();
	const volta = $('#voltaEfetiva').val();

	if (!estaVazio(ida) && !estaVazio(volta) && !compararDatas(ida, volta, elementoData.val().split(' ')[0])) {
		elementoData.val('');
		toast('Atenção!', 'A data deve estar entre o período ida e volta da viagem.', 'warning');
		return false;
	} else if (estaVazio(ida) || estaVazio(volta)) {
		elementoData.val('');
		toast('Atenção!', 'Informe o período de ida e volta da viagem.', 'warning');
		return false;
	}

	const idData = elementoData.prop('id');

	if (idData.indexOf('hospedagemCheckout') != -1) {
		const dataCheckin = $('#hospedagemCheckin___' + numeroIdDespesa).val();
		if (!estaVazio(dataCheckin)) {
			if (dataCheckin != elementoData.val() && compararDatas(dataCheckin, elementoData.val())) {
				// Calcular diárias após check-in preenchido
				const diarias = calcularDiarias(dataCheckin, elementoData.val());
				$('#hospedagemDiarias___' + numeroIdDespesa).val(diarias);
			} else {
				toast('Atenção!', 'A data de checkout deve ser posterior ao check-in.', 'warning');
				elementoData.val('');
			}
		}
	} else if (idData.indexOf('hospedagemCheckin') != -1) {
		const dataCheckout = $('#hospedagemCheckout___' + numeroIdDespesa).val();
		if (!estaVazio(dataCheckout)) {
			if (dataCheckout != elementoData.val() && compararDatas(elementoData.val(), dataCheckout)) {
				// Calcular diárias após checkout preenchido
				const diarias = calcularDiarias(elementoData.val(), dataCheckout);
				$('#hospedagemDiarias___' + numeroIdDespesa).val(diarias);
			} else {
				toast('Atenção!', 'A data de checkin deve ser anterior ao checkout.', 'warning');
				elementoData.val('');
			}
		}
	} else if (idData.indexOf('dataDevolucao') != -1) {
		const dataRetirada = $('#dataRetirada___' + numeroIdDespesa).val();
		if (!estaVazio(dataRetirada)) {
			if (compararDatas(dataRetirada, elementoData.val())) {
				// Calcular diárias após data de devolução preenchida
				let diarias = calcularDiarias(dataRetirada, elementoData.val());
				if (diarias == 0 && elementoData.val().split(' ')[0] == dataRetirada.split(' ')[0]) {
					diarias = 1;
				}
				$('#diariasAluguel___' + numeroIdDespesa).val(diarias);
			} else {
				toast('Atenção!', 'A data de devolução do veículo deve ser posterior a retirada.', 'warning');
				elementoData.val('');
			}
		}
	} else if (idData.indexOf('dataRetirada') != -1) {
		const dataDevolucao = $('#dataDevolucao___' + numeroIdDespesa).val();
		if (!estaVazio(dataDevolucao)) {
			if (compararDatas(elementoData.val(), dataDevolucao)) {
				// Calcular diárias após checkout preenchido
				let diarias = calcularDiarias(elementoData.val(), dataDevolucao);
				if (diarias == 0 && elementoData.val().split(' ')[0] == dataDevolucao.split(' ')[0]) {
					diarias = 1;
				}
				$('#diariasAluguel___' + numeroIdDespesa).val(diarias);
			} else {
				toast('Atenção!', 'A data de retirada do veículo deve ser anterior a devolução.', 'warning');
				elementoData.val('');
			}
		}
	}

	calcularValorTotalPrevistoDespesa(numeroIdDespesa);
	return true;
}