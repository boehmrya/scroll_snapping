jQuery(function($){
  // initialize animations
  AOS.init();

  // initialize d3 charts
  buildCharts();

  function buildCharts() {
    // flags for whether charts have appeared
    var sdChart = false;
    var sdChartEl = $('.speed-chart');

    var adoptChart = false;
    var adoptChartEl = $('.adoption-chart');

    var custChart = false;
    var custChartEl = $('.customers-chart');

    var infraChart = false;
    var infraChartEl = $('.infrastructure-chart');

    var costChart = false;
    var costChartEl = $('.cost-chart');

    // check if element is in the viewport
    var isInViewport = function(el) {
      var elementTop = el.offset().top;
      var elementBottom = elementTop + el.outerHeight();
      var viewportTop = jQuery(window).scrollTop();
      var viewportBottom = viewportTop + jQuery(window).height();
      return elementBottom > viewportTop && elementTop < viewportBottom;
    };

    $(window).on('load scroll', function() {
      var throttled = false;
      var delay = 250;

      // only run if we're not throttled
      if (!throttled) {
        if (!sdChart && isInViewport(sdChartEl)) {
          speedChart();
          sdChart = true;
        }

        if (!adoptChart && isInViewport(adoptChartEl)) {
          adoptionChart();
          adoptChart = true;
        }

        if (!custChart && isInViewport(custChartEl)) {
          customersChart();
          custChart = true;
        }

        if (!infraChart && isInViewport(infraChartEl)) {
          infrastructureChart();
          infraChart = true;
        }

        if (!costChart && isInViewport(costChartEl)) {
          costReduceChart();
          costChart = true;
        }

        // we're throttled!
        throttled = true;

        // set a timeout to un-throttle
        setTimeout(function() {
          throttled = false;
        }, delay);
      }
    });
  }

  function speedChart() {

    // Load in the data now...
    d3.csv("../data/data.csv", function(error, data) {
      var data, margin, width, height, viewBox, parseDate, x, y,
          tickLabels, xAxis, yAxis, initialArea, area, svg, chartwidth;

      //Get width of page
      //chartwidth = parseInt(d3.select(".speed-chart").style("width"));
      chartwidth = 1140;

      // Set the margins
      margin = {top: 20, right: 20, bottom: 40, left: 20},
      width = chartwidth - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
      viewBox = "0 0 1140 600";

      parseDate = d3.time.format("%Y").parse;

      // Setting up the scaling objects
      var x = d3.time.scale()
        .range([0, width]);

      // Same for the y axis
      var y = d3.scale.linear()
        .range([height, 0]);

    // Same for colour.
    var color = d3.scale.category10();

    tickLabels = ["2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2018"];

    //Setting x-axis up here using x scaling object
    var xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(function(d,i){ return tickLabels[i] })
      .orient("bottom");

    // Setting up a d3 line object - used to draw lines later
    var line = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.speed); });

    // Now to actually make the chart area
    var svg = d3.select(".speed-chart").append("svg")
      .attr("class", "svgele")
      .attr("id", "svgEle")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", viewBox)
      //.attr("width", width + margin.left + margin.right)
      //.attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


     color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

      // Take each row and put the date column through the parsedate form we've defined above.
      data.forEach(function(d) {
        d.date = parseDate(d.date);
      });

      // Building an object with all the data in it for each line
      projections = color.domain().map(function(name) {
        return {
          name: name,
          values: data.map(function(d) {
                 return {date: d.date, speed: +d[name]};
           })
        };
      });

      // Set the domain of the x-value
      x.domain(d3.extent(data, function(d) {
        return d.date;
      }));

      // Do the same for the y-axis...[0,800000] by looking at the minimum and maximum for the speed variable.
      y.domain([
        d3.min(projections, function(c) { return d3.min(c.values, function(v) { return v.speed; }); }),
        d3.max(projections, function(c) { return d3.max(c.values, function(v) { return v.speed; }); })
      ]);

      svg.append("path")

      // Bind the x-axis to the svg object
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      //create proj
      var proj = svg.selectAll(".proj")
          .data(projections)
          .enter()
          .append("g")
          .attr("class", "proj");

      // Drawing the lines
      proj.append("path")
        .attr("class", "line")
        .attr("id" , function(d, i) {
          return "line" + i;
        })
        .attr("stroke-linecap","round")
        .attr("d", function(d,i) {
          return line(d.values);
         })
        .style("stroke", function(d,i) {
          if (i < 12) {
            return "#5ac8e7";
          }
          else if (i < 24) {
            return "#E71B4F";
          }
          else {
            return "#8c489a";
          }
        });

       //Initially set the lines to not show
       d3.selectAll(".line").style("opacity",0);
       var chart = jQuery('.speed-chart');
       var barwidth = (chartwidth - 120) / 9;

       // 2007: 16 mbps
       svg.append("text")
         .attr("class", "speed num")
         .attr("y", height - 40)
         .attr("x", 4)
         .text("16");

       svg.append("text")
         .attr("class", "speed label")
         .attr("y", height - 20)
         .attr("x", 0)
         .text("MBPS");

       // 2009: 50 mbps
       svg.append("text")
         .attr("class", "speed num")
         .attr("y", height - 50)
         .attr("x", (barwidth * 2))
         .text("50");

       svg.append("text")
         .attr("class", "speed label")
         .attr("y", height - 30)
         .attr("x", (barwidth * 2) - 4)
         .text("MBPS");

       // 2011: 100 mbps
       svg.append("text")
         .attr("class", "speed num")
         .attr("y", height - 80)
         .attr("x", (barwidth * 4) + 12)
         .text("100");

       svg.append("text")
         .attr("class", "speed label")
         .attr("y", height - 60)
         .attr("x", (barwidth * 4) + 18)
         .text("MBPS");

       // 2012: 305 mbps
       svg.append("text")
         .attr("class", "speed num")
         .attr("y", height - 140)
         .attr("x", (barwidth * 5) + 20)
         .text("305")

       svg.append("text")
         .attr("class", "speed label")
         .attr("y", height - 120)
         .attr("x", (barwidth * 5) + 26)
         .text("MBPS");

       // 2013: 505 mbps
       svg.append("text")
         .attr("class", "speed num")
         .attr("y", height - 200)
         .attr("x", (barwidth * 6) + 30)
         .text("505");

       svg.append("text")
         .attr("class", "speed label")
         .attr("y", height - 180)
         .attr("x", (barwidth * 6) + 36)
         .text("MBPS");

       // 2015: 1 GB
       svg.append("text")
         .attr("class", "speed num")
         .attr("y", height - 340)
         .attr("x", (barwidth * 8) + 40)
         .text("1");

       svg.append("text")
         .attr("class", "speed label")
         .attr("y", height - 320)
         .attr("x", (barwidth * 8) + 30)
         .text("GBPS");

       // 2016: 2 GB
       svg.append("text")
         .attr("class", "speed num")
         .attr("y", 25)
         .attr("x", (barwidth * 9) + 10)
         .text("2");

       svg.append("text")
         .attr("class", "speed label")
         .attr("y", 45)
         .attr("x", (barwidth * 9))
         .text("GBPS");

        //Select All of the lines and process them one by one
   			d3.selectAll(".line").each(function(d,i) {

           if (i < 24) {
              d3.select(this).style("opacity","1");
           }
           else {
              d3.select(this).style("opacity","0.7");
           }

   			  // Get the length of each line in turn
   			  var totalLength = d3.select("#line" + i).node().getTotalLength();

   				d3.selectAll("#line" + i)
            .attr("stroke-dasharray", totalLength + " " + totalLength)
   				  .attr("stroke-dashoffset", totalLength)
   				  .transition()
   				  .duration(2000)
   				  .ease("linear") //Try linear, quad, bounce... see other examples here - http://bl.ocks.org/hunzy/9929724
   				  .attr("stroke-dashoffset", 0)
   				  .style("stroke-width",2);
   			});

       // reveal text
       d3.selectAll("svg.svgele text.speed")
         .transition()
         .delay(1000)
         .duration(3000)
         .style("opacity", 1);

     });
  }


  // broadband adoption chart
  function adoptionChart() {
    var data, margin, width, height, viewBox, parseDate, x, y,
        tickLabels, xAxis, yAxis, initialArea, area, svg;

    // broadband adoption data
    data = [{"year":"2000", "percent": 3},
            {"year":"2005", "percent": 32},
            {"year":"2010", "percent": 62},
            {"year":"2015", "percent": 68},
            {"year":"2020", "percent": 81}];

    // dimensions
    margin = {top: 20, right: 20, bottom: 80, left: 80};
    width = 1140 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    viewBox = "0 0 1140 500";

    parseDate = d3.time.format("%Y").parse;

    x = d3.time.scale()
        .range([0, width]);

    y = d3.scale.linear()
        .range([height, 0]);

    tickLabels = ["2000", "2005", "2010", "2015", "2019"];

    xAxis = d3.svg.axis()
        .ticks(5)
        .scale(x)
        .tickFormat(function(d,i){ return tickLabels[i] })
        .orient("bottom");

    yAxis = d3.svg.axis()
        .scale(y)
        .innerTickSize(-width)
        .outerTickSize(0)
        .orient("left");

    initialArea = d3.svg.area()
        //.x(function(d) { return x(d.year); })
        .x(0)
        .y0(height)
        .y1(height);

    area = d3.svg.area()
        .x(function(d) { return x(d.year); })
        .y0(height)
        .y1(function(d) { return y(d.percent); });

    svg = d3.select(".adoption-chart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", viewBox)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Take each row and put the date column through the parsedate form we've defined above.
    data.forEach(function(d) {
      d.year = parseDate(d.year);
    });

    x.domain(d3.extent(data, function(d) { return d.year; }));
    //y.domain(d3.extent(data, function(d) { return d.percent; }));
    y.domain([0,100]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("y", 60)
        .attr("x", 540)
        .attr("dy", ".71em")
        .attr("class", "axis-label")
        .style("text-anchor", "end")
        .text("Year");
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("x", -90)
        .attr("dy", ".71em")
        .attr("class", "axis-label")
        .style("text-anchor", "end")
        .text("Percentage of Households");
    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("fill", "#E71B4F")
        .attr("d", initialArea) // initial state (line at the bottom)
        .transition()
        .duration(2500)
        .ease("circle")
        .attr("d", area);
  }



  // broadband customers chart
  function customersChart() {
    var data, margin, width, height, viewBox, parseDate, x, y,
        tickLabels, xAxis, yAxis, initialArea, area, svg;

    // broadband adoption data
    data = [{"year":"2004", "customers": 22},
            {"year":"2005", "customers": 27},
            {"year":"2006", "customers": 31},
            {"year":"2007", "customers": 35},
            {"year":"2008", "customers": 39},
            {"year":"2009", "customers": 41},
            {"year":"2010", "customers": 43},
            {"year":"2011", "customers": 47},
            {"year":"2012", "customers": 49},
            {"year":"2013", "customers": 51},
            {"year":"2014", "customers": 54},
            {"year":"2015", "customers": 58},
            {"year":"2016", "customers": 62},
            {"year":"2017", "customers": 66}];

    // dimensions
    margin = {top: 20, right: 20, bottom: 80, left: 80};
    width = 1140 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    viewBox = "0 0 1140 500";

    parseDate = d3.time.format("%Y").parse;

    x = d3.time.scale()
        .range([0, width]);

    y = d3.scale.linear()
        .range([height, 0]);

    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    yAxis = d3.svg.axis()
        .scale(y)
        .innerTickSize(-width)
        .outerTickSize(0)
        .tickFormat(function(d,i) {
          if (d == 0) {
            return d;
          }
          else {
            return d + "M";
          }
        })
        .orient("left");

    initialArea = d3.svg.area()
        .x(function(d) { return x(d.year); })
        .y0(0)
        .y1(height);

    area = d3.svg.area()
        .x(function(d) { return x(d.year); })
        .y0(height)
        .y1(function(d) { return y(d.customers); });

    svg = d3.select(".customers-chart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", viewBox)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(d) {
      d.year = parseDate(d.year);
    });

    x.domain(d3.extent(data, function(d) { return d.year; }));
    y.domain([0,70]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("y", 60)
        .attr("x", 540)
        .attr("dy", ".71em")
        .attr("class", "axis-label")
        .style("text-anchor", "end")
        .text("Year");
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("x", -120)
        .attr("dy", ".71em")
        .attr("class", "axis-label")
        .style("text-anchor", "end")
        .text("Number of Customers");
    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("fill", "#5AC9E7")
        .attr("d", initialArea) // initial state (line at the bottom)
        .transition()
        .duration(1500)
        .ease("linear")
        .attr("d", area);
  }


  // infrastructure investment chart
  function infrastructureChart() {
    var data, margin, width, height, viewBox, parseDate, x, y,
        tickLabels, xAxis, yAxis, svg, bar;

    // broadband adoption data
    data = [{"year":"1999", "amount": 30},
            {"year":"2000", "amount": 40},
            {"year":"2001", "amount": 50},
            {"year":"2002", "amount": 55.8},
            {"year":"2003", "amount": 70},
            {"year":"2004", "amount": 80},
            {"year":"2005", "amount": 90},
            {"year":"2006", "amount": 100},
            {"year":"2007", "amount": 114.1},
            {"year":"2008", "amount": 130},
            {"year":"2009", "amount": 150},
            {"year":"2010", "amount": 170},
            {"year":"2011", "amount": 190},
            {"year":"2012", "amount": 206.6},
            {"year":"2013", "amount": 220},
            {"year":"2014", "amount": 235},
            {"year":"2015", "amount": 250},
            {"year":"2016", "amount": 265},
            {"year":"2017", "amount": 280},
            {"year":"2018", "amount": 290}];

    // dimensions
    margin = {top: 120, right: 20, bottom: 80, left: 80};
    width = 1140 - margin.left - margin.right;
    height = 600 - margin.top - margin.bottom;
    viewBox = "0 0 1140 600";

    parseDate = d3.time.format("%Y").parse;

    x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .05);

    y = d3.scale.linear()
        .range([height, 0]);

    xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(d3.time.format("%Y"))
        .orient("bottom");

    yAxis = d3.svg.axis()
        .scale(y)
        .tickFormat(function(d,i) {
          if (d == 0) {
            return d;
          }
          else {
            return d + "B";
          }
        })
        .orient("left");

    svg = d3.select(".infrastructure-chart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", viewBox)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(d) {
      d.year = parseDate(d.year);
    });

    x.domain(data.map(function(d) { return d.year; }));
    y.domain([0,300]);

    // add axes and labels
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("y", 60)
        .attr("x", 540)
        .attr("dy", ".71em")
        .attr("class", "axis-label")
        .style("text-anchor", "end")
        .text("Year");
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -80)
        .attr("x", -120)
        .attr("dy", ".71em")
        .attr("class", "axis-label")
        .style("text-anchor", "end")
        .text("Amount (Dollars)");

    // Bars
  bar = svg.selectAll(".chart-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", function(d) {
            var year = d.year.getFullYear();
            if ((year == 2002) || (year == 2007) || (year == 2012)) {
              return 'chart-bar blue';
            }
            else if (year == 2018) {
              return 'chart-bar red';
            }
            return 'chart-bar';
          }
        )
        .attr("x", function(d) { return x(d.year); })
        .attr("y", height)
        .attr("width", x.rangeBand())
        .attr("height", 0);

  bar.transition()
      .duration(3000)
      .ease("elastic")
      .delay(function(d, i) {
        return i / data.length * 1000;  // Dynamic delay (each item delays a little longer)
      })
      .attr("y", function(d) { return y(d.amount); })
      .attr("height", function(d) { return height - y(d.amount); })
      .each("end", function() {
        d3.selectAll(".text-group.reveal").attr("class", function(d) {
            var year = d.year.getFullYear();
            if ((year == 2002) || (year == 2007) || (year == 2012)) {
              return 'text-group reveal animated blue';
            }
            else if (year == 2018) {
              return 'text-group reveal animated red';
            }
        });
      });

  labelGroup = svg.selectAll(".text-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", function(d) {
        var year = d.year.getFullYear();
        if ((year == 2002) || (year == 2007) || (year == 2012)) {
          return 'text-group reveal blue';
        }
        else if (year == 2018) {
          return 'text-group reveal red';
        }
        return 'text-group hide';
    })
    .attr("x", function(d) { return x(d.year) + (x.rangeBand() / 2) })
    .attr("y", function(d){
      return y(d.amount) - 80;
    });

  /*Create the circle for each block */
  var circle = labelGroup.append("circle")
      .attr("r", function(d) { return 50; } )
      .attr("cx", function(d) { return d3.select(this.parentNode).attr('x'); })
      .attr("cy", function(d) { return d3.select(this.parentNode).attr('y'); } )
      .attr("class","text-circle");

  var textStat = labelGroup.append("text")
      .attr("x", function(d) { return d3.select(this.parentNode).attr('x'); })
      .attr("y", function(d) { return parseInt(d3.select(this.parentNode).attr('y')) - 3; } )
      .attr("class", "text-stat")
      .attr("text-anchor", "middle");

  textStat.append("tspan")
      .text("$")
      .attr("class", "text-stat-prefix")
      .attr("text-anchor", "middle");

  textStat.append("tspan")
      .text(function(d) { return d.amount; })
      .attr("class", "text-stat-number")
      .attr("text-anchor", "middle");

  textStat.append("tspan")
      .text("B")
      .attr("class", "text-stat-suffix")
      .attr("dx", 2)
      .attr("text-anchor", "middle");

  var textLabel = labelGroup.append("text")
      .text("Invested")
      .attr("x", function(d) { return d3.select(this.parentNode).attr('x'); })
      .attr("y", function(d) { return parseInt(d3.select(this.parentNode).attr('y')) + 17; } )
      .attr("class", "text-label")
      .attr("text-anchor", "middle");

  }


  // cost chart
  function costReduceChart() {
    var data, margin, width, height, viewBox, parseDate, x, y,
        maxCost, xAxis, svg, bar;

    // broadband adoption data
    data = [{"year":"2000", "cost": 28.13},
            {"year":"2020", "cost": 0.64}];

    // dimensions
    margin = {top: 0, right: 0, bottom: 50, left: 0};
    width = 690 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    viewBox = "0 0 690 500";

    parseDate = d3.time.format("%Y").parse;

    x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .025, 0);

    y = d3.scale.linear()
        .range([height, 0]);

    xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(d3.time.format("%Y"))
        .tickSize(0)
        .orient("bottom");

    svg = d3.select(".cost-chart").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", viewBox)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(d) {
      d.year = parseDate(d.year);
    });

    maxCost = d3.max(data, function(d) { return d.cost; });

    x.domain(data.map(function(d) { return d.year; }));
    y.domain([0, maxCost]);

    // add axes and labels
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Bars
  bar = svg.selectAll(".cost-chart-bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "cost-chart-bar")
        .attr("x", function(d) { return x(d.year); })
        .attr("y", height / 2)
        .attr("width", x.rangeBand())
        .attr("height", height / 2);

  bar.transition()
      .duration(2000)
      .ease("quad-in-out")
      .attr("y", function(d) { return y(d.cost); })
      .attr("height", function(d) { return height - y(d.cost); })
      .each("end", function() {
        d3.selectAll(".cost-chart-bar-label").attr("class", function(d) {
          var year = d.year.getFullYear();
          if (year == 2000) {
            return 'cost-chart-bar-label white reveal';
          }
          return 'cost-chart-bar-label red reveal';
        })
      });

  svg.selectAll(".cost-chart-bar-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", function(d) {
        var year = d.year.getFullYear();
        if (year == 2000) {
          return 'cost-chart-bar-label white';
        }
        return 'cost-chart-bar-label red';
    })
    .attr("x", function(d) { return x(d.year) + (x.rangeBand() / 2) })
    .attr("y", function(d){ return height - 100; })
    .text(function(d) { return '$' + d.cost; })
    .attr("text-anchor", "middle");

    $('.shape-wrap .box').addClass('full');

    $('.cost-percent-num .num').each(function () {
      var $this = $(this);
      $({ Counter: 0 }).animate({ Counter: $this.text() }, {
        duration: 2000,
        easing: 'swing',
        step: function () {
          $this.text(Math.ceil(this.Counter));
        }
      });
    });

  }


});
