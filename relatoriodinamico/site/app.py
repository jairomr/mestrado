from flask import Flask, render_template, jsonify, redirect
import geopandas as gpd
import pandas as pd
app = Flask(__name__)

@app.route('/')
def index():
    total = [{'index': 0, 'natural': 4.415011037527594, 'antropico': 95.58498896247241},
     {'index': 1, 'natural': 6.596020761245675, 'antropico': 93.40397923875432},
     {'index': 2, 'natural': 14.534181496094693, 'antropico': 85.46581850390531},
     {'index': 3, 'natural': 19.05781584582441, 'antropico': 80.94218415417558},
     {'index': 4, 'natural': 80.29279279279278, 'antropico': 19.707207207207208},
     {'index': 5, 'natural': 81.69611307420494, 'antropico': 18.303886925795055},
     {'index': 6, 'natural': 18.562231759656655, 'antropico': 81.43776824034335},
     {'index': 7, 'natural': 24.444444444444446, 'antropico': 75.55555555555556},
     {'index': 8, 'natural': 81.20567375886525, 'antropico': 18.794326241134748},
     {'index': 9, 'natural': 4.040404040404041, 'antropico': 95.95959595959596},
     {'index': 10, 'natural': 99.74338412189253, 'antropico': 0.2566158781074579},
     {'index': 11, 'natural': 97.49430523917997, 'antropico': 2.5056947608200453},
     {'index': 12, 'natural': 60.0, 'antropico': 40.0},
     {'index': 13, 'natural': 100.0, 'antropico': 0},
     {'index': 14, 'natural': 11.76470588235294, 'antropico': 88.23529411764704},
     {'index': 15, 'natural': 97.57794947668366, 'antropico': 2.4220505233163463},
     {'index': 16, 'natural': 70.96774193548386, 'antropico': 29.03225806451613},
     {'index': 17, 'natural': 95.4705286369867, 'antropico': 4.52947136301329},
     {'index': 18, 'natural': 73.79488602345245, 'antropico': 26.205113976547555},
     {'index': 19, 'natural': 77.95874049945712, 'antropico': 22.041259500542886},
     {'index': 20, 'natural': 73.79488602345245, 'antropico': 26.205113976547555},
     {'index': 21, 'natural': 73.79488602345245, 'antropico': 26.205113976547555}]

    gdf = gpd.read_file('data.gpkg')
    dados_api = gdf.join(pd.DataFrame(total), on='index', lsuffix='l').to_dict(orient='records')
    return render_template('list.html', relatorios=dados_api)

@app.route('/geometry/<int:project_id>')
def geometry(project_id):
    # Aqui você normalmente faria a chamada à API e obteria os dados
    # Para este exemplo, usaremos os dados simulados acima.
    gdf = gpd.read_file('data.gpkg')
    dados_api = gdf[gdf['index'] == project_id]
    print(dados_api)
    if len(dados_api) > 0:
        dados_api = dados_api.to_dict(orient='records')[0]

    print(dados_api)
    return render_template('index.html', dados=dados_api, project_id=project_id)



@app.route('/api/dados')  # Rota para fornecer os dados via API (opcional, mas útil)
def api_dados():
    # Aqui você faria a chamada real à sua API e retornaria os dados em JSON
    return jsonify(dados_api)

if __name__ == '__main__':
    app.run(debug=True)  # Execute em modo de depuração para facilitar o desenvolvimento