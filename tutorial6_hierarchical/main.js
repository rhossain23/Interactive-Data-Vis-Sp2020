const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;

let state = {
  data: null,
  hover: null,
  mousePosition: null,
};

d3.json("../data/flare.json", d3.autotype).then(data => {
  state.data = data;
  init();
});

function init() {
  const container = d3.select("#d3-container").style("position", "relative");

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  tooltip = container
    .append("div")
    .attr("class", "tooltip")
    .attr("width", 100)
    .attr("height", 100)
    .style("position", "absolute");
  
  const colorScale = d3.scaleOrdinal(d3.schemeSet3);

  const root = d3
    .hierarchy(state.data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  const packGen = d3
    .pack()
    .size([width, height])
    .padding(5);

  packGen(root);

  const node = svg
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

    node
      .append("circle")
      .attr("r", d => d.r)
      .attr("fill", d => colorScale(d.height))
      .on("mouseover", d => {
        state.hover = {
          translate: [
            d.x + 1,
            d.y - 500,
          ],
          name: d.data.name,
          value: d.data.value,
          title: `${d
            .ancestors()
            .reverse()
            .map(d => d.data.name)
            .join("/")}`,
        };
        draw();
      });
    draw();
  }

function draw() {
  if (state.hover) {
    tooltip
      .html(
        `
        <div>Name: ${state.hover.name}</div>
        <div>Value: ${state.hover.value}</div>
        <div>Hierarchy Path: ${state.hover.title}</div>
      `
      )
      .transition()
      .duration(500)
      .style(
        "transform",
        `translate(${state.hover.translate[0]}px,${state.hover.translate[1]}px)`
      );
  }
}
