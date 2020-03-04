const width = window.innerWidth * 0.8,
  height = window.innerHeight * 0.8,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5,
  default_selection = "Select a State";

let svg;
let xScale;
let yScale;
let yAxis;

let state = {
  data: [],
  selectedPlace: null,
};

d3.csv("../data/statePopulation.csv", d => ({
  year: new Date(d.Year, 0),
  place: d.Place,
  population: +d.Population,
})).then(raw_data => {
  state.data = raw_data;
  init();
});

function init() {
  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => d.year))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain([0, 2*d3.max(state.data, d => d.population)])
    .range([height - margin.bottom, margin.top]);

/*I added the 2* to the domain above because the dots/line/area would keep showing up at the top of the graph,
which looked ugly, and I couldn't figure out how else to shift the data down into the middle of the graph.*/

  const xAxis = d3.axisBottom(xScale).ticks(20);
  
  yAxis = d3
    .axisLeft(yScale)
    .ticks(5)
    .tickFormat(d3.format(",.2s"));

  const selectElement = d3.select("#dropdown").on("change", function() {
    state.selectedPlace = this.value;
    draw();
  });

  selectElement
    .selectAll("option")
    .data([
      ...Array.from(new Set(state.data.map(d => d.place))),
      default_selection,
    ])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  selectElement.property("value", default_selection);

  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Year");

  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Population");

  draw();
}

function draw() {
  let filteredData;
  if (state.selectedPlace !== null) {
    filteredData = state.data.filter(d => d.place === state.selectedPlace);
  }

  yScale.domain([0, 2*d3.max(filteredData, d => d.population)]);

  d3.select("g.y-axis")
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale));

const areaFunc = d3
    .area()
    .x(d => xScale(d.year))
    .y0(height - margin.bottom, margin.top)
    .y1(d => yScale(d.population));

  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.year)
    .join(
      enter =>
        enter
          .append("circle")
          .attr("class", "dot")
          .attr("r", radius)
          .attr("cy", height - margin.bottom)
          .attr("cx", d => xScale(d.year)),
      update => update,
      exit =>
        exit.call(exit =>
          exit
            .transition()
            .delay(d => d.year)
            .duration(500)
            .attr("cy", height - margin.bottom)
            .remove()
        )
    )
    .call(
      selection =>
        selection
          .transition()
          .duration(1000)
          .attr("cy", d => yScale(d.population))
    );

  const area = svg
    .selectAll("path.trend")
    .data([filteredData])
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "trend")
          .attr("opacity", 0),
      update => update,
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition()
        .duration(1000)
        .attr("opacity", 1)
        .attr("d", d => areaFunc(d))
    );
}
