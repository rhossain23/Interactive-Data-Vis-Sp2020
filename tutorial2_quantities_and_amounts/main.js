d3.csv("../data/squirrelActivities.csv", d3.autoType).then(data => {
    console.log(data);
  
    const width = window.innerWidth / 1.5,
      height = window.innerHeight * 0.9,
      paddingInner = 0.2,
      margin = { top: 10, bottom: 40, left: 40, right: 40 };
  
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.count)])
      .range([margin.left, width - margin.right]);
  
    const yScale = d3
      .scaleBand()
      .domain(data.map(d => d.activity))
      .range([margin.top, height - margin.bottom])
      .paddingInner(paddingInner);
  
    const yAxis = d3.axisRight(yScale).ticks(data.length);
  
    const svg = d3
      .select("#d3-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const rect = svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("y", d => yScale(d.activity))
      .attr("width", d => xScale(d.count))
      .attr("height", d => yScale.bandwidth())
      .attr("fill", "steelblue");
  
    const text = svg
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("y", d => yScale(d.activity) + (yScale.bandwidth() / 2))
      .attr("x", d => xScale(d.count))
      .text(d => d.count)
      .attr("dy", "0.5em");
  
    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(${margin.right - margin.left},0)`)
      .call(yAxis);
  });