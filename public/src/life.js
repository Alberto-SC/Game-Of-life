
var drawer = new CanvasDrawer();
var last_x,last_y,isSet; 
var quadTree = new Universe();
var nextFrame =
window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
setTimeout;
running = false;
console.log(quadTree);
var textfile = null;
var button,guardar,input,reset,backgroundColor,cellColor,Rule,Random,SetRule,draw_quad;


// chart
let patterns = new Array(1000007);
let npatterns = new Array(1000007);
let nlast = new Array(1000007);
let last = new Array(1000007);
let vis = new Array(1000000);
let nvis = new Array(1000000);
let vis2 = new Array(1000000);
let nvis2 = new Array(1000000);
let vis3 = new Array(1000000);
let nvis3 = new Array(1000000);
let type = new Array(1000000);
let ntype = new Array(1000000);

for(let i = 0;i<1000000;i++){
    patterns[i] = new Set();
    npatterns[i] = new Set();
}

var lineArr = [];
var MAX_LENGTH = 100;
var duration = 500;
var chart = realTimeLineChart();
var gen = 1;
var velocity = 1000;

(function(){
    window.onload = function(){
        drawer.init(document.body);
        drawer.set_size(window.innerWidth, document.body.offsetHeight);
        drawer.redraw(quadTree.root);
        // drawer.redraw(quadTree.root);
        // CANVAS EVENTS
        drawer.canvas.onmousedown = function(e){
            console.log(e.clientX,e.clientY);
            // console.log(drawer);
            // console.log(drawer.cell_width);
            if(e.which === 2 || e.which ===3){
                console.log("Ruedita/derecho");
                if(drawer.cell_width >=1){
                    var coords = drawer.pixelToCell(e.clientX, e.clientY);
                    isSet = !quadTree.getCell(coords.x,coords.y);
                    console.log(isSet);
                    console.log(coords);
                    window.addEventListener("mousemove", do_draw,true);
                    do_draw(e);
                }
            }
            else if(e.which ===1){
                console.log("Izquierdo");
                last_x = e.clientX;
                last_y = e.clientY;
                console.log(last_x,last_y);
                window.addEventListener("mousemove",do_move,true);
                (function redraw(){
                    if(last_x !== null)
                        requestAnimationFrame(redraw);
                    redraw_canvas(quadTree.root);
                })();
            }

        }
        
        drawer.canvas.onmouseup = function(e){
            last_x = null;
            last_y = null;
            window.removeEventListener("mousemove", do_draw,true);
            window.removeEventListener("mousemove", do_move,true);
        }
        drawer.canvas.onmousewheel = function(e){
            e.preventDefault();
            drawer.zoom_at((e.wheelDelta || -e.detail)<0,e.clientX,e.clientY);
            redraw_canvas(quadTree.root);
        }
        window.onkeydown = function(e){
            if(e.which == 32){
                if(running)
                    stop();
                else 
                    run();
            }
            if(e.which == 81){
                console.log(quadTree.root);
            }
            if(e.which ==76){
                bound = quadTree.get_limites();
                console.log(bound);
            }
            // console.log(e.which);
        }
        RandomUniverse(100,100,0.2);


        //MENU
        button = document.getElementById("load");
        guardar = document.getElementById("save");
        input = document.getElementById("myfile");
        reset = document.getElementById("Reset");
        backgroundColor = document.getElementById("colorB");
        cellColor = document.getElementById("colorC");
        Random = document.getElementById("Random");
        setRule = document.getElementById("SetRule");
        Rule = document.getElementById("Rule");
        draw_quad = document.getElementById("draw_quad");
        input.addEventListener("change", addDoc);
        button.addEventListener("click", handleText);
        reset.addEventListener("click", handleReset);
        guardar.addEventListener("click", handleSave);
        setRule.addEventListener("click", handleRule);
        draw_quad.addEventListener("click", handleDraw);
        // Random.addEventListener("click", createRandom);
        backgroundColor.addEventListener("input", handleColorB,false);
        cellColor.addEventListener("input", handleColorC,false);

        document.addEventListener( "contextmenu", function(e) {
            e.preventDefault();
            console.log(e);
        });
        // seedData();
        d3.select("#chart").datum(lineArr).call(chart);
        d3.select(window).on('resize', resize);
    }
})();

function addDoc(event) {
    var file = this.files[0]
    var reader = new FileReader();      
    reader.onload = function(e) {
    textfile = reader.result;
    button.removeAttribute("disabled");
    }

    reader.onerror = function(err) {
    console.log(err, err.loaded
                , err.loaded === 0
                , file);
    button.removeAttribute("disabled");
    }

    reader.readAsText(event.target.files[0]);
}

function handleText() {
    load(textfile);
    // console.log(textfile);
    
}
function handleSave(){
    save();
}

function handleRule(){
    console.log(Rule.value);
    str = Rule.value;
    var rule_b = 0;
    var rule_s = 0;
    let i = 1;
    while(i<str.length && str[i]!= '/'){
        rule_b |= (1<<parseInt(str[i]));
        i++;
    }
    i+=2;
    while(i<str.length){
        console.log(str[i]);
        rule_s |= (1<<parseInt(str[i]));
        i++;
    }
    quadTree.rule_b = rule_b;
    quadTree.rule_s = rule_s;
    console.log(quadTree.rule_b,quadTree.rule_s);

}
function handleRandom(){
    var column = document.getElementById("sw").value;
    var filas = document.getElementById("sh").value;
    console.log(column,filas);
    RandomUniverse(column,filas,0.2);
}

function handleReset(){
    console.log("hello");
    quadTree.init();
    drawer.cell_width=16;
    drawer.Offset_x = 0;
    drawer.Offset_y = 0;
    gen = 0;
    drawer.redraw(quadTree.root);
}

function handleDraw(){
    console.log("HI",drawer.draw_quad);
    drawer.draw_quad = !drawer.draw_quad;
    drawer.redraw(quadTree.root);
}

function handleColorB(e){
    console.log("Background");
    let color = backgroundColor.value;
    console.log(drawer.background_color);
    drawer.background_color = color;
    console.log(color);
    drawer.redraw(quadTree.root);
}
function handleColorBackHexa(color){
    drawer.background_color = color;
    drawer.redraw(quadTree.root);
}

function handleColorCellHexa(color){
    drawer.cell_color = color;
    drawer.redraw(quadTree.root);
}

function handleColorC(e){
    console.log("Celda");
    let color = cellColor.value;
    console.log(drawer.cell_color);
    drawer.cell_color = color;
    console.log(color);
    drawer.redraw(quadTree.root);
}

function load(file){
    quadTree.init();
    console.log(file);
    let x = null,y = null,negativo;
    let strn,first;
    for(var i = 0;i<file.length;i++){
        if(file[i]== '#' && file[i+1] == 'P'){
            i+=3;
            strn = "";
            if(file[i]== '-'){
                negativo = true;
                i++;
            }
            else {
                negativo = false;
            }

            while(file[i]>='0' && file[i]<='9'){
                strn+=file[i];
                i++;

            }
            if(x ==null)first =parseInt(strn);
            x = parseInt(strn);
            if(negativo)x*=-1;
            i++;
            strn = "";
            if(file[i]== '-'){
                negativo = true;
                i++;
            }
            else {
                negativo = false;
            }

            while(file[i]>= '0' && file[i]<='9'){
                strn+=file[i];
                i++;

            }
            y = parseInt(strn);
            if(negativo)y*=-1;
            x+=Math.abs(first)+1;
        }
        else if(x!= null && y!= null){
            let auxy = y;
            while(i<file.length && file[i]!= '#'){
                let auxx = x;
                while(file[i]!= '\n'){
                    if(file[i]== '*')
                    quadTree.setCell(auxx,auxy,1,3);
                    i++;
                    auxx++;
                }
                i++;
                auxy++;
            }
            i--;
        }
    }
    drawer.redraw(quadTree.root);
}


function save(){
    bound = quadTree.get_limites();
    console.log(bound);
    str = "#P "+bound.left+" "+bound.top+"\n"; 
    console.log("HELLO");
    for(var i = bound.top;i<=bound.bottom;i++){
        for(var j = bound.left;j<=bound.right;j++){
            let x = quadTree.getCell(j,i);
            console.log(x);
            if(x)
                str+='*';
            else 
                str+='.';
            console.log(j,bound.right);
        }
        str+='\n';
    }
    console.log(str);
    var blob = new Blob([`${str}`], {type: "textfile/plain;charset=utf-8"});
    saveAs(blob, "testfile1.LIF");
}

function getRandom(distribution){
    var num=Math.random();
    if(num < distribution) return 1;  
    else return 0; 
}

function RandomUniverse(w,h,distribution){
    for(var i = 0;i<w;i++){
        for(var j = 0;j<h;j++){
            quadTree.setCell(i,j,getRandom(distribution),3);
        }
    }
    drawer.redraw(quadTree.root);
}
function redraw_canvas(node){
    drawer.redraw(node);
}

function do_draw(e){
    var coords = drawer.pixelToCell(e.clientX,e.clientY);
    if(coords.x !== last_x || coords.y !== last_y){
        console.log(coords.x,coords.y);
        quadTree.setCell(coords.x,coords.y,isSet,3);
        drawer.draw_cell(coords.x,coords.y,isSet);
        last_x = e.clientX;
        last_y = e.clientY;
    }
}

function do_move(e){
    if(last_x!== null){
        let dx = Math.round(e.clientX-last_x);
        let dy = Math.round(e.clientY-last_y);
        drawer.move(dx,dy);
        last_x+=dx;
        last_y+=dy;
    }
}

function stop(callback){
    if(running){
        running = false;
        onstop = callback;
    }
    else {
        if(callback){
            callback();
        }
    }
}

function run(){
    var n = 1,start,last_frame,frame_time = velocity/5,interval,per_frame = frame_time;
    running = true;
    start = Date.now();
    last_frame = start-per_frame;
    console.log(quadTree.root);
    function update(){
        if(!running){
            clearInterval(interval);
            if(onstop){
                onstop();
            }
            return ;
        }
        var time = Date.now();
        if(per_frame * n <(time-start)){
            quadTree.next();
            en = 1;
            // en = get_entropia();
            // get_patterns();
            updateData(quadTree.root.poblacion,en)
            n++;
            gen++;
            frame_time += (-last_frame - frame_time + (last_frame = time)) / 15;
            if(frame_time < .7 * per_frame){
                n = 1;
                start = Date.now();
            }
            drawer.redraw(quadTree.root);
        }
        // console.log("Siguiente generacion",n,quadTree.root)
        nextFrame(update);
    }
    update();
}

function f(x,y){
    return (x*1000)+y;
}
function fi(num){
    return {0:num/1000,1:num%1000};
}

let ind = 0;
let q = new Array(1000000);
let fx =[+0,+0,+1,-1,-1,+1,-1,+1]; 
let fy =[-1,+1,+0,+0,+1,+1,-1,-1];
function bfs(s){
    ind = 0;
    q[ind++] = s;
    let str = "";
    for(let i = 0;i<ind;i++){
        let u = q[i];
        if(u<0)
            nvis[Math.abs(u)] = true;
        else
            vis[u] = true;
        let x = parseInt(fi(u)[1]);
        let y = parseInt(fi(u)[0]);
        str+=u+"_";
        for(let j = 0;j<8;j++){
            let nx = parseInt(fi(u)[1]);
            let ny = parseInt(fi(u)[0]);
            nx+=fx[j];
            ny+=fy[j];
            if(f(ny,nx)<0){
                if(!nvis[Math.abs(f(ny,nx))] && quadTree.getCell(nx,ny)){
                    q[ind++] = f(ny,nx);
                }
            }
            else{
                if(!vis[f(ny,nx)] && quadTree.getCell(nx,ny)){
                    q[ind++] = f(ny,nx);
                }
            }
        }
    }
    var sha256Hash = CryptoJS.SHA256(str);
    ind = 0;
    q[ind++] = s;
    let flag = false;
    for(let i = 0;i<ind;i++){
        let u = q[i];
        if(u<0){
            nvis2[Math.abs(u)] = true;
            if(nlast[Math.abs(u)] === sha256Hash.toString())ntype[Math.abs(u)] = 1;
            else if(npatterns[Math.abs(u)].has(sha256Hash.toString())){ntype[Math.abs(u)] = 2;flag = true;}
            else ntype[Math.abs(u)] = 3;
            nlast[Math.abs(u)] = sha256Hash.toString();
            npatterns[Math.abs(u)].add(sha256Hash.toString());
        }
        else {
            vis2[u] = true;   
            if(last[u] === sha256Hash.toString())type[u] = 1;
            else if(patterns[u].has(sha256Hash.toString())){type[u] = 2;flag = true;}
            else type[u] = 3;
            last[u] = sha256Hash.toString();
            patterns[u].add(sha256Hash.toString());
        }

        for(let j = 0;j<8;j++){
            let nx = parseInt(fi(u)[1])+fx[j];
            let ny = parseInt(fi(u)[0])+fy[j];
            if(f(ny,nx)<0){
                if(!nvis2[Math.abs(f(ny,nx))] && quadTree.getCell(nx,ny)){
                    q[ind++] = f(ny,nx);
                }
            }
            else{
                if(!vis2[f(ny,nx)] && quadTree.getCell(nx,ny)){
                    q[ind++] = f(ny,nx);
                }
            }
        }
    }
    if(!flag)return;
    ind = 0;
    q[ind++] = s;
    for(let i = 0;i<ind;i++){
        let u = q[i];
        if(u<0){   
            nvis3[Math.abs(u)] = true;
            ntype[Math.abs(u)] = 2;
        }
        else{
            vis3[u] = true;
            type[u] = 2;
        }
        for(let j = 0;j<8;j++){
            let nx = parseInt(fi(u)[1])+fx[j];
            let ny = parseInt(fi(u)[0])+fy[j];
            if(f(ny,nx)<0){
                if(!nvis3[Math.abs(f(ny,nx))] && quadTree.getCell(nx,ny)){
                    q[ind++] = f(ny,nx);
                }
            }
            else{
                if(!vis3[f(ny,nx)] && quadTree.getCell(nx,ny)){
                    q[ind++] = f(ny,nx);
                }
            }
        }
    }
}

function get_patterns(){
    var bounds = quadTree.get_limites();
    console.log("Patterns",bounds);
    for(let i = bounds.top-2;i<=bounds.bottom+2;i++){
        for(let j = bounds.left-2;j<=bounds.right+2;j++){
            if(f(i,j)<0){
                nvis[Math.abs(f(i,j))] = false;
                nvis2[Math.abs(f(i,j))] = false;
                nvis3[Math.abs(f(i,j))] = false;
            }
            else{

                vis[f(i,j)] = false;
                vis2[f(i,j)] = false;
                vis3[f(i,j)] = false;
            }
        }
    }

    for(let i = bounds.top-2;i<=bounds.bottom+2;i++){
        for(let j = bounds.left-2;j<=bounds.right+2;j++){
            if(f(i,j)<0){
                if(quadTree.getCell(j,i) && !nvis[f(i,j)]){
                    bfs(f(i,j));
                    // quadTree.setCell(j,i,1,type[f(i,j)]);
                }
            }
            else{
                if(quadTree.getCell(j,i) && !vis[f(i,j)]){
                    bfs(f(i,j));
                    // quadTree.setCell(j,i,1,type[f(i,j)]);
                }
            }
        }
    }
    for(let i = bounds.top-4;i<=bounds.bottom+4;i++){
        for(let j = bounds.left-4;j<=bounds.right+4;j++){
            if(!quadTree.getCell(j,i)){
                if(f(i,j)<0)
                    nlast[f(i,j)] = 0;
                else 
                    last[f(i,j)] = 0;
            }
            else{
                if(f(i,j)<0){
                    console.log("Tipo",j,i,ntype[f(i,j)]);
                    quadTree.setCell(j,i,1,ntype[f(i,j)]);
                }
                else{
                    quadTree.setCell(j,i,1,type[f(i,j)]);
                    console.log("TIPO ",j,i,type[f(i,j)]);
                }
                
            }
        }
    }
}

function run_naive(sz,rule){
    let n = sz;
    var matrix = []; for(var i=0; i<sz; i++) { matrix[i] = new Array(sz); } 
    for(let i = 0;i<n;i++){
        for(let j = 0;j<n;j++){
            let cont = 0;
            for(let k = 0;k<8;k++){
                let nx = i+fx[k];
                let ny = j+fy[k];
                nx = ((nx%sz)+sz)%sz;
                ny = ((ny%sz)+sz)%sz;
                if(quadTree.getCell(ny,nx))
                    cont++;
            }
            if(quadTree.getCell(j,i)){
                if(rule == "b3s23"){
                    if(cont == 2|| cont == 3)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
                else if(rule == "b2s7"){
                    if(cont == 7)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
                else if(rule == "b2s3"){
                    if(cont == 3)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
            }
            else{
                if(rule == "b3s23"){
                    if(cont == 3)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
                else if(rule == "b2s7"){
                    if(cont == 2)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
                else if(rule == "b2s3"){
                    if(cont == 2)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
            }
        }
    }
    for(let i = 0;i<sz;i++){
        for(let j = 0;j<sz;j++){
            if(matrix[i][j] ==1){
                quadTree.setCell(j,i,1,3);
            }
            else 
                quadTree.setCell(j,i,0,3);
        }
    }
    drawer.center_For_atractors();
    drawer.redraw(quadTree.root);
}


function get_entropia(){
    bound = quadTree.get_limites();
    // console.log(bound);
    let fx =[-1,-1,-1,+0,+0,+0,+1,+1,+1]; 
    let fy =[-1,+0,+1,-1,+0,+1,-1,+0,+1];
    b = [];
    for(let i =0;i<511;i++)
        b[i] = 0;
    for(let i = bound.top;i<=bound.bottom;i++){
        for(let j = bound.left;j<=bound.right;j++){
            let value = 0;
            for(let k = 0;k<9;k++){
                let nx = i+fx[k];
                let ny = j+fy[k];
                // console.log(ny,nx,quadTree.getCell(ny,nx));
                if(quadTree.getCell(ny,nx))
                    value|= 1<<k;
            }
            // console.log(j,i,value,quadTree.getCell(j,i));
            b[value]++;
        }
    }
    let entropy = 0.0;
    for(let i = 0;i<511;i++){
        if(b[i]== 0)continue;
        let p = b[i]/512.0;
        p*= Math.log2(p);
        entropy+=p;
    }
    if(entropy<0)return -entropy;
    return entropy;
}

function Get_next(sz,rule){
    let n = sz;
    let fx =[+0,+0,+1,-1,-1,+1,-1,+1]; 
    let fy =[-1,+1,+0,+0,+1,+1,-1,-1];
    var matrix = []; for(var i=0; i<n; i++) {matrix[i] = new Array(n);} 
    let original = 0,c = 0;
    for(let i = 0;i<n;i++){
        for(let j = 0;j<n;j++){
            let cont = 0;
            for(let k = 0;k<8;k++){
                let nx = i+fx[k];
                let ny = j+fy[k];
                nx = ((nx%sz)+sz)%sz;
                ny = ((ny%sz)+sz)%sz;
                if(quadTree.getCell(ny,nx))
                    cont++;
            }
            if(quadTree.getCell(j,i)){
                if(rule == "b3s23"){
                    if(cont == 2|| cont == 3)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
                else if(rule == "b2s7"){
                    if(cont == 7)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
                else if(rule == "b2s3"){
                    if(cont == 3)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
                original|= 1<<c;
            }
            else{
                if(rule == "b3s23"){
                    if(cont == 3)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
                else if(rule == "b2s7"){
                    if(cont == 2)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
                else if(rule == "b2s3"){
                    if(cont == 2)
                        matrix[i][j] = 1;
                    else 
                        matrix[i][j] = 0;
                }
            }
            c++;
        }
    }
    let next = 0,cont =0;
    for(let i = 0;i<n;i++){
        for(let j = 0;j<n;j++){
            console.log(matrix[i][j])
            if(matrix[i][j])
                next|=(1<<cont);
            cont++;
        }
        console.log("new_line");
    }
    console.log(original,next);
    return next;
}

function randomNumberBounds(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function seedData() {
    for (let i = 0; i < 1; ++i) {
        lineArr.push({
        time: i+1,
        x: randomNumberBounds(10, 20),
        y: randomNumberBounds(10, 20),
        z: randomNumberBounds(10, 20)
        });
    }
    console.log(lineArr)
}

function updateData(poblacion,entropia) {
    var bounds = quadTree.get_limites();
    sizeTotal = ((bounds.right+2)-bounds.left)*((bounds.bottom+2)-bounds.top);
    var lineData = {
        time: gen,
        x: poblacion,
        y: poblacion/sizeTotal,
        z: entropia
    };
    lineArr.push(lineData);

    if (lineArr.length > 30) {
        lineArr.shift();
    }
    d3.select("#chart").datum(lineArr).call(chart);
}

function resize() {
    if (d3.select("#chart svg").empty()) {
        return;
    }
    chart.width(+d3.select("#chart").style("width").replace(/(px)/g, ""));
    d3.select("#chart").call(chart);
}
 

function DrawEstado(h,espacio){
    stop();
    quadTree.init();
    drawer.cell_width=64;
    drawer.Offset_x = 200;
    drawer.Offset_y = 200;
    gen = 0;
    let cont = 0;
    console.log(h);
    for(let i = 0;i<espacio;i++){
        for(let j = 0;j<espacio;j++){
            console.log((h>>cont)&1);
            if((h>>cont)&1){
                quadTree.setCell(j,i,1,3);
            }
            cont++;
        }
    }
    drawer.center_For_atractors();
    drawer.redraw(quadTree.root);
}

// B1/S12 se ve mamalon con una sola celula 
