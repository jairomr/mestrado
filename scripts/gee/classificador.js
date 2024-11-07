
var clusters = [
    '7j6122', '6yk7ym', '6znc7w', '6vmm56', '6yk9qc', '7j610p',
    '6znce8', '6vx5gz', '6zncec', '6yk9x9', '6gvmzx', '6unst4',
    '6vqt8g', '6gv7r0', '6unshd'
      ]
    
    
    var cluster = '6znce8' //'6gur3q'
    print(cluster)
    
    var Clima = require("users/jairomr/mestrado:clima")
    
    var mpb = ee.Image('projects/mapbiomas-public/assets/brazil/lulc/collection9/mapbiomas_collection90_integration_v1')
    
    
    
    
    var colors = {min: 1, max: 19, palette: 
    [
    '#EDDE8E', // 1 PASTURE
    '#32A65E', // 2 FOREST FORMATION
    '#E974ED', // 3 AGRICULTURE
    '#FFFFB2', // 4 AGROPEC
    '#7A5900', // 5 FOREST PLANT
    '#D4271E', // 6 URBAN
    '#7DC975', // 7 SAVANNA
    '#0000FF', // 8 WATER
    '#026975', // 9 FLOODED AREA
    '#02D659', // 10 WOODED SANDBANK
    '#D6BC74', // 11 GRASSLAND
    '#D68FE2', // 12 COFF
    '#04381D', // 13 MANGROVE
    '#9C0027', // 14 MINING
    '#FFAA5F', // 15 ROCKY
    '#AD975A', // 16 NON FOREST
    '#FC8114', // 17 APICUM
    '#AD5100', // 18 HERBACEOUS SANDBANK
    '#CECECE', // 19 ASPHALT
      ]}
    
    var area_estudo = ee.FeatureCollection('projects/geocodelabs-jairo/assets/amostra_hash6').filter(ee.Filter.eq('hash',cluster))
    var nicfi = ee.ImageCollection('projects/planet-nicfi/assets/basemaps/americas');
    var amostras= ee.FeatureCollection('projects/geocodelabs-jairo/assets/amostras_cerrado5_clear').filter(ee.Filter.eq('hash_macro',cluster))
    
    var hash_sem_filtro = ee.FeatureCollection('projects/geocodelabs-jairo/assets/amostra_hash6')//.filter(ee.Filter.eq('hash',cluster))
    
    
    
    
    //var agua= ee.FeatureCollection('projects/geocodelabs-jairo/assets/concat_hashs_regenaracao3').filter(ee.Filter.eq('hash',cluster)).filter(ee.Filter.eq('class_id',9))
    
    //Map.addLayer(agua)
    
    print(amostras.size())
    
    
    mpb = mpb.select('classification_2022').remap(
    [3, 4, 5, 6, 7, 10, 32, 11, 50, 12, 29, 9, 14, 15, 20, 21, 39, 40, 41, 46, 47, 48, 62, 24, 25, 30, 33, 31, 26],
    [2, 7, 13, 9, 10, 2, 17, 9, 18, 11, 15, 5, 4, 1, 3, 4, 3, 3, 3, 12, 12, 3, 3, 6, 15, 13, 8, 8, 8]
      )
      
    
    
    print(area_estudo)
    
    var rfNTrees = 250; //Number of random trees;
    var rfBagFraction = 0.5; //Fraction (10^-2%) of variables in the bag;
    var rfVarPersplit = 6 //Number of varibales per tree branch;
    
    // Filtre mapas de base por data e obtenha a primeira imagem dos resultados filtrados
    var basemap= nicfi.filter(ee.Filter.date('2022-01-01','2023-12-30'))//.first();
    var cena = basemap.map(
        function(img){return img.clip(area_estudo)}
      )
    
    //Parâmetro de Visualização
    var vis = {"bands":["N","G","B"],"min":64,"max":5454,"gamma":1.8};
    var ngbVisBandSpec = {
      bands: ['N', 'G', 'B'],
      min: [1250, 224, 107],
      max: [3366, 1313, 878],
      //palette: ['red', 'green', 'blue']
    };
    var rgbVisBandSpec = {
      bands: ['R', 'G', 'B'],
      min: [320, 224, 107],
      max: [1500, 1313, 878],
      //palette: ['red', 'green', 'blue']
    };
    
    
    var vis_min = {"bands":["N_min","G_min","B_min"],"min":64,"max":5454,"gamma":1.8};
    var vis_max = {"bands":["N_max","G_max","B_max"],"min":64,"max":5454,"gamma":1.8};
    var vis_mean = {"bands":["N_mean","G_mean","B_mean"],"min":64,"max":5454,"gamma":1.8};
    var visndvi = {"bands":["ndvi"],"min":0,"max":1};
    //Centralizando o mapa
    Map.centerObject(area_estudo, 16)
    
    var cenajulho = nicfi.filter(ee.Filter.date('2020-07-01','2023-07-30'))
        .map(
        function(img){return img.clip(area_estudo)}
      )
    //Adicionando os layers
    Map.addLayer(cena, vis, 'cenas' ,false);
    
    //Map.addLayer(cenajulho, ngbVisBandSpec, 'cena julho');
    //Map.addLayer(cenajulho, rgbVisBandSpec, 'cena julho rgb');
    
    //Map.addLayer(image, vis2, 'testeplanet');
    
    print('cena:', cena) 
    
    var dadosClima = ee.ImageCollection(Clima.dadosClima)
    
    cena = cena.map(function(img){
      var date = ee.Date(img.get('system:time_start'))
      return img.set('year',date.get('year')).set('month',date.get('month'))
    })
    
    cena = cena.map(function(img){
      
      
      var chuvoso = dadosClima.filter(ee.Filter.eq('year',img.get('year')))
      .filter(ee.Filter.eq('month',img.get('month'))).first()
      img = img.multiply(0.0001)
      var seco = chuvoso.remap([0,1],[1,0])
      
      var  ndvi_chuvoso = img.expression("(b('N')-b('R'))/(b('N')+b('R'))").multiply(chuvoso).rename('ndvi_chuvoso');
      var  ndviB_chuvoso = img.expression("(b('R')-b('B'))/(b('R')+b('B'))").multiply(chuvoso).rename('ndviB_chuvoso');
      var  savi_chuvoso = img.expression("1.5*((b('N')-b('R')) /(b('N')+b('R')+0.5))").multiply(chuvoso).rename('savi_chuvoso');
      var  EXG_chuvoso = img.expression("(2*b('G'))-(b('R')+b('B'))").multiply(chuvoso).rename('EXG_chuvoso');
      var  GLI_chuvoso = img.expression("(b('G')*2-b('R')-b('B'))/(b('G')*2+b('R')+b('B'))").multiply(chuvoso).rename('GLI_chuvoso');
      var  EVI_chuvoso = img.expression("2.5*((b('N')-b('R'))/(b('N')+ (6*b('R'))- (7.5*b('B')) +0.5) )").multiply(chuvoso).rename('EVI_chuvoso');
      
      
      var  ndvi_seco = img.expression("(b('N')-b('R'))/(b('N')+b('R'))").multiply(seco).rename('ndvi_seco');
      var  ndviB_seco = img.expression("(b('R')-b('B'))/(b('R')+b('B'))").multiply(seco).rename('ndviB_seco');
      var  savi_seco = img.expression("1.5*((b('N')-b('R')) /(b('N')+b('R')+0.5))").multiply(seco).rename('savi_seco');
      var  EXG_seco = img.expression("(2*b('G'))-(b('R')+b('B'))").multiply(seco).rename('EXG_seco');
      var  GLI_seco = img.expression("(b('G')*2-b('R')-b('B'))/(b('G')*2+b('R')+b('B'))").multiply(seco).rename('GLI_seco');
      var  EVI_seco = img.expression("2.5*((b('N')-b('R'))/(b('N')+ (6*b('R'))- (7.5*b('B')) +0.5) )").multiply(seco).rename('EVI_seco');
        
      var new_img = img.addBands([
      ndvi_chuvoso, ndviB_chuvoso, savi_chuvoso, EXG_chuvoso,
      GLI_chuvoso, EVI_chuvoso, ndvi_seco, ndviB_seco, savi_seco,
      EXG_seco, GLI_seco, EVI_seco
    ])
     
      return new_img
    })
    
    
    
    
    print('Pos process',cena)
    
    
    
    
    var cena_min = cena.reduce(ee.Reducer.min())
    var cena_max = cena.reduce(ee.Reducer.max())
    var std = cena.reduce(ee.Reducer.stdDev())
    var cena_mean = cena.reduce(ee.Reducer.mean())
    var cena_perc = cena.reduce(ee.Reducer.percentile([15,30,45,60,80,90]))
    
    
    
    var amp = cena_max.subtract(cena_min).rename(["B_amp", "G_amp", "R_amp", "N_amp", "ndvi_chuvoso_amp", "ndviB_chuvoso_amp", "savi_chuvoso_amp", "EXG_chuvoso_amp", "GLI_chuvoso_amp", "EVI_chuvoso_amp", "ndvi_seco_amp", "ndviB_seco_amp", "savi_seco_amp", "EXG_seco_amp", "GLI_seco_amp", "EVI_seco_amp"])
    
    
    
    
    
    
    print('cena_min:', cena_min)
    //Map.addLayer(cena_min, vis_min, '2022-04 min');
    //Map.addLayer(cena_max, vis_max, '2022-04 max');
    
    var Lapig = require("users/nxgame2009/Modules:LapigModule")
    
    
    var cli_by_area = function(img){return img.clip(area_estudo)}
    
    
    var cena = cena.map(cli_by_area)
    
    //Map.addLayer(cena)
    
    
    
    var SRTM = Lapig.getSRTM()
    
    function maskS2clouds(image) {
      var qa = image.select('QA60');
    
      // Bits 10 and 11 are clouds and cirrus, respectively.
      var cloudBitMask = 1 << 10;
      var cirrusBitMask = 1 << 11;
    
      // Both flags should be set to zero, indicating clear conditions.
      var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
          .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
    
      return image.updateMask(mask).divide(10000);
    }
    
    var start = '2021-04-01'
    var end = '2021-08-30'
    var dataset_new = ee.ImageCollection('COPERNICUS/S2_SR')
                      .filterDate(start, end)
                      // Pre-filter to get less cloudy granules.
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                      .map(maskS2clouds)
                      .select('WVP','B9')
    var wvp = dataset_new.select('WVP')
    var b9 = dataset_new.select('B9')
    
    
    var bigcena = cena_perc.addBands(cena_min)
      //.addBands(cena_max)
      .addBands(std)
      //.addBands(cena_mean)
      .addBands(SRTM.elevation)
    
    //var bigcena = cena_perc.addBands(cena_min).addBands(cena_max).addBands(cena_mean)
    
    print('cena com todas as bandas',bigcena)
    // Selecionando as bandas
    var bands = bigcena.bandNames()
    var classe = 'class_id'
    
    // Criando amostras 
    var features1 = amostras//merge(cafe_geada).merge(arb_geada).merge(cafe)//.merge(silvi)//.merge(estrada)//.merge(arb)
    //print('amostras_1', features1)
    //Acurária 
    // Opcionalmente, faça alguma avaliação de precisão. Adicione uma coluna de
    // uniformes aleatórios para o conjunto de dados de treinamento.
    var withRandom = features1.filter(ee.Filter.neq(classe, null))
      .randomColumn('random');
    
    //Queremos reservar alguns dos dados para teste, para evitar overfitting do modelo.
    var split = 0.7;  // Aproximadamente 70% treinando, 30% testando.
    var trainingPartition = withRandom.filter(ee.Filter.lt('random', split));
    var testingPartition = withRandom.filter(ee.Filter.gte('random', split));
    
    //Map.addLayer(trainingPartition, {color: 'FF0000'}, 'trainingPartition',false)
    //Map.addLayer(testingPartition, {color: 'FFff00'}, 'testingPartition', false)
    
    var training = bigcena.select(bands).sampleRegions({
      collection: trainingPartition,
      properties: [classe],
      scale: 4.77,
      tileScale: 16
     });
     
     
    var training2 = bigcena.select(bands).sampleRegions({
      collection: testingPartition,
      properties: [classe],
      scale: 4.77,
      tileScale: 16
     });
    
    
    var withRandom = training.randomColumn('random');
    print('Com Random',withRandom.limit(500))
    
    var withRandom_2 = training2.randomColumn('random');
    print('Com Random',withRandom.limit(500))
    
    //Queremos reservar alguns dos dados para teste, para evitar overfitting do modelo.
    var split = 0.7;  // Aproximadamente 70% treinando, 30% testando.
    var trainingPartition = withRandom.filter(ee.Filter.lte('random', split));
    print('trainingPartition',trainingPartition.limit(500))
    var testingPartition = withRandom_2.filter(ee.Filter.lte('random', split));
    print('testingPartition',testingPartition.limit(500))
    
    // Treinado com 70% dos nossos dados..
    var trainedClassifier = ee.Classifier.smileRandomForest(rfNTrees, rfVarPersplit, 1, rfBagFraction).train({
      features: trainingPartition,
      classProperty: classe,
      inputProperties: bands
    });
    
    // Classifica o teste FeatureCollection.
    var test = testingPartition.classify(trainedClassifier);
    
    //Imprime a matriz de confusão.
    var confusionMatrix = test.errorMatrix(classe, 'classification');
    print('Confusion Matrix', confusionMatrix);
    
    var confMatrix = trainedClassifier.confusionMatrix()
    var OA = confMatrix.accuracy()
    var CA = confMatrix.consumersAccuracy()
    var Kappa = confMatrix.kappa()
    var PA = confMatrix.producersAccuracy()
    var Order = confMatrix.order()
    
    
    
    print(confMatrix,'Matriz de Confusão')
    print(OA,'Acurácia geral da validação:')
    print(Kappa,'Kappa ')
    //print(CA,'Acurácia do Consumidor ')
    print(PA,'Acurácia do Produtor ')
    print(Order,'Order')
    
    
    
    // Crie uma lista de features para cada métrica
    var metrics = ee.FeatureCollection([
      ee.Feature(null, {metric: 'Overall Accuracy', value: OA}),
      ee.Feature(null, {metric: 'Kappa', value: Kappa})
    ]);
    
    // Adicione as matrizes CA e PA (transformando-as em colunas)
    CA.toList(Order.length()).map(function(row, index) {
      metrics = metrics.merge(ee.FeatureCollection([
        ee.Feature(null, {metric: 'Consumer Accuracy ' + index, value: ee.Number(row)})
      ]));
    });
    PA.toList(Order).map(function(row, index) {
      metrics = metrics.merge(ee.FeatureCollection([
        ee.Feature(null, {metric: 'Producer Accuracy ' + index, value: ee.Number(row)})
      ]));
    });
    
    // Exportar a FeatureCollection como CSV para o Google Drive
    Export.table.toDrive({
      collection: metrics,
      description: 'Export_ConfusionMatrixMetrics',
      fileFormat: 'CSV'
    });
    
    
    
    
    
    
    
    //Imprima algumas informações sobre o classificador
    print('Random Forest, explained', trainedClassifier.explain());
    
    var classificado =  bigcena.select(bands).classify(trainedClassifier);
    
    print(classificado.int8())
    
    
    
    
    
    
    //Map.addLayer(classificado, {min: 0, max: 12, palette: ['pink', 'pink', 'pink','pink', 'red', 'white','yellow', 'green', 'pink','blue', 'pink', 'brown']},'Classificação Supervisionada');
    Map.addLayer(classificado, colors ,'Classificação Supervisionada');
    
    print(mpb)
    Map.addLayer(mpb.clip(area_estudo), colors,'MBP')
    
    
    
    Map.addLayer(amostras.map(function(f) {return f.buffer(1)}).reduceToImage({
        properties: ['class_id'],
        reducer: ee.Reducer.first()
    }), colors, 'Amostras')
    
    // Exportando a Classificação 
    Export.image.toDrive({
      image:classificado.int8(),
      description:'classifica_'+cluster+'_planet'+'_v3',
      scale:4.77,
     folder: 'Download_geeV2',
      region:area_estudo,
      maxPixels:1e13, 
      crs: 'EPSG:4674'
    })
    
    
    
    Export.image.toDrive({
      image:mpb.select('remapped').clip(area_estudo).int8(),
      description:'classifica_mpb_'+cluster+'_planet'+'_v3',
      scale:30,
     folder: 'Download_geeV2',
      region:area_estudo,
      maxPixels:1e13, 
      crs: 'EPSG:4674'
    })
    
    
    
    //Export.image.toDrive({
    //  image:bigcena,
    //  description:'Class_cafe_all_bands',
    //  scale:4.77,
    // folder: 'Download_gee',
    //  region:area_estudo,
    //  maxPixels:1e13, 
    //  crs: 'EPSG:4674'
    //})
    // Exportando como SHP
    //Export.table.toDrive({
    //  collection: geometry,
    //  description:'StudyArea_Atual',
    //  fileFormat: 'SHP'
    //});
    
    
    
    
    
    
    