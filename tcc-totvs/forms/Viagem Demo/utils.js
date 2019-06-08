/**
 * @function atribuirReadOnly Atribui readonly para os campos encontrados dentro do seletor.
 * 
 * @param {String} seletor String com o(s) seletor(es) usado(s) no JQuery.
 */
function atribuirReadOnly(seletor) {
	$(seletor).find('input, select, textarea').each(function () {
		let elemento = $(this);
		elemento.attr('readonly', true);
		if (elemento.prop("tagName") == 'SELECT') {
			elemento.css({
				'pointer-events': 'none',
				'touch-action': 'none'
			});
		}
	});
}

/**
 * @function colorirElementoHtml Função para colorir inputs no html.
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
 * @function compararDatas Pode ser executada de duas formas:
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
		let timestampDataInicial = transformaTimestamp(dataInicial);
		let timestampDataFinal = transformaTimestamp(dataFinal);
		if (estaVazio(dataIntervalar)) {
			if (timestampDataInicial <= timestampDataFinal) return true;
		} else {
			let timestampDataIntervalar = transformaTimestamp(dataIntervalar);
			if (timestampDataInicial <= timestampDataIntervalar && timestampDataIntervalar <= timestampDataFinal) return true;
		}
	}
	return false;
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
 * @function estanciaCalendarioFluig Estancia o calendário do fluig para cada id informado no array de ids. 
 * Usado para chamar o calendário em novos elementos do pai filho.
 * 
 * @param {Array<String>} ids Array de strings com os ids dos campos que devem receber o calendário
 * @param {Boolean} exibirHoras Default = false. True exibe o seletor de horas. 
 */
function estanciaCalendarioFluig(ids, exibirHoras = false) {
	let opcoes = {
		pickDate: true,
		pickTime: false
	};

	if (exibirHoras) {
		opcoes = {
			pickDate: true,
			pickTime: true,
			sideBySide: true
		};
	}

	ids.forEach(id => {
		FLUIGC.calendar('#' + id, opcoes);
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
	if (valor == '' || valor == null || valor == undefined) return true;
	return false;
}

/**
 * @function controlarDetalhesTipoDespesa Faz o controle de qual grupo de elementos deve ser exibido conforme o tipo de fornecedor selecionado.
 * Os seguintes tipos de fornecedores possuem grupos específicos:
 * - Aéreo;
 * - Aluguel de Veículos;
 * - Hospedagem;
 * - Transfer;
 * 
 * Para outros tipos de fornecedores, o grupo padrão será exibido.
 * 
 * @param {String} ramoAtividade Ramo de atividade a ser verificado.
 * @param {String} numeroIdPaiFilho Número contido no id do elemento no pai filho.
 */
function controlarDetalhesTipoDespesa(ramoAtividade, numeroIdPaiFilho) {
	switch (ramoAtividade) {
		case 'Aéreo':
			alternarDetalhesTipoDespesa('tipoAereo', numeroIdPaiFilho);
			break;
		case 'Aluguel de Veículos':
			alternarDetalhesTipoDespesa('tipoAluguelVeiculos', numeroIdPaiFilho);
			break;
		case 'Hospedagem':
			alternarDetalhesTipoDespesa('tipoHospedagem', numeroIdPaiFilho);
			break;
		case 'Transfer':
			alternarDetalhesTipoDespesa('tipoTransfer', numeroIdPaiFilho);
			break;
		default:
			alternarDetalhesTipoDespesa('tipoPadrao', numeroIdPaiFilho);
			break;
	}
}

/**
 * @function alternarDetalhesTipoDespesa Exibe os elementos relacionados ao tipo de fornecedor informado e oculta os outros não relacionados.
 * 
 * @param {String} exibirId Prefixo do id do grupo de elementos que devem ser exibidos.
 * @param {String} numeroIdPaiFilho Número contido no id do elemento no pai filho.
 */
function alternarDetalhesTipoDespesa(exibirId, numeroIdPaiFilho) {
	let idsTipos = ['tipoAereo', 'tipoAluguelVeiculos', 'tipoHospedagem', 'tipoTransfer', 'tipoPadrao'];

	idsTipos.map(function (id) {
		if (exibirId == id) $('#' + exibirId + '___' + numeroIdPaiFilho).show();
		else $('#' + id + '___' + numeroIdPaiFilho).hide();
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
	let id = $(elemento).prop('id');
	if (elemento.className == 'fluigicon fluigicon-trash fluigicon-md')
		id = $(elemento).closest('tr').prop('id');
	return id.split('___')[1];
}

/**
 * @function getDataHoje Cria uma string com a data de hoje no formato DD/MM/AAAA.
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
 * @function pad Função para pegar adicionar 0 nas datas que contém o dia ou mês < 10.
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
 * @function toast Função genérica para gerar toast.
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
 * @function transformarDias Converte um timestamp para sua respectiva quantidade de dias.
 * 
 * @param {Number} dataTimestamp Data em timestamp.
 * 
 * @return {Number} Quantidade de dias.
 */
function transformarDias(dataTimestamp) {
	return Math.floor(dataTimestamp / 1000 / 60 / 60 / 24);
}

/**
 * @function transformaTimestamp Converte uma data em string no formato DD/MM/AAAA em timestamp.
 * 
 * @param {String} data String com data no formato DD/MM/AAAA.
 * 
 * @return {Number} Timestamp da data convertida.
 */
function transformaTimestamp(data) {
	let dataSplit = data.split('/');
	let novaData = dataSplit[1] + '/' + dataSplit[0] + '/' + dataSplit[2];
	return new Date(novaData).getTime();
}

/**
 * @function validarCampoVazio Altera a borda e label do campo vazio para vermelhas.
 * 
 * @param {Object} input Elemento do JQuery que deve ser validado.
 * 
 * @returns {Boolean} True se o campo estiver vazio.
 */
function validarCampoVazio(input) {
	if (input[0].className.indexOf('select2') != -1) {
		if (input.parent().parent()[0].innerText == null || input.parent().parent()[0].innerText == '') {
			input.parents('div.form-group').addClass('has-error text-danger');
			colorirElementoHtml($(input[0]).parent().parent().parent(), 'danger');
			return true;
		} else {
			input.parents('div.form-group').removeClass('has-error text-danger');
			colorirElementoHtml($(input[0]).parent().parent().parent(), '');
			return false;
		}
	} else {
		if ((input.val() == null || input.val() == '') && !input.prop('readonly')) {
			if (input.prop('id').indexOf('data') != -1) {
				input.parent().parent().addClass('has-error');
			} else {
				input.parent().addClass('has-error');
			}
			return true;
		} else {
			if (input.prop('id').indexOf('data') != -1) {
				input.parent().parent().removeClass('has-error');
			} else {
				input.parent().removeClass('has-error');
			}
			return false;
		}
	}
}