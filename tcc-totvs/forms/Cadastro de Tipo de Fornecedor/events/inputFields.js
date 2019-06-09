function inputFields(form) {
	var valorComMascara = form.getValue('valorLimite');
	if (valorComMascara != '' && valorComMascara != null) {
		// Salva o limite sem mascara de reais em um campo escondido
		var valorSemMascara = [];
		valorComMascara = valorComMascara.replace('R$ ', '');

		valorComMascara = valorComMascara;
		valorComMascara.split(',').map(function (x) {
			x = x.replace('.', '');
			valorSemMascara.push(x);
		});

		valorSemMascara = parseFloat(valorSemMascara.join('.'));

		form.setValue('valorLimiteSemMascara', valorSemMascara);
	}
}