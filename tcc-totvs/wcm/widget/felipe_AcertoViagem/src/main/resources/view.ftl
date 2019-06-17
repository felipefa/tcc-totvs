<div id="AcertoViagem_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide" data-params="AcertoViagem.instance()">

	<div class="navbar logado">
		<div class="navbar-header">
			<h1 class="fs-no-margin fs-ellipsis">Acerto de Viagem</h1>
			<button type="button" class="fs-no-margin navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
				<i class="fluigicon fluigicon-ellipsis-vertical icon-md" style="color: white;"></i>
			</button>
		</div>
		<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
			<ul class="nav navbar-nav navbar-right">
				<li><span class="navbar-text" id="usuario" name="usuario">Usuário</span></li>
				<li><a class="btn btn-link" href="#" id="btnSair" name="btnSair" role="button" style="color:#f64445">Sair</a></li>
			</ul>
		</div>
	</div>

	<div class="container-fluid">
		<div class="panel panel-default" id="panelLogin" style="margin: auto; width: 100%; max-width: 350px; margin-top: 15%;">
			<div class="panel-heading">
				<h3 class="panel-title text-center">Acessar Acerto de Viagem</h3>
			</div>
			<div class="panel-body">
				<div class="form-group" id="inputLogin">
					<label class="control-label" for="login">Login</label>
					<input class="form-control" id="login" name="login" type="text">
				</div>
				<div class="row text-center">
					<button class="btn btn-primary" id="btnLogin" name="btnLogin">Entrar</button>
				</div>
			</div>
		</div>

		<div class="panel panel-primary logado" id="panelAcerto">
			<div class="panel-heading">
				<span class="fs-float-right">
					<small>Total</small>
					<span class="badge" id="qtdSolicitacoes">0</span>
				</span>
				<h3 class="panel-title">Solicitações Pendentes</h3>
			</div>
			<div class="panel-body table-responsive" id="panelBodyAcerto">
				<div class="row">
					<div class="col-xs-12" id="tabelaSolicitacoes">
						<!-- Espaço onde será incluída a tabela com as solicitações na atividade Acerto de Viagem do usuário logado -->
					</div>
				</div>
			</div>
		</div>
	</div>


	<script type="text/template" class="templateTabelaSolicitacoes">
		<tr>
            <td>{{numeroSolicitacao}}</td>
            <td>{{origem}}</td>
            <td>{{destino}}</td>
            <td>{{idaPrevista}}</td>
            <td>{{voltaPrevista}}</td>
            <td>
				<button class="btn btn-primary btn-sm" onclick="abrirModalSolicitacao({{numeroSolicitacao}})">Acertar</button>
			</td>
        </tr>
	</script>

	<script type="text/template" class="modalSolicitacao">
		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">Itinerário</h3>
			</div>
			<div class="panel-body">
			</div>
		</div>
		
		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">Despesas da Viagem</h3>
			</div>
			<div class="panel-body">
			</div>
		</div>

		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">Resumo da Viagem</h3>
			</div>
			<div class="panel-body">
			</div>
		</div>
	</script>

	<script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
	<script type="text/javascript" src="/webdesk/vcXMLRPC-mobile.js"></script>
</div>