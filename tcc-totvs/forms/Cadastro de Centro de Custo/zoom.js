function setSelectedZoomItem(selectedItem) {
	let idCampoZoom = selectedItem.inputId;

	// Preenche os campos ocultos relacionados a empresa selecionada
	if (idCampoZoom === 'zoomEmpresa') {
		$('#cnpj').val(selectedItem.cnpj);
		$('#razaoSocial').val(selectedItem.razaoSocial);
		$('#nomeFantasia').val(selectedItem.nomeFantasia);
	}

	// Preenche os campos ocultos relacionados ao gestor selecionado
	if (idCampoZoom === 'zoomGestor') {
		$('#loginGestor').val(selectedItem.login);
	}
}

function removedZoomItem(removedItem) {
	let idCampoZoom = removedItem.inputId;

	// Limpa os campos ocultos relacionados a empresa selecionada anteriormente
	if (idCampoZoom === 'zoomEmpresa') {
		$('#cnpj').val('');
		$('#razaoSocial').val('');
		$('#nomeFantasia').val('');
	}

	// Limpa os campos ocultos relacionados ao gestor selecionado anteriormente
	if (idCampoZoom === 'zoomGestor') {
		$('#loginGestor').val('');
	}
}