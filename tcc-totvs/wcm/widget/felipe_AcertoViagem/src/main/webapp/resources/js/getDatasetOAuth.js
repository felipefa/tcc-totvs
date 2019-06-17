function getDatasetOAuth(dsName, fields, constraints, orders) {
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
// fluig local
const inOauth = new Object({
	oauth1_fluig: new Object(),
	consumer_post: new Object({
		'public': 'post',
		'secret': 'post'
	}),
	token_post: new Object({
		'public': '99d2e68c-5e28-4aed-b935-5f8e9da454cd',
		'secret': '78cd26b0-264d-4df3-ad64-6692e0c07b70822a2dd3-0889-43d5-925d-5f88390793c2'
	}),
	consumer_get: new Object({
		'public': 'get',
		'secret': 'get'
	}),
	token_get: new Object({
		'public': 'd43ed1ba-d705-43e6-8130-e0deb1512d8f',
		'secret': '4d91dfef-3b81-49df-80f8-7bb35b47940ae90c8b5b-fc6e-483b-beae-a6de644fbc43'
	})
});

// demofluig
// const inOauth = new Object({
// 	oauth1_fluig: new Object(),
// 	consumer_post: new Object({
// 		'public': 'post',
// 		'secret': 'post-app-secret'
// 	}),
// 	token_post: new Object({
// 		'public': '5081c3f0-eb83-42e2-8d08-19acd8176d7c',
// 		'secret': '8ffa6133-bcb5-4933-91d8-c3359c024c0161518a35-3695-4cac-bfd4-de35ce862e81'
// 	}),
// 	consumer_get: new Object({
// 		'public': 'get-app',
// 		'secret': 'get-app'
// 	}),
// 	token_get: new Object({
// 		'public': '2e6efb63-3b06-4ecd-af7c-2d4a23bf00e6',
// 		'secret': '781d64a9-8cd1-4d79-b9cf-c26ffe6ad18ac4eb1037-fef5-44d6-94a4-2deedc5dbef0'
// 	})
// });

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