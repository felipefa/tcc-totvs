$(document).ready(function () {
	$('.obrigatorio').on('blur', function () {
		input = $(this);
		if (input.val() == '' || input.val() == null) {
			input.parent().addClass('has-error');
		} else if (input.prop('id') === 'cnpj') {
			if (validarCnpj(input.val())) {
				input.parent().find('.help-block').hide();
				input.parent().removeClass('has-error');
			} else {
				input.parent().find('.help-block').show();
				input.parent().addClass('has-error');
			}
		} else {
			input.parent().removeClass('has-error');
		}
	});

	$('#cep').on('blur', function () {
		consultarCep($(this).val());
	});
});

/**
 * @function validarCnpj Valida CNPJ digitado de acordo com algoritmo da Receita Federal.
 * 
 * @param {String} cnpj Valor que deve ser validado.
 * 
 * @returns {Boolean} True se cnpj for válido e não estiver cadastrado.
 */
function validarCnpj(cnpj) {
	let cnpjComMascara = cnpj;
	cnpj = cnpj.replace(/[^\d]+/g, '');

	if (cnpj == '') return false;

	if (cnpj.length != 14) return false;

	// Elimina CNPJs inválidos conhecidos
	if (cnpj == '00000000000000' ||
		cnpj == '11111111111111' ||
		cnpj == '22222222222222' ||
		cnpj == '33333333333333' ||
		cnpj == '44444444444444' ||
		cnpj == '55555555555555' ||
		cnpj == '66666666666666' ||
		cnpj == '77777777777777' ||
		cnpj == '88888888888888' ||
		cnpj == '99999999999999')
		return false;

	// Valida dígitos verificadores
	tamanho = cnpj.length - 2
	numeros = cnpj.substring(0, tamanho);
	digitos = cnpj.substring(tamanho);
	soma = 0;
	pos = tamanho - 7;
	for (i = tamanho; i >= 1; i--) {
		soma += numeros.charAt(tamanho - i) * pos--;
		if (pos < 2)
			pos = 9;
	}
	resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
	if (resultado != digitos.charAt(0))
		return false;

	tamanho = tamanho + 1;
	numeros = cnpj.substring(0, tamanho);
	soma = 0;
	pos = tamanho - 7;
	for (i = tamanho; i >= 1; i--) {
		soma += numeros.charAt(tamanho - i) * pos--;
		if (pos < 2)
			pos = 9;
	}
	resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
	if (resultado != digitos.charAt(1))
		return false;

	// Verifica se CNPJ já está cadastrado para outra empresa
	let constraintsEmpresa = new Array(
		DatasetFactory.createConstraint('cnpj', cnpjComMascara, cnpjComMascara, ConstraintType.MUST)
	);
	let felipe_CadastroEmpresa = DatasetFactory.getDataset('felipe_CadastroEmpresa', null, constraintsEmpresa, null);

	if (felipe_CadastroEmpresa.values.length > 0) {
		// TO DO: melhorar alerta de CNPJ existente
		alert('CNPJ já cadastrado.');
		return false;
	}

	return true;
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
 * @function consultarCep Busca um CEP informado para preencher os demais campos do endereço.
 * 
 * @param {String} cep CEP a ser consultado.
 */
function consultarCep(cep) {
	//Verifica se campo cep possui valor informado.
	if (cep != '') {

		//Nova variável 'cep' somente com dígitos.
		cep = cep.replace(/\D/g, '');

		//Expressão regular para validar o CEP.
		let validacep = /^[0-9]{8}$/;

		//Valida o formato do CEP.
		if (validacep.test(cep)) {

			//Preenche os campos com '...' enquanto consulta webservice.
			$('#logradouro').val('...');
			$('#bairro').val('...');
			$('#localidade').val('...');
			$('#uf').val('...');

			//Consulta o webservice viacep.com.br/
			$.getJSON('https://viacep.com.br/ws/' + cep + '/json/?callback=?', function (dados) {
				if (!('erro' in dados)) {
					//Atualiza os campos com os valores da consulta.
					$('#logradouro').val(dados.logradouro);
					$('#bairro').val(dados.bairro);
					$('#localidade').val(dados.localidade);
					$('#uf').val(dados.uf);
				} //end if.
				else {
					//CEP pesquisado não foi encontrado.
					limparEndereco();
					alert('CEP não encontrado.');
				}
			});
		} //end if.
		else {
			//cep é inválido.
			limparEndereco();
			alert('Formato de CEP inválido.');
		}
	} //end if.
	else {
		//cep sem valor, limpa formulário.
		limparEndereco();
	}
}