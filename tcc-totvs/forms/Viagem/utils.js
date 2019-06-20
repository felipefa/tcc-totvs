/**
 * Função para abrir documento dentro do fluig.
 * 
 * @param {String} docId - id do documento.
 * @param {String} urlDoc - endereço do documento.
 * @param {String} docVersao - versão do documento (default: 1000).
 * @param {String} titulo - tipo do visualizador de documento (default: 'Visualizador de Documentos').
 * @param {Boolean} maximizado - true para maximizado e false visualização comum (default: true).
 */
function abrirDocumento(docId, docVersao = 1000, titulo = 'Visualizador de Documentos', maximizado = true) {
	let parentOBJ;

	if (window.opener) {
		parentOBJ = window.opener.parent;
	} else {
		parentOBJ = parent;
	}

	const cfg = {
		url: '/ecm_documentview/documentView.ftl',
		maximized: maximizado,
		title: titulo,
		callBack: function () {
			parentOBJ.ECM.documentView.getDocument(docId, docVersao);
		},
		customButtons: []
	};

	parentOBJ.ECM.documentView.panel = parentOBJ.WCMC.panel(cfg);
}

/**
 * @authors Autímio, Felipe, Murilo e Gabriel
 * 
 * @param {String} funcao - Valor referente ao comportamento que a função irá assumir.
 * - criarPasta -> Cria uma pasta
 * - listarDocumentos -> Lista os documentos da pasta
 * - remover -> Remove um documento ou pasta
 * - alterar -> Alterar uma pasta
 * @param {String} dadosJson JSON em formato String com os dados da requisição.
 * 
 * @returns Dados obtidos na resposta do ajax.
 */
function ajaxApi(funcao, dadosJson) {
	const restApiEcm = 'api/public/ecm/document';
	let url;
	let msgSucesso;
	let metodo = 'POST';
	let assincrono = false;
	let resultado = null;

	switch (funcao) {
		case 'criarArquivo':
			url = `/${restApiEcm}/createDocument`;
			msgSucesso = 'Documento inserido com sucesso!';
			break;
		case 'criarPasta':
			// url = `/${restApiEcm}/createFolder`;
			url = `/api/public/2.0/folderdocuments/create`;
			msgSucesso = 'Pasta criada com sucesso!';
			break;
		case 'listarDocumentos':
			url = `/${restApiEcm}/listDocument/${dadosJson}`;
			metodo = 'GET';
			msgSucesso = 'Listagem realizada com sucesso!';
			break;
		case 'remover':
			url = `/${restApiEcm}/remove`;
			msgSucesso = 'Remoção realizada com sucesso!';
			break;
		case 'alterar':
			url = `/${restApiEcm}/updateDocumentFolder`;
			msgSucesso = 'Documento alterado com sucesso!';
			break;
		default:
			toast('Erro!', 'Função não encontrada.', 'danger', 4000);
			console.log('Função ajax não encontrada.');
			return null;
	}

	$.ajax({
		async: assincrono,
		url: url,
		type: metodo,
		data: dadosJson,
		contentType: 'application/json',
		success: function (dados) {
			// console.log('Sucesso na requisição ajax!', msgSucesso);
			resultado = dados;
		},
		error: function (objErro, status, msg) {
			console.log(`Erro: ${msg}`);
			resultado = objErro;
		}
	});

	return resultado;
}

/**
 * Exibe os elementos relacionados ao tipo de fornecedor informado e oculta os outros não relacionados.
 * 
 * @param {String} exibirId Prefixo do id do grupo de elementos que devem ser exibidos.
 * @param {String} numeroIdPaiFilho Número contido no id do elemento no pai filho.
 */
function alternarDetalhesTipoDespesa(exibirId, numeroIdPaiFilho) {
	let idsTipos = ['tipoAluguelVeiculos', 'tipoHospedagem', 'tipoProprio', 'tipoTransporte', 'tipoPadrao'];

	idsTipos.map(function (id) {
		if (exibirId == id) $('#' + exibirId + '___' + numeroIdPaiFilho).show();
		else $('#' + id + '___' + numeroIdPaiFilho).hide();
	});
}

/**
 * Atribui readonly para os campos encontrados dentro do seletor.
 * 
 * @param {String} seletor String com o(s) seletor(es) usado(s) no JQuery.
 */
function atribuirReadOnly(seletor, seletorNegacao = '') {
	$(seletor).find('input, select, textarea').not(seletorNegacao).each(function () {
		const elemento = $(this);
		if (elemento[0].hasAttribute('data-zoom') && elemento[0].id !== 'tipoFornecedor' && elemento[0].id !== 'nomeFornecedor') {
			desativarZoom(elemento[0].id);
		} else {
			elemento.attr('readonly', true);
			if (elemento.prop("tagName") == 'SELECT') {
				elemento.css({
					'pointer-events': 'none',
					'touch-action': 'none'
				});
			}
		}
	});
}

/**
 * Atribui readonly para os campos de uma despesa de acordo com a aprovação do tipo informado.
 * 
 * @param {String} tipo String com o tipo da aprovação, são aceitos:
 * - Gestor
 * - Financeiro
 */
function atribuirReadOnlyAposAprovacao(tipo) {
	$('[id^=aprovacao' + tipo + '___]').each(function () {
		const elementoAprovacao = $(this);
		const numeroIdDespesa = getPosicaoPaiFilho(elementoAprovacao);
		const aprovacao = elementoAprovacao.val();
		if (aprovacao != 'ajustar' && !estaVazio(aprovacao)) {
			$('#btnExcluirDespesa___' + numeroIdDespesa).prop('disabled', true);
			$('#btnAdicionarTrajeto___' + numeroIdDespesa).prop('disabled', true);
			let seletorNot = '.atividadeAcerto';
			atribuirReadOnly('#despesa___' + numeroIdDespesa, seletorNot);
		}
		if (aprovacao == 'reprovar') {
			if (tipo == 'Financeiro') $('#despesaEfetuada___' + numeroIdDespesa).val('nao');
			$('#btnAnexos___' + numeroIdDespesa).parent().hide();
			atribuirReadOnly('#despesa___' + numeroIdDespesa);
		} else if (aprovacao == 'aprovar') {
			FLUIGC.calendar('#dataEfetiva___' + numeroIdDespesa, {
				pickDate: true,
				pickTime: false
			});
		}
	});
}

function atribuirTituloDespesa(numeroIdDespesa) {
	const tipoFornecedor = $('#tipoFornecedor___' + numeroIdDespesa).val();
	const nomeFornecedor = $('#nomeFornecedor___' + numeroIdDespesa).val();
	const valorPrevisto = $('#valorPrevisto___' + numeroIdDespesa).val();
	let tituloDespesa = 'Preencha a despesa';
	if (!estaVazio(tipoFornecedor) && !estaVazio(nomeFornecedor) && !estaVazio(valorPrevisto)) {
		tituloDespesa = `${numeroIdDespesa} - ${tipoFornecedor} - ${nomeFornecedor} - ${valorPrevisto}`;
	}
	$('#tituloDespesa___' + numeroIdDespesa).html(tituloDespesa);
}

/**
 * Função para colorir inputs no html.
 * 
 * @param {Object} elemento Elemento do JQuery que deve ser colorido.
 * @param {String} cor Cor do elemento podendo ser: danger, warning, info, success ou null.
 */
function colorirElementoHtml(elemento, cor) {
	if (cor == 'danger') {
		elemento.attr('style', 'background-image: linear-gradient(to left, #f64445, #f64445), linear-gradient(to left, #f64445, #f64445);');
	} else if (cor == 'warning') {
		elemento.attr('style', 'background-image: linear-gradient(to left, #e4b73f, #e4b73f), linear-gradient(to left, #e4b73f, #e4b73f);');
	} else if (cor == 'info') {
		elemento.attr('style', 'background-image: linear-gradient(to left, #60c1e0, #60c1e0), linear-gradient(to left, #60c1e0, #60c1e0);');
	} else if (cor == 'success') {
		elemento.attr('style', 'background-image: linear-gradient(to left, #56d773, #56d773), linear-gradient(to left, #56d773, #56d773);');
	} else if (cor == null || cor == '') {
		elemento.attr('style', '');
	}
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
	if (ramoAtividade.length == 1) ramoAtividade = ramoAtividade[0];
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

function corrigirIndicesPaiFilho() {
	$('[id^=trDespesa___]').each(function () {
		const despesa = $(this);
		const numeroIdDespesa = getPosicaoPaiFilho(despesa);
		despesa.find('.corrigirIndice').each(function () {
			const elemento = $(this);
			const id = elemento.prop('id');
			if (id.indexOf('___') == -1) {
				elemento.attr('id', id + '___' + numeroIdDespesa);
				elemento.attr('name', id + '___' + numeroIdDespesa);
				if (id == 'btnDetalhesDespesa') elemento.attr('href', '#despesa___' + numeroIdDespesa);
			}
		});
		atribuirTituloDespesa(numeroIdDespesa);
		controlarDetalhesTipoDespesa($('#tipoFornecedor___' + numeroIdDespesa).val(), numeroIdDespesa);
	});
}

/**
 * @function esconderUltimaHr Esconde o último elemento hr do pai filho.
 * 
 * @param {String} id Id da tag hr no pai filho com underscore sem a posição. Exemplo: 'hrDespesa___'.
 * @param {String} ultimaPosicao Última posição do pai filho.
 */
function esconderUltimaHr(id) {
	$('[id^=' + id + ']').each(function () {
		$(this).show();
	});
	$('[id^=' + id + ']:last').hide();
}

/**
 * Verifica se um valor está vazio, é nulo ou indefinido.
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
 * Busca o número do id de um elemento em um pai filho.
 * 
 * @param {Object} elemento Objeto do JQuery que contém um elemento do pai filho.
 * 
 * @returns {String} String com o número contido no id do elemento do pai filho.
 */
function getPosicaoPaiFilho(elemento) {
	let id = $(elemento).prop('id');
	if (elemento.className == 'fluigicon fluigicon-trash fluigicon-md')
		id = $(elemento).closest('tr').prop('id');
	return id.split('___')[1];
}

/**
 * Cria uma string com a data de hoje no formato DD/MM/AAAA.
 * 
 * @returns {String} Uma string com a data de hoje.
 */
function getDataHoje() {
	var dataAtual = new Date();
	var data = dataAtual.getDate();
	var mes = dataAtual.getMonth();
	var ano = dataAtual.getFullYear();
	data = pad(data) + '/' + pad(mes + 1) + '/' + ano;
	return data;
}

/**
 * Função para pegar adicionar 0 nas datas que contém o dia ou mês < 10.
 * Ex.: 1 -> 01;
 * 
 * @param {Number} n - Número do dia ou mês.
 * 
 * @returns {Number} Número formatado.
 */
function pad(n) {
	return n < 10 ? '0' + n : n;
}

/**
 * Função genérica para gerar toast.
 * 
 * @param {String} titulo Título do toast.
 * @param {String} msg Mensagem para informação do toast.
 * @param {String} tipo Tipos: 'success', 'warning', 'info' e 'danger'.
 * @param {Number} timeout Tempo de duração do Toast. Valor padrão: 4000.
 */
function toast(titulo, msg, tipo, timeout = 4000) {
	FLUIGC.toast({
		title: titulo,
		message: msg,
		type: tipo,
		timeout: timeout
	});
}

/**
 * Converte um timestamp para sua respectiva quantidade de dias.
 * 
 * @param {Number} dataTimestamp Data em timestamp.
 * 
 * @return {Number} Quantidade de dias.
 */
function transformarDias(dataTimestamp) {
	return Math.floor(dataTimestamp / 1000 / 60 / 60 / 24);
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
 * Função que força a execução do evento blur dos campos obrigatórios para validação visual.
 */
function validarCampos() {
	$('.obrigatorio, .validacaoZoom .select2-search__field').blur();
}

/**
 * Altera a borda e label do campo vazio para vermelhas.
 * 
 * @param {Object} input Elemento do DOM que deve ser validado.
 * 
 * @returns {Boolean} True se o campo estiver vazio.
 */
function validarCampoVazio(input) {
	if (input[0].className.indexOf('select2') != -1) {
		// Entra aqui se for zoom
		if (estaVazio(input.parent().parent()[0].innerText)) {
			input.parents('div.form-group').addClass('has-error text-danger');
			colorirElementoHtml($(input[0]).parent().parent().parent(), 'danger');
			colorirElementoHtml($(input[0]).parent().parent().parent().find('.input-group-addon.select2-fluigicon-zoom'), 'danger');
			return true;
		} else {
			input.parents('div.form-group').removeClass('has-error text-danger');
			colorirElementoHtml($(input[0]).parent().parent().parent(), '');
			colorirElementoHtml($(input[0]).parent().parent().parent().find('.input-group-addon.select2-fluigicon-zoom'), '');
			return false;
		}
	} else {
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
}

function verificarDataEmPaiFilho(elemento) {
	const elementoData = $(elemento);
	const numeroIdDespesa = getPosicaoPaiFilho(elementoData);
	const despesaPrevista = $('#despesaPrevista___' + numeroIdDespesa).val();
	let ida = null;
	let volta = null;

	if (despesaPrevista == 'nao') {
		// verificar datas efetivas da viagem
		ida = $('#idaEfetiva').val();
		volta = $('#voltaEfetiva').val();
	} else {
		// verificar datas previstas da viagem
		ida = $('#idaPrevista').val();
		volta = $('#voltaPrevista').val();
	}

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
}

function calcularDiarias(dataInicial, dataFinal) {
	return transformarDias(transformarEmTimestamp(dataFinal) - transformarEmTimestamp(dataInicial));
}