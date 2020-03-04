d3.csv("../data/messiGoals.csv").then(data => {
  console.log("data", data);
  const table = d3.select("#d3-table");

  const thead = table.append("thead");
  thead
    .append("tr")
    .selectAll("th")
    .data(data.columns)
    .join("td")
    .text(d => d);

  const rows = table
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .join("tr");

  rows
    .selectAll("td")
    .data(d => Object.values(d))
    .join("td")
    .attr("class", d => +d > 30 ? 'greater-than-30' : null)
    .text(d => d);
});
