function validateForm(form) {
	var campos = '';

	// if (form.getValue('nomeSolicitante') == '' || form.getValue('nomeSolicitante') == null) {
	// 	campos += '<br>Solicitante';
	// }
	// if (form.getValue('centroCusto') == '' || form.getValue('centroCusto') == null) {
	// 	campos += '<br>Centro de Custo';
	// }
	// if (form.getValue('justificativaViagem') == '') {
	// 	campos += '<br>Justificativa de Viagem';
	// }
	// if (form.getValue('idaPrevista') == '') {
	// 	campos += '<br>Ida Prevista';
	// }
	// if (form.getValue('voltaPrevista') == '') {
	// 	campos += '<br>Volta Prevista';
	// }
	// if (form.getValue('estadoOrigem') == '') {
	// 	campos += '<br>Estado de Origem';
	// }
	// if (form.getValue('cidadeOrigem') == '') {
	// 	campos += '<br>Cidade de Origem';
	// }
	// if (form.getValue('cidadeDestino') == '') {
	// 	campos += '<br>Cidade de Destino';
	// }
	// if (form.getValue('estadoDestino') == '') {
	// 	campos += '<br>Estado de Destino';
	// }

	if (getValue('WKNumProces') == 16) {
		// Se estiver na atividade de acerto de viagem
		if (form.getValue('idaEfetiva') == '') {
			campos += '<br>Ida Efetiva';
		}
		if (form.getValue('voltaEfetiva') == '') {
			campos += '<br>Volta Efetiva';
		}
	}

	if (campos != '') {
		var cabecalhoMsg = i18n.translate('msgCampoVazio');
		var quantidadeCampos = campos.split('<br>').length - 1; // -1 para remover posição do array com string vazia
		if (quantidadeCampos > 1) {
			cabecalhoMsg = i18n.translate('msgCamposVazios');
		}
		throw cabecalhoMsg + '<br>' + campos;
		// throw '<script>cardPublisherFrame.validarCampos()</script>' + cabecalhoMsg + '<br>' + campos;
	}
}