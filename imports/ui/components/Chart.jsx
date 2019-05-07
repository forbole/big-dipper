import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Tooltip } from 'reactstrap';
import { Axes, Components, Dataset, Interactions, Plots, Scales } from 'plottable';


export default class PChart extends Component{
    constructor(props){
        super(props);
        this.targetRef = React.createRef();
        this.tooltipRef = React.createRef();
        this.state = {
            tooltipTarget: '.chart_warpper',
            tooltipOpen: false,
            tooltipContent: null,
            tooltipPosition: null
        }
    }

    loadScales() {
        this.scales = {};

        const scales = this.props.scales;
        if (scales) {
            scales.forEach((scaleData) => {
                let scaleId = scaleData.scaleId;
                if (this.scales[scaleId])
                    throw`duplicate scaleId: ${scaleId}.`;

                let scale;
                switch (scaleData.type) {
                    case 'Linear':
                        scale = new Scales.Linear();
                        break;
                    case 'Log':
                        scale = new Scales.Log();
                        break;
                    case 'ModifiedLog':
                        scale = new Scales.ModifiedLog();
                        break;
                    case 'Time':
                        scale = new Scales.Time();
                        break;
                    case 'Category':
                        scale = new Scales.Category();
                        break;
                    case 'Color':
                        scale = new Scales.Color();
                        break;
                    case 'InterpolatedColor':
                        scale = new Scales.InterpolatedColor(scaleData.colorScale);
                        break;
                    default:
                        throw`${scaleData.type} is not a valid type for Scale.`;
                }
                if (scaleData.domain)
                    scale.domain(scaleData.domain);
                if (scaleData.range)
                    scale.range(scaleData.range);
                if (scaleData.ticks)
                    scale.ticks(ticks);
                this.scales[scaleId] = scale;
            });
        }
    }

    getScale(scaleId) {
        if (scaleId == null)
            return null;
        if (this.scales.hasOwnProperty(scaleId)) {
            return this.scales[scaleId];
        }
        throw`invalid scaleId: ${scaleId}`;
    }


    getComponent(componentId) {
        if (componentId == null)
            return null;
        if (this.components.hasOwnProperty(componentId)) {
            return this.components[componentId];
        }
        throw`invalid componentId: ${componentId}`;
    }

    loadPlots() {
        // TODO: move datasets outside of plot so plots can share dataset
        // TODO: add renderer('canvas') for supported types
        this.datasets = {};
        this.plotColorScales = {};
        this.props.components.plots.forEach((plotData) =>{
            let plotId = plotData.plotId;
            if (this.components[plotId])
                throw`duplicate componentId: ${plotId}.`;

            let plot;
            switch (plotData.type) {
                case 'Area':
                    plot = new Plots.Area();
                    break;
                case 'Bar':
                    plot = new Plots.Bar();
                    break;
                case 'ClusteredBar':
                    plot = new Plots.ClusteredBar();
                    break;
                case 'Line':
                    plot = new Plots.Line();
                    break;
                case 'Pie':
                    plot = new Plots.Pie();
                    break;
                case 'Rectangle':
                    plot = new Plots.Rectangle();
                    break;
                case 'Scatter':
                    plot = new Plots.Scatter();
                    break;
                case 'Segment':
                    plot = new Plots.Segment();
                    break;
                case 'StackedArea':
                    plot = new Plots.StackedArea();
                    break;
                case 'StackedBar':
                    plot = new Plots.StackedBar();
                    break;
                case 'Waterfall':
                    plot = new Plots.Waterfall();
                    break;
                default:
                    throw`${plotData.type} is not a valid type for Scale.`
            }
            if (plotData.type === 'Pie' && plotData.sectorValue)
                plot.sectorValue(plotData.sectorValue.value,
                                 this.getScale(plotData.sectorValue.scale));
            if (plotData.type !== 'Pie' && plotData.x)
                plot.x(plotData.x.value, this.getScale(plotData.x.scale));
            if (plotData.type !== 'Pie' && plotData.y)
                plot.y(plotData.y.value, this.getScale(plotData.y.scale));
            // TODO: use fill/stroke for different types of plots
            let hasFill = false
            let hasStroke = false;
            if (plotData.attrs)
                plotData.attrs.forEach((attrData) => {
                    plot.attr(attrData.attr, attrData.value,
                              this.getScale(attrData.scale))
                    hasFill = hasFill || attrData.attr == 'fill';
                    hasStroke = hasStroke || attrData.attr == 'stroke';
                });
            let allDatasetsHaveColor = true;
            if (plotData.datasets) {
                plotData.datasets.forEach((datasetData) => {
                    let datasetId = datasetData.datasetId;
                    if (this.datasets[datasetId])
                        throw`duplicate datasetId: ${datasetId}.`;
                    let dataset = new Dataset(
                        datasetData.data, {...datasetData, data:null});
                    this.datasets[datasetId] = dataset;
                    plot.addDataset(dataset);
                    allDatasetsHaveColor = allDatasetsHaveColor && !!datasetData.color;
                });
            }

            if (!hasFill && !hasStroke && allDatasetsHaveColor) {
                plot.attr('stroke', (d, i, ds) => ds.metadata().color);
            }

            /*if (plot.attr('fill') && plot.attr('fill').scale) {
                this.plotColorScales[plotId] = plot.attr('fill').scale;
            } else if (plot.attr('stroke') && plot.attr('stroke').scale) {
                this.plotColorScales[plotId] = plot.attr('stroke').scale;
            }*/

            if (plotData.interactions)
                this.loadInteractions(plotData.interactions, plot);
            if (plotData.tooltip)
                this.addTooltipQueue.push([plotData.tooltip, plot, plotId]);

            this.components[plotId] = plot;
        });
    }

    loadAxes() {
        this.props.components.axes.forEach((axisData) => {
            let axisId = axisData.axisId;
            if (this.components[axisId])
                throw`duplicate componentId: ${axisId}.`;

            let axis;
            switch (axisData.type) {
                case 'Category':
                    axis = new Axes.Category(
                        this.getScale(axisData.scale), axisData.orientation);
                    break;
                case 'Numeric':
                    axis = new Axes.Numeric(
                        this.getScale(axisData.scale), axisData.orientation);
                    break;
                case 'Time':
                    axis = new Axes.Time(
                        this.getScale(axisData.scale), axisData.orientation);
                    break;
                default:
                    throw`${axisData.type} is not a valid type for Axis.`
            }
            if (axisData.xAlignment)
                axis.xAlignment(axisData.xAlignment);
            if (axisData.yAlignment)
                axis.yAlignment(axisData.yAlignment);

            if (axisData.interactions)
                this.loadInteractions(axisData.interactions, axis);
            if (axisData.tooltip)
                this.addTooltipQueue.push([axisData.tooltip, axis, axisId]);

            this.components[axisId] = axis;
        });
    }

    loadLabels() {
        this.props.components.labels.forEach((labelData) => {
            let labelId = labelData.labelId;
            if (this.components[labelId])
                throw`duplicate componentId: ${labelId}.`;

            let label;
            switch (labelData.type) {
                case 'Axis':
                    label = new Label.Axis(labelData.text, labelData.angel);
                case 'Regular':
                    label = new Label.Regular(labelData.text, labelData.angel);
                case 'Title':
                    label = new Label.Title(labelData.text, labelData.angel);
                default:
                    throw`${labelData.type} is not a valid type for Label.`;
            }
            if (labelData.xAlignment)
                label.xAlignment(labelData.xAlignment);
            if (labelData.yAlignment)
                label.yAlignment(labelData.yAlignment);
            if (labelData.padding)
                label.padding(labelData.padding);


            if (labelData.interactions)
                this.loadInteractions(labelData.interactions, label);
            if (labelData.tooltip)
                this.addTooltipQueue.push([labelData.tooltip, label, labelId]);

            this.components[labelId] = label;
        });
    }

    loadGridlines() {
        this.props.components.gridlines.forEach((gridlineData) => {
            let gridId = gridlineData.gridlineId;
            if (this.components[gridId])
                throw`duplicate componentId: ${gridId}.`;

            let grid = new Components.Gridline(
                xScale=this.getScale(gradlineData.xScale),
                yScale=this.getScale(gradlineData.yScale));

            if (gridData.interactions)
                this.loadInteractions(gridData.interactions, grid);
            if (gridData.tooltip)
                this.addTooltipQueue.push([gridData.tooltip, grid, gridId]);

            this.components[gridId] = grid;
        });
    }

    loadLegends() {
        // TODO: should take PlotGroup as well
        this.props.components.legends.forEach((legendData) => {
            let legendId = legendData.legendId;
            let plotId = legendData.plotId;
            if (this.components[legendId])
                throw`duplicate componentId: ${legendId}.`;

            let legend;
            switch (legendData.type) {
                case 'Regular':
                    let domain = [];
                    let range = [];
                    legendData.plotIds.forEach((plotId) => {
                        let plot = this.getComponent(plotId);
                        plot.datasets().forEach((dataset) => {
                            let metadata = dataset.metadata();
                            domain.push(metadata.label);
                            range.push(metadata.color);
                        });
                    });
                    let colorScale = new Scales.Color().domain(domain).range(range);
                    legend = new Components.Legend(colorScale);
                    break;

                case 'InterpolatedColor':
                    legend = new Components.InterpolatedColorLegend(
                        this.getScale(legendData.colorScaleId));
                default:
                    throw`${legendData.type} is not a valid type for Legend.`
            }

            if (legendData.xAlignment)
                legend.xAlignment(legendData.xAlignment);
            if (legendData.yAlignment)
                legend.yAlignment(legendData.yAlignment);

            if (legendData.interactions)
                this.loadInteractions(legendData.interactions, legend);
            if (legendData.tooltip)
                this.addTooltipQueue.push([legendData.tooltip, legend, legendId]);

            this.components[legendId] = legend;
        });
    }

    loadGroups() {
        this.groups = {};
        this.props.components.groups.forEach((groupData) => {
            let groupId = groupData.groupId;
            if (this.components[groupId])
                throw`duplicate componentId: ${groupId}.`;

            let group;
            switch (groupData.type) {
                case 'Regular':
                    group = new Components.Group();
                    break;
                case 'Plot':
                    group = new Components.PlotGroup();
                    break;
                default:
                    throw`${groupData.type} is not a valid type for Group.`
            }
            groupData.components.forEach((componentId) =>
                group.append(this.getComponent(componentId)));

            if (groupData.interactions)
                this.loadInteractions(groupData.interactions, group);
            if (groupData.tooltip)
                this.addTooltipQueue.push([groupData.tooltip, group, groupId]);

            this.components[groupId] = group;
        });
    }

    loadComponents() {
        this.components = {};
        let components = this.props.components;
        if (components) {
            if (components.plots)
                this.loadPlots();
            if (components.axes)
                this.loadAxes();
            if (components.legends)
                this.loadLegends();
            if (components.labels)
                this.loadLabels();
            if (components.gridlines)
                this.loadGridlines();
            if (components.groups)
                this.loadGroups();
        }
    }

    attachClickInteraction(interactionData, component) {
        let interaction = new Interactions.Click();
        for (let action in interactionData) {
            switch (action) {
                case 'onClick':
                    interaction.onClick(interactionData[action].bind(null, component));
                    break;
                case 'onDoubleClick':
                    interaction.onDoubleClick(interactionData[action].bind(null, component));
                    break;
                default:
                    throw `invalid event ${action} for Click Interaction.`;
            }
        }
        interaction.attachTo(component);
    }

    attachDragInteraction(interactionData, component) {
        let interaction = new Interactions.Drag();
        for (let action in interactionData) {
            switch (action) {
                case 'onDragStart':
                    interaction.onDragStart(interactionData[action].bind(null, component));
                    break;
                case 'onDrag':
                    interaction.onDrag(interactionData[action].bind(null, component));
                    break;
                case 'onDragEnd':
                    interaction.onDragEnd(interactionData[action].bind(null, component));
                    break;
                default:
                    throw `invalid event ${action} for Drag Interaction.`;
            }
        }
        interaction.attachTo(component);

    }

    attachKeyInteraction(interactionData, component) {
        let interaction = new Interactions.Key();
        for (let action in interactionData) {
            switch (action) {
                case 'onKeyPress':
                    interaction.onKeyPress(interactionData[action].bind(null, component));
                    break;
                case 'onKeyRelease':
                    interaction.onKeyRelease(interactionData[action].bind(null, component));
                    break;
                default:
                    throw `invalid event ${action} for Key Interaction.`;
            }
        }
        interaction.attachTo(component);
    }

    attachPanZoomInteraction(interactionData, component) {
        let interaction = new Interactions.PanZoom();
        for (let action in interactionData) {
            switch (action) {
                case 'xScales':
                    interactionData[action].forEach((scaleId) =>
                        interaction.addXScale(this.getScale(scaleId)));
                    break;
                case 'yScales':
                    interactionData[action].forEach((scaleId) =>
                        interaction.addYScale(this.getScale(scaleId)));
                    break;
                default:
                    throw `invalid event ${action} for PanZoom Interaction.`;
            }
        }
        interaction.attachTo(component);
    }

    attachPointerInteraction(interactionData, component) {
        let interaction = new Interactions.Pointer();
        for (let action in interactionData) {
            switch (action) {
                case 'onPointerEnter':
                    interaction.onPointerEnter(interactionData[action].bind(null, component));
                    break;
                case 'onPointerExit':
                    interaction.onPointerExit(interactionData[action].bind(null, component));
                    break;
                case 'onPointerMove':
                    interaction.onPointerMove(interactionData[action].bind(null, component));
                    break;
                default:
                    throw `invalid event ${action} for Pointer Interaction.`;
            }
        }
        interaction.attachTo(component);
    }

    loadInteractions(interactions, component) {
        for (let interaction in interactions) {
            switch (interaction) {
                case 'Click':
                    this.attachClickInteraction(interactions[interaction], component);
                    break;
                case 'Drag':
                    this.attachDragInteraction(interactions[interaction], component);
                    break;
                case 'Key':
                    this.attachKeyInteraction(interactions[interaction], component);
                    break;
                case 'PanZoom':
                    this.attachPanZoomInteraction(interactions[interaction], component);
                    break;
                case 'Pointer':
                    this.attachPointerInteraction(interactions[interaction], component);
                    break;
                default:
                    throw`unrecognized interaction ${interaction}.`
            }

        };
    }

    addTooltip(tooltip, component, componentId) {
        let selection = component.foreground().append("circle").attrs({
            r:3,
            opacity:0,
            id: `${componentId}_tooltip`});
        let interaction = new Interactions.Pointer();
        interaction.onPointerMove((point) => {
            let closest = component.entityNearest(point);
            if (closest) {
                if (!this.state.tooltipPosition || this.state.tooltipPosition[0] != closest.position.x
                    || this.state.tooltipPosition[1] != closest.position.x) {
                    // workaround for tooltip updateTarget only does shallow comparison
                    let newSelection = selection.clone();
                    newSelection.attrs({
                        cx: closest.position.x,
                        cy: closest.position.y
                    });
                    selection.remove();
                    selection = newSelection;
                    this.setState({
                        tooltipTarget: newSelection.node(),
                        tooltipOpen: true,
                        tooltipContent: tooltip(component, point, closest),
                        tooltipContainer: component.foreground().node(),
                        tooltipPosition: [closest.position.x, closest.position.y]
                    })
                }
            } else {
                this.setState({
                    tooltipOpen: false,
                })
            }
        });
        interaction.attachTo(component);
    }

    createLayout() {
        let layout = this.props.layout;
        if (!Array.isArray(layout) || layout.length == 0 || !Array.isArray(layout[0])) {
            throw'layout must be a 2D array.';
        }
        this.table = new Components.Table(
            layout.map((row) => row.map((col) => this.getComponent(col))))
    }

    componentDidMount(){
        this.addTooltipQueue = [];
        this.loadScales();
        this.loadComponents();
        this.createLayout();
        this.table.renderTo(this.targetRef.current);
        this.addTooltipQueue.forEach((args) => this.addTooltip.bind(this).apply(null, args));
    }
    /*
    TODO: detach plots/eventlistener
    componentWillUnmount(){

    }
    */


    /*
    TODO: updates plots instead of rerender unless it updates target width/height
    TODO: add width/height as props
    shouldComponentUpdate(nextProps, nextState){
        return false;
    }
    */

    render(){
        return <div className='chart_warpper'>
            <div ref={this.targetRef} style={{width: '600px', height:'300px'}}/>
            <Tooltip target={this.state.tooltipTarget} isOpen={this.state.tooltipOpen} innerRef={this.tooltipRef}>{this.state.tooltipContent}</Tooltip>
        </div>;
    }
}

/*
props defintions:
{
    layout: [['component1Id','component2Id', 'component3Id']],
    scales: [{
        scaleId: 'string',
        type: 'Linear | Log | ModifiedLog | Time | Category | Color | '
              'InterpolatedColor',
        colorScale: 'linear| log | sqrt | pow', // for InterpolatedColor
        domain: [],
        range: [], // | REDS, BLUES, POSNEG for InterpolatedColor
        ticks: []
    }...],
    components: {
        plots: [{
            plotId: 'string',
            type: 'Area | Bar | ClusteredBar | Line | Pie | Rectangle | '
                  'Scatter | Segment | StackedArea | StackedBar | Waterfall',
            x: {
                value: 'any | function',
                scale: 'null | scaleId'
            },
            y: {
                value: 'any | function',
                scale: 'null | scaleId'
            },
            sectorValue: {
                value: 'any | function',
                scale: 'null | scaleId'
            },
            attrs: [{
                attr: 'string',
                value: 'any | function',
                scale: 'null | scaleId'
            }...],
            datasets: [{
                datasetId: 'string',
                label: '',
                color: ''
                data: [],
            }...],
            interactions: {
                Click: {
                    onClick: (component, point, event) => {},
                    onDoubleClick :(component, point, event) => {}
                }
                Drag: {
                    onDrag: (component, start, end) => {},
                    onDragEnd: (component, start, end) => {},
                    onDragStart: (component, start, end) => {},
                }
                Key: {
                    onKeyPress: (component, keyCode) => {},
                    onKeyRelease: (component, keyCode) => {},
                }
                PanZoom: {
                    xScales: ['scaleId'...],
                    yScales: ['scaleId'...]
                },
                Pointer: {
                    onPointerEnter: (component, point) => {},
                    onPointerExit: (component, point) => {},
                    onPointerMove: (component, point) => {},
                },
            },
            tooltip: (component, point, data) => {}`
        }...],
        axes: [{
            axisId: 'string',
            type: 'Category | Numeric | Time',
            scale: 'scaleId',
            orientation: 'bottom | left | right | top',
            xAlignment: 'left | center | right',
            yAlignment: 'top | center | bottom',
            interaction: {...},
            tooltip: (component, point, data) => {}`
        }...],
        legends: [{
            legendId: 'string',
            type: 'Regular | InterpolatedColor',
            plotIds: ['plotId'..],
            colorScaleId: 'scaleId',
            xAlignment: 'left | center | right',
            yAlignment: 'top | center | bottom',
            interaction: {...},
            tooltip: (component, point, data) => {}`
        }...],
        labels: [{
            labelId: 'string',
            type: 'Axis | Regular | Title',
            angle: 'number',
            padding: 'number',
            text: 'string',
            xAlignment: 'left | center | right',
            yAlignment: 'top | center | bottom',
            interaction: {...},
            tooltip: (component, point, data) => {}`
        }...],
        gridlines: [{
            gridlineId: 'string',
            xScale: 'scaleId',
            yScale: 'scaleId',
            interaction: {...},
            tooltip: (component, point, data) => {}`
        }...],
        groups: [{
            groupId: 'string',
            type: 'Regular | Plot',
            components: ['componentId'...],
            interaction: {...},
            tooltip: (component, point, data) => {}`
        }]

    }
}
E.g.

let layout = [
    ['yAxis', 'group', 'legend'],
    [null, 'xAxis', null]];
let scales = [{
    scaleId: 'xScale',
    type: 'Linear'
}, {
    scaleId: 'yScale',
    type: 'Linear'
}];
let components = {
    plots: [{
        plotId: 'plot',
        type: 'Line',
        x: {
            value: (ds) => ds.x,
            scale: 'xScale'
        },
        y: {
            value: (ds) => ds.y,
            scale: 'yScale'
        },
        datasets: [{
            datasetId: 'dataset1',
            label: 'set 1',
            color: 'RED',
            data: [
              { "x": 0, "y": 1 },
              { "x": 1, "y": 2 },
              { "x": 2, "y": 4 },
              { "x": 3, "y": 8 }
            ]
        }, {
            datasetId: 'dataset2',
            label: 'set 2',
            color: 'BLUE',
            data: [
              { "x": 0, "y": 5 },
              { "x": 1, "y": 1 },
              { "x": 2, "y": 6 },
              { "x": 3, "y": 9 }
            ]
        }]},
        {
        plotId: 'plot2',
        type: 'Line',
        x: {
            value: (ds) => ds.x,
            scale: 'xScale'
        },
        y: {
            value: 4,
            scale: 'yScale'
        },
        datasets: [{
            datasetId: 'dataset3',
            label: 'target',
            color: 'GREEN',
            data: [
              { "x": 0},
              { "x": 1},
              { "x": 2},
              { "x": 3}
            ]
        }]
    }],
    axes: [{
        axisId: 'xAxis',
        type: 'Numeric',
        scale: 'xScale',
        orientation: 'bottom',
        interactions: {
            PanZoom: {
                xScales: ['xScale']
            }
        }
    },{
        axisId: 'yAxis',
        type: 'Numeric',
        scale: 'yScale',
        orientation: 'left',
        interactions: {
            PanZoom: {
                yScales: ['yScale']
            }
        }
    }],
    groups: [{
        groupId: 'group',
        type: 'Plot',
        components: ['plot', 'plot2'],
        interactions: {
            Pointer: {
                onPointerMove: (component, point) => {
                    console.log(component.entityNearest(point));
                }
            }
        },
        tooltip: (component, point, data) => `(${data.datum.x},${data.datum.y})`
    }],
    legends: [{
        legendId: 'legend',
        type: 'Regular',
        plotIds: ['plot', 'plot2'],
    }]
};
<PChart layout={layout}, scales={scales}, components={components} />
*/