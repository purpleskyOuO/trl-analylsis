import { number } from '@amcharts/amcharts4/core';
import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// amCharts imports
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4plugins_wordCloud from '@amcharts/amcharts4/plugins/wordCloud';
import * as am4plugins_forceDirected from '@amcharts/amcharts4/plugins/forceDirected';

import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

import * as Highcharts from 'highcharts';
import { SeriesXrangeOptions } from 'highcharts';

import HighchartsExporting from 'highcharts/modules/exporting';
import { array } from '@amcharts/amcharts5';



import { parse } from 'papaparse';
import { unparse } from 'papaparse';
import * as Papa from 'papaparse';



// npm install --save-dev @types/papaparse

import { createObjectCsvWriter } from 'csv-writer';
import { log } from 'console';




HighchartsExporting(Highcharts);

@Component({
  selector: 'app-trl-analysis',
  templateUrl: './trl-analysis.component.html',
  styleUrls: ['./trl-analysis.component.scss']


})




export class TrlAnalysisComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private router: Router

  ) { }

  keyword: string = ''
  news_keyword: string = ''
  chartdata = [];

  new_keyword_chartdata = [];
  old_keyword_chartdata = [];
  keyword_chartdata3 = [];
  keyword_chartdata4 = [];

  year_range1=0
  year_range2=0
  year_range3=0
  year_range4=0

  min_project_year=0

  max_diff_year = 0
  news_count = []
  related_news_count_list=[]
  output_path: string = ''
  output_name: string = ''

  trl_output: Array<String> = [];

  newsisLoad: boolean = false;
  isLoad: boolean = false;


  newsList = [
    {
      title: 'News 1',
      time: '2022-05-01',
      abstract: 'This is a summary of News 1.'
    }
  ];

  filteredNewsList: Array<any> = [];

  filterNews(keyword: string) {
    this.filteredNewsList = this.filteredNewsList.filter(news => {
      return news.title.includes(keyword) || news.abstract.includes(keyword);
    });
  }

  ngOnInit(): void {


  }


  search_keyword(): void {

    

    // this.http.post('http://140.116.39.213:8000/api/search_keyword', {
    this.http.post('http://127.0.0.1:8000/api/search_keyword', { // 本地

      keyword: this.keyword
    }).subscribe((data: any) => {
      const keyword = data['keyword']
      const plan_year = data['plan_year']
      const project_count = data['project_count']
      this.max_diff_year = data['max_diff_year']
      const project_trl_fetch = data['project_trl_fetch']
      

      // 新聞計畫總數長條圖
      const options: Highcharts.Options = {
        chart: {
          type: 'column'
        },

        title: {
          text: keyword + '相關計畫與新聞數量'
        },
        xAxis: {
          categories: plan_year,
          crosshair: true
        },
        yAxis: [
          { // 左邊 Y 軸 (長條圖)
            min: 0,
            title: {
              text: '計畫件數'
            },
          },
          { // 右邊 Y 軸 (折線圖)
            min: 0,
            title: {
              text: '新聞篇數'
            },
            opposite: true
          }
        ],
        tooltip: {
          shared: true,
          formatter: function () {

            let tooltipText = `<strong>${this.x}</strong><br>`; // 取得 x 軸的值作為標題
            if (this.points) {
              tooltipText += `<span style="color:${this.points[0].color}">計畫件數: </span>${this.points[0].y} 件<br>`;
              tooltipText += `<span style="color:${this.points[1].color}">新聞篇數: </span>${this.points[1].y} 篇<br>`;

              for (const item of project_trl_fetch) {
                if (item[0] == `${this.x}`) {
                  tooltipText += `<p>已有 ` + item[1] + ` 的計畫</p><br>`; // 加入自定義文字
                }
              }
              // tooltipText += `<p>這裡是自定義文字</p>`; // 加入自定義文字
            }
            return tooltipText;

          
          }
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          },
        },

        series: [{
          name: '計畫',
          type: "column",
          data: project_count,
          yAxis: 0
        },
        {
          name: '相關新聞',
          type: 'line',
          // data: [175,	158,	122,	154,	177,	145,	152,	232,	293,	236,	282,	398,	1110,	2005,	2961,	3617,	3332,	4066,	3887,	2990,	2742,	2669,	2392,	2224,	2011,	1666,	1270,	1281,	1570],
          // data: [64, 93, 155, 714, 2523, 3541, 2878, 1948, 1509, 1218],
          data: this.news_count,
          yAxis: 1
        }]
      }
      const chart = Highcharts.chart('chart-container', options);

      // 技術應用之報導涵蓋度
      const related_news_options: Highcharts.Options = {
        chart: {
          type: 'column'
        },

        title: {
          text: keyword + '相關計畫與產學新聞報導涵蓋度'
        },
        xAxis: {
          categories: plan_year,
          crosshair: true
        },
        yAxis: [
          { // 左邊 Y 軸 (長條圖)
            min: 0,
            title: {
              text: '計畫件數'
            },
          },
          { // 右邊 Y 軸 (折線圖)
            min: 0,
            title: {
              text: '新聞篇數'
            },
            opposite: true
          }
        ],
        tooltip: {
          shared: true,          
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          },
        },

        series: [{
          name: '計畫',
          type: "column",
          data: project_count,          
          yAxis: 0
        },
        {
          name: '產學新聞',
          type: 'line',
          // data: [175,	158,	122,	154,	177,	145,	152,	232,	293,	236,	282,	398,	1110,	2005,	2961,	3617,	3332,	4066,	3887,	2990,	2742,	2669,	2392,	2224,	2011,	1666,	1270,	1281,	1570],
          // data: [64, 93, 155, 714, 2523, 3541, 2878, 1948, 1509, 1218],
          data: this.related_news_count_list,
          color:"orange",
          yAxis: 1
        }]
      }
      const  related_news = Highcharts.chart('related-news', related_news_options);

      this.newsisLoad = false;
      this.get_keyword_chartdata()
      
    })
  }
 
  get_news(): void {

    const keyword = (document.getElementById("search_keyword") as HTMLInputElement).value;
    this.keyword = keyword
    alert("搜尋相關新聞中，請稍後")

    this.newsisLoad = true;
    this.isLoad = true;

    const trl_output_area = document.getElementById("go-tech-scouting") as HTMLElement
    trl_output_area.hidden = false

    // this.http.post('http://140.116.39.213:8000/api/get_news', {
    this.http.post('http://127.0.0.1:8000/api/get_news', { // 本地
      keyword: this.keyword
    }).subscribe((data: any) => {
      this.news_count = data['news_count']
      this.related_news_count_list=data['related_news_count_list']
      console.log("this.related_news_count_list="+this.related_news_count_list)

      this.filteredNewsList = (data['news'] as any).map(
        (item: any) => {         
          
          return {
            title: item[0],
            news_link: 'https://udndata.com' + item[1],
            abstract: item[2],
            time: item[3]

          }
        }
      )
      this.search_keyword()
      

    })
    

  }


  get_diff_year(): void {
    let diff_year: number = 0
    diff_year = parseInt((document.getElementById("diff_year") as HTMLInputElement).value);
    this.max_diff_year = diff_year


    // 選取圖表容器元素
    const newChartContainer = document.getElementById('new-chart')!; // 使用非空斷言運算符
    // 清空圖表容器內的內容
    newChartContainer.innerHTML = '';
    // 選取圖表容器元素
    const oldChartContainer = document.getElementById('old-chart')!; // 使用非空斷言運算符
    // 清空圖表容器內的內容
    oldChartContainer.innerHTML = '';


    this.isLoad = true;
    this.get_keyword_chartdata()
  }

  get_keyword_chartdata(): void {
    // this.http.post('http://140.116.39.213:8000/api/get_keyword_co_occurrence',{
    this.http.post('http://127.0.0.1:8000/api/get_keyword_co_occurrence', { // 本地
      keyword: this.keyword,
      max_diff_year: this.max_diff_year
    })
      .subscribe((data: any) => {
        this.new_keyword_chartdata = data.new_rawData;
        this.old_keyword_chartdata = data.old_rawData;
        this.keyword_chartdata3 = data.rawData3;
        this.keyword_chartdata4 = data.rawData4;

        this.year_range1=data.year_range1;
        this.year_range2=data.year_range2;
        this.year_range3=data.year_range3;
        this.year_range4=data.year_range4;

        this.min_project_year=data.min_project_year;

        this.new_keyword_chart();
        this.old_keyword_chart();
        this.keyword_chart3();
        this.keyword_chart4()
      });
  }


  new_keyword_chart(): void {
    this.isLoad = false;
    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(
      'new-chart',
      am4plugins_forceDirected.ForceDirectedTree
    );
    //chart.legend = new am4charts.Legend();
    var networkSeries = chart.series.push(
      new am4plugins_forceDirected.ForceDirectedSeries()
    );

    chart.data = this.new_keyword_chartdata;

    // // Set up data fields
    networkSeries.dataFields.value = 'value';
    networkSeries.dataFields.name = 'name';
    networkSeries.dataFields.children = 'children';
    networkSeries.dataFields.id = 'name';
    networkSeries.dataFields.linkWith = 'link';

    networkSeries.minRadius = 25;
    networkSeries.maxRadius = 35;


    networkSeries.manyBodyStrength = -50;
    networkSeries.dataFields.color = 'color';
    networkSeries.colors.list = [am4core.color('#8888f1')];

    networkSeries.nodes.template.fillOpacity = 0.85;
    networkSeries.nodes.template.label.text = '{name}';

    networkSeries.nodes.template.label.adapter.add(
      'fill',
      function (fill, target) {
        return am4core.color('#000');
      }
    );
    networkSeries.nodes.template.label.adapter.add(
      'fontSize',
      function (fontSize, target) {
        if (target.dataItem) {
          switch (
          (
            target.dataItem as am4plugins_forceDirected.ForceDirectedSeriesDataItem
          ).level
          ) {
            case 0:
              return 18;
            case 1:
              return 13;
          }
        }
        return 13;
      }
    );

    //tooltip setting
    networkSeries.tooltip!.label.fill = am4core.color('#000');
    networkSeries.tooltip!.getFillFromObject = false;
    networkSeries.tooltip!.background.fill = am4core.color('#55a9f7');
    networkSeries.tooltip!.fontSize = 13;
    networkSeries.nodes.template.adapter.add(
      'tooltipText',
      function (text, target) {
        if (target.dataItem) {
          switch (target.dataItem.level) {
            case 0:
              return '「[bold]{name}[/]與[bold]{neighbors}[/]個關鍵詞';
            case 1:
              return '[bold]< {name} >[/]\n與[bold]{parent.name}[/]共同出現： [bold]{value}[/] 次';
          }
        }
        return text;
      }

    );

    networkSeries.nodes.template.circle.adapter.add(
      'fill',
      function (fill, target) {
        return am4core.color('#8888f1');
      }
    );
    networkSeries.nodes.template.circle.adapter.add(
      'stroke',
      function (fill, target) {
        if (
          (
            target.dataItem as am4plugins_forceDirected.ForceDirectedSeriesDataItem
          ).level > 0
        ) {
          return am4core.color('#8888f1');
        }
        return am4core.color('#8888f1');
      }
    );
    networkSeries.links.template.adapter.add('stroke', function (fill, target) {
      return am4core.color('#8888f1');
    });

    networkSeries.links.template.strokeOpacity = 0.5;
    networkSeries.links.template.strokeWidth = 0.6;
    networkSeries.links.template.distance = 1;
    networkSeries.links.template.adapter.add(
      'strokeWidth',
      function (width, target) {
        let from = target.source;
        let to = target.target;
        let widths = (from.dataItem.dataContext as any).linkWidths;
        if (widths && widths[to.dataItem.id as any]) {
          return widths[to.dataItem.id as any];
        }
        return width;
      }
    );

    networkSeries.links.template.tooltipText =
      '[bold]{source.label.currentText}[/] x [bold]{name}[/]：共同出現 [bold]{value}[/] 次';
    networkSeries.links.template.interactionsEnabled = true;

    var hoverState = networkSeries.links.template.states.create('hover');
    //hoverState.properties.strokeWidth = 3;
    hoverState.properties.strokeOpacity = 1;
    hoverState.properties.stroke = am4core.color('#E82E8E');

    networkSeries.nodes.template.events.on('over', function (event) {
      var node = event.target;
      networkSeries.links.each(function (link) {
        if (link.source.label.currentText == node.dataItem.id) {
          link.isHover = true;
        } else if (link.target.label.currentText == node.dataItem.id) {
          link.isHover = true;
        }
      });
    });

    networkSeries.nodes.template.events.on('out', function (event) {
      var node = event.target;
      networkSeries.links.each(function (link) {
        if (link.source.label.currentText == node.dataItem.id) {
          link.isHover = false;
        } else if (link.target.label.currentText == node.dataItem.id) {
          link.isHover = false;
        }
      });
    });

    //Friction and mobility
    networkSeries.events.on('inited', function () {
      networkSeries.animate(
        {
          property: 'velocityDecay',
          to: 0.85,
        },
        3000
      );
    });
  }

  old_keyword_chart(): void {
    this.isLoad = false;
    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(
      'old-chart',
      am4plugins_forceDirected.ForceDirectedTree
    );
    var networkSeries = chart.series.push(
      new am4plugins_forceDirected.ForceDirectedSeries()
    );

    chart.data = this.old_keyword_chartdata;

    // // Set up data fields
    networkSeries.dataFields.value = 'value';
    networkSeries.dataFields.name = 'name';
    networkSeries.dataFields.children = 'children';
    networkSeries.dataFields.id = 'name';
    networkSeries.dataFields.linkWith = 'link';

    networkSeries.minRadius = 22;
    networkSeries.maxRadius = 35;
    networkSeries.manyBodyStrength = -50;
    networkSeries.dataFields.color = 'color';
    networkSeries.colors.list = [am4core.color('#8888f1')];

    networkSeries.nodes.template.fillOpacity = 0.85;
    networkSeries.nodes.template.label.text = '{name}';

    networkSeries.nodes.template.label.adapter.add(
      'fill',
      function (fill, target) {
        return am4core.color('#000');
      }
    );
    networkSeries.nodes.template.label.adapter.add(
      'fontSize',
      function (fontSize, target) {
        if (target.dataItem) {
          switch (
          (
            target.dataItem as am4plugins_forceDirected.ForceDirectedSeriesDataItem
          ).level
          ) {
            case 0:
              return 18;
            case 1:
              return 13;
          }
        }
        return 13;
      }
    );

    //tooltip setting
    networkSeries.tooltip!.label.fill = am4core.color('#000');
    networkSeries.tooltip!.getFillFromObject = false;
    networkSeries.tooltip!.background.fill = am4core.color('#55a9f7');
    networkSeries.tooltip!.fontSize = 13;
    networkSeries.nodes.template.adapter.add(
      'tooltipText',
      function (text, target) {
        if (target.dataItem) {
          switch (target.dataItem.level) {
            case 0:
              return '「[bold]{name}[/]與[bold]{neighbors}[/]個關鍵詞';
            case 1:
              return '[bold]< {name} >[/]\n與[bold]{parent.name}[/]共同出現： [bold]{value}[/] 次';
          }
        }
        return text;
      }
    );

    networkSeries.nodes.template.circle.adapter.add(
      'fill',
      function (fill, target) {
        return am4core.color('#8888f1');
      }
    );
    networkSeries.nodes.template.circle.adapter.add(
      'stroke',
      function (fill, target) {
        if (
          (
            target.dataItem as am4plugins_forceDirected.ForceDirectedSeriesDataItem
          ).level > 0
        ) {
          return am4core.color('#8888f1');
        }
        return am4core.color('#8888f1');
      }
    );
    networkSeries.links.template.adapter.add('stroke', function (fill, target) {
      return am4core.color('#8888f1');
    });

    networkSeries.links.template.strokeOpacity = 0.5;
    networkSeries.links.template.strokeWidth = 0.6;
    networkSeries.links.template.distance = 1;
    networkSeries.links.template.adapter.add(
      'strokeWidth',
      function (width, target) {
        let from = target.source;
        let to = target.target;
        let widths = (from.dataItem.dataContext as any).linkWidths;
        if (widths && widths[to.dataItem.id as any]) {
          return widths[to.dataItem.id as any];
        }
        return width;
      }
    );

    networkSeries.links.template.tooltipText =
      '[bold]{source.label.currentText}[/] x [bold]{name}[/]：共同出現 [bold]{value}[/] 次';
    networkSeries.links.template.interactionsEnabled = true;

    var hoverState = networkSeries.links.template.states.create('hover');
    //hoverState.properties.strokeWidth = 3;
    hoverState.properties.strokeOpacity = 1;
    hoverState.properties.stroke = am4core.color('#E82E8E');

    networkSeries.nodes.template.events.on('over', function (event) {
      var node = event.target;
      networkSeries.links.each(function (link) {
        if (link.source.label.currentText == node.dataItem.id) {
          link.isHover = true;
        } else if (link.target.label.currentText == node.dataItem.id) {
          link.isHover = true;
        }
      });
    });

    networkSeries.nodes.template.events.on('out', function (event) {
      var node = event.target;
      networkSeries.links.each(function (link) {
        if (link.source.label.currentText == node.dataItem.id) {
          link.isHover = false;
        } else if (link.target.label.currentText == node.dataItem.id) {
          link.isHover = false;
        }
      });
    });

    //Friction and mobility
    networkSeries.events.on('inited', function () {
      networkSeries.animate(
        {
          property: 'velocityDecay',
          to: 0.85,
        },
        3000
      );
    });
  }


  keyword_chart3(): void {
    this.isLoad = false;
    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(
      'keyword-chart3',
      am4plugins_forceDirected.ForceDirectedTree
    );
    //chart.legend = new am4charts.Legend();
    var networkSeries = chart.series.push(
      new am4plugins_forceDirected.ForceDirectedSeries()
    );

    chart.data = this.keyword_chartdata3;


    // // Set up data fields
    networkSeries.dataFields.value = 'value';
    networkSeries.dataFields.name = 'name';
    networkSeries.dataFields.children = 'children';
    networkSeries.dataFields.id = 'name';
    networkSeries.dataFields.linkWith = 'link';

    networkSeries.minRadius = 25;
    networkSeries.maxRadius = 35;


    networkSeries.manyBodyStrength = -50;
    networkSeries.dataFields.color = 'color';
    networkSeries.colors.list = [am4core.color('#8888f1')];

    networkSeries.nodes.template.fillOpacity = 0.85;
    networkSeries.nodes.template.label.text = '{name}';

    networkSeries.nodes.template.label.adapter.add(
      'fill',
      function (fill, target) {
        return am4core.color('#000');
      }
    );
    networkSeries.nodes.template.label.adapter.add(
      'fontSize',
      function (fontSize, target) {
        if (target.dataItem) {
          switch (
          (
            target.dataItem as am4plugins_forceDirected.ForceDirectedSeriesDataItem
          ).level
          ) {
            case 0:
              return 18;
            case 1:
              return 13;
          }
        }
        return 13;
      }
    );

    //tooltip setting
    networkSeries.tooltip!.label.fill = am4core.color('#000');
    networkSeries.tooltip!.getFillFromObject = false;
    networkSeries.tooltip!.background.fill = am4core.color('#55a9f7');
    networkSeries.tooltip!.fontSize = 13;
    networkSeries.nodes.template.adapter.add(
      'tooltipText',
      function (text, target) {
        if (target.dataItem) {
          switch (target.dataItem.level) {
            case 0:
              return '「[bold]{name}[/]與[bold]{neighbors}[/]個關鍵詞';
            case 1:
              return '[bold]< {name} >[/]\n與[bold]{parent.name}[/]共同出現： [bold]{value}[/] 次';
          }
        }
        return text;
      }

    );

    networkSeries.nodes.template.circle.adapter.add(
      'fill',
      function (fill, target) {
        return am4core.color('#8888f1');
      }
    );
    networkSeries.nodes.template.circle.adapter.add(
      'stroke',
      function (fill, target) {
        if (
          (
            target.dataItem as am4plugins_forceDirected.ForceDirectedSeriesDataItem
          ).level > 0
        ) {
          return am4core.color('#8888f1');
        }
        return am4core.color('#8888f1');
      }
    );
    networkSeries.links.template.adapter.add('stroke', function (fill, target) {
      return am4core.color('#8888f1');
    });

    networkSeries.links.template.strokeOpacity = 0.5;
    networkSeries.links.template.strokeWidth = 0.6;
    networkSeries.links.template.distance = 1;
    networkSeries.links.template.adapter.add(
      'strokeWidth',
      function (width, target) {
        let from = target.source;
        let to = target.target;
        let widths = (from.dataItem.dataContext as any).linkWidths;
        if (widths && widths[to.dataItem.id as any]) {
          return widths[to.dataItem.id as any];
        }
        return width;
      }
    );

    networkSeries.links.template.tooltipText =
      '[bold]{source.label.currentText}[/] x [bold]{name}[/]：共同出現 [bold]{value}[/] 次';
    networkSeries.links.template.interactionsEnabled = true;

    var hoverState = networkSeries.links.template.states.create('hover');
    //hoverState.properties.strokeWidth = 3;
    hoverState.properties.strokeOpacity = 1;
    hoverState.properties.stroke = am4core.color('#E82E8E');

    networkSeries.nodes.template.events.on('over', function (event) {
      var node = event.target;
      networkSeries.links.each(function (link) {
        if (link.source.label.currentText == node.dataItem.id) {
          link.isHover = true;
        } else if (link.target.label.currentText == node.dataItem.id) {
          link.isHover = true;
        }
      });
    });

    networkSeries.nodes.template.events.on('out', function (event) {
      var node = event.target;
      networkSeries.links.each(function (link) {
        if (link.source.label.currentText == node.dataItem.id) {
          link.isHover = false;
        } else if (link.target.label.currentText == node.dataItem.id) {
          link.isHover = false;
        }
      });
    });

    //Friction and mobility
    networkSeries.events.on('inited', function () {
      networkSeries.animate(
        {
          property: 'velocityDecay',
          to: 0.85,
        },
        3000
      );
    });
  }


  keyword_chart4(): void {
    this.isLoad = false;
    /* Chart code */
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    var chart = am4core.create(
      'keyword-chart4',
      am4plugins_forceDirected.ForceDirectedTree
    );
    //chart.legend = new am4charts.Legend();
    var networkSeries = chart.series.push(
      new am4plugins_forceDirected.ForceDirectedSeries()
    );

    chart.data = this.keyword_chartdata4;

    // // Set up data fields
    networkSeries.dataFields.value = 'value';
    networkSeries.dataFields.name = 'name';
    networkSeries.dataFields.children = 'children';
    networkSeries.dataFields.id = 'name';
    networkSeries.dataFields.linkWith = 'link';

    networkSeries.minRadius = 25;
    networkSeries.maxRadius = 35;


    networkSeries.manyBodyStrength = -50;
    networkSeries.dataFields.color = 'color';
    networkSeries.colors.list = [am4core.color('#8888f1')];

    networkSeries.nodes.template.fillOpacity = 0.85;
    networkSeries.nodes.template.label.text = '{name}';

    networkSeries.nodes.template.label.adapter.add(
      'fill',
      function (fill, target) {
        return am4core.color('#000');
      }
    );
    networkSeries.nodes.template.label.adapter.add(
      'fontSize',
      function (fontSize, target) {
        if (target.dataItem) {
          switch (
          (
            target.dataItem as am4plugins_forceDirected.ForceDirectedSeriesDataItem
          ).level
          ) {
            case 0:
              return 18;
            case 1:
              return 13;
          }
        }
        return 13;
      }
    );

    //tooltip setting
    networkSeries.tooltip!.label.fill = am4core.color('#000');
    networkSeries.tooltip!.getFillFromObject = false;
    networkSeries.tooltip!.background.fill = am4core.color('#55a9f7');
    networkSeries.tooltip!.fontSize = 13;
    networkSeries.nodes.template.adapter.add(
      'tooltipText',
      function (text, target) {
        if (target.dataItem) {
          switch (target.dataItem.level) {
            case 0:
              return '「[bold]{name}[/]與[bold]{neighbors}[/]個關鍵詞';
            case 1:
              return '[bold]< {name} >[/]\n與[bold]{parent.name}[/]共同出現： [bold]{value}[/] 次';
          }
        }
        return text;
      }

    );

    networkSeries.nodes.template.circle.adapter.add(
      'fill',
      function (fill, target) {
        return am4core.color('#8888f1');
      }
    );
    networkSeries.nodes.template.circle.adapter.add(
      'stroke',
      function (fill, target) {
        if (
          (
            target.dataItem as am4plugins_forceDirected.ForceDirectedSeriesDataItem
          ).level > 0
        ) {
          return am4core.color('#8888f1');
        }
        return am4core.color('#8888f1');
      }
    );
    networkSeries.links.template.adapter.add('stroke', function (fill, target) {
      return am4core.color('#8888f1');
    });

    networkSeries.links.template.strokeOpacity = 0.5;
    networkSeries.links.template.strokeWidth = 0.6;
    networkSeries.links.template.distance = 1;
    networkSeries.links.template.adapter.add(
      'strokeWidth',
      function (width, target) {
        let from = target.source;
        let to = target.target;
        let widths = (from.dataItem.dataContext as any).linkWidths;
        if (widths && widths[to.dataItem.id as any]) {
          return widths[to.dataItem.id as any];
        }
        return width;
      }
    );

    networkSeries.links.template.tooltipText =
      '[bold]{source.label.currentText}[/] x [bold]{name}[/]：共同出現 [bold]{value}[/] 次';
    networkSeries.links.template.interactionsEnabled = true;

    var hoverState = networkSeries.links.template.states.create('hover');
    //hoverState.properties.strokeWidth = 3;
    hoverState.properties.strokeOpacity = 1;
    hoverState.properties.stroke = am4core.color('#E82E8E');

    networkSeries.nodes.template.events.on('over', function (event) {
      var node = event.target;
      networkSeries.links.each(function (link) {
        if (link.source.label.currentText == node.dataItem.id) {
          link.isHover = true;
        } else if (link.target.label.currentText == node.dataItem.id) {
          link.isHover = true;
        }
      });
    });

    networkSeries.nodes.template.events.on('out', function (event) {
      var node = event.target;
      networkSeries.links.each(function (link) {
        if (link.source.label.currentText == node.dataItem.id) {
          link.isHover = false;
        } else if (link.target.label.currentText == node.dataItem.id) {
          link.isHover = false;
        }
      });
    });

    //Friction and mobility
    networkSeries.events.on('inited', function () {
      networkSeries.animate(
        {
          property: 'velocityDecay',
          to: 0.85,
        },
        3000
      );
    });
  }

  // 讀取 csv 檔案
  handleFile() {
    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const contents = (e.target as FileReader).result as string;
        this.processCSV(contents);
      };
      reader.readAsText(file);
    }
    else {
      alert('未選擇檔案');
    }
  }

  processCSV(contents: string) {
    const parsedData = parse(contents, { header: true });
    const rows: Array<{ [key: string]: string }> = parsedData.data as Array<{ [key: string]: string }>;
    let project_info: Array<Array<string>> = [];

    for (let i = 0; i < rows.length - 1; i++) {
      const row = rows[i];

      let project_item: Array<string> = [];
      project_item.push(row.plan_no);
      project_item.push(row.title_ch);
      project_item.push(row.rep_Pabstract_ch + '。' + row.Pabstract_ch);
      project_info.push(project_item);
      // console.log("row.rep_Pabstract_ch"+row.rep_Pabstract_ch +'。'+ row.Pabstract_ch);

    }
    alert("開始預測，請稍等")


    this.http.post('http://127.0.0.1:8000/api/trl_predict', { //本地
      project_info: project_info,

    }).subscribe((data: any) => {
      alert("預測完成")
      // console.log(data['output_list'])
      const output_path = data['output_path']
      const output_name = data['output_name']

      this.output_path = output_path
      this.output_name = output_name
      const trl_output_area = document.getElementById("trl-output-area") as HTMLElement
      trl_output_area.hidden = false

    })

  }


  download_file(output_path: string, output_name: string) {

    const url = 'http://127.0.0.1:8000/api/download_file'; //本地
    const body = {
      output_path: output_path,
      output_name: output_name
    };

    this.http.post(url, body, { responseType: 'blob' })
      .subscribe((data: Blob) => {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = output_name;
        link.click();
        URL.revokeObjectURL(url);
      });
  }

  

  
  racing(): void{
    /**
     * ---------------------------------------
     * This demo was created using amCharts 5.
     * 
     * For more information visit:
     * https://www.amcharts.com/
     * 
     * Documentation is available at:
     * https://www.amcharts.com/docs/v5/
     * ---------------------------------------
     */

    // Data
    var allData: {
      [key: string]: {
        [key: string]: number;
      };
    } = {
      "2002": {
        "Friendster": 0,
        "Facebook": 0,
        "Flickr": 0,
        "Google Buzz": 0,
        "Google+": 0,
        "Hi5": 0,
        "Instagram": 0,
        "MySpace": 0,
        "Orkut": 0,
        "Pinterest": 0,
        "Reddit": 0,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 0,
        "WeChat": 0,
        "Weibo": 0,
        "Whatsapp": 0,
        "YouTube": 0
      },
      "2003": {
        "Friendster": 4470000,
        "Facebook": 0,
        "Flickr": 0,
        "Google Buzz": 0,
        "Google+": 0,
        "Hi5": 0,
        "Instagram": 0,
        "MySpace": 0,
        "Orkut": 0,
        "Pinterest": 0,
        "Reddit": 0,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 0,
        "WeChat": 0,
        "Weibo": 0,
        "Whatsapp": 0,
        "YouTube": 0
      },
      "2004": {
        "Friendster": 5970054,
        "Facebook": 0,
        "Flickr": 3675135,
        "Google Buzz": 0,
        "Google+": 0,
        "Hi5": 0,
        "Instagram": 0,
        "MySpace": 980036,
        "Orkut": 4900180,
        "Pinterest": 0,
        "Reddit": 0,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 0,
        "WeChat": 0,
        "Weibo": 0,
        "Whatsapp": 0,
        "YouTube": 0
      },
      "2005": {
        "Friendster": 7459742,
        "Facebook": 0,
        "Flickr": 7399354,
        "Google Buzz": 0,
        "Google+": 0,
        "Hi5": 9731610,
        "Instagram": 0,
        "MySpace": 19490059,
        "Orkut": 9865805,
        "Pinterest": 0,
        "Reddit": 0,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 0,
        "WeChat": 0,
        "Weibo": 0,
        "Whatsapp": 0,
        "YouTube": 1946322
      },
      "2006": {
        "Friendster": 8989854,
        "Facebook": 0,
        "Flickr": 14949270,
        "Google Buzz": 0,
        "Google+": 0,
        "Hi5": 19932360,
        "Instagram": 0,
        "MySpace": 54763260,
        "Orkut": 14966180,
        "Pinterest": 0,
        "Reddit": 248309,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 0,
        "WeChat": 0,
        "Weibo": 0,
        "Whatsapp": 0,
        "YouTube": 19878248
      },
      "2007": {
        "Friendster": 24253200,
        "Facebook": 0,
        "Flickr": 29299875,
        "Google Buzz": 0,
        "Google+": 0,
        "Hi5": 29533250,
        "Instagram": 0,
        "MySpace": 69299875,
        "Orkut": 26916562,
        "Pinterest": 0,
        "Reddit": 488331,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 0,
        "WeChat": 0,
        "Weibo": 0,
        "Whatsapp": 0,
        "YouTube": 143932250
      },
      "2008": {
        "Friendster": 51008911,
        "Facebook": 100000000,
        "Flickr": 30000000,
        "Google Buzz": 0,
        "Google+": 0,
        "Hi5": 55045618,
        "Instagram": 0,
        "MySpace": 72408233,
        "Orkut": 44357628,
        "Pinterest": 0,
        "Reddit": 1944940,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 0,
        "WeChat": 0,
        "Weibo": 0,
        "Whatsapp": 0,
        "YouTube": 294493950
      },
      "2009": {
        "Friendster": 28804331,
        "Facebook": 276000000,
        "Flickr": 41834525,
        "Google Buzz": 0,
        "Google+": 0,
        "Hi5": 57893524,
        "Instagram": 0,
        "MySpace": 70133095,
        "Orkut": 47366905,
        "Pinterest": 0,
        "Reddit": 3893524,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 0,
        "WeChat": 0,
        "Weibo": 0,
        "Whatsapp": 0,
        "YouTube": 413611440
      },
      "2010": {
        "Friendster": 0,
        "Facebook": 517750000,
        "Flickr": 54708063,
        "Google Buzz": 166029650,
        "Google+": 0,
        "Hi5": 59953290,
        "Instagram": 0,
        "MySpace": 68046710,
        "Orkut": 49941613,
        "Pinterest": 0,
        "Reddit": 0,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 43250000,
        "WeChat": 0,
        "Weibo": 19532900,
        "Whatsapp": 0,
        "YouTube": 480551990
      },
      "2011": {
        "Friendster": 0,
        "Facebook": 766000000,
        "Flickr": 66954600,
        "Google Buzz": 170000000,
        "Google+": 0,
        "Hi5": 46610848,
        "Instagram": 0,
        "MySpace": 46003536,
        "Orkut": 47609080,
        "Pinterest": 0,
        "Reddit": 0,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 0,
        "Twitter": 92750000,
        "WeChat": 47818400,
        "Weibo": 48691040,
        "Whatsapp": 0,
        "YouTube": 642669824
      },
      "2012": {
        "Friendster": 0,
        "Facebook": 979750000,
        "Flickr": 79664888,
        "Google Buzz": 170000000,
        "Google+": 107319100,
        "Hi5": 0,
        "Instagram": 0,
        "MySpace": 0,
        "Orkut": 45067022,
        "Pinterest": 0,
        "Reddit": 0,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 146890156,
        "Twitter": 160250000,
        "WeChat": 118123370,
        "Weibo": 79195730,
        "Whatsapp": 0,
        "YouTube": 844638200
      },
      "2013": {
        "Friendster": 0,
        "Facebook": 1170500000,
        "Flickr": 80000000,
        "Google Buzz": 170000000,
        "Google+": 205654700,
        "Hi5": 0,
        "Instagram": 117500000,
        "MySpace": 0,
        "Orkut": 0,
        "Pinterest": 0,
        "Reddit": 0,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 293482050,
        "Twitter": 223675000,
        "WeChat": 196523760,
        "Weibo": 118261880,
        "Whatsapp": 300000000,
        "YouTube": 1065223075
      },
      "2014": {
        "Friendster": 0,
        "Facebook": 1334000000,
        "Flickr": 0,
        "Google Buzz": 170000000,
        "Google+": 254859015,
        "Hi5": 0,
        "Instagram": 250000000,
        "MySpace": 0,
        "Orkut": 0,
        "Pinterest": 0,
        "Reddit": 135786956,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 388721163,
        "Twitter": 223675000,
        "WeChat": 444232415,
        "Weibo": 154890345,
        "Whatsapp": 498750000,
        "YouTube": 1249451725
      },
      "2015": {
        "Friendster": 0,
        "Facebook": 1516750000,
        "Flickr": 0,
        "Google Buzz": 170000000,
        "Google+": 298950015,
        "Hi5": 0,
        "Instagram": 400000000,
        "MySpace": 0,
        "Orkut": 0,
        "Pinterest": 0,
        "Reddit": 163346676,
        "Snapchat": 0,
        "TikTok": 0,
        "Tumblr": 475923363,
        "Twitter": 304500000,
        "WeChat": 660843407,
        "Weibo": 208716685,
        "Whatsapp": 800000000,
        "YouTube": 1328133360
      },
      "2016": {
        "Friendster": 0,
        "Facebook": 1753500000,
        "Flickr": 0,
        "Google Buzz": 0,
        "Google+": 398648000,
        "Hi5": 0,
        "Instagram": 550000000,
        "MySpace": 0,
        "Orkut": 0,
        "Pinterest": 143250000,
        "Reddit": 238972480,
        "Snapchat": 238648000,
        "TikTok": 0,
        "Tumblr": 565796720,
        "Twitter": 314500000,
        "WeChat": 847512320,
        "Weibo": 281026560,
        "Whatsapp": 1000000000,
        "YouTube": 1399053600
      },
      "2017": {
        "Friendster": 0,
        "Facebook": 2035750000,
        "Flickr": 0,
        "Google Buzz": 0,
        "Google+": 495657000,
        "Hi5": 0,
        "Instagram": 750000000,
        "MySpace": 0,
        "Orkut": 0,
        "Pinterest": 195000000,
        "Reddit": 297394200,
        "Snapchat": 0,
        "TikTok": 239142500,
        "Tumblr": 593783960,
        "Twitter": 328250000,
        "WeChat": 921742750,
        "Weibo": 357569030,
        "Whatsapp": 1333333333,
        "YouTube": 1495657000
      },
      "2018": {
        "Friendster": 0,
        "Facebook": 2255250000,
        "Flickr": 0,
        "Google Buzz": 0,
        "Google+": 430000000,
        "Hi5": 0,
        "Instagram": 1000000000,
        "MySpace": 0,
        "Orkut": 0,
        "Pinterest": 246500000,
        "Reddit": 355000000,
        "Snapchat": 0,
        "TikTok": 500000000,
        "Tumblr": 624000000,
        "Twitter": 329500000,
        "WeChat": 1000000000,
        "Weibo": 431000000,
        "Whatsapp": 1433333333,
        "YouTube": 1900000000
      }
    };


    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    var root = am5.Root.new("chartdiv");

    root.numberFormatter.setAll({
      numberFormat: "#a",

      // Group only into M (millions), and B (billions)
      bigNumberPrefixes: [
        { number: 1e6, suffix: "M" },
        { number: 1e9, suffix: "B" }
      ],

      // Do not use small number prefixes at all
      smallNumberPrefixes: []
    });

    var stepDuration = 2000;


    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);


    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "none",
      wheelY: "none"
    }));


    // We don't want zoom-out button to appear while animating, so we hide it at all
    chart.zoomOutButton.set("forceHidden", true);


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var yRenderer = am5xy.AxisRendererY.new(root, {
      minGridDistance: 20,
      inversed: true
    });
    // hide grid
    yRenderer.grid.template.set("visible", false);

    var yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0,
      categoryField: "network",
      renderer: yRenderer
    }));

    var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
      maxDeviation: 0,
      min: 0,
      strictMinMax: true,
      extraMax: 0.1,
      renderer: am5xy.AxisRendererX.new(root, {})
    }));

    xAxis.set("interpolationDuration", stepDuration / 10);
    xAxis.set("interpolationEasing", am5.ease.linear);


    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(am5xy.ColumnSeries.new(root, {
      xAxis: xAxis,
      yAxis: yAxis,
      valueXField: "value",
      categoryYField: "network"
    }));

    // Rounded corners for columns
    series.columns.template.setAll({ cornerRadiusBR: 5, cornerRadiusTR: 5 });

    // Make each column to be of a different color
    series.columns.template.adapters.add("fill", function (fill, target) {
      return chart.get("colors")?.getIndex(series.columns.indexOf(target));
    });

    series.columns.template.adapters.add("stroke", function (stroke, target) {
      return chart.get("colors")?.getIndex(series.columns.indexOf(target));
    });

    // Add label bullet
    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationX: 1,
        sprite: am5.Label.new(root, {
          text: "{valueXWorking.formatNumber('#.# a')}",
          fill: root.interfaceColors.get("alternativeText"),
          centerX: am5.p100,
          centerY: am5.p50,
          populateText: true
        })
      });
    });

    var label = chart.plotContainer.children.push(am5.Label.new(root, {
      text: "2002",
      fontSize: "8em",
      opacity: 0.2,
      x: am5.p100,
      y: am5.p100,
      centerY: am5.p100,
      centerX: am5.p100
    }));

    // Get series item by category
    function getSeriesItem(category: string) {
      for (var i = 0; i < series.dataItems.length; i++) {
        var dataItem = series.dataItems[i];
        if (dataItem.get("categoryY") == category) {
          return dataItem;
        }
      }
    }

    // Axis sorting
    function sortCategoryAxis() {
      // sort by value
      series.dataItems.sort(function (x, y) {
        return (y?.get("valueX") || 0) - (x?.get("valueX") || 0); // descending
        //return x.get("valueX") - y.get("valueX"); // ascending
      });

      // go through each axis item
      am5.array.each(yAxis.dataItems, function (dataItem) {
        const dataItemCategory = dataItem.get("category")
        if(dataItemCategory !== undefined){
          // get corresponding series item
        var seriesDataItem = getSeriesItem(dataItemCategory);

        if (seriesDataItem) {
          // get index of series data item
          var index = series.dataItems.indexOf(seriesDataItem);
          // calculate delta position
          var deltaPosition =
            (index - dataItem.get("index", 0)) / series.dataItems.length;
          // set index to be the same as series data item index
          if (dataItem.get("index") != index) {
            dataItem.set("index", index);
            // set deltaPosition instanlty
            dataItem.set("deltaPosition", -deltaPosition);
            // animate delta position to 0
            dataItem.animate({
              key: "deltaPosition",
              to: 0,
              duration: stepDuration / 2,
              easing: am5.ease.out(am5.ease.cubic)
            });
          }
        }
        }
        
      });
      // sort axis items by index.
      // This changes the order instantly, but as deltaPosition is set, they keep in the same places and then animate to true positions.
      yAxis.dataItems.sort(function (x, y) {
        return (x?.get("index") || 0) - (y?.get("index") || 0);
      });
    }

    var year = 2002;

    // update data with values each 1.5 sec
    var interval = setInterval(function () {
      year++;

      if (year > 2018) {
        clearInterval(interval);
        clearInterval(sortInterval);
      }

      updateData();
    }, stepDuration);

    var sortInterval = setInterval(function () {
      sortCategoryAxis();
    }, 100);

    function setInitialData() {
      var d = allData[year];

      for (var n in d) {
        series.data.push({ network: n, value: d[n] });
        yAxis.data.push({ network: n });
      }
    }

    function updateData() {
      var itemsWithNonZero = 0;

      if (allData[year]) {
        label.set("text", year.toString());

        am5.array.each(series.dataItems, function (dataItem) {
          var category = dataItem.get("categoryY");
          if(category !== undefined){
            var value = allData[year][category];
            if (value > 0) {
              itemsWithNonZero++;
            }
  
            dataItem.animate({
              key: "valueX",
              to: value,
              duration: stepDuration,
              easing: am5.ease.linear
            });
            dataItem.animate({
              key: "valueXWorking",
              to: value,
              duration: stepDuration,
              easing: am5.ease.linear
            });
          }
          

          
        });

        yAxis.zoom(0, itemsWithNonZero / yAxis.dataItems.length);
      }
    }

    setInitialData();
    setTimeout(function () {
      year++;
      updateData();
    }, 50);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);
      }
}


