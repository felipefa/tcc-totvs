$(document).ready(function () {
	$('.obrigatorio').on('blur', function () {
		var input = $(this);
		if (input.val() == '' || input.val() == null) {
			input.parent().addClass('has-error');
		} else if (input.prop('id') === 'cnpj') {
			loading.show();
			if (validarCnpj(input.val())) {
				input.parent().removeClass('has-error');
			} else {
				input.parent().addClass('has-error');
			}
			loading.hide();
		} else {
			input.parent().removeClass('has-error');
		}
	});

	$('#cep').on('blur', function () {
		consultarCep($(this).val());
	});
});

var loading = FLUIGC.loading(window, {
	textMessage: 'Carregando...'
});

/**
 * @function consultarCep Busca um CEP informado para preencher os demais campos do endereço.
 * 
 * @param {String} cep CEP a ser consultado.
 */
function consultarCep(cep) {
	if (cep != '') {
		// Tranforma cep para somente dígitos.
		cep = cep.replace(/\D/g, '');

		// Expressão regular para validar o CEP.
		let validacep = /^[0-9]{8}$/;

		// Valida o formato do CEP.
		if (validacep.test(cep)) {
			loading.show();

			// Consulta o webservice viacep.com.br/
			$.getJSON('https://viacep.com.br/ws/' + cep + '/json/?callback=?', function (dados) {
				if (!('erro' in dados)) {
					// Atualiza os campos com os valores da consulta.
					$('#logradouro').val(dados.logradouro);
					$('#bairro').val(dados.bairro);
					$('#localidade').val(dados.localidade);
					$('#uf').val(dados.uf);
				} else {
					// CEP pesquisado não foi encontrado.
					limparEndereco();
					toast('CEP não encontrado.', '', 'warning');
				}
			}).fail(function () {
				toast('Erro ao buscar CEP.', '', 'warning');
			}).always(function () {
				loading.hide();
			});
		} else {
			// CEP inválido.
			limparEndereco();
			toast('Formato de CEP inválido.', '', 'warning');
		}
	} else {
		// CEP sem valor, limpa formulário.
		limparEndereco();
	}
}

/**
 * @function limparEndereco Limpa valores dos campos de endereço.
 */
function limparEndereco() {
	$('#logradouro').val('');
	$('#bairro').val('');
	$('#localidade').val('');
	$('#uf').val('');
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
 * @function validarCampos Função que força a execução do evento blur dos campos obrigatórios para validação visual.
 */
function validarCampos() {
	$('.obrigatorio').blur();
}

/**
 * @function validarCnpj Valida CNPJ digitado de acordo com algoritmo da Receita Federal.
 * 
 * @param {String} cnpj Valor que deve ser validado.
 * 
 * @returns {Boolean} True se cnpj for válido e não estiver cadastrado.
 */
function validarCnpj(cnpj) {
	var constraintsCnpj = [
		DatasetFactory.createConstraint('cnpj', cnpj, cnpj, ConstraintType.MUST),
		DatasetFactory.createConstraint('dataset', 'felipe_CadastroFornecedor', 'felipe_CadastroFornecedor', ConstraintType.MUST),
		DatasetFactory.createConstraint('campoCnpj', 'cnpj', 'cnpj', ConstraintType.MUST),
		DatasetFactory.createConstraint('campoNomeEmpresa', 'nomeFornecedor', 'nomeFornecedor', ConstraintType.MUST),
	];
	var dsValidaCnpj = DatasetFactory.getDataset('dsValidaCnpj', null, constraintsCnpj, null);

	if (dsValidaCnpj.values.length > 0) {
		if (dsValidaCnpj.values[0].sucesso == 'true') {
			return true;
		} else {
			toast(dsValidaCnpj.values[0].mensagem + '.', '', 'warning');
			return false;
		}
	}

	return false;
}