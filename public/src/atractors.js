var width = w = window.innerWidth,
  height = h = window.innerHeight,
  link,
  node,
  svg,
  force,
  circle,
  container,
  label,
  zoom,
  drag,
  currentSelected,
  espacio = 3,
  rules = 0,
  idx = 0,
  selected= 0,
  max5 = 203,
  max5_2 = 90,
  max5_3 = 147,
  select_5 = 0,
  changes = [];
atractoresB3S23 = {
  2:{
    0: "https://api.jsonbin.io/b/5ffb912ff98f6e35d5fada2d/2",
  },
  3: {
    0: "https://api.jsonbin.io/b/5ffb9ba568f9f835a3dd8a9d"
  },
  4: {
    0: "/atractores/4/b3s23/graph4_1.json",
    1: "/atractores/4/b3s23/graph4_2.json",
    2: "/atractores/4/b3s23/graph4.json"
  },
  5:{
    0: "/atractores/5/b3s23/graph5_",
    1: "/atractores/5/b3s23/static/graph5_static_",
    2: "/atractores/5/b3s23/osciladores/graph5_oscilator_"
  },
  6:{
    0: "/atractores/data.json"
  }
}

atractoresB2S7 = {
  2: {
    0: "/atractores/2/b2s7/graph2b2s7.json"
  },
  3: {
    0: "/atractores/3/b2s7/graph3b2s7.json"
  },
  4: {
    0: "/atractores/4/b2s7/graph4b2s7_1.json",
    1: "/atractores/4/b2s7/graph4b2s7_2.json",
    2: "/atractores/4/b2s7/graph4b2s7_3.json"
  },
  5:{
    0: "/atractores/5/b2s7/graph5b2s7_",
  }
}
atractoresB2S3 = {
  2: {
    0: "/atractores/2/b2s3/graph2b2s3.json"
  },
  3: {
    0: "/atractores/3/b2s3/graph3b2s3.json"
  },
  4: {
    0: "/atractores/4/b2s3/graph4b2s3_1.json",
    1: "/atractores/4/b2s3/graph4b2s3_2.json",
    2: "/atractores/4/b2s3/graph4b2s3_3.json"
  },
  5:{
    0: "/atractores/5/b2s3/graph5b2s3_",
  }
}

function render(){
  let ajson;
  if(rules == 0){
    if(espacio == 5){
      ajson = atractoresB3S23[espacio][select_5]+idx+".json";
    }
    else{
      ajson = atractoresB3S23[espacio][idx];
    }

  }
  else if(rules == 1){
    if(espacio == 5){
      ajson = atractoresB2S7[espacio][0]+idx+".json";
    }
    else{
      ajson = atractoresB2S7[espacio][idx];
    }
  }
  else{
    if(espacio == 5){
      ajson = atractoresB2S3[espacio][0]+idx+".json";
    }
    else{
      ajson = atractoresB2S3[espacio][idx];
    }
  }

  console.log(ajson,espacio,idx,rules);
  d3.json(ajson, function(error, graph) {
    // const simulation = d3.forceSimulation(nodes)
    // .force("link", d3.forceLink().id(d => d.id))
    // .force("charge", d3.forceManyBody().strength(-50))
    // .force("center", d3.forceCenter(width / 2, height / 2));
      
    container = svg.append("g")
      .attr("class", "container")
      .attr("transform", "translate("+((width/2)+50)+","+((height/2)-200)+") scale(" + ((espacio===4|espacio===5)?0.03:0.35) + ")")
      
    link = container.append("g")
      .attr("class", "links")
      .selectAll(".link")
      .data(graph.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) {
        return 1;
    });
  
    node = container.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      
    circle = node.append("circle")
      .attr("r", 12)
      // .style("fill","#69b3a2")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click",handleClick)
      .on("dblclick", dblclick)
    if(espacio<=3){
      label = node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.name
          });
    }

    // let marker = container.append("defs")
    //   .attr("class", "defs")
    //   .selectAll("marker")
    //   .data(graph.links, function (d) { return d.source.id + "-" + d.target.id; });

    // marker = marker
    //   .enter()
    //   .append("marker")
    //   .style("fill", "#444")
    //   .attr("id", function (d) { return (d.source.id + "-" + d.target.id).replace(/\s+/g, ''); })
    //   .style("opacity", function (d) { return Math.min(0, 1); })
    //   .attr("viewBox", "0 -5 10 10")
    //   .attr("refX", 0) 
    //   .attr("refY", 0)
    //   .attr("markerWidth", 5)
    //   .attr("markerHeight", 5)
    //   .attr("orient", "auto")
    //   .append("path")
    //   .attr("d", "M0,-5L10,0L0,5")
    //   .merge(marker);

    const simulation = d3.forceSimulation(graph.nodes)
      .force("forceX", d3.forceX().strength(.1).x(width * .5))
      .force("forceY", d3.forceY().strength(.1).y(height * .5))
      .force('link', d3.forceLink(graph.links).id(function(d,i) { return i; }))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
    // console.log(rules,rules>=4)
    if(espacio >=4){
      console.log("STOP");
      simulation.stop();//stop the simulation here
      for (var i = 0; i < 300; ++i) simulation.tick();
      link
        .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)
          .attr("id", d => ""+d.source.name+"to"+d.target.name);

      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
          
      circle
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("id", d => d.name)
    }
    // label
    //     .attr("dx", d => d.x+15)
    //     .attr("dy", d => d.y);
    // var simulation = d3.forceSimulation(node)
    //   .force("charge", d3.forceManyBody())
    //   .force("link", d3.forceLink(link))
    //   .force("center", d3.forceCenter());

    simulation.on("tick", () => {
      link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)
          .attr("id", d => ""+d.source.name+"to"+d.target.name);
  
      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);

      circle
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("id", d => d.name)
      label
          .attr("dx", d => d.x+15)
          .attr("dy", d => d.y);
    });
    // invalidation.then(() => simulation.stop());
  });
}

function init() {
  // if(svg ===undefined){
    var x = document.getElementById("graph");
    console.log(x);
    x.innerHTML = "";
    console.log("INIT...");
    svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", function () {
      svg.attr("transform", d3.event.transform)
    })) 
    
    link = svg.selectAll(".link");
    node = svg.selectAll(".node");
    render();
  // }
  // else{
    
  // }
}


function dblclick(d) {
  d3.select(this).classed("fixed", d.fixed = false);
}

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}
var flag = true;
function handleMouseOver(d, i) { 
  if(flag){
    // console.log(this);
    d3.select(this)
    .attr("fill", "orange")
    .attr("r", 24)
  }
}

function handleMouseOut(d, i) {
  if(flag){
    d3.select(this)
    .attr("fill","black")
    .attr("r",12);
    d3.select("#thover").remove();  // Remove text location
  }
}

function handleClick(d, i) {
  console.log(this);
  console.log(changes[0]);
  for(let i = 0;i<changes.length;i++){
    if(changes[i].tagName == "circle"){
      d3.select(changes[i])
      .attr("fill","black")
      .attr("r",12)
    }
    else{
      changes[i].setAttribute('style','stroke: red; stroke-width: 1;'); 
    }
    console.log(changes[i].tagName);
  }
  flag = !flag;
  d3.select(this)
  .attr("fill", "orange")
  .attr("r", 24)
  changes.push(this);
  selected = this.id;
  console.log("clikaste weee",this.id);
  DrawEstado(this.id,espacio);
}

function ChangeAtractor(size){
  var x = document.getElementById("c"+espacio);
  console.log(x.style);
  x.classList.remove("Cgreen");
  x.className += " Cblack";
  espacio = size;
  x = document.getElementById("c"+espacio);
  x.classList.remove("Cblack");
  x.className +=" Cgreen";
  if(espacio == 4){
    idx = 1;
    init();
  }
  else if(espacio == 5){
    if(rules == 0)
      idx = 201;
    if(rules == 1)
      idx = 89;
    else 
      idx = 89;
    changeOscilator();
    DrawEstado(1107,5)
  }
  else{
    idx = 0;
    init();
  } 
}
function ChangeGraphF(){
  idx++;
  // console.log(idx);
  // console.log(Object.keys(atractoresB3S23[espacio]).length);
  if(espacio==5){
    idx%=max5;  
  }
  
  else{
    idx%=Object.keys(atractoresB3S23[espacio]).length;
  }
  init();
}
function ChangeGraphB(){
  idx--;
  if(idx<0){
    if(espacio == 5)
      idx = max5-1;
    else
      idx = Object.keys(atractoresB3S23[espacio]).length-1;
  }
  init();
}
function ChangeRule(rule){
  var x = document.getElementById("CR"+rules);
  x.classList.remove("Cgreen");
  x.className += " Cblack";
  if(rule == 323){
    rules = 0; 
  }
  else if(rule == 27){
    rules = 1;
  }
  else rules = 2;
  x = document.getElementById("CR"+rules);
  x.classList.remove("Cblack");
  x.classList+=" Cgreen";
  if(espacio == 5){
    if(rules == 0)
      idx = 201;
    if(rules == 1)
      idx = 89;
    else if(rules == 2)
      idx = 147; 
  }
  else idx = 0;
  init();
}
function changeOscilator(){
  console.log(select_5);
  var x = document.getElementById("CT"+select_5);
  select_5 = 2; 
  x.classList.remove("Cgreen");
  x.className += " Cblack";
  x = document.getElementById("CT"+select_5);
  x.classList.remove("Cblack");
  x.classList+=" Cgreen";
  console.log("helow ocilator",espacio,rules,select_5);
  if(espacio == 5){
     idx = 63;
  }
  else idx = 0;
  init();
}
function changeStatic(){
  var x = document.getElementById("CT"+select_5);
  select_5 = 1; 
  x.classList.remove("Cgreen");
  x.className += " Cblack";
  if(select_5==2&& espacio ==5)idx = 23;
  else idx = 5;
  x = document.getElementById("CT"+select_5);
  x.classList.remove("Cblack");
  x.classList+=" Cgreen";
  if(espacio == 5){
    if(rules == 0)
      idx = 201;
    if(rules == 1)
      idx = 89;
    else 
      idx = 89; 
  }
  else idx = 0;
  init();
}
function changeRandom(){
  var x = document.getElementById("CT"+select_5);
  select_5 = 0; 
  x.classList.remove("Cgreen");
  x.className += " Cblack";
  if(select_5==2&& espacio ==5)idx = 23;
  else idx = 5;
  x = document.getElementById("CT"+select_5);
  x.classList.remove("Cblack");
  x.classList+=" Cgreen";
  init();
}

function RunG(){
  let next;
  if(rules == 0)
    next = Get_next(espacio,"b3s23");
  else if(rules == 1)
    next = Get_next(espacio,"b2s7");
  else 
    next = Get_next(espacio,"b2s3"); 
  console.log(selected+"to"+next);
  var node1 = document.getElementById(selected);
  var node2 = document.getElementById(next);
  var edge = document.getElementById(selected+"to"+next);
  if(node1){
    changes.push(node1);
    node1.setAttribute('fill','rgb(35, 119, 18)'); 
    node1.setAttribute('r','26'); 
  }
  if(node2){
    changes.push(node2);
    node2.setAttribute('fill','orange'); 
    node2.setAttribute('r','36'); 
  }
  console.log(next,selected);
  if(edge){
    changes.push(edge);
    edge.setAttribute('style','stroke: green; stroke-width: 16;'); 
  }
  selected = next;
  if(rules == 0)
    run_naive(espacio,"b3s23");
  else if(rules ==1)
    run_naive(espacio,"b2s7");
  else if(rules ==2)
    run_naive(espacio,"b2s3");
}
