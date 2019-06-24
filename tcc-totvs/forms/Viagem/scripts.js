$(document).ready(function () {
	$('#btnAdicionarDespesa').on('click', function () {
		adicionarDespesa();
	});

	$('#idaPrevista, #voltaPrevista, #idaEfetiva, #voltaEfetiva').on('blur', function () {
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

	$(document).on('blur', '.obrigatorio, .validacaoZoom .select2-search__field', function () {
		validarCampoVazio($(this));
	});
});

const loading = FLUIGC.loading(window, {
	textMessage: 'Carregando...'
});
var quantidadeIdsTrajetos = 1;

/**
 * Abre a modal de anexos.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
 */
function abrirModalAnexos(elemento) {
	const numeroIdDespesa = getPosicaoPaiFilho(elemento);
	const despesaEfetuada = $('#despesaEfetuada___' + numeroIdDespesa).val()

	if (estaVazio(despesaEfetuada)) {
		toast('Atenção!', 'Informe se a despesa foi efetuada ou não.', 'warning');
	} else if (despesaEfetuada == 'sim') {
		const html = $('.modalAnexos').html();
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
 * Adiciona uma nova despesa no painel de despesas.
 */
function adicionarDespesa() {
	$('[id^=despesa___]').each(function () {
		$(this).collapse('hide');
	});

	const numeroIdDespesa = wdkAddChild('despesas');

	$('#btnDetalhesDespesa___' + numeroIdDespesa).attr('href', '#despesa___' + numeroIdDespesa);
	$('#numeroIdDespesa___' + numeroIdDespesa).val(numeroIdDespesa);

	if (codigoAtividade == ATIVIDADE.ACERTO_VIAGEM) {
		$('#despesaPrevista___' + numeroIdDespesa).val('nao');
		const despesaEfetuada = $('#despesaEfetuada___' + numeroIdDespesa);
		despesaEfetuada.val('sim');
		despesaEfetuada.attr('readonly', true);
		despesaEfetuada.css({
			'pointer-events': 'none',
			'touch-action': 'none'
		});
	}

	$('.bodyDespesas').show();

	const elementoTipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa);
	const elementoFornecedor = $('#nomeFornecedor___' + numeroIdDespesa);

	instanciarAutocomplete(elementoTipoFornecedor, 'tipoFornecedor', numeroIdDespesa);

	elementoTipoFornecedor.on('blur', function () {
		if (estaVazio(elementoTipoFornecedor.val())) {
			alternarDetalhesTipoDespesa(null, numeroIdDespesa);
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
	FLUIGC.utilities.scrollTo('#panelDespesa___' + numeroIdDespesa, 500);

	$('.real').unmask();
	$('.real').maskMoney({
		prefixMoney: 'R$ ',
		placeholder: 'R$ 0,00'
	});
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
 * Busca os anexos de uma determinada despesa.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
 */
function buscarArquivos(numeroIdDespesa) {
	const codigoPastaDespesa = verificarCriarPasta(numeroIdDespesa);
	const arquivos = ajaxApi('listarDocumentos', codigoPastaDespesa);
	return arquivos.content;
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
	const listaDePastasFilhas = ajaxApi('listarDocumentos', codigoPastaPai);
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
	const elementoFornecedor = $('#nomeFornecedor___' + numeroIdDespesa);
	const fornecedor = elementoFornecedor.val();

	// Só permite adicionar um trajeto se um fornecedor estiver selecionado
	if (!estaVazio(fornecedor)) {
		const html = $('.cadastroTrajeto').html();
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
		toast('Atenção!', 'Informe o fornecedor antes de adicionar um trajeto.', 'warning');
	}
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
		const elementoValorSM = $(this);
		const numeroIdDespesa = getPosicaoPaiFilho(elementoValorSM);
		const aprovacaoGestor = $('#aprovacaoGestor___' + numeroIdDespesa).val();
		const aprovacaoFinanceiro = $('#aprovacaoFinanceiro___' + numeroIdDespesa).val();
		if (((aprovacaoGestor == 'aprovar' || aprovacaoGestor == '') ||
				(aprovacaoFinanceiro == 'aprovar' || aprovacaoFinanceiro == '')) &&
			!estaVazio(elementoValorSM.val())) {
			valorTotal += parseFloat(elementoValorSM.val());
		}
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
function criarPasta(codigoPastaPai, codItemBuscado, descricaoItemBuscado) {
	const dados = montarDadosPasta(codigoPastaPai, codItemBuscado, descricaoItemBuscado);
	return ajaxApi('criarPasta', JSON.stringify(dados));
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
			numeroIdDespesa: numeroIdDespesa
		});
	});

	FLUIGC.datatable('.divTabelaAnexos', {
		dataRequest: linhas,
		renderContent: '.tabelaAnexos',
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
 * 
 * @param {Number} numeroIdDespesa Número do id da despesa.
 */
function criarTabelaTrajetos(numeroIdDespesa) {
	let jsonTrajetos = $('#jsonTrajetos___' + numeroIdDespesa).val();
	jsonTrajetos = estaVazio(jsonTrajetos) ? [] : JSON.parse(jsonTrajetos);

	FLUIGC.datatable('#trajetos___' + numeroIdDespesa, {
		dataRequest: jsonTrajetos,
		renderContent: '.tabelaTrajetos',
		header: [{
			'title': 'Origem',
			'size': 'col-md-3'
		}, {
			'title': 'Destino',
			'size': 'col-md-3'
		}, {
			'title': 'Data',
			'size': 'col-md-2'
		}, {
			'title': 'Identificador',
			'size': 'col-md-2'
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

	// Se não estiver no início, esconde as opções de editar e excluir trajeto
	if (codigoAtividade != ATIVIDADE.INICIO && codigoAtividade != 0) {
		$('.opcoesTrajeto').hide();
	}
}

/**
 * Exclui uma despesa do painel de despesas.
 * 
 * @param {Number} numeroIdDespesa Número da posição do elemento no pai x filho.
 */
function excluirDespesa(elemento) {
	FLUIGC.message.confirm({
		message: 'Tem certeza que deseja excluir esta despesa?',
		title: 'Excluir Despesa',
		labelYes: 'Excluir',
		labelNo: 'Cancelar'
	}, function (confirmar) {
		if (confirmar) {
			fnWdkRemoveChild(elemento);

			const quantidadeDespesas = $('[id^=despesa___]').length;
			if (quantidadeDespesas == 0) $('.bodyDespesas').hide();
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

	return ajaxApi('criarArquivo', dados);
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
				const dsCidadesBrasil = DatasetFactory.getDataset('dsCidadesBrasil', null, constraintsCidades, null);
				if (!estaVazio(dsCidadesBrasil)) {
					dsCidadesBrasil.values.forEach(cidade => {
						cidades.push({
							value: cidade.cidade + ' (' + cidade.uf + ')',
							estado: cidade.estado,
							uf: cidade.uf,
							json: cidade
						});
					});

					if (cidades.length > 0) {
						cidades.sort(function (a, b) {
							if (a.value < b.value) return -1;
							if (a.value > b.value) return 1;
							return 0;
						});
					}
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
		const felipe_CadastroFornecedor = DatasetFactory.getDataset('felipe_CadastroFornecedor', null, constraintFornecedor, null);

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

			if (fornecedores.length > 0) {
				fornecedores.sort(function (a, b) {
					if (a.value < b.value) return -1;
					if (a.value > b.value) return 1;
					return 0;
				});
			}
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
		const felipe_CadastroTipoFornecedor = DatasetFactory.getDataset('felipe_CadastroTipoFornecedor', null, null, null);

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

			if (tiposFornecedores.length > 0) {
				tiposFornecedores.sort(function (a, b) {
					if (a.value < b.value) return -1;
					if (a.value > b.value) return 1;
					return 0;
				});
			}
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
					elementoFornecedor.blur();
					$('#valorPrevisto___' + numeroIdDespesa).val(tipo.item.valorLimite);
					$('#valorPrevisto___' + numeroIdDespesa).attr('readonly', true);
					$('#valorPrevistoSM___' + numeroIdDespesa).val(parseFloat(tipo.item.valorLimiteSM).toFixed(2));
				} else {
					$('#valorPrevisto___' + numeroIdDespesa).attr('readonly', false);
					elementoFornecedor.val('');
					instanciarAutocomplete(null, 'nomeFornecedor', numeroIdDespesa);
				}
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
			ajaxApi('remover', dado);
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
	if (tipo == 'Previsto') {
		calcularValorTotalPrevistoDespesa(numeroIdDespesa);
		atribuirTituloDespesa(numeroIdDespesa);
		const valorLimiteSM = parseFloat($('#valorLimiteSM___' + numeroIdDespesa).val()).toFixed(2);
		if (!isNaN(valorLimiteSM) && parseFloat(valor) > parseFloat(valorLimiteSM)) {
			toast('Atenção!', 'O valor informado está acima do limite oferecido pela empresa.', 'info');
		}
	}
	calcularValorTotal(tipo);
}

/**
 * Verifica aprovação do gestor ou do financeiro por despesa e adiciona um layout conforme seu status.
 * 
 * @param {String} idTipo Tipo de aprovação a ser verificada, podendo ser:
 * - Gestor
 * - Financeiro
 */
function verificarAprovacao(idTipo) {
	$('[id^=panelDespesa___]').each(function () {
		const panelDespesa = $(this);
		const numeroIdDespesa = getPosicaoPaiFilho(panelDespesa);
		const elementoAprovacao = $('#aprovacao' + idTipo + '___' + numeroIdDespesa);
		const aprovacao = elementoAprovacao.val();

		if (!estaVazio(aprovacao)) {
			const tituloDespesa = $('#tituloDespesa___' + numeroIdDespesa);
			let classe = 'text-success';
			let cor = '#38cf5a';
			let icone = 'fluigicon-check-circle-on';

			if (aprovacao == 'reprovar') {
				classe = 'text-danger';
				cor = '#f64445';
				icone = 'fluigicon-remove icon-sm';
				$('#btnExcluirDespesa___' + numeroIdDespesa).prop('disabled', true);
			} else if (aprovacao == 'ajustar') {
				classe = 'text-warning';
				cor = '#dfaa1e';
				icone = 'fluigicon-warning-sign';
			}

			panelDespesa.css('border', '1px solid ' + cor);
			tituloDespesa.css('color', cor);
			tituloDespesa.append(' <i class="fluigicon ' + icone + ' icon-sm ' + classe + '"></i>');
		}
	});
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
	const nomeFornecedor = $('#nomeFornecedor___' + numeroIdDespesa).val();

	let codigoPastaSolicitacao = buscarPasta(codigoAnexosComprovantes, numeroSolicitacao, nomeSolicitante);
	if (estaVazio(codigoPastaSolicitacao)) {
		codigoPastaSolicitacao = (criarPasta(codigoAnexosComprovantes, numeroSolicitacao, nomeSolicitante)).content.documentId;
	}

	let codigoPastaDespesa = buscarPasta(codigoPastaSolicitacao, numeroIdDespesa, nomeFornecedor);
	if (estaVazio(codigoPastaDespesa)) {
		codigoPastaDespesa = (criarPasta(codigoPastaSolicitacao, numeroIdDespesa, nomeFornecedor)).content.documentId;
	}

	return codigoPastaDespesa;
}