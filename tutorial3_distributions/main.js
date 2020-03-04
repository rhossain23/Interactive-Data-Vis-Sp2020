const width = window.innerWidth * 0.8,
  height = window.innerHeight * 0.8,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 6;

let svg;
let xScale;
let yScale;

let state = {
  data: [],
  selectedPosition: "All",
};

d3.json("../data/barcaAttackers.json", d3.autoType).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

function init() {
  xScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.appearances))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.goals))
    .range([height - margin.bottom, margin.top]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  const selectElement = d3.select("#dropdown").on("change", function() {
    state.selectedPosition = this.value;
    draw();
  });

  selectElement
    .selectAll("option")
    .data(["All", "Center Forward", "Left Winger", "Right Winger", "Attacking Midfielder", "Second Striker"])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

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
    .text("Appearances");

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
    .text("Goals");
  draw();
}

function draw() {
  let filteredData = state.data;
  if (state.selectedPosition !== "All") {
    filteredData = state.data.filter(d => d.position === state.selectedPosition);
  }

  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.name)
    .join(
      enter =>
        enter
          .append("circle")
          .attr("class", "dot")
          .attr("stroke", "lightgrey")
          .attr("opacity", 0.7)
          .attr("fill", d => {
            if (d.position === "Center Forward") return "blue";
            else if (d.position === "Left Winger") return "red";
            else if (d.position === "Right Winger") return "purple";
            else if (d.position === "Attacking Midfielder") return "green";
            else return "orange";
          })
          .attr("r", radius)
          .attr("cy", d => height - margin.bottom)
          .attr("cx", d => xScale(d.appearances))
          .call(enter =>
            enter
              .transition()
              .delay(d => 2 * d.appearances)
              .duration(500)
              .attr("cy", d => yScale(d.goals))
          ),
      update =>
        update.call(update =>
          update
           .transition()
           .duration(10)
           .attr("stroke", "black")
           .transition()
           .duration(10)
           .attr("stroke", "lightgrey")
        ),
      exit =>
        exit.call(exit =>
          exit
            .transition()
            .delay(d => 2 * d.appearances)
            .duration(500)
            .attr("cy", margin.top)
            .remove()
        )
    );
}
