$(document).ready(function () {
	$('.obrigatorio').on('blur', function () {
		let input = $(this);
		if (input.val() == '' || input.val() == null) {
			input.parent().addClass('has-error');
		} else {
			input.parent().removeClass('has-error');
		}
	});

	$('#possuiLimite').on('change', function () {
		let possuiLimite = $(this).children('option:selected').val();
		if (possuiLimite === 'sim') {
			$('.valorLimite').show();
		} else {
			$('.valorLimite').hide();
			$('#limitePor').val('');
			$('#valorLimite').val('');
		}
	});

	$('.real').maskMoney({
		prefixMoney: 'R$ ',
		placeholder: 'R$ 0,00'
	});
});

/**
 * @function validarCampos Função que força a execução do evento blur dos campos obrigatórios para validação visual.
 */
function validarCampos() {
	$('.obrigatorio').blur();
}