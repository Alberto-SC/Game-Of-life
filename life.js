// import { saveAs } from 'fileSave';
(function(){
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
            drawer.zoom((e.wheelDelta || -e.detail)<0,e.clientX,e.clientY);
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
        RandomUniverse(500,500,50);


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

       
    }

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
    function handleReset(){
        console.log("hello");
        quadTree.init();
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
    function handleColorC(e){
        console.log("Celda");
        let color = cellColor.value;
        console.log(drawer.cell_color);
        drawer.cell_color = color;
        console.log(color);
        drawer.redraw(quadTree.root);
    }

    function randn_bm(min, max, skew) {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
        num = Math.pow(num, skew); // Skew
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
        return num;
    }

    function load(file){
        quadTree.init();
        console.log(file);
        let x = null,y = null,negativo;
        let strn,first;
        for(var i = 0;i<file.length;i++){
            // console.log(file[i]);
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
                // console.log(x,y,first);
                x+=Math.abs(first)+1;
                // console.log(x,y,first);
                // console.log(i,file[i]);
            }
            else if(x!= null && y!= null){
                let auxy = y;
                while(i<file.length && file[i]!= '#'){
                    let auxx = x;
                    while(file[i]!= '\n'){
                        console.log(auxx,auxy,file[i]);
                        if(file[i]== '*')
                        quadTree.setCell(auxx,auxy,1);
                        i++;
                        auxx++;
                    }
                    console.log("New line");
                    i++;
                    console.log(file[i]);
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
            console.log("NEW");
            str+='\n';
        }
        console.log(str);
        var blob = new Blob([`${str}`], {type: "textfile/plain;charset=utf-8"});
        saveAs(blob, "testfile1.LIF");
    }
    function RandomUniverse(w,h,distribution){
        // var n = Math.random()*1000;
        // console.log(n);
        // for(var i = 0;i<n;i++){
        //     y = Math.round(Math.random(0-(h*(distribution/100))/2, 0+(h*(distribution/100))/2));
        //     x = Math.round(Math.random(0-(w*(distribution/100))/2, 0+(w*(distribution/100))/2));
        //     quadTree.setCell(x,y,1);
        //     console.log(x,y);
        // }
        for(var i = 0;i<w;i++){
            for(var j = 0;j<h;j++){
                x = Math.round(Math.random(0-(w*(1/100))/2, 0+(w*(1/100))/2));
                quadTree.setCell(i,j,x);
            }
        }
        drawer.redraw(quadTree.root);
    }
    function redraw_canvas(node){
        // if(!running || max_fps < 15){
        drawer.redraw(node);
        // }
    }

    function do_draw(e){
        var coords = drawer.pixelToCell(e.clientX,e.clientY);
        if(coords.x !== last_x || coords.y !== last_y){
            console.log(coords.x,coords.y);
            quadTree.setCell(coords.x,coords.y,isSet);
            drawer.draw_cell(coords.x,coords.y,isSet);
            last_x = e.clientX;
            last_y = e.clientY;
        }
    }

    function do_move(e){
        // console.log(e.clientX,e.clientY);
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
        var n = 0,start,last_frame,frame_time = 1000/5,interval,per_frame = frame_time;
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
                drawer.redraw(quadTree.root);
                generacionLabel = document.getElementById("label_gen");
                PoblacionLabel = document.getElementById("label_pop");
                generacionLabel.innerHTML = "Generación: "+n;
                PoblacionLabel.innerHTML = "Población: "+quadTree.root.poblacion;
                n++;
                frame_time += (-last_frame - frame_time + (last_frame = time)) / 15;
                if(frame_time < .7 * per_frame){
                    n = 1;
                    start = Date.now();
                }
            }
            // console.log("Siguiente generacion",n,quadTree.root)
            nextFrame(update);
        }
        update();
    }
})();


// B1/S12 mamalon con una sola celula 