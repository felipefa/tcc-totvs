$(document).ready(function () {
	// $(':text').css('text-transform', 'uppercase');
	$(':text').on('blur', function () {
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
			// input.val(input.val().toUpperCase());
			input.parent().removeClass('has-error');
		}
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
	var cnpjComMascara = cnpj;
	cnpj = cnpj.replace(/[^\d]+/g, '');

	if (cnpj == '') return false;

	if (cnpj.length != 14) return false;

	// Elimina CNPJs inválidos conhecidos
	if (cnpj == "00000000000000" ||
		cnpj == "11111111111111" ||
		cnpj == "22222222222222" ||
		cnpj == "33333333333333" ||
		cnpj == "44444444444444" ||
		cnpj == "55555555555555" ||
		cnpj == "66666666666666" ||
		cnpj == "77777777777777" ||
		cnpj == "88888888888888" ||
		cnpj == "99999999999999")
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

	// Verifica se CNPJ já está cadastrado para outro fornecedor
	var constraintsFornecedor = new Array(
		DatasetFactory.createConstraint('cnpj', cnpjComMascara, cnpjComMascara, ConstraintType.MUST)
	);
	var felipe_CadastroFornecedor = DatasetFactory.getDataset('felipe_CadastroFornecedor', null, constraintsFornecedor, null);

	if (felipe_CadastroFornecedor.values.length > 0) {
		// TO DO: melhorar alerta de CNPJ existente
		alert('CNPJ já cadastrado.');
		return false;
	}

	return true;
}