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
 * 
 * @param {Object} elemento 
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
 * @function adicionarDespesa Adiciona uma nova despesa no painel de despesas.
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
	limparZoom('tipoFornecedor___' + numeroIdDespesa);
	limparZoom('nomeFornecedor___' + numeroIdDespesa);
	desativarZoom('nomeFornecedor___' + numeroIdDespesa);
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

/**
 * 
 * @param {String} numeroIdDespesa 
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
		const elementoValorSM = $(this);
		const numeroIdDespesa = getPosicaoPaiFilho(elementoValorSM);
		const aprovacaoGestor = $('#aprovacaoGestor___' + numeroIdDespesa).val();
		const aprovacaoFinanceiro = $('#aprovacaoFinanceiro___' + numeroIdDespesa).val();
		if ((aprovacaoGestor == 'aprovar' || aprovacaoGestor == '') ||
			(aprovacaoFinanceiro == 'aprovar' || aprovacaoFinanceiro == '')) {
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
	return ajaxApi('criarPasta', JSON.stringify(dados));
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
 * @function criarTabelaTrajetos Monta a tabela com os trajetos cadastrados pelo usuário de acordo com o que foi salvo no campo jsonTrajetos de uma determinada despesa.
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

	// Se não estiver no início, esconde as opções de editar e excluir trajeto
	if (codigoAtividade != ATIVIDADE.INICIO && codigoAtividade != 0) {
		$('.opcoesTrajeto').hide();
	}
}

/**
 * @function excluirDespesa Exclui uma despesa do painel de despesas.
 * 
 * @param {Object} elemento Elemento do DOM clicado para realizar a remoção da despesa.
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
 * @function excluirTrajeto Exclui um trajeto de acordo com os parâmetros informados.
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

	return ajaxApi('criarArquivo', dados);
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
			ajaxApi('remover', dado);
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
 * @function salvarTrajeto Salva um trajeto de acordo com os parâmetros informados.
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
	if (tipo == 'Previsto') atribuirTituloDespesa(numeroIdDespesa);
}

/**
 * @function verificarAprovacao Verifica aprovação do gestor ou do financeiro por despesa e adiciona um layout conforme seu status.
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
 * @param {String} numeroIdDespesa
 * 
 * @return {string} Código da pasta existente ou já criada para os comprovantes da solicitação.
 */
function verificarCriarPasta(numeroIdDespesa) {
	const codigoAnexosComprovantes = '44'; //44 no fluig local
	const numeroSolicitacao = $('#numeroSolicitacao').val();
	const nomeSolicitante = $('#nomeSolicitante').val();
	const nomeFornecedor = $('#nomeFornecedor___' + numeroIdDespesa).val();

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