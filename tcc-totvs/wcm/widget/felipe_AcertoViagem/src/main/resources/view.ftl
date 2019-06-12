<div id="AcertoViagem_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide container-fluid" data-params="AcertoViagem.instance()">
	<div class="page-header">
		<div class="row">
			<div class="col-xs-9 col-sm-10 col-md-11">
				<h1 class="fs-no-margin fs-ellipsis fs-full-width" style="color: white">Biblioteca Trainee</h1>
			</div>
			<div class="col-xs-3 col-sm-2 col-md-1">
				<button class="btn btn-block btn-default" id="btnSair" name="btnSair">Sair</button>
			</div>
		</div>
	</div>

	<div class="alert alert-warning" role="alert" id="alert-multa" hidden>
		<strong>Atenção!</strong> Seu empréstimo está atrasado em <span id="qtdDias"></span> dia(s) e você já está
		devendo <span id="valorMulta"></span> de multa. Totalizando em <span id="valorTotal"></span>.
	</div>

	<div class="panel panel-default" id="panelLogin" style="margin: auto; width: 100%; max-width: 350px; margin-top: 10%;">
		<div class="panel-heading">
			<h3 class="panel-title text-center">Login</h3>
		</div>
		<div class="panel-body">
			<div class="form-group" id="formCpf">
				<label for="cpf">CPF</label>
				<input type="text" class="form-control cpf" id="cpf" name="cpf">
			</div>
			<div class="form-group" id="formCodEmp">
				<label for="codEmprestimo">Código do empréstimo</label>
				<input type="number" class="form-control" id="codEmprestimo" name="codEmprestimo">
			</div>
			<div class="form-group">
				<div class="g-recaptcha" data-sitekey="6LdIxZ8UAAAAAFe_IpnuA7qqvX-pHUvZKoAxr3xm"></div>
			</div>
			<div class="row text-center">
				<button class="btn btn-primary" id="btnLogin" name="btnLogin">Entrar</button>
			</div>
		</div>
	</div>

	<div class="panel panel-primary" id="panelDadosCliente">
		<div class="panel-heading">
			<h3 class="panel-title">Dados do Cliente</h3>
		</div>
		<div class="panel-body" id="panelBodyDadosCliente">
			<div class="form-group col-md-3">
				<label for="cliente">Cliente</label>
				<input type="text" id="cliente" name="cliente" class="form-control" readonly />
			</div>
			<div class="form-group col-md-2">
				<label for="dataRetirada">Data Retirada</label>
				<input type="text" name="dataRetirada" id="dataRetirada" class="form-control" readonly>
			</div>
			<div class="form-group col-md-2">
				<label for="dataEntrega">Data Entrega</label>
				<input type="text" name="dataEntrega" id="dataEntrega" class="form-control" readonly>
			</div>
			<div class="form-group col-md-2">
				<label for="valorAluguel">Valor Aluguel</label>
				<input type="text" name="valorAluguel" id="valorAluguel" class="form-control" readonly>
			</div>
			<div class="form-group col-md-2">
				<label for="valorFinal">Valor Final</label>
				<input type="text" name="valorFinal" id="valorFinal" class="form-control" readonly>
			</div>
			<div class="form-group col-md-1">
				<label for="ativo">Em aberto?</label>
				<div class="switch switch-success">
					<input class="switch-input" type="checkbox" id="ativo" disabled />
					<label class="switch-button" for="ativo">Toggle</label>
				</div>
			</div>
		</div>
	</div>

	<div class="panel panel-primary" id="panelLivrosEmprestados">
		<div class="panel-heading">
			<span class="fs-float-right">
				Quantidade de livros
				<span class="badge" id="qtdLivro">0</span>
			</span>
			<h3 class="panel-title">Livros Emprestados</h3>
		</div>
		<div class="panel-body table-responsive" id="panelBodyLivrosEmprestados">
			<div class="row">
				<div class="col-md-12" id="tableLivros">
					<!-- Espaço onde será incluída a tabela de Livros-->
				</div>
			</div>
		</div>
	</div>
</div>