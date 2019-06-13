function chamaDataset(dsName, fields, constraints, orders) {
	loadOauth1();

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

/** Object Oauth fluig **/
const inOauth = new Object({
	oauth1_fluig: new Object(),
	consumer_post: new Object({
		'public': 'post',
		'secret': 'secret-post-app'
	}),
	token_post: new Object({
		'public': '8c40af6f-4e6a-49fe-b8de-3c648c3c90da',
		'secret': '16aed677-0530-4b09-ada1-56620a889be18d6fe5ca-6956-4119-8b03-df7b8fb5c5f3'
	}),
	consumer_get: new Object({
		'public': 'get',
		'secret': 'secret-get-app'
	}),
	token_get: new Object({
		'public': 'a6afd78e-17d1-4bec-9d5f-a4ef6d6ea476',
		'secret': '49c5882a-2aee-4a48-9bf3-8ec585f90d02122bec02-8304-4b45-88ae-7cffa2ccbf66'
	})
});

function loadOauth1() {
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