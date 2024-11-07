var trmm = ee.ImageCollection("JAXA/GPM_L3/GSMaP/v7/operational")

var years = ee.List.sequence(2018,2023)
var months = ee.List.sequence(1,12)

var prep_month = ee.ImageCollection.fromImages(
  years.map(function(year){
    return months.map(function(month){
      var prep_filter = trmm.filter(ee.Filter.calendarRange(year,year,'year'))
      .filter(ee.Filter.calendarRange(month,month,'month')).sum();
      
      return prep_filter.set('year',year)
      .set('month',month)
      .set('system:time_start',ee.Date.fromYMD(year,month,1).millis())
      
    })
    
  }).flatten()
  )




var anos = ee.ImageCollection.fromImages(years.map(function(year){
  var mean_year = prep_month.filter(ee.Filter.eq('year',year)).mean()
  return months.map(function(month){
    
    return mean_year.subtract(prep_month.filter(ee.Filter.eq('year',year))
  .filter(ee.Filter.eq('month',month)).max()).expression("b('hourlyPrecipRate') <= 0 ?1 :0").clip(geometry).rename('ischuvoso')
  .set('year',year)
      .set('month',month)
      .set('system:time_start',ee.Date.fromYMD(year,month,1).millis())
  
})
}).flatten())

exports.doc = 'Seco e chuvoso'

exports.dadosClima = anos



