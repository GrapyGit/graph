function creatRange(range1, range2){//функция формирует диапазон
    return [range1, range2]
   }
   
   let range =creatRange('2018-06-15','2018-06-16') //записываем диапазон
   
   graphDiv = document.getElementById('tester');
   
   let trace = {
     x: range,
     y: [],
     type: 'scatter',
     mode: 'lines',
     name: "План добычи",
    fill: 'tozeroy',
    fillcolor: 'rgba(220, 238, 254, 0.5)',
     line: {
       color: '74bafc',
       width: 2,
     }
   },
   trace1 = {
     x: [],
     y:[],
     mode: 'lines+markers',
     name: 'Добыто (сутки)',
     type: 'scatter',
     hover_name : "Добыто (сутки)",
     line: {color: "rgb(199, 35, 179)", width: 3, shape: 'linear'},
     hovertemplate :'%{x} <br>' + 'Добыто(сутки): %{y}' +"<extra></extra>",
     hoverlabel : {
       bgcolor: 'white',
       bordercolor: 'rgb(199, 35, 179)'
     }
   },
   trace2 = {
     x: new Array(24),
     y: new Array(24).fill(0),
       type: 'bar',
       name: 'Добыто (час)',
      marker: {
           color: 'rgb(142, 237, 132)',
       },
       hovertemplate :'%{x}  <br>' + 'Добыто (час): %{y}' +"<extra></extra>",
       hoverlabel : {
         bgcolor: 'white',
         bordercolor: 'rgb(142, 237, 132)'
     },
   },
   trace3 = {
     x: [range[0], range[0] +" 23:59:00"],
     y:[0,0],
     mode: 'lines+markers+text',
     name: 'Прогноз добычи',
     line: {color: "rgb(255, 164, 38)", width: 3,  dash: 'dot'},
     textposition: 'top left',
     textfont: {
       family: 'cursive',
       size: 18,
     },
     hoverlabel : {
         bgcolor: 'white',
         bordercolor: 'rgb(255, 164, 38)'
     },
     hovertemplate :'%{x}<br>' + 'Прогноз добычи: %{y}' +"<extra></extra>",
   }
   config = {//задаю русский язык 
     locale: 'ru',
     displayModeBar: false,
     responsive: true,
     showlegend: true,
   },
   data = [trace2,trace,trace3,trace1];
   layout = {
     hovermode:'closest',
     margin: { t: 60,b:0, r: 90},
     title : {
       text : 'Скважина 1-1',
       font:{size:26, family: "cursive"},
       automargin: true,
   },
     font:{ size:16
     },
     xaxis: {
       tickformat: '%H:%M\n%a %B %d %Y',
       range: range, 
       type: 'date',
       tickmode: "linear", 
       tick0: range[0],
       dtick:  2 * 60 * 60 * 1000, 
       showgrid: false,
       zeroline: false,
     },
     yaxis: {
       automargin: true,
       ticksuffix: "тыс.м",
       title: {
        text:"Добыто",
        font:{ 
         size: 20,
         family: ""
       },
       },
       showline: false,
       gridwidth: 2
     },
     legend: {
       orientation : "h",
       y: -0.1,
       x: 0.4,
       traceorder: 'reversed'
     },
   }
   Plotly.newPlot( graphDiv, data,layout,config);
   //Добавление значений
   setValue(40, "2018-06-15 09:30:00");
   setValue(18, "2018-06-15 05:01:00");
   setValue(19, "2018-06-15 06:00:00");
   setValue(36, "2018-06-15 09:14:00");
   setValue(32, 1529038860000 );//1529038860000 тоже самое, что и 2018-06-15 08:01:00
   setValue(31, "2018-06-15 07:22:00");
   setPlane(100)
   
   function setPlane(value){//функция назначения плана добычи
     trace.y = [value,value]
     proverka()
     Plotly.newPlot( graphDiv, data, layout,config);
   }
   
   function setValue(value, times){//функция добавления значений добыто (сутки)
     var bufferArray = new Array(24).fill(0), hours =0, buffer =0
     times= new Date(times)
     for (i=0;i<trace1.x.length;i++){//находим индекс элемента, в который добавим значение
         if (trace1.x[i]>times){
           break;
         }
       }
     trace1.x.splice(i, 0 , times)//добавляем время со сдвигом
     trace1.y.splice(i, 0 , value)//добавляем значение добыто со сдвигом
     trace3.x[0] = trace1.x[trace1.x.length-1]
     trace3.y[0] = trace1.y[trace1.y.length-1]
     for (i=0;i<trace1.x.length;i++){
       while(trace1.x[i].getHours() !=hours && hours!=24) hours++//записываем значение по часам
       bufferArray[hours]= trace1.y[i]
      }
     for(i=0; i<=24; i++){
         if (bufferArray[i]){//записываем значения в массив с добыто в час
             trace2.y[i] = bufferArray[i]-buffer//из значения вычетаем предыдущее(так находим значение добычи в час)
             trace2.x[i] = range[0] +" "+ i +":00:00"
             buffer = bufferArray[i]           
         }
       }
     /*считаем прогноз добычи(считаем среднию добычу её
      умножаем на оставшееся время, а к получившемуся 
      прибавляем  последнеt по времени значение)
     */
     trace3.y[1] = Math.round(trace1.y[trace1.y.length-1] + (trace1.y[trace1.y.length-1]/trace1.x[trace1.x.length-1].getHours())*(24 - trace1.x[trace1.x.length-1].getHours()))
     proverka()
     trace3.text = [trace3.y[0],trace3.y[1]] 
     Plotly.react(graphDiv, data);
   }
   function proverka(){
     if (trace3.y[1]<trace.y[0]) {//проверяем больше ли прогноз, чем планка на сегодня
       trace3.line.color = "red"
       trace3.hoverlabel.bordercolor = "red"
     }
     else{
       trace3.line.color = "rgb(255, 164, 38)"
       trace3.hoverlabel.bordercolor = "rgb(255, 164, 38)"
     }
   }
   //The End