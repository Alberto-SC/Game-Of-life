class Universe{
    constructor(){
		this.root = null;
		this.generation = 0;
		this.empty_tree_cache = [];
		this.hashmap_size = 0;
		this.max_load;
		this.step = 0;
		this.hashmap = []; 
		this._powers = new Float64Array(1024);
		this._powers[0] = 1;
		this.rule_b = 1 << 3;
		this.rule_s =  1 << 2 | 1 << 3;
		for(var i = 1;i<1024;i++){
			this._powers[i] = this._powers[i-1]*2;
		}
		this._bitcounts = new Int8Array(0x758);
		this._bitcounts.set([0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4]);
		for(var i = 0x10; i < 0x758; i++){
			this._bitcounts[i] = this._bitcounts[i & 0xF] +
									this._bitcounts[i >> 4 & 0xF] +
									this._bitcounts[i >> 8];
		}
	
		this.dead_leaf ={
			id: 3,
			poblacion: 0,
			level: 0,
		};
    	this.alive_leaf ={
        	id: 2,
        	poblacion: 1,
			level: 0,
			type:3,
    	};
		this.init();
    }

	init(){
		this.last_id = 4;
		this.hashmap_size = (1<<16)-1;
		this.max_load = this.hashmap_size+0.9;
		this.generation = 0;
		this.empty_tree_cache = [];
		for(var i = 0;i<=this.hashmap_size;i++){
			this.hashmap[i] = undefined;
		}
		this.root = this.empty_tree(3);
		this.generation = 0;
    }

    empty_tree(level){
		if(this.empty_tree_cache[level]){
			return this.empty_tree_cache[level];
		}
		var t;
		if(level ===1){
			t = this.dead_leaf;
		}
		else {
			t = this.empty_tree(level-1);
		}
		return this.empty_tree_cache[level] = this.create_tree(t,t,t,t);
    }

    create_tree(nw,ne,sw,se){
		var hash = this.calc_hash(nw.id,ne.id,sw.id,se.id) & this.hashmap_size;
		var node = this.hashmap[hash];
		// console.log(hash);
		// console.log(hash,node,nw.id,ne.id,sw.id,se.id,this.hashmap_size);
		var new_node = new this.QuadNode(nw,ne,sw,se,this.last_id++);
		return new_node;
		var last;
		for(;;){
			// console.log("for");
			if(node === undefined){
				if(this.last_id >this.max_load){
					this.garbage_collect();
					return this.create_tree(nw,ne,sw,se);
				}
				var new_node = new this.QuadNode(nw,ne,sw,se,this.last_id++);
				if(last !== undefined){
					last.hashmap_next = new_node;
				}
				else{
					this.hashmap[hash] = new_node;
				}
				return new_node;
			}
			else if(node.nw ===nw && node.nw ===ne && node.sw ==sw && node.se ===se)
				return node;
			last = node;
			node = node.hashmap_next;
		}
	}
	// garbage_collect = function(){
	// 	if(this.hashmap_size < (1 << 24) - 1){
	// 		this.hashmap_size = this.hashmap_size << 1 | 1;
	// 		this.hashmap = [];
	// 	}
	// 	this.max_load = this.hashmap_size * .9 | 0;
	// 	for(var i = 0; i <= this.hashmap_size; i++)
	// 		this.hashmap[i] = undefined;

	// 	this.last_id = 4; 
	// 	this.node_hash(this.root);
	// };
	
	calc_hash(nw_id,ne_id,sw_id,se_id){
		var hash = ((nw_id * 23 ^ ne_id) * 23 ^ sw_id) * 23 ^ se_id;
    	return hash;
	}
    
   
    QuadNode = function(nw,ne,sw,se,id){
		this.nw = nw;
		this.ne = ne;
		this.sw = sw;
		this.se = se;
		this.id = id;
		this.cache = null;
		this.quick_cache = null;
		this.level = nw.level+1;
		this.poblacion = nw.poblacion+ne.poblacion+sw.poblacion+se.poblacion;
		this.hashmap_next = undefined;
	}

    setCell(x,y,alive,type = 3){
		var level = this.get_level(x,y);
		if(alive){
			while(level> this.root.level){
				this.root = this.expand(this.root);
			}
		}
		else {
			if(level>this.root.level)
				return;
		}
		// console.log("HI");
		this.root = this.node_setCell(this.root,x,y,alive,type);
	}
	node_setCell(node,x,y,alive,type){
		if(node.level ===0){
			if(alive){
				// console.log("set cell",type);
				let leaf = this.alive_leaf;
				leaf.type = type;
				// console.log(leaf);
				return leaf;
			}
			else{
				return this.dead_leaf;
			}
		}		
		var ofset = node.level === 1?0:this._powers[node.level-2];
		var nw = node.nw,ne = node.ne,sw = node.sw,se = node.se;
		if(x<0){
			if(y<0){
				// console.log("HELLO nw");
				nw = this.node_setCell(nw,x+ofset,y+ofset,alive,type);
			}
			else {
				// console.log("Hello sw")
				sw = this.node_setCell(sw,x+ofset,y-ofset,alive,type);
			}
		}
		else{
			if(y<0){
				// console.log("HELLO ne")	
				ne = this.node_setCell(ne,x-ofset,y+ofset,alive,type);
			}
			else{
				// console.log("HELLO se")	
				se = this.node_setCell(se,x-ofset,y-ofset,alive,type);
			}
		}
		// console.log(nw,ne);
		return this.create_tree(nw,ne,sw,se);
	}

	getCell(x,y){
		// console.log(x,y);
		var level = this.get_level(x,y);
		// console.log(level,this.root.level);
		if(level>this.root.level)
			return false;
		else 
			return this.node_getCell(this.root,x,y);
	}

	node_getCell(node,x,y){
		// console.log(node,x,y,node.poblacion);
		if(node.poblacion ===0)
			return false;
		if(node.level === 0){
			// console.log(node);
			return true;
		}

		var ofset = node.level === 1?0:this._powers[node.level-2];
		if(x<0){
			if(y<0)
				return this.node_getCell(node.nw,x+ofset,y+ofset);
			else 
				return this.node_getCell(node.sw,x+ofset,y-ofset);
		}
		else{
			if(y<0)
				return this.node_getCell(node.ne,x-ofset,y+ofset);
			else
				return this.node_getCell(node.se,x-ofset,y-ofset);
		}
	}

	expand(node){
		var t = this.empty_tree(node.level-1);
		return this.create_tree(
			this.create_tree(t,t,t,node.nw),
			this.create_tree(t,t,node.ne,t),
			this.create_tree(t,node.sw,t,t),
			this.create_tree(node.se,t,t,t)
		);
	}

	get_level(x,y){
		var max = 4;
		if(x>y){
			if(x+1>max)
				max = x+1;
			else if(-x>max)
				max = -x;
		}
		else{
			if(y+1>max)
				max = y+1;
			else if(-y>max)
				max = -y;
		}
		// console.log(Math.log(max)/Math.LN2);
		var level =  Math.ceil(Math.log(max)/Math.LN2)+1;
		// console.log(level,max);
		return level;
	}
  
	next(){
		var root = this.root;
		while(root.level <=this.step+2 ||
			root.nw.poblacion !== root.nw.se.se.poblacion ||
			root.ne.poblacion !== root.ne.sw.sw.poblacion ||
			root.sw.poblacion !== root.sw.ne.ne.poblacion ||
			root.se.poblacion !== root.se.nw.nw.poblacion){
				root = this.expand(root);
		}
		this.generation++;
		root = this.node_next(root);
		this.root = root;
	}

	node_next(node){
		if(node.cache)
			return node.cache;
		if(node.level ===2){
			if(node.quick_cache)
				return node.quick_cache;
			else
				return node.quick_cache = this.node_level2_next(node);
		}

		var nw = node.nw,
		ne = node.ne,
		sw = node.sw,
		se = node.se,
		n00 = this.create_tree( nw.nw.se, nw.ne.sw, nw.sw.ne, nw.se.nw),
        n01 = this.create_tree(nw.ne.se, ne.nw.sw, nw.se.ne, ne.sw.nw),
        n02 = this.create_tree(ne.nw.se, ne.ne.sw, ne.sw.ne, ne.se.nw),
        n10 = this.create_tree(nw.sw.se, nw.se.sw, sw.nw.ne, sw.ne.nw),
        n11 = this.create_tree(nw.se.se, ne.sw.sw, sw.ne.ne, se.nw.nw),
        n12 = this.create_tree(ne.sw.se, ne.se.sw, se.nw.ne, se.ne.nw),
        n20 = this.create_tree(sw.nw.se, sw.ne.sw, sw.sw.ne, sw.se.nw),
        n21 = this.create_tree(sw.ne.se, se.nw.sw, sw.se.ne, se.sw.nw),
        n22 = this.create_tree(se.nw.se, se.ne.sw, se.sw.ne, se.se.nw);
		return node.cache = this.create_tree(
			this.node_next(this.create_tree(n00,n01,n10,n11)),
			this.node_next(this.create_tree(n01,n02,n11,n12)),
			this.node_next(this.create_tree(n10,n11,n20,n21)),
			this.node_next(this.create_tree(n11,n12,n21,n22)),
		);
	}
	node_level2_next(node){
		var nw = node.nw,ne = node.ne,sw = node.sw,se = node.se;
		var bitmask = 
		nw.nw.poblacion <<15 | nw.ne.poblacion <<14 | ne.nw.poblacion<<13 | ne.ne.poblacion <<12 |
		nw.sw.poblacion <<11 | nw.se.poblacion <<10 | ne.sw.poblacion<<9  | ne.se.poblacion <<8  |
		sw.nw.poblacion <<7  | sw.ne.poblacion <<6  | se.nw.poblacion<<5  | se.ne.poblacion <<4  |
		sw.sw.poblacion <<3  | sw.se.poblacion <<2  | se.sw.poblacion<<1  | se.se.poblacion;
		// console.log(bitmask);
		return this.level1_creare(
			this.evaluar(bitmask>>5)|
			this.evaluar(bitmask>>4)<<1|
			this.evaluar(bitmask>>1)<<2|
			this.evaluar(bitmask)<<3
		)

	}
	evaluar(bitmask){
		var rule = (bitmask&32) ? this.rule_s: this.rule_b;
		return rule >>this._bitcounts[bitmask & 0x757] &1;
	}
	level1_creare(bitmask){
		return this.create_tree(
			bitmask&1? this.alive_leaf:this.dead_leaf,
			bitmask&2? this.alive_leaf:this.dead_leaf,
			bitmask&4? this.alive_leaf:this.dead_leaf,
			bitmask&8? this.alive_leaf:this.dead_leaf
		);
	}

	get_limites(){
		if(this.root.poblacion ===0){
			return {
				top:0,
				left:0,
				bottom:0,
				right:0
			}
		}
		var bounds = {
			top: Infinity,
			left:Infinity,
			bottom:-Infinity,
			right:-Infinity,
		},
		offset = this._powers[this.root.level-1];
		this.node_get_limits(this.root,-offset,-offset,15,bounds);
		return bounds;
	}

	node_get_limits(node,left,top,mask,bounds){
		if(node.poblacion ===0 || !mask)return;
		if(node.level===0){
			if(left<bounds.left)
				bounds.left = left;
			if(left>bounds.right)
				bounds.right = left;
			if(top<bounds.top)
				bounds.top = top;
			if(top>bounds.bottom)
				bounds.bottom = top;
		}
		else {
			var offset = this._powers[node.level-1];
			if(left>=bounds.left && left+offset*2 <=bounds.right &&
				top >=bounds.top && top+ offset*2<=bounds.bottom)
					return ;
			
			var mask_nw = mask,mask_ne = mask,mask_sw = mask,mask_se = mask;
			if(node.nw.poblacion){
				mask_sw &= ~2;
				mask_ne &= ~1
				mask_se &= ~2 & ~1;
			}
			if(node.sw.poblacion){
            	mask_se &= ~1;
            	mask_nw &= ~8;
            	mask_ne &= ~8 & ~1;
			}
			if(node.ne.poblacion){
				mask_nw &= ~4;
				mask_se &= ~2;
				mask_sw &= ~2 & 4;
			}
			if(node.se.poblacion){
				mask_sw &= ~4;
				mask_ne &= ~8;
				mask_nw &= ~8 & ~4;
			}
			this.node_get_limits(node.nw,left,top,mask_nw,bounds);
			this.node_get_limits(node.sw,left,top+offset,mask_sw,bounds);
			this.node_get_limits(node.ne,left+offset,top,mask_ne,bounds);
			this.node_get_limits(node.se,left+offset,top+offset,mask_se,bounds);
		}
	}
}



