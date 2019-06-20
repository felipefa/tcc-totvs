function getDatasetOAuth(dsName, fields, constraints, orders) {
	loadOauthDataset();

	var request_data = {
		url: WCMAPI.serverURL + '/api/public/ecm/dataset/datasets',
		method: 'POST',
	};

	var data = {
		name: dsName,
		fields: fields,
		constraints: constraints,
		order: orders
	}

	var ret = null;

	$.ajax({
		url: request_data.url,
		crossDomain: true,
		async: false,
		type: request_data.method,
		data: JSON.stringify(data),
		//headers: oauth.toHeader(oauth.authorize(request_data, token)),
		headers: inOauth.oauth1_fluig,
		contentType: "application/json"
	}).done(function (data) {
		ret = data.content;
	});

	return ret;
}

function loadOauthDataset() {
	this.oauth = OAuth({
		consumer: inOauth.consumer_post,
		signature_method: 'HMAC-SHA1',
		parameter_seperator: ",",
		nonce_length: 6
	});
	this.serverUrl = top.WCMAPI.serverURL;
	this.request_data = {
		url: this.serverUrl + '/api/public/ecm/dataset/datasets', //NOTE: Api
		method: 'POST',
		data: ''
	};
	this.token = inOauth.token_post;
	this.headers = this.oauth.toHeader(this.oauth.authorize(this.request_data, this.token));
	inOauth.oauth1_fluig = this.headers;
}