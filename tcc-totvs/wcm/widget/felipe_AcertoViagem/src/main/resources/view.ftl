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
	<div class="container">
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
		<input type="hidden" id="numeroSolicitacao" value="{{numeroSolicitacao}}">
		<input type="hidden" id="nomeSolicitante" value="{{nomeSolicitante}}">
		<!-- Panel Itinerário -->
		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">Itinerário</h3>
			</div>
			<div class="panel-body">
				<div class="row">
					<div class="form-group col-md-2">
						<label class="control-label" for="idaPrevista">Ida Prevista</label>
						<div class="input-group">
							<input type="text" class="form-control" value="{{idaPrevista}}" readonly>
							<span class="input-group-addon">
								<span class="fluigicon fluigicon-calendar"></span>
							</span>
						</div>
					</div>
					<div class="form-group col-md-2">
						<label class="control-label" for="voltaPrevista">Volta Prevista</label>
						<div class="input-group">
							<input type="text" class="form-control" value="{{voltaPrevista}}" readonly>
							<span class="input-group-addon">
								<span class="fluigicon fluigicon-calendar"></span>
							</span>
						</div>
					</div>
					<div class="form-group col-md-2">
						<label class="control-label" for="idaEfetiva">Ida Efetiva</label>
						<div class="input-group">
							<input type="text" class="form-control calendario obrigatorio atividadeAcerto" placeholder="Selecione" name="idaEfetiva" id="idaEfetiva" value="{{idaEfetiva}}">
							<span class="input-group-addon">
								<span class="fluigicon fluigicon-calendar"></span>
							</span>
						</div>
					</div>
					<div class="form-group col-md-2">
						<label class="control-label" for="voltaEfetiva">Volta Efetiva</label>
						<div class="input-group">
							<input type="text" class="form-control calendario obrigatorio atividadeAcerto" placeholder="Selecione" name="voltaEfetiva" id="voltaEfetiva" value="{{voltaEfetiva}}">
							<span class="input-group-addon">
								<span class="fluigicon fluigicon-calendar"></span>
							</span>
						</div>
					</div>
				</div>
				<div class="row">
					<div class="form-group col-md-3">
						<label class="control-label" for="estadoOrigem">Estado de Origem</label>
						<input type="text" class="form-control" value="{{estadoOrigem}}" readonly>
					</div>
					<div class="form-group col-md-3">
						<label class="control-label" for="cidadeOrigem">Cidade de Origem</label>
						<input type="text" class="form-control" value="{{cidadeOrigem}}" readonly>
					</div>
					<div class="form-group col-md-3">
						<label class="control-label" for="estadoDestino">Estado de Destino</label>
						<input type="text" class="form-control" value="{{estadoDestino}}" readonly>
					</div>
					<div class="form-group col-md-3">
						<label class="control-label" for="cidadeDestino">Cidade de Destino</label>
						<input type="text" class="form-control" value="{{cidadeDestino}}" readonly>
					</div>
				</div>
			</div>
		</div>

		<!-- Panel Despesas de Viagem -->
		<div class="panel panel-primary">
			<div class="panel-heading">
				<div class="row">
					<div class="col-xs-6 col-sm-8">
						<h3 class="panel-title" style="margin-top: .5rem;">Despesas da Viagem</h3>
					</div>
					<div class="col-sm-4 text-right">
						<button class="btn btn-default" type="button" id="btnAdicionarDespesa" onclick="adicionarDespesa()">Adicionar Despesa</button>
					</div>
				</div>
			</div>
			<div class="panel-body bodyDespesas">
				<div class="panel-group" id="accordion">
					<table class="col-xs-12" id="tableDespesas" tablename="despesas" noaddbutton="true" nodeletebutton="true">
						<thead>
							<tr>
								<th class="tableColumn"></th>
							</tr>
						</thead>
						<tbody id="tbodyDespesas">
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- Panel Resumo de Viagem -->
		<div class="panel panel-primary">
			<div class="panel-heading">
				<h3 class="panel-title">Resumo da Viagem</h3>
			</div>
			<div class="panel-body">
				<div class="row">
					<div class="form-group col-md-2">
						<label class="control-label" for="totalPrevisto">Despesa Total Prevista</label>
						<input class="form-control real" id="totalPrevisto" type="text" value="{{totalPrevisto}}" readonly>
					</div>
					<div class="form-group col-md-2">
						<label class="control-label" for="totalEfetivo">Despesa Total Efetiva</label>
						<input class="form-control real" id="totalEfetivo" name="totalEfetivo" type="text" value="{{totalEfetivo}}" readonly>
					</div>
					<!-- Início de Campos Ocultos do Resumo da Viagem -->
					<input type="hidden" id="totalPrevistoSM" name="totalPrevistoSM">
					<input type="hidden" id="totalEfetivoSM" name="totalEfetivoSM">
					<!-- Fim de Campos Ocultos do Resumo da Viagem -->
				</div>
			</div>
		</div>
	</script>

	<script type="text/template" class="templateDespesaPreenchida">
		<tr id="trDespesa___{{numeroIdDespesa}}">
			<input type="hidden" id="numeroIdDespesa___{{numeroIdDespesa}}" value="{{numeroIdDespesa}}">
			<td>
				<div class="panel panel-default" style="border-radius: 2rem; {{border}}">
					<div class="panel-heading">
						<h4 class="panel-title">
							<div class="row">
								<div class="col-xs-9">
									<h5 class="panel-title" style="margin-top: .3rem; color: {{cor}}">{{numeroIdDespesa}} - {{tipoFornecedor}} - {{nomeFornecedor}} - {{valorPrevisto}} {{^valorPrevisto}}Despesa não prevista{{/valorPrevisto}} {{{icone}}}</h5>
								</div>
								<div class="col-xs-3 text-right">
									<a class="btn btn-info btn-sm" data-toggle="collapse" data-parent="#accordion" href="#despesa___{{numeroIdDespesa}}" role="button">
										<i class="fluigicon fluigicon-eye-open icon-sm"></i>
									</a>
									<button class="btn btn-danger btn-sm" disabled>
										<i class="fluigicon fluigicon-trash icon-sm"></i>
									</button>
								</div>
							</div>
						</h4>
					</div>
					<div class="panel-collapse collapsed collapse" id="despesa___{{numeroIdDespesa}}" aria-expanded="false" style="height: 0px;">
						<div class="panel-body">
							<!-- Início Aprovação Gestor -->
							<div class="row">
								<div class="form-group col-md-3">
									<label class="control-label" for="aprovacaoGestor___{{numeroIdDespesa}}">Aprovação do Gestor</label>
									<input class="form-control" name="aprovacaoGestor___{{numeroIdDespesa}}" type="text" readonly style="text-transform: capitalize;" value="{{aprovacaoGestor}}">
								</div>
								<div class="form-group col-md-9">
									<label class="control-label" for="justificativaGestor___{{numeroIdDespesa}}">Justificativa do Gestor</label>
									<textarea class="form-control" name="justificativaGestor___{{numeroIdDespesa}}" rows="1" readonly style="resize: vertical" value="{{justificativaGestor}}"></textarea>
								</div>
							</div>
							<!-- Fim Aprovação Gestor -->
							<!-- Início Aprovação Financeiro -->
							<div class="row">
								<div class="form-group col-md-3">
									<label class="control-label" for="aprovadorFinanceiro___{{numeroIdDespesa}}">Aprovador do Financeiro</label>
									<input class="form-control" name="aprovadorFinanceiro___{{numeroIdDespesa}}" type="text" readonly value="{{aprovadorFinanceiro}}">
								</div>
								<div class="form-group col-md-3">
									<label class="control-label" for="aprovacaoFinanceiro___{{numeroIdDespesa}}">Aprovação do Financeiro</label>
									<input class="form-control" name="aprovacaoFinanceiro___{{numeroIdDespesa}}" type="text" readonly style="text-transform: capitalize;" value="{{aprovacaoFinanceiro}}">
								</div>
								<div class="form-group col-md-6">
									<label class="control-label" for="justificativaFinanceiro___{{numeroIdDespesa}}">Justificativa do Financeiro</label>
									<textarea class="form-control" name="justificativaFinanceiro___{{numeroIdDespesa}}" rows="1" readonly style="resize: vertical" value="{{justificativaFinanceiro}}"></textarea>
								</div>
							</div>
							<!-- Fim Aprovação Financeiro-->
							<!-- Início Dados do Fornecedor -->
							<div class="row">
								<div class="dadosFornecedor">
									<div class="form-group col-md-3">
										<label class="control-label" for="tipoFornecedor___{{numeroIdDespesa}}">Tipo</label>
										<input class="form-control" name="tipoFornecedor___{{numeroIdDespesa}}" type="text" readonly value="{{tipoFornecedor}}">
									</div>
									<div class="form-group col-md-3 validacaoZoom atividadeInicio">
										<label class="control-label" for="nomeFornecedor___{{numeroIdDespesa}}">Fornecedor</label>
										<input class="form-control" name="nomeFornecedor___{{numeroIdDespesa}}" type="text" readonly value="{{nomeFornecedor}}">
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="valorLimite___{{numeroIdDespesa}}">Valor Limite</label>
										<input class="form-control real" name="valorLimite___{{numeroIdDespesa}}" type="text" readonly value="{{valorLimite}}">
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="valorPrevisto___{{numeroIdDespesa}}">Valor Previsto</label>
										<input class="form-control real" id="valorPrevisto___{{numeroIdDespesa}}" name="valorPrevisto___{{numeroIdDespesa}}" type="text" readonly value="{{valorPrevisto}}">
										<input id="valorPrevistoSM___{{numeroIdDespesa}}" name="valorPrevistoSM___{{numeroIdDespesa}}" type="hidden" value="{{valorPrevistoSM}}">
									</div>
								</div>
								<div class="form-group col-md-2">
									<label class="control-label" for="despesaEfetuada___{{numeroIdDespesa}}">Despesa Efetuada?</label>
									<select class="form-control obrigatorio atividadeAcerto" id="despesaEfetuada___{{numeroIdDespesa}}" name="despesaEfetuada___{{numeroIdDespesa}}" style="cursor: pointer;">
										<option value="" disabled></option>
										<option value="sim">Sim</option>
										<option value="nao">Não</option>
									</select>
								</div>
							</div>
							<!-- Fim Dados do Fornecedor -->
							<!-- Início de Detalhes da Despesa -->
							<div class="row">
								<div class="detalhesDespesa">
									{{#dataRetirada}}{{#dataDevolucao}}
									<!-- Início Aluguel de Veículos -->
									<div class="form-group col-md-3">
										<label class="control-label" for="dataRetirada___{{numeroIdDespesa}}">Retirada</label>
										<div class="input-group">
											<input class="form-control" name="dataRetirada___{{numeroIdDespesa}}" readonly type="text" value="{{dataRetirada}}">
											<span class="input-group-addon">
												<span class="fluigicon fluigicon-calendar"></span>
											</span>
										</div>
									</div>
									<div class="form-group col-md-3">
										<label class="control-label" for="dataDevolucao___{{numeroIdDespesa}}">Devolução</label>
										<div class="input-group">
											<input class="form-control" name="dataDevolucao___{{numeroIdDespesa}}" readonly type="text" value="{{dataDevolucao}}">
											<span class="input-group-addon">
												<span class="fluigicon fluigicon-calendar"></span>
											</span>
										</div>
									</div>
									<!-- Fim Aluguel de Veículos -->
									{{/dataDevolucao}}{{/dataRetirada}}
									{{#hospedagemCheckin}}{{#hospedagemCheckout}}{{#hospedagemDiarias}}
									<!-- Início Hospedagem -->
									<div class="form-group col-md-2">
										<label class="control-label" for="hospedagemCheckin___{{numeroIdDespesa}}">Check-in</label>
										<div class="input-group">
											<input class="form-control" name="hospedagemCheckin___{{numeroIdDespesa}}" readonly type="text" value="{{hospedagemCheckin}}">
											<span class="input-group-addon">
												<span class="fluigicon fluigicon-calendar"></span>
											</span>
										</div>
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="hospedagemCheckout___{{numeroIdDespesa}}">Checkout</label>
										<div class="input-group">
											<input class="form-control" name="hospedagemCheckout___{{numeroIdDespesa}}" readonly type="text" value="{{hospedagemCheckout}}">
											<span class="input-group-addon">
												<span class="fluigicon fluigicon-calendar"></span>
											</span>
										</div>
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="hospedagemDiarias___{{numeroIdDespesa}}">Diárias</label>
										<input class="form-control" name="hospedagemDiarias___{{numeroIdDespesa}}" readonly type="text" value="{{hospedagemDiarias}}">
									</div>
									<!-- Fim Hospedagem -->
									{{/hospedagemDiarias}}{{/hospedagemCheckout}}{{/hospedagemCheckin}}
									{{#proprioOrigem}}{{#proprioDestino}}{{#proprioData}}{{#proprioDistancia}}
									<!-- Início Próprio -->
									<div class="form-group col-md-2">
										<label class="control-label" for="proprioOrigem___{{numeroIdDespesa}}">Origem</label>
										<input class="form-control" name="proprioOrigem___{{numeroIdDespesa}}" readonly type="text" value="{{proprioOrigem}}">
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="proprioDestino___{{numeroIdDespesa}}">Destino</label>
										<input class="form-control" name="proprioDestino___{{numeroIdDespesa}}" readonly type="text" value="{{proprioDestino}}">
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="proprioData___{{numeroIdDespesa}}">Data Prevista</label>
										<div class="input-group">
											<input class="form-control" name="proprioData___{{numeroIdDespesa}}" readonly type="text" value="{{proprioData}}">
											<span class="input-group-addon">
												<span class="fluigicon fluigicon-calendar"></span>
											</span>
										</div>
									</div>
									<div class="form-group col-md-1">
										<label class="control-label" for="proprioDistancia___{{numeroIdDespesa}}">Distância</label>
										<input class="form-control" name="proprioDistancia___{{numeroIdDespesa}}" readonly type="text" value="{{proprioDistancia}}">
									</div>
									<!-- Fim Próprio -->
									{{/proprioDistancia}}{{/proprioData}}{{/proprioDestino}}{{/proprioOrigem}}
									{{#jsonTrajetos}}
									<!-- Início Transporte -->
									<div class="col-xs-12">
										<div class="row">
											<input id="jsonTrajetos___{{numeroIdDespesa}}" name="jsonTrajetos___{{numeroIdDespesa}}" type="hidden" value="{{jsonTrajetos}}">
											<div class="col-xs-12 table-reponsive" id="trajetos___{{numeroIdDespesa}}" name="trajetos___{{numeroIdDespesa}}"></div>
										</div>
									</div>
									<!-- Fim Transporte -->
									{{/jsonTrajetos}}
									{{#dataPrevista}}
									<!-- Início Padrão -->
									<div class="form-group col-md-2">
										<label class="control-label" for="dataPrevista___{{numeroIdDespesa}}">Data Prevista</label>
										<div class="input-group">
											<input class="form-control" name="dataPrevista___{{numeroIdDespesa}}" readonly type="text" value="{{dataPrevista}}">
											<span class="input-group-addon">
												<span class="fluigicon fluigicon-calendar"></span>
											</span>
										</div>
									</div>
									<!-- Fim Padrão -->
									{{/dataPrevista}}
								</div>
								<div class="acertoViagem" id="comprovante___{{numeroIdDespesa}}">
									<div class="form-group col-md-2">
										<label class="control-label" for="valorEfetivo___{{numeroIdDespesa}}">Valor Efetivo</label>
										<input id="valorEfetivo___{{numeroIdDespesa}}" class="form-control obrigatorio atividadeAcerto real" type="text" name="valorEfetivo___{{numeroIdDespesa}}" onblur="salvarValorSemMascara(this,'Efetivo')" value="{{valorEfetivo}}">
										<input id="valorEfetivoSM___{{numeroIdDespesa}}" type="hidden" name="valorEfetivoSM___{{numeroIdDespesa}}" value="{{valorEfetivoSM}}">
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="dataEfetiva___{{numeroIdDespesa}}">Data Efetiva</label>
										<div class="input-group" style="cursor: pointer;">
											<input type="text" class="form-control calendario obrigatorio atividadeAcerto" placeholder="Selecione" name="dataEfetiva___{{numeroIdDespesa}}" id="dataEfetiva___{{numeroIdDespesa}}" value="{{dataEfetiva}}">
											<span class="input-group-addon">
												<span class="fluigicon fluigicon-calendar"></span>
											</span>
										</div>
									</div>
									<div class="form-group col-md-1">
										<label for="btnAnexos___{{numeroIdDespesa}}"><br></label><br>
										<button class="btn btn-primary" id="btnAnexos___{{numeroIdDespesa}}" name="btnAnexos___{{numeroIdDespesa}}" type="button" onclick="abrirModalAnexos({{numeroIdDespesa}})">Anexos</h4>
									</div>
								</div>
							</div>
							<!-- Fim de Detalhes da Despesa -->
						</div>
					</div>
				</div>
			</td>
		</tr>
	</script>

	<script type="text/template" class="templateNovaDespesa">
		<tr id="trDespesa___{{numeroIdDespesa}}">
			<input type="hidden" id="numeroIdDespesa___{{numeroIdDespesa}}" name="numeroIdDespesa___{{numeroIdDespesa}}" value="{{numeroIdDespesa}}">
			<td>
				<div class="panel panel-default" id="panelDespesa___{{numeroIdDespesa}}" style="border-radius: 2rem;">
					<div class="panel-heading">
						<h4 class="panel-title">
							<div class="row">
								<div class="col-xs-9">
									<h5 class="panel-title" style="margin-top: .3rem;" id="tituloDespesa___{{numeroIdDespesa}}">Preencha a despesa</h5>
								</div>
								<div class="col-xs-3 text-right">
									<a class="btn btn-info btn-sm" data-toggle="collapse" id="btnDetalhesDespesa___{{numeroIdDespesa}}" data-parent="#accordion" href="#despesa___{{numeroIdDespesa}}" role="button">
										<i class="fluigicon fluigicon-eye-open icon-sm"></i>
									</a>
									<button class="btn btn-danger btn-sm" id="btnExcluirDespesa___{{numeroIdDespesa}}" onclick="excluirDespesa({{numeroIdDespesa}})">
										<i class="fluigicon fluigicon-trash icon-sm"></i>
									</button>
								</div>
							</div>
						</h4>
					</div>
					<div class="panel-collapse collapse in" id="despesa___{{numeroIdDespesa}}">
						<div class="panel-body">
							<!-- Início Dados do Fornecedor -->
							<div class="row">
								<div class="dadosFornecedor">
									<div class="form-group col-md-3 validacaoZoom atividadeInicio">
										<label class="control-label" for="tipoFornecedor___{{numeroIdDespesa}}">Tipo</label>
										<input class="form-control obrigatorio" id="tipoFornecedor___{{numeroIdDespesa}}" name="tipoFornecedor___{{numeroIdDespesa}}" placeholder="Selecione ou digite um tipo" type="text">
									</div>
									<div class="form-group col-md-3 validacaoZoom atividadeInicio">
										<label class="control-label" for="nomeFornecedor___{{numeroIdDespesa}}">Fornecedor</label>
										<input class="form-control obrigatorio" id="nomeFornecedor___{{numeroIdDespesa}}" name="nomeFornecedor___{{numeroIdDespesa}}" placeholder="Selecione ou digite um fornecedor" type="text" readonly>
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="valorLimite___{{numeroIdDespesa}}">Valor Limite</label>
										<input class="form-control real" id="valorLimite___{{numeroIdDespesa}}" name="valorLimite___{{numeroIdDespesa}}" type="text" readonly>
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="valorPrevisto___{{numeroIdDespesa}}">Valor Previsto</label>
										<input class="form-control real" id="valorPrevisto___{{numeroIdDespesa}}" name="valorPrevisto___{{numeroIdDespesa}}" type="text" readonly value="R$ 0,00">
										<input id="valorPrevistoSM___{{numeroIdDespesa}}" name="valorPrevistoSM___{{numeroIdDespesa}}" type="hidden" value="0.00">
									</div>
								</div>
								<div class="form-group col-md-2 acertoViagem">
									<label class="control-label" for="despesaEfetuada___{{numeroIdDespesa}}">Despesa Efetuada?</label>
									<select class="form-control obrigatorio atividadeAcerto" id="despesaEfetuada___{{numeroIdDespesa}}" name="despesaEfetuada___{{numeroIdDespesa}}" readonly style="cursor: pointer;">
										<option value="sim" selected>Sim</option>
									</select>
								</div>
								<!-- Início de Campos Ocultos dos Dados do Fornecedor -->
								<input id="despesaPrevista___{{numeroIdDespesa}}" name="despesaPrevista___{{numeroIdDespesa}}" type="hidden" value="nao">
								<input id="possuiLimite___{{numeroIdDespesa}}" name="possuiLimite___{{numeroIdDespesa}}" type="hidden">
								<input id="cnpjFornecedor___{{numeroIdDespesa}}" name="cnpjFornecedor___{{numeroIdDespesa}}" type="hidden">
								<!-- Fim de Campos Ocultos dos Dados do Fornecedor -->
							</div>
							<!-- Fim Dados do Fornecedor -->
							<!-- Início de Detalhes da Despesa -->
							<div class="row">
								<div class="detalhesDespesa">
									<div id="tipoAluguelVeiculos___{{numeroIdDespesa}}" hidden>
										<div class="form-group col-md-3">
											<label class="control-label" for="dataRetirada___{{numeroIdDespesa}}">Retirada</label>
											<div class="input-group" style="cursor: pointer;">
												<input class="form-control calendarioHora" id="dataRetirada___{{numeroIdDespesa}}" name="dataRetirada___{{numeroIdDespesa}}" type="text" placeholder="Selecione">
												<span class="input-group-addon">
													<span class="fluigicon fluigicon-calendar"></span>
												</span>
											</div>
										</div>
										<div class="form-group col-md-3">
											<label class="control-label" for="dataDevolucao___{{numeroIdDespesa}}">Devolução</label>
											<div class="input-group" style="cursor: pointer;">
												<input class="form-control calendarioHora" id="dataDevolucao___{{numeroIdDespesa}}" name="dataDevolucao___{{numeroIdDespesa}}" type="text" placeholder="Selecione">
												<span class="input-group-addon">
													<span class="fluigicon fluigicon-calendar"></span>
												</span>
											</div>
										</div>
									</div>
									<div id="tipoHospedagem___{{numeroIdDespesa}}" hidden>
										<div class="form-group col-md-2">
											<label class="control-label" for="hospedagemCheckin___{{numeroIdDespesa}}">Check-in</label>
											<div class="input-group" style="cursor: pointer;">
												<input class="form-control calendario" id="hospedagemCheckin___{{numeroIdDespesa}}" name="hospedagemCheckin___{{numeroIdDespesa}}" type="text" placeholder="Selecione">
												<span class="input-group-addon">
													<span class="fluigicon fluigicon-calendar"></span>
												</span>
											</div>
										</div>
										<div class="form-group col-md-2">
											<label class="control-label" for="hospedagemCheckout___{{numeroIdDespesa}}">Checkout</label>
											<div class="input-group" style="cursor: pointer;">
												<input type="text" class="form-control calendario" placeholder="Selecione" name="hospedagemCheckout___{{numeroIdDespesa}}" id="hospedagemCheckout___{{numeroIdDespesa}}">
												<span class="input-group-addon">
													<span class="fluigicon fluigicon-calendar"></span>
												</span>
											</div>
										</div>
										<div class="form-group col-md-2">
											<label class="control-label" for="hospedagemDiarias___{{numeroIdDespesa}}">Diárias</label>
											<input id="hospedagemDiarias___{{numeroIdDespesa}}" class="form-control" type="text" name="hospedagemDiarias___{{numeroIdDespesa}}">
										</div>
									</div>
									<div id="tipoProprio___{{numeroIdDespesa}}" hidden>
										<div class="form-group col-md-2">
											<label class="control-label" for="proprioOrigem___{{numeroIdDespesa}}">Origem</label>
											<input id="proprioOrigem___{{numeroIdDespesa}}" class="form-control" type="text" name="proprioOrigem___{{numeroIdDespesa}}">
										</div>
										<div class="form-group col-md-2">
											<label class="control-label" for="proprioDestino___{{numeroIdDespesa}}">Destino</label>
											<input id="proprioDestino___{{numeroIdDespesa}}" class="form-control" type="text" name="proprioDestino___{{numeroIdDespesa}}">
										</div>
										<div class="form-group col-md-2">
											<label class="control-label" for="proprioData___{{numeroIdDespesa}}">Data Prevista</label>
											<div class="input-group" style="cursor: pointer;">
												<input type="text" class="form-control" placeholder="Selecione" name="proprioData___{{numeroIdDespesa}}" id="proprioData___{{numeroIdDespesa}}" readonly>
												<span class="input-group-addon">
													<span class="fluigicon fluigicon-calendar"></span>
												</span>
											</div>
										</div>
										<div class="form-group col-md-1">
											<label class="control-label" for="proprioDistancia___{{numeroIdDespesa}}">Distância</label>
											<input id="proprioDistancia___{{numeroIdDespesa}}" class="form-control" type="text" name="proprioDistancia___{{numeroIdDespesa}}">
										</div>
									</div>
									<div id="tipoTransporte___{{numeroIdDespesa}}" hidden>
										<div class="col-xs-12">
											<div class="row">
												<div class="form-group col-md-2">
													<label>&nbsp;</label>
													<button id="btnAdicionarTrajeto___{{numeroIdDespesa}}" class="btn btn-primary" onclick="cadastrarTrajeto(this, 'adicionar')">Adicionar Trajeto</button>
													<input id="jsonTrajetos___{{numeroIdDespesa}}" name="jsonTrajetos___{{numeroIdDespesa}}" type="hidden">
												</div>
											</div>
											<div class="row">
												<div class="col-xs-12 table-reponsive" id="trajetos___{{numeroIdDespesa}}"></div>
											</div>
										</div>
									</div>
									<div id="tipoPadrao___{{numeroIdDespesa}}" hidden>
										<div class="form-group col-md-2">
											<label class="control-label" for="dataPrevista___{{numeroIdDespesa}}">Data Prevista</label>
											<div class="input-group" style="cursor: pointer;">
												<input type="text" class="form-control calendario" placeholder="Selecione" name="dataPrevista___{{numeroIdDespesa}}" id="dataPrevista___{{numeroIdDespesa}}" readonly>
												<span class="input-group-addon">
													<span class="fluigicon fluigicon-calendar"></span>
												</span>
											</div>
										</div>
									</div>
								</div>
								<div class="acertoViagem" id="comprovante___{{numeroIdDespesa}}">
									<div class="form-group col-md-2">
										<label class="control-label" for="valorEfetivo___{{numeroIdDespesa}}">Valor Efetivo</label>
										<input id="valorEfetivo___{{numeroIdDespesa}}" class="form-control obrigatorio atividadeAcerto real" type="text" name="valorEfetivo___{{numeroIdDespesa}}" onblur="salvarValorSemMascara(this,'Efetivo')">
										<input id="valorEfetivoSM___{{numeroIdDespesa}}" type="hidden" name="valorEfetivoSM___{{numeroIdDespesa}}">
									</div>
									<div class="form-group col-md-2">
										<label class="control-label" for="dataEfetiva___{{numeroIdDespesa}}">Data Efetiva</label>
										<div class="input-group" style="cursor: pointer;">
											<input type="text" class="form-control calendario obrigatorio atividadeAcerto" placeholder="Selecione" name="dataEfetiva___{{numeroIdDespesa}}" id="dataEfetiva___{{numeroIdDespesa}}">
											<span class="input-group-addon">
												<span class="fluigicon fluigicon-calendar"></span>
											</span>
										</div>
									</div>
									<div class="form-group col-md-1">
										<label for="btnAnexos___{{numeroIdDespesa}}"><br></label><br>
										<button class="btn btn-primary" id="btnAnexos___{{numeroIdDespesa}}" type="button" onclick="abrirModalAnexos({{numeroIdDespesa}})">Anexos</h4>
									</div>
								</div>
							</div>
							<!-- Fim de Detalhes da Despesa -->
						</div>
					</div>
				</div>
			</td>
		</tr>
	</script>

	<script type="text/template" class="templateTabelaTrajetos">
		<tr>
			<td>{{origem}}</td>
			<td>{{destino}}</td>
			<td>{{dataHoraTrajeto}}</td>
			<td>{{identificador}}</td>
			<td class="opcoesTrajeto" style="text-align: center;">
				<button class="btn btn-primary btn-sm" id="btnCadastrarTrajeto___{{numeroIdDespesa}}" disabled onclick="cadastrarTrajeto({'numeroIdDespesa':{{numeroIdDespesa}}, 'numeroIdTrajeto':{{numeroIdTrajeto}}}, 'editar')">
					<i class="fluigicon fluigicon-pencil icon-sm"></i>
				</button>
				<button class="btn btn-danger btn-sm" id="btnExcluirTrajeto___{{numeroIdDespesa}}" disabled onclick="excluirTrajeto({{numeroIdDespesa}}, {{numeroIdTrajeto}})">
					<i class="fluigicon fluigicon-trash icon-sm"></i>
				</button>
			</td>
		</tr>
	</script>

	<script type="text/template" class="templateCadastroTrajeto">
		<div class="row">
			<div class="form-group col-md-4">
				<label class="control-label" for="origem">Origem</label>
				<input id="origem" class="form-control obrigatorio"
					type="text" name="origem" placeholder="Local de origem" value="{{origem}}">
			</div>
			<div class="form-group col-md-4">
				<label class="control-label" for="destino">Destino</label>
				<input id="destino" class="form-control obrigatorio"
					type="text" name="destino" placeholder="Local de destino" value="{{destino}}">
			</div>
			<div class="form-group col-md-3">
				<label class="control-label" for="dataHoraTrajeto">Data do Trajeto</label>
				<div class="input-group" style="cursor: pointer;">
					<input type="text"
						class="form-control obrigatorio calendarioHora"
						placeholder="Selecione" name="dataHoraTrajeto"
						id="dataHoraTrajeto" value="{{dataHoraTrajeto}}">
					<span class="input-group-addon">
						<span class="fluigicon fluigicon-calendar"></span>
					</span>
				</div>
			</div>
			<div class="form-group col-md-1">
				<label class="control-label" for="identificador">Identificador</label>
				<input id="identificador" class="form-control obrigatorio"
					type="text" name="identificador" placeholder="Nº voo" value="{{identificador}}">
			</div>
		</div>
	</script>

	<script type="text/template" class="templateModalAnexos">
		<div class="row">
			<div class="col-xs-12">
				<label class="file-input-wrapper btn btn-primary">
					Adicionar Arquivo(s)
					<input type="file" id="files" name="files" data-url="/ecm/upload" multiple onclick="anexarComprovantes(this, {{numeroIdDespesa}})">
				</label>
			</div>
		</div>
		<div class="row">
			<div class="col-xs-12 divTabelaAnexos table-reponsive"></div>
		</div>
	</script>

	<script type="text/template" class="templateTabelaAnexos">
		<tr>
			<td>{{codigo}}</td>
			<td>{{descricao}}</td>
			<td>
				<a class="btn btn-primary btn-sm" href="{{fileURL}}" target="_blank">
					<i class="fluigicon fluigicon-eye-open icon-sm"></i>
				</a>
				<button class="btn btn-danger btn-sm" onclick="removerArquivoPasta({{numeroIdDespesa}}, {{codigo}})">
					<i class="fluigicon fluigicon-trash icon-sm"></i>
				</button>
			</td>
		</tr>
	</script>

	<script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>
	<script type="text/javascript" src="/webdesk/vcXMLRPC-mobile.js"></script>
	<script type="text/javascript" src="/felipe_AcertoViagem/resources/js/jquery.mask.js"></script>
</div>