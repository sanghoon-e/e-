class Histogram {
    margin = {
        top: 30, right: 30, bottom: 70, left: 60
    }

    constructor(svg, width = 700, height = 500) {
        this.svg = svg;
        this.width = width;
        this.height = height;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g").style("font-size", "1.3em").attr("transform", "translate(0," + this.height + ")");;
        this.yAxis = this.svg.append("g").style("font-size", "1.3em");
        this.legend = this.svg.append("g");

        // barX
        this.xScale = d3.scaleBand()
            .range([0, this.width])
            .padding(0.2);
        // barY
        this.yScale = d3.scaleLinear().range([this.height, 0]);

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }

    update(nodeId) {
        const data = this.createBarDataSet(nodeId);

        this.xScale.domain(data.map(function (d) { return d.name; }));
        this.xAxis.call(d3.axisBottom(this.xScale))

        this.yScale.domain([0, d3.max(data, function (d) { return d.count })]);
        this.yAxis.transition().duration(1000).call(d3.axisLeft(this.yScale));

        this.container.selectAll("rect")
            .data(data)
            .join("rect")
            .transition()
            .duration(500)
            .attr("x", d => this.xScale(d.name))
            .attr("y", d => this.yScale(d.count))
            .attr("width", this.xScale.bandwidth())
            .attr("height", d => this.height - this.yScale(d.count))
            .attr("fill", "lightgray")

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .call(d3.axisBottom(this.xScale));

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .call(d3.axisLeft(this.yScale));
    }


    sortBy(field) {
        return function (a, b) {
            return (a[field] < b[field]) - (a[field] > b[field])
        };
    }

    createBarDataSet(nodeId) {
        let edges = testData.edges;
        let eventTypeDict = {};

        for (let i = 0; i < edges.length; i++) {
            let events = edges[i].events;
            for (let j = 0; j < events.length; j++) {
                let source = edges[i].source;

                if (nodeId !== 'all') {
                    if (source !== nodeId) {
                        continue;
                    }
                }
                let eventType = events[j].event_type;
                if (eventTypeDict.hasOwnProperty(eventType))
                    eventTypeDict[eventType] += 1
                else
                    eventTypeDict[eventType] = 1
            }
        }

        let dataSet = [];

        for (let k in eventTypeDict)
            dataSet.push({ "name": k, "count": eventTypeDict[k] })

        //dataSet.sort(this.sortBy('count'));
        dataSet.sort(sortBy('count'));
        
        return dataSet;
    }

}