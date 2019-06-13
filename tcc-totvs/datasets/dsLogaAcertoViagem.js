function createDataset(fields, constraints, sortFields) {
	try {
		var dsLogaAcertoViagem = DatasetBuilder.newDataset();
		var buscarLogin = '';

		if (constraints != null) {
			for (var indexConstraints = 0; indexConstraints < constraints.length; indexConstraints++) {
				if (constraints[indexConstraints].fieldName == 'login') {
					buscarLogin = constraints[indexConstraints].initialValue;
				}
			}
		}

		dsLogaAcertoViagem.addColumn('logado');
		if (buscarLogin == '' || buscarLogin == null) {
			dsLogaAcertoViagem.addColumn('erro');
			dsLogaAcertoViagem.addRow([false, 'Nenhum login informado']);
		} else {
			var constraintLogin = [DatasetFactory.createConstraint('loginSolicitante', buscarLogin, buscarLogin, ConstraintType.MUST)];
			var felipe_Viagem = DatasetFactory.getDataset('felipe_Viagem', null, constraintLogin, null);

			if (felipe_Viagem.rowsCount > 0) {
				var loginSolicitante = felipe_Viagem.getValue(0, 'loginSolicitante');
				var codigoAtividade = felipe_Viagem.getValue(0, 'codigoAtividade'); // Atividade Acerto de Viagem == 16

				if (loginSolicitante == buscarLogin && codigoAtividade == 16) {
					dsLogaAcertoViagem.addRow([true]);
				} else {
					dsLogaAcertoViagem.addColumn('erro');
					dsLogaAcertoViagem.addRow([false, 'Login não encontrado']);
				}
			} else {
				dsLogaAcertoViagem.addColumn('erro');
				dsLogaAcertoViagem.addRow([false, 'Login não encontrado']);
			}
		}

		return dsLogaAcertoViagem;
	} catch (e) {
		log.warn('--Debug dsLogaAcertoViagem-- Erro: ' + e + '; Linha: ' + e.lineNumber);
		var dataset = DatasetBuilder.newDataset();
		dataset.addColumn("logado");
		dataset.addColumn("erro");
		dataset.addRow([false, e.toString()]);
		return dataset;
	}
}