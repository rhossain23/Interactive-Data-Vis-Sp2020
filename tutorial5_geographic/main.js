const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;

let state = {
  geojson: null,
  extremes: null,
  hover: {
    latitude: null,
    longitude: null,
    state: null,
  },
};

Promise.all([
  d3.json("../data/us-state.json"),
  d3.csv("../data/usHeatExtremes.csv", d3.autoType),
]).then(([geojson, extremes]) => {
  state.geojson = geojson;
  state.extremes = extremes;
  console.log("state: ", state);
  init();
});

function init() {
  const projection = d3.geoAlbersUsa().fitSize([width, height], state.geojson);
  const path = d3.geoPath().projection(projection);

 svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .selectAll(".state")
    .data(state.geojson.features)
    .join("path")
    .attr("d", path)
    .attr("class", "state")
    .attr("fill", "lightblue");

  svg
    .selectAll("circle")
    .data(state.extremes)
    .join("circle")
    .attr("class", "dot")
    .attr("r", 3)
    .attr("fill", "red")
    .attr("cx", function(d) {
      return projection([d.Long, d.Lat])[0];
    })
    .attr("cy", function(d) {
      return projection([d.Long, d.Lat])[1];
    })
    .on("mouseover", d => {
      const [mx, my] = d3.mouse(svg.node());
      const proj = projection.invert([mx, my]);
      state.hover["Longitude"] = proj[0];
      state.hover["Latitude"] = proj[1];
      state.hover["State"] = d.State;
      draw();
    });
}

function draw() {
  hoverData = Object.entries(state.hover);
  d3.select("#hover-content")
    .selectAll("div.row")
    .data(hoverData)
    .join("div")
    .attr("class", "row")
    .html(
      d =>
        d[1]
          ? `${d[0]}: ${d[1]}`
          : null
    );
}
