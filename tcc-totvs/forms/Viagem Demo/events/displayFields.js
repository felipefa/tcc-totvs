function displayFields(form, customHTML) {
	customHTML.append('<script>var codigoAtividade = ' + getValue('WKNumState') + ';</script>');
	form.setValue('numeroSolicitacao', getValue('WKNumProces'));
}