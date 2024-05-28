class Network {
    margin = {
        top: 10, right: 30, bottom: 30, left: 40
    }

    constructor(svg, width = 800, height = 500) {
        this.svg = svg;
        this.width = width;
        this.height = height;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.svg
            .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.height]);

        this.link = this.svg.append("g");
        this.node = this.svg.append("g");
    }

    update(nodeData, linkData) {
        this.simulation = d3.forceSimulation(nodeData)
            .force("link", d3.forceLink(linkData).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-80))
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .force('collide', d3.forceCollide(d => 10))

        this.link = this.link.attr("fill", "none")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(linkData)
            .join("path")
            .attr("stroke", 'black')
            .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);

        this.node = this.node.attr("fill", "currentColor")
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .selectAll("g")
            .data(nodeData)
            .join("g")
            .call(d3.drag()
                .on("start", (e, d) => {
                    if (!e.active) this.simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on("drag", this.dragged)
                .on("end", (e, d) => {
                    if (!e.active) this.simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }));

        this.node.append("circle")
            .data(nodeData)
            .attr("stroke", "white")
            .attr("stroke-width", 1.5)
            .attr("r", 15)
            .each(function (d) {
                d3.select(this)
                    .attr("fill", function (d) {
                        let nodeType = d.type;
                        if (nodeType === "start") {
                            return "green";
                        } else if (nodeType == "crash") {
                            return "red";
                        } else {
                            return "#6baed6";
                        }
                    })
                    .attr("r", d => {
                        let nodeType = d.type;
                        if (nodeType === "start" || nodeType === "crash") {
                            return 15;
                        }

                        return 12;
                    })
            });

        this.node.append("text")
            .attr("x", 15)
            .attr("y", "0.31em")
            .attr("font-size", "0.6em")
            .text(d => d.index)
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        this.simulation.on("tick", () => {
            this.link.attr("d", function (d) { return `M${d.source.x},${d.source.y} A0, 0 0 0, 1 ${d.target.x},${d.target.y}`; });
            this.node.attr("transform", d => `translate(${d.x},${d.y})`);
        });
    }

    dragStarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragEnded(event, d) {

        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

}