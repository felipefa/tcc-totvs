<div id="AcertoViagem_${instanceId}" class="super-widget wcm-widget-class fluig-style-guide container-fluid" data-params="AcertoViagem.instance()">
	<div class="page-header">
		<div class="row">
			<div class="col-xs-9 col-sm-10 col-md-11">
				<h1 class="fs-no-margin fs-ellipsis fs-full-width" style="color: white">Acerto de Viagem</h1>
			</div>
			<div class="col-xs-3 col-sm-2 col-md-1">
				<!-- TO DO: Adicionar usuário logado -->
				<button class="btn btn-block btn-default" id="btnSair" name="btnSair">Sair</button>
			</div>
		</div>
	</div>

	<div class="panel panel-default" id="panelLogin" style="margin: auto; width: 100%; max-width: 350px; margin-top: 15%;">
		<div class="panel-heading">
			<h3 class="panel-title text-center">Acessar Sistema</h3>
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

	<div class="panel panel-primary" id="panelAcerto">
		<div class="panel-heading">
			<span class="fs-float-right">
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

	<script type="text/template" class="templateTabelaSolicitacoes">
		<tr>
            <td>{{numeroSolicitacao}}</td>
            <td>{{cidadeOrigem}}</td>
            <td>{{cidadeDestino}}</td>
            <td>{{idaPrevista}}</td>
            <td>{{voltaPrevista}}</td>
            <td style="text-align: center;">
				<button class="btn btn-primary btn-sm" onclick="alert('Acertô mizeravi!')">
					<i class="fluigicon fluigicon-check-circle-on icon-sm"></i>
				</button>
			</td>
        </tr>
	</script>
	<script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
	<script type="text/javascript" src="/webdesk/vcXMLRPC-mobile.js"></script>
</div>