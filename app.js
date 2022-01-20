let BUTTONS_TO_REMOVE = ['toImage', 'lasso2d', 'zoomIn2d', 'zoomOut2d'];

let IMAGES = [
    {
    x: 0.45,
    y: 1,
    sizex: 0.15,
    sizey: 0.15,
    source: "https://raw.githubusercontent.com/CovidTrackerFr/covidtracker-data/master/images/covidtracker.svg",
    xanchor: "middle",
    xref: "paper",
    yanchor: "top",
    yref: "top"
    }
];

let MARGIN = {
    t: 0,
    b:40,
    r:0,
    l:50
};

let CONFIG = {responsive: true,
    displaylogo: false,
    locale: 'fr',
    showAxisDragHandles: true,
    modeBarButtonsToRemove: BUTTONS_TO_REMOVE};


/*
function printableNumber(x){
    x = Math.round(x);
    x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&nbsp;");
    x = x.replace('.', ',');
    return x
};

function buildChartHospitalisations(){
    //updateDataAdmissionsHopital();

    let data_nom = "hospitalisations";
    let jour_nom = data_France[data_nom].jour_nom;

    var trace2 = {
        x: data_France[jour_nom],
        y: data_France[data_nom].valeur,
        hovertemplate: '%{y:.1f} hospitalisations<br>%{x}<extra></extra>',
        mode: 'lines',
        type: 'scatter',
        fill: 'tozeroy',
        line: {
            color: 'rgba(209, 102, 21,1)',
            width: 3
        }
    };

    let N = data_France[jour_nom].length;
    let x_min = data_France[jour_nom][N-300];
    let x_max = data_France[jour_nom][N-1];
    let y_min = 0;
    let y_max = Math.max.apply(Math, data_France[data_nom].valeur);

    var layout = { 
        images: IMAGES,
        font: {size: 15},
        legend: {"orientation": "h"},
        annotations: [
            {
            x: x_max,
            y: data_France[data_nom].valeur[N-1],
            xref: 'x',
            yref: 'y',
            text: "<b>" + printableNumber(data_France[data_nom].valeur[N-1]) + " hosp.</b><br> (+ " + printableNumber(data_France[data_nom].valeur[N-1]-data_France[data_nom].valeur[N-8]) +" / sem.)",
            showarrow: true,
            font: {
                family: 'Helvetica Neue',
                size: 13,
                color: 'rgba(209, 102, 21,1)'
            },
            align: 'center',
            arrowhead: 2,
            arrowsize: 1,
            arrowwidth: 1.5,
            arrowcolor: 'rgba(209, 102, 21,1)',
            ax: -50,
            ay: -30,
            borderwidth: 1,
            borderpad: 2,
            bgcolor: 'rgba(256, 256, 256, 0.5)',
            opacity: 0.8
            }
        ],
        margin: MARGIN,
        xaxis: {
            tickfont: {size: 12},
            //range: [x_min, x_max],
        },
        yaxis: {
            range: [y_min, y_max]
        }
    };

    var data = [trace2];

    Plotly.newPlot('lits_hospitalisations', data, layout, CONFIG);
}
*/
function objectAsValues(object)
{
    var keys = Object.keys(object);
    keys.sort();
    var result = {'keys': [], 'values': []};
    for (let i = 0; i < keys.length; i++) {
        result['keys'].push(keys[i]);
        result['values'].push(object[keys[i]]);
    }

    return result;
}

function countAdmissions(myVar, line)
{
    if (!myVar[line.fields.date]) {
        myVar[line.fields.date] = 0;
    }

    myVar[line.fields.date] += line.fields.sc_pcr;

    return myVar;
}

function percent()
{
    notVaxFrom20to39 = {};
    vaxFrom20to39 = {};
    from60to79 = {};
    total = {};
    response.forEach(line => {
        total = countAdmissions(total, line);
        if ('[60,79]' === line.fields.age) {
            from60to79 = countAdmissions(from60to79, line);
        }

        if ('[20,39]' === line.fields.age) {
            if ('Non-vaccinés' === line.fields.vac_statut) {
                notVaxFrom20to39 = countAdmissions(notVaxFrom20to39, line);
            } else {
                vaxFrom20to39 = countAdmissions(vaxFrom20to39, line);
            }
        }
    });

    var notVaxFrom20to39 = objectAsValues(notVaxFrom20to39);
    var vaxFrom20to39 = objectAsValues(vaxFrom20to39);
    var from60to79 = objectAsValues(from60to79);
    var total = objectAsValues(total);

    total['values'].forEach((line, i) => {
        notVaxFrom20to39['values'][i] = (notVaxFrom20to39['values'][i] / total['values'][i]) * 100;
        vaxFrom20to39['values'][i] = (vaxFrom20to39['values'][i] / total['values'][i]) * 100;
        from60to79['values'][i] = (from60to79['values'][i] / total['values'][i]) * 100;
    });

    data = [
        {x: notVaxFrom20to39['keys'], y: notVaxFrom20to39['values'], mode: "lines", name: 'Non-vaccinés entre 20 et 39 ans'},
        {x: vaxFrom20to39['keys'], y: vaxFrom20to39['values'], mode: "lines", name: 'Vaccinés entre 20 et 39 ans'},
        {x: from60to79['keys'], y: from60to79['values'], mode: "lines", name: 'Entre 60 et 79 ans'},
        //{x: total['keys'], y: total['values'], mode: "lines", name: 'total'},
    ];
    var layout = {
        title: "Pourcentage par tranche d'age en soin critique",
        yaxis: { title: "Pourcentage"}
    };

    Plotly.newPlot("percent", data, layout);
}

function vaxVsNoVax()
{
    var vax = {};
    var notVax = {};

    response.forEach(line => {
        if ('Non-vaccinés' === line.fields.vac_statut) {
            if (!notVax[line.fields.date]) {
                notVax[line.fields.date] = 0;
            }

            notVax[line.fields.date] += line.fields.sc_pcr;
        } else {
            if (!vax[line.fields.date]) {
                vax[line.fields.date] = 0;
            }

            vax[line.fields.date] += line.fields.sc_pcr;            
        }
    });

    var vax = objectAsValues(vax);
    var notVax = objectAsValues(notVax);
    data = [
        {x: vax['keys'], y: vax['values'], mode: "lines", name: 'Vaccinés'},
        {x: notVax['keys'], y: notVax['values'], mode: "lines", name: 'Non-vaccinés'},
    ];
    var layout = {
        title: "Vaccinés VS non-vaccinés entrés en réanimation",
    };

    Plotly.newPlot("vaccinated_vs_not_vaccinated", data, layout);
}

function myGraph()
{
    console.log(response);


    let from20to39 = {};
    let from40to59 = {};
    let from60to79 = {};
    let from80 = {};

    response.forEach(line => {
        line.fields.sc_pcr = Math.round(line.fields.sc_pcr);

        switch (line.fields.age) {
            case "[20,39]":
                if (!from20to39[line.fields.date]) {
                    from20to39[line.fields.date] = 0;
                }
                from20to39[line.fields.date] += line.fields.sc_pcr;
                break;
            case "[40,59]":
                if (!from40to59[line.fields.date]) {
                    from40to59[line.fields.date] = 0;
                }
                from40to59[line.fields.date] += line.fields.sc_pcr;
                //console.log(line.fields.date, line.fields.sc_pcr, line.fields.age, from40to59[line.fields.date]);

                break;
            case "[60,79]":
                if (!from60to79[line.fields.date]) {
                    from60to79[line.fields.date] = 0;
                }
                from60to79[line.fields.date] += line.fields.sc_pcr;
                break;
            case "[80;+]":
                if (!from80[line.fields.date]) {
                    from80[line.fields.date] = 0;
                }
                from80[line.fields.date] += line.fields.sc_pcr;
                break;
        }
        //date0to19 = line.fields.age
    });

    //console.log(from20to39, from40to59, Object.keys(from20to39), Object.values(from20to39));
    //console.log(from40to59);
    console.log(from60to79);
    from20to39 = objectAsValues(from20to39);
    from40to59 = objectAsValues(from40to59);
    from60to79 = objectAsValues(from60to79);
    from80 = objectAsValues(from80);


    data = [
        {x: from20to39['keys'], type: 'histogram',y: from20to39['values'],  name: '20 à 39 ans'},
        {x: from40to59['keys'], type: 'histogram', y: from40to59['values'], name: '40 à 59 ans'},
        {x: from60to79['keys'], type: 'histogram', y: from60to79['values'], name: '60 à 79 ans'},
        {x: from80['keys'], type: 'histogram', y: from80['values'], name: '80 ans et plus'},
    ];
    var layout = {
        title: "Nombre de personnes en soins critiques par age en décembre",
        xaxis: {
            //autorange: true,
            //range: ['2021-01-01 06:00', '2022-01-15 18:00'],
            title: '',
            type: 'date'
        },

        updatemenus: [{
            x: 0.1,
            y: 1.15,
            xref: 'paper',
            yref: 'paper',
            yanchor: 'top',
            active: 0,
            showactive: true,
            buttons: [{
                args: ['xbins.size', 'M1'],
                label: 'Month',
                method: 'restyle',
            }, {
                args: ['xbins.size', 'M3'],
                label: 'Quater',
                method: 'restyle',
            }, {
                args: ['xbins.size', 'M6'],
                label: 'Half Year',
                method: 'restyle',
            }, {
                args: ['xbins.size', 'M12'],
                label: 'Year',
                method: 'restyle',
            }]
      }]
    };

    Plotly.newPlot("myPlot", data, layout);
}

/*
download_data();
function download_data(){
    var URL = 'https://raw.githubusercontent.com/CovidTrackerFr/covidtracker-data/master/data/france/stats/dataexplorer_compr_france.json';
    var request = new XMLHttpRequest();
    request.open('GET', URL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
        data_France = request.response;
        buildChartHospitalisations();
    }
}
*/

downloadPerAge();

function downloadPerAge() {
    var URL = 'https://gist.githubusercontent.com/rouffj/0f6822b6ae65438c00b532ea8d305d05/raw/18dcd1b9efda1c27519b4506dabf674119d57ce6/result-per-age.json';
   //var URL = 'https://gist.githubusercontent.com/rouffj/0f6822b6ae65438c00b532ea8d305d05/raw/aec0574f5a3886b6d19dab4ea00fad533a81ec9b/resultat-par-age-12-2021.json';
    var request = new XMLHttpRequest();
    request.open('GET', URL);
    request.responseType = 'json';
    request.send();
    request.onload = function() {
        response = request.response;
        Covid.download(response);
        myGraph();
        vaxVsNoVax();
        percent();
        //graphPerMonth();
    }
}


var Covid = {
    response: [],

    download: function(response) {
        this.response = response;
    },

    groupByAge: function() {

        return d3.nest()
            .key(function(item) { return item.fields.age; })
            .rollup(function(group) { return {
                count: d3.sum(group, function(item) { return item.fields.sc_pcr; })
                };
            })
            .entries(this.response)
        ;

    },

    groupByAgeAndVaccinationStatus: function() {

        var groupByAgeAndVaccination = d3.nest()
        .key(function(item) { return item.fields.age; })
        .key(function(item) { return 'Non-vaccinés' === item.fields.vac_statut; })
        .rollup(function(group) { return {
            count: d3.sum(group, function(item) { return item.fields.sc_pcr; })
            };
        })
        .entries(response)

        return groupByAgeAndVaccination;
    }
};