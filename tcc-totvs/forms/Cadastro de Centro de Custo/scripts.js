$(document).ready(function () {
	// Verifica o preenchimento de cada input com a classe 'obrigatorio' e de campos zoom
	$(document).on('blur', '.obrigatorio, .validacaoZoom .select2-search__field', function () {
		validarCampoVazio($(this));
	});
});

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
 * @function validarCampos Função que força a execução do evento blur dos campos obrigatórios para validação visual.
 */
function validarCampos() {
	$('.obrigatorio, .validacaoZoom .select2-search__field').blur();
}

/**
 * @function validarCampoVazio Altera a borda e label do campo vazio para vermelhas.
 * 
 * @param {Object} input Elemento do JQuery que deve ser validado.
 */
function validarCampoVazio(input) {
	if (input[0].className.indexOf('select2') != -1) {
		if (input.parent().parent()[0].innerText == null || input.parent().parent()[0].innerText == '') {
			input.parents('div.form-group').addClass('has-error text-danger');
			colorirElementoHtml($(input[0]).parent().parent().parent(), 'danger');
			colorirElementoHtml($(input[0]).parent().parent().parent().find('.input-group-addon.select2-fluigicon-zoom'), 'danger');
		} else {
			input.parents('div.form-group').removeClass('has-error text-danger');
			colorirElementoHtml($(input[0]).parent().parent().parent(), '');
			colorirElementoHtml($(input[0]).parent().parent().parent().find('.input-group-addon.select2-fluigicon-zoom'), '');
		}
	} else {
		if (input.val() == null || input.val() == '') {
			input.parent().addClass('has-error');
		} else {
			input.parent().removeClass('has-error');
		}
	}
}