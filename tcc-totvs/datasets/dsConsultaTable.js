/**
 * Dataset para consulta generico de tabela PaixFilho
 * @param fields
 * @param constraints: idForm-Id do Formulario; datasetName-Nome do Dataset do Formulario; dataTable-Nome da tabela 
 * @param sortFields
 * @returns
 */
function createDataset(fields, constraints, sortFields) {

	log.warn("Dataset dsSearchTableForm");
	
	var dataset = DatasetBuilder.newDataset();
	
	dataset.addColumn('codReturn');
	dataset.addColumn('messageReturn');
	dataset.addColumn('idForm');
	dataset.addColumn('datasetName');
	dataset.addColumn('dataTable');
			
	var criaColunas = '';
	
    var idForm = "";
    var datasetName = "";
    var dataTable = '';
    
    if (constraints != null) {
        for (var c = 0; c < constraints.length; c++) {
        	log.warn('constraints[c].fieldName: '+constraints[c].initialValue)
            if (constraints[c].fieldName == "idForm") {
            	idForm = constraints[c].initialValue;
            }
            if (constraints[c].fieldName == "datasetName") {
            	datasetName = constraints[c].initialValue;
            }
            if (constraints[c].fieldName == "dataTable") {
            	dataTable = constraints[c].initialValue;
            }
        }
    }
	
    if (datasetName == '' || dataTable == '') {
    	dataset.addRow(['ERROR', 'Nome dataset ou nome da tabela não foram informados', idForm, datasetName, dataTable]);
    	return dataset;
    }
    
	var c1 = DatasetFactory.createConstraint('metadata#active', 'true', 'true', ConstraintType.MUST);
	var const1 = [c1];
	
	if (idForm != '') {
		var c2 = DatasetFactory.createConstraint("metadata#id", idForm, idForm, ConstraintType.MUST);
		const1.push(c2);
	}
	
	var datasetPrincipal = DatasetFactory.getDataset(datasetName, null, const1, null);
	
	log.warn('datasetPrincipal.rowsCount: '+datasetPrincipal.rowsCount)
	
    for (var i = 0; i < datasetPrincipal.rowsCount; i++) {
        var documentId = datasetPrincipal.getValue(i, "metadata#id");
        var documentVersion = datasetPrincipal.getValue(i, "metadata#version");
         
        //Cria as constraints para buscar os campos filhos, passando o tablename, número da formulário e versão
        var c1 = DatasetFactory.createConstraint("tablename", dataTable,dataTable, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("metadata#id", documentId, documentId, ConstraintType.MUST);
        var c3 = DatasetFactory.createConstraint("metadata#version", documentVersion, documentVersion, ConstraintType.MUST);
        var constraintsFilhos = new Array(c1, c2, c3);
 
        //Busca o dataset
        var datasetFilhos = DatasetFactory.getDataset(datasetName, null, constraintsFilhos, null);
        log.warn('datasetFilhos.rowsCount: '+datasetFilhos.rowsCount)
        if (datasetFilhos.rowsCount > 0) {
			log.warn('criaColunas: '+criaColunas);
			if (criaColunas == '') {
				criaColunas = 'S';
				var qtColumns = datasetFilhos.getColumnsCount();
				log.warn("qtColumns: " + qtColumns);
				for (var h=0;h<qtColumns;h++) {
					//log.warn("getColumnName "+y+": " + dsDsFormReqVaga.getColumnName(y));
					dataset.addColumn(datasetFilhos.getColumnName(h));
				}
			}
			for (var x=0;x<datasetFilhos.rowsCount;x++) {
				var lista = new Array();
				
				lista.push('OK', '', idForm, datasetName, dataTable);
				for (var y=0;y<qtColumns;y++) {
					lista.push(datasetFilhos.getValue(x, datasetFilhos.getColumnName(y)));
				}
				dataset.addRow(lista); 
			}
        }
	}
	
	return dataset;
}