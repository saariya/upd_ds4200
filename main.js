const svg = d3.select("svg"),
      margin = { top: 40, right: 20, bottom: 100, left: 60 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

d3.csv("dataset.csv").then(data => {
    data.forEach(d => d.popularity = +d.popularity);

    const artistMap = d3.rollup(
        data,
        v => d3.mean(v, d => d.popularity),
        d => d.artists
    );

    const topArtists = Array.from(artistMap, ([artist, avgPopularity]) => ({ artist, avgPopularity }))
        .sort((a, b) => d3.descending(a.avgPopularity, b.avgPopularity))
        .slice(0, 10);

    const x = d3.scaleBand()
        .domain(topArtists.map(d => d.artist))
        .range([0, width])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(topArtists, d => d.avgPopularity)])
        .nice()
        .range([height, 0]);

    chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

    chart.append("g")
        .call(d3.axisLeft(y));

    chart.selectAll(".bar")
        .data(topArtists)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.artist))
        .attr("y", d => y(d.avgPopularity))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.avgPopularity))
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(`<strong>${d.artist}</strong><br>Popularity: ${d.avgPopularity.toFixed(1)}`)
                   .style("left", event.pageX + "px")
                   .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", () => tooltip.transition().duration(300).style("opacity", 0));
});
