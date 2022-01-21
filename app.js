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


const CURRENT_URL = new URL(location.href);

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

function unpack(rows, key) {
    return rows.map(function(row) { return row[key]; });
}

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

function myGraph()
{
    query = Covid.groupByAgeAndVaccinationStatus();
    const result = query.execute();

    const data = GraphBuilder.generateDataMultidimension(result, {true: 'Non-vaccinés', false: 'Vaccinés'});

    var layout = {
        title: "Nombre d'entrées en soins critiques par age et status vaccinal",
    };

    Plotly.newPlot("vaccinated_vs_not_vaccinated_by_age", data, layout);
}

function vaxVsNoVax()
{

    query = Covid.vaxVsNoVax();
    const result = query.execute();
    const data = GraphBuilder.generateData(result, {true: 'Non-vaccinés', false: 'Vaccinés'});

    var layout = {
        title: "Nombre d'entrées en soins critiques par status vaccinal",
        xaxis: {
            //autorange: true,
            //range: ['2021-01-01 06:00', '2022-01-15 18:00'],
            title: '',
            //type: 'date'
        },
    };

    Plotly.newPlot("vaccinated_vs_not_vaccinated", data, layout);
}

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
        TableBuilder.buildPercentVaxNotVax();
        TableBuilder.buildPercentPerAge();
        myGraph();
        vaxVsNoVax();
        //percent();
        //graphPerMonth();
    }
}


var Covid = {
    response: [],
    query: '',

    download: function(response) {
        this.response = response;
        this.query = d3.nest();
    },

    groupByAge: function() {

        this.query
            .key(function(item) { return item.fields.age; })
            .rollup(function(group) { return d3.sum(group, function(item) { return item.fields.sc_pcr; }); })
        ;

        return this;
    },

    groupByMonth: function() {
        this.query.key(function(item) {return item.fields.date.split('-')[0] + '-' + item.fields.date.split('-')[1]; });

        return this;
    },


    groupByDay: function() {
        this.query.key(function(item) {return item.fields.date; });

        return this;
    },

    execute: function(groupByDate = true) {
        if (groupByDate) {
            if ('month' === CURRENT_URL.searchParams.get('group')) {
                this.groupByMonth();
            } else {
                this.groupByDay();
            }
        }

        var rows = this.query.sortKeys(d3.ascending).entries(this.response);
        this.query = d3.nest(); // reset query

        return rows;
    },

    vaxVsNoVax: function() {
        this.query
        .key(function(item) { return 'Non-vaccinés' === item.fields.vac_statut; })
        .rollup(function(group) {
            return d3.sum(group, function(item) { return item.fields.sc_pcr; })
            //return d3.mean(group, function(item) { console.log(arguments) ;return item.fields.sc_pcr })
        });

        return this;
    },

    all: function() {
        this.query
        .rollup(function(group) { 
            return d3.sum(group, function(item) { return item.fields.sc_pcr; })
        });

        return this;
    },

    groupByAgeAndVaccinationStatus: function() {

        this.query
        .key(function(item) { return item.fields.age; })
        .key(function(item) { return 'Non-vaccinés' === item.fields.vac_statut; })
        .rollup(function(group) { 
            return d3.sum(group, function(item) { return item.fields.sc_pcr; })
        });

        return this;
    }
};

var GraphBuilder = {
    generateDataMultidimension: function(d3Result, labels) {
        const data = [];
        d3Result.forEach(item => {
            item.values.forEach(item2 => {
                data.push({
                    name: item['key'] + ' - ' + labels[item2['key']],
                    x: unpack(item2['values'], 'key'),
                    y: unpack(item2['values'], 'values'),
                });
            });
        });
        
        return data;
    },

    generateData: function(d3Result, labels) {
        const data = [];
        d3Result.forEach(item => {
            console.log('ll', item);
            data.push({
                name: (labels) ? labels[item['key']] : item['key'],
                x: unpack(item['values'], 'key'),
                y: unpack(item['values'], 'values'),
            });
        });

        return data;
    }
}

var TableBuilder = {
    buildPercentVaxNotVax: function() {
        const all = Covid.all().groupByMonth().execute(false);
        const vaxStatuses = Covid.vaxVsNoVax().groupByMonth().execute(false);

        var rows = [];
        var headers = [];

        // build headers
        all.forEach(month => {
            headers.push(month.key);
        });

        vaxStatuses.forEach(vaxStatus => {
            var row = [];
            vaxStatus.values.forEach((month, monthIndex) => {
                row.push({
                    all: Math.round(all[monthIndex].values),
                    number: month.values,
                    percent: month.values / Math.round(all[monthIndex].values),
                });
            });
            rows.push(row);
        });

        this.buildTable('#table_vax_vs_notvax', headers, rows, ['Vaccinés', 'Non vaccinés']);
    },

    buildPercentPerAge() {
        const all = Covid.all().groupByMonth().execute(false);
        const ages = Covid.groupByAgeAndVaccinationStatus().groupByMonth().execute(false);

        var rows = [];
        var headers = [];
        var label = '';

        // build headers
        all.forEach(month => {
            headers.push(month.key);
        });

        // build rows
        ages.forEach((age) => {
            age.values.forEach((vaxStatus, i) => {
                let row = [];
                vaxStatus.values.forEach((month, monthI) => {
                    row.push({
                        all: Math.round(all[monthI].values),
                        number: Math.round(month.values),
                        percent: month.values / all[monthI].values
                    });
                });
                // add new row
                rows.push(row);
            });
        });
        console.log('buildPercentPerAge', ages, rows);

        labels = [
            '[0 - 19] AVEC vaccin',
            '[0 - 19] SANS vaccin',
            '[20 - 39] AVEC vaccin',
            '[20 - 39] SANS vaccin',
            '[40 - 59] AVEC vaccin',
            '[40 - 59] SANS vaccin',
            '[60 - 79] AVEC vaccin',
            '[60 - 79] SANS vaccin',
            '[80+] AVEC vaccin',
            '[80+] SANS vaccin',
        ];

        this.buildTable('#table_percent_age', headers, rows, labels);
    },

    buildTable: function(tableSelector, headers, rows, labels = []) {
        const tbody = document.querySelector(tableSelector).querySelector('tbody');
        const thead = document.querySelector(tableSelector).querySelector('thead');

        // build headers
        let htmlHead = '';
        headers.forEach(function(month, i) {
            if (labels.length > 0 && i === 0) {
                htmlHead += '<th></th>';                
            }
            htmlHead += '<th>'+ month+'</th>';
        });

        let htmlBody = '';
        rows.forEach((row, i) => {
            htmlBody += '<tr>';
            if (labels[i]) { htmlBody += '<td>'+ labels[i] +'</td>'; }
            row.forEach(function(column) {
                htmlBody += '<td title="'+column.number+' / '+column.all+' personnes">'+ Math.round(column.percent*100) +'%</td>';
            });
            htmlBody += '</tr>';
        });

        thead.insertAdjacentHTML('afterbegin', htmlHead);
        tbody.insertAdjacentHTML('afterbegin', htmlBody);
    }
}