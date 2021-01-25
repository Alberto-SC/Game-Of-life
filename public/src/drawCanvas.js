
function CanvasDrawer() {
    var Ofset_x = 0,Ofset_y = 0;
    var canvas_width,canvas_height;
    var canvas,context;
    var image_data,image_data_data;
    var cell_color_rgb;
    var cell_color_ocilator_rgb;
    var cell_color_static_rgb;
    drawer = this;

    var pixel_ratio = 1;
    this.draw_quad = false;
    this.cell_color = "#cccccc";
    this.background_color = "#011";
    // this.cell_color = "#444";
    // this.background_color = "#ffffff";
    this.cell_color_static = "#581AA6"
    this.cell_color_ocilator = "2EBAD5"
    this.border_width = 0.25;
    this.cell_width = 16;
    this.squareQuadTree_color ="#008000";
    this.squareQuadTree_color_rgb = HexaToRGB(this.squareQuadTree_color);
    this.init = function(dom_parent ){
        console.log(this.squareQuadTree_color_rgb);
        canvas = document.createElement("canvas");
        drawer.canvas = canvas;
        context = canvas.getContext("2d");
        dom_parent.insertBefore(canvas, dom_parent.children[1]);
        // dom_parent.appendChild(canvas);
        return true;
    }

    this.draw_cell = function(x,y,set,type = 3){
        var cell_x = x * drawer.cell_width + Ofset_x;
        var cell_y = y * drawer.cell_width + Ofset_y;
        console.log("DIbujar cuadrito" , x,y,set,Ofset_x,Ofset_y,cell_x,cell_y);
        var width = Math.ceil(drawer.cell_width)-(drawer.cell_width * drawer.border_width |0);
        if(set){
            if(type == 3)
                context.fillStyle = drawer.cell_color;
            if(type == 2)
                context.fillStyle = drawer.cell_color_static;
            if(type == 1)
                context.fillStyle = drawer.cell_color_ocilator;
        }
        else {
            context.fillStyle = drawer.background_color;
        }
        // context.beginPath();
        // context.arc(cell_x+width/2, cell_y+width/2, width/2, 0, 2 * Math.PI);
        // context.fill();
        context.fillRect(cell_x,cell_y,width,width);
    }
    this.set_size =  function set_size(width, height){
        if(width !== canvas_width || height !== canvas_height){
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            var factor = window.devicePixelRatio;
            pixel_ratio = factor;

            canvas.width = Math.round(width * factor);
            canvas.height = Math.round(height * factor);

            canvas_width = canvas.width;
            canvas_height = canvas.height;

            image_data = context.createImageData(canvas_width, canvas_height);
            image_data_data = new Int32Array(image_data.data.buffer);

            for(var i = 0; i < width * height; i++)
                image_data_data[i] = 0xFF <<24 ;    
        }
    }

    this.redraw = function(node){
        // console.log("REDIBUJAR");
        // console.log(Ofset_x,Ofset_y);
        var bg_color_rgb = HexaToRGB(drawer.background_color);
        var bg_color_int = bg_color_rgb.r | bg_color_rgb.g << 8 | bg_color_rgb.b << 16 | 0xFF <<24;

        border_width = drawer.border_width * drawer.cell_width | 0;
        cell_color_rgb = HexaToRGB(drawer.cell_color);
        cell_color_static_rgb = HexaToRGB(drawer.cell_color_static);
        cell_color_ocilator_rgb = HexaToRGB(drawer.cell_color_ocilator);
        var count = canvas_width * canvas_width;

        for(var i = 0;i<count;i++){
            image_data_data[i] = bg_color_int;
        }
        var size = Math.pow(2,node.level-1) * drawer.cell_width;
        // console.log("REDIBUJAR");
        // console.log(size);
        this.draw_node(node, 2*size, -size,-size);
        context.putImageData(image_data,0,0);
    }

    this.draw_node = function(node,size,left,top){
        // console.log("REDIBUJAR NODO");
        // console.log(node,left,top);
        // console.log(size);
        if(node.poblacion == 0)return;
        if(left + size + Ofset_x <0 || top + size + Ofset_y <0 || left + Ofset_x >= canvas_width || top + Ofset_y >= canvas_height)return ;
        if(size<=1){
            if(node.poblacion)
                this.square(left + Ofset_x | 0 ,top + Ofset_y | 0 ,1,3);
        }
        else if(node.level === 0){
            if(node.poblacion){
                // console.log("NODE ",node);
                // context.beginPath();
                // context.arc(left+Ofset_x+drawer.cell_width/2, top+Ofset_y+drawer.cell_width/2, drawer.cell_width/2-this.border_width/2, 0, 2 * Math.PI);
                // context.fill();
                this.square(left + Ofset_x, top+ Ofset_y,drawer.cell_width,node.type);
            }
        }

        else {
            // context.beginPath();
            // context.lineWidth = "4";
            // context.strokeStyle = "green";
            // context.rect(left+Ofset_x,top+Ofset_y,size,size);
            // context.stroke();
            if(drawer.draw_quad)
                this.squareQuadTree(left+Ofset_x,top+Ofset_y,size);
            size/=2;
            this.draw_node(node.nw,size,left,top);
            this.draw_node(node.ne,size,left+size,top);
            this.draw_node(node.sw,size,left,top+size);
            this.draw_node(node.se,size,left+size,top+size);
        }
    }
 
    this.square = function(x,y,size,type){
        var w = size-border_width,h = w;
        if(x<0){
            w+=x;
            x = 0;
        }
        if(x+w >canvas_width)
            w = canvas_width-x;
        if(y<0){
            h+=y;
            y = 0;
        }
        if(y+h > canvas_height)
            h = canvas_height-y;
        if(w<=0 || h<=0)return 

        var pointer = x+y *canvas_width,row_width = canvas_width-w;

        let color;
        if(type == 3)
            color = cell_color_rgb.r | cell_color_rgb.g << 8 | cell_color_rgb.b << 16 | 0xFF <<24;
        if(type == 2)
            color = cell_color_ocilator_rgb.r | cell_color_ocilator_rgb.g << 8 | cell_color_ocilator_rgb.b << 16 | 0xFF <<24;
        if(type == 1)
            color = cell_color_static_rgb.r | cell_color_static_rgb.g << 8 | cell_color_static_rgb.b << 16 | 0xFF <<24;
        for(var i = 0;i<h;i++){
            for(var j = 0;j<w;j++){
                image_data_data[pointer] = color;
                pointer++;
            }
            pointer += row_width;
        }  
    }

    this.squareQuadTree = function(x,y,size){
        var w = size,h = w;
        if(x<0){
            w+=x;
            x = 0;
        }
        if(x+w >canvas_width)
            w = canvas_width-x;
        if(y<0){
            h+=y;
            y = 0;
        }
        if(y+h > canvas_height)
            h = canvas_height-y;
        if(w<=0 || h<=0)return 
        // console.log(border_width,border_width/2);
        x-=border_width/2;
        y-=border_width/2;
        x = Math.round(x);
        y = Math.round(y);
        // console.log(x,y);
        var pointer = x+y *canvas_width,row_width = canvas_width-w;
        var color = drawer.squareQuadTree_color_rgb.r | drawer.squareQuadTree_color_rgb.g << 8 | drawer.squareQuadTree_color_rgb.b << 16 | 0xFF <<24;
        // console.log(color);
        for(var i = 0;i<w;i++){
            image_data_data[pointer] = color;
            pointer++;
        }  
        pointer+=row_width;
        for(var i = 1;i<h-1;i++){
            image_data_data[pointer] = color;
            pointer += w;
            image_data_data[pointer] = color;
            pointer += row_width;
        }
        for(var i = 0;i<w;i++){
            image_data_data[pointer] = color;
            pointer++;
        }
    }

    this.pixelToCell = function(x,y){
        console.log("Pixel a celda ",x,y,pixel_ratio,drawer.border_width);
        return {
            x: Math.floor((x * pixel_ratio - Ofset_x + drawer.border_width /2) / drawer.cell_width),
            y: Math.floor(((y-35) * pixel_ratio - Ofset_y + drawer.border_width /2) / drawer.cell_width)
        };
    }
  
    this.zoom = function(out ,center_x,center_y){
        // console.log(out,center_x,center_y);
        // console.log(Ofset_x,Ofset_y);
        if(out){
            Ofset_x -= Math.round((Ofset_x - center_x)/2);
            Ofset_y -= Math.round((Ofset_y - center_y)/2);
            drawer.cell_width/=2;
        }
        else{
            Ofset_x += Math.round((Ofset_x - center_x));
            Ofset_y += Math.round((Ofset_y - center_y));
            drawer.cell_width*=2;
        }
        // console.log(Ofset_x,Ofset_y);
    }
 
    this.zoom_at = function(out, center_x, center_y){
        // console.log(center_x,center_y);
        this.zoom(out, center_x * pixel_ratio, center_y * pixel_ratio);
    }

    this.move = function(dx,dy){
        Ofset_x += Math.round(dx*pixel_ratio);
        Ofset_y += Math.round(dy*pixel_ratio);
        // console.log("Ofset ", Ofset_x,Ofset_y);
    }
    
    this.center_view = function(){
        Ofset_x = canvas_width >> 1;
        Ofset_y = canvas_height >> 1;
    }
    this.center_For_atractors = function(){
        Ofset_x = canvas_width >> 3;
        Ofset_y = canvas_height >> 2;
    }
    function HexaToRGB(color){
        // console.log(color);
        if(color.length === 4){
            return {
                r: parseInt(color[1] + color[1], 16),
                g: parseInt(color[2] + color[2], 16),
                b: parseInt(color[3] + color[3], 16)
            };
        }
        else{
            return {
                r: parseInt(color.slice(1, 3), 16),
                g: parseInt(color.slice(3, 5), 16),
                b: parseInt(color.slice(5, 7), 16)
            };
        }
    }

}
// #011 color bonito