function ajaxEcm(operacao, dados) {
	const restApiEcm = 'api/public/ecm/document';
	let url;
	let metodo = 'POST';

	switch (operacao) {
		case 'criarArquivo':
			url = `/${restApiEcm}/createDocument`;
			break;
		case 'criarPasta':
			url = `/api/public/2.0/folderdocuments/create`;
			break;
		case 'listarDocumentos':
			url = `/${restApiEcm}/listDocument/${dados}`;
			metodo = 'GET';
			break;
		case 'remover':
			url = `/${restApiEcm}/remove`;
			break;
		case 'alterar':
			url = `/${restApiEcm}/updateDocumentFolder`;
			break;
		default:
			toast('Erro!', 'Função não encontrada.', 'danger', 4000);
			break;
	}

	this.oauth = OAuth({
		consumer: inOauth.consumer_post,
		signature_method: 'HMAC-SHA1',
		parameter_seperator: ",",
		nonce_length: 6
	});
	this.serverUrl = top.WCMAPI.serverURL;
	this.request_data = {
		url: this.serverUrl + url, //NOTE: Api
		method: metodo,
		data: ''
	};
	this.token = inOauth.token_post;
	this.headers = this.oauth.toHeader(this.oauth.authorize(this.request_data, this.token));
	inOauth.oauth1_fluig = this.headers;

	var ret = null;

	$.ajax({
		url: url,
		crossDomain: true,
		async: false,
		type: metodo,
		data: dados,
		//headers: oauth.toHeader(oauth.authorize(request_data, token)),
		headers: inOauth.oauth1_fluig,
		contentType: "application/json"
	}).done(function (data) {
		ret = data;
	});

	return ret;
}