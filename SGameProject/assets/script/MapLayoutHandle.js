var DataMgr = require("DataMgr");
var MapLayoutHandle = cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        pre: [cc.Integer],
        stone: {
          default: null,
          type: cc.Prefab,  
        },
        samenum: 3,
        
        selectRole: {
            default: null,
            visible: false,
        },
        
        
        _map: [],
        mapWidth: {
            default: 0,
            visible: false,
        },
        mapHeight: {
            default: 0,
            visible: false,
        },
        tileWidth: {
            default: 0,
            visible: false,  
        },
        tileHeight: {
            default: 0,
            visible: false,  
        },
        
    },
   

    // use this for initialization
    onLoad: function () {

    },
    
    getPosByIndex:  function (idx) {
        var pos = cc.v2(idx%this.mapWidth,Math.floor(idx/this.mapWidth));
        return pos;
    },
    
    getIndexByPos:  function (pos) {
        return pos.x + pos.y * this.mapWidth;
    },
    
    getPosByPixelPos:  function (ppos) {
        var widx = Math.floor(ppos.x/this.tileWidth);
        var hidx = this.mapHeight - 1 - Math.floor(ppos.y/this.tileHeight);
        
        return cc.v2(widx,hidx);
    },
    
    
    getPixelPosByPos:  function (pos) {
        var map = this.node.getComponent(cc.TiledLayer)
        var ppos = map.getPositionAt(pos);
        ppos.x = ppos.x + this.tileWidth/2;
        ppos.y = ppos.y + this.tileHeight/2;
        return ppos;
    },
    
    getRoleByPos:  function (pos) {
        return this._map[this.getIndexByPos(pos)];
    },
    
    setRoleInIdx: function (role,idx) {
        if (role instanceof require("RoleNode") || role == null) {
            idx = Number(idx);
            this._map[idx] = role;
            if (role) {
                role.idx = idx;
            }
        }else{
            cc.log("not rolenode type");
        }
    },
    
    GetOneLineRole: function (idx,type,linerole) {
        var rolenode = this._map[idx];
        if (rolenode || type) {
            var ctnode = rolenode;
            if (ctnode|| type) {
                var ctype = ctnode?ctnode.type:type;
                if (ctype == 0) {
                    return ;
                }
                var lefttype = this._map[idx - 1]?this._map[idx - 1].type:0;
                var righttype = this._map[idx + 1]?this._map[idx + 1].type:0;
                var uptype = this._map[idx - this.mapWidth]?this._map[idx - this.mapWidth].type:0;
                var downtype = this._map[idx + this.mapWidth]?this._map[idx + this.mapWidth].type:0;
                if (lefttype == ctype) {
                    var bhave = false;
                    for (var index = 0; index < linerole.length; index++) {
                        var element = linerole[index];
                        if (element.idx == (idx-1)) {
                            bhave = true;
                            break;
                        }
                    }
                    if (!bhave) {
                        linerole[linerole.length] = this._map[idx - 1];
                        this.GetOneLineRole(idx-1,type,linerole);
                    }
                }
                if (righttype == ctype) {
                    var bhave = false;
                    for (var index = 0; index < linerole.length; index++) {
                        var element = linerole[index];
                        if (element.idx == (idx+1)) {
                            bhave = true;
                            break;
                        }
                    }
                    if (!bhave) {
                        linerole[linerole.length] = this._map[idx + 1];
                        this.GetOneLineRole(idx+1,type,linerole);
                    }
                }
                if (uptype == ctype) {
                    var bhave = false;
                    for (var index = 0; index < linerole.length; index++) {
                        var element = linerole[index];
                        if (element.idx == (idx - this.mapWidth)) {
                            bhave = true;
                            break;
                        }
                    }
                    if (!bhave) {
                        linerole[linerole.length] = this._map[idx - this.mapWidth];
                        this.GetOneLineRole(idx - this.mapWidth,type,linerole);
                    }
                }
                if (downtype == ctype) {
                    var bhave = false;
                    for (var index = 0; index < linerole.length; index++) {
                        var element = linerole[index];
                        if (element.idx == (idx + this.mapWidth)) {
                            bhave = true;
                            break;
                        }
                    }
                    if (!bhave) {
                        linerole[linerole.length] = this._map[idx + this.mapWidth];
                        this.GetOneLineRole(idx + this.mapWidth,type,linerole);
                    }
                }
            }
        }
    },
    
    findNearestNull: function (ppos,role) {
        var cpos = this.getPosByPixelPos(ppos);
        var urole = this.getRoleByPos(cc.v2(cpos.x,cpos.y-1));
        var drole = this.getRoleByPos(cc.v2(cpos.x,cpos.y+1));
        var lrole = this.getRoleByPos(cc.v2(cpos.x-1,cpos.y));
        var rrole = this.getRoleByPos(cc.v2(cpos.x+1,cpos.y));
        var lurole = this.getRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
        var rurole = this.getRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
        var ldrole = this.getRoleByPos(cc.v2(cpos.x-1,cpos.y+1));
        var rdrole = this.getRoleByPos(cc.v2(cpos.x+1,cpos.y+1));
        var ulen,dlen,llen,rlen,lulen,rulen,ldlen,rdlen,lest,reppos;
        if (!urole || urole == role) {
            var uppos = this.getPixelPosByPos(cc.v2(cpos.x,cpos.y-1));
            ulen = uppos.sub(ppos).mag();
        }
        if (!drole || drole == role) {
            var dppos = this.getPixelPosByPos(cc.v2(cpos.x,cpos.y+1));
            dlen = dppos.sub(ppos).mag();
        }
        if (!lrole || lrole == role) {
            var lppos = this.getPixelPosByPos(cc.v2(cpos.x-1,cpos.y));
            llen = lppos.sub(ppos).mag();
        }
        if (!rrole || rrole == role) {
            var rppos = this.getPixelPosByPos(cc.v2(cpos.x+1,cpos.y));
            rlen = rppos.sub(ppos).mag();
        }
        if (!lurole || lurole == role) {
            var luppos = this.getPixelPosByPos(cc.v2(cpos.x-1,cpos.y-1));
            lulen = luppos.sub(ppos).mag();
        }
        if (!rurole || rurole == role) {
            var ldppos = this.getPixelPosByPos(cc.v2(cpos.x+1,cpos.y-1));
            rulen = ldppos.sub(ppos).mag();
        }
        if (!ldrole || ldrole == role) {
            var ruppos = this.getPixelPosByPos(cc.v2(cpos.x-1,cpos.y+1));
            ldlen = ruppos.sub(ppos).mag();
        }
        if (!rdrole || rdrole == role) {
            var rdppos = this.getPixelPosByPos(cc.v2(cpos.x+1,cpos.y+1));
            rdlen = rdppos.sub(ppos).mag();
        }
        ulen?(lest = ulen,reppos = uppos):null;
        dlen?(lest?(dlen < lest?(lest = dlen,reppos = dppos):null):(lest = dlen,reppos = dppos)):null;
        llen?(lest?(llen < lest?(lest = llen,reppos = lppos):null):(lest = llen,reppos = lppos)):null;
        rlen?(lest?(rlen < lest?(lest = rlen,reppos = rppos):null):(lest = rlen,reppos = rppos)):null;
        lulen?(lest?(lulen < lest?(lest = lulen,reppos = luppos):null):(lest = lulen,reppos = luppos)):null;
        rulen?(lest?(rulen < lest?(lest = rulen,reppos = ruppos):null):(lest = rulen,reppos = ruppos)):null;
        ldlen?(lest?(ldlen < lest?(lest = ldlen,reppos = ldppos):null):(lest = ldlen,reppos = ldppos)):null;
        rdlen?(lest?(rdlen < lest?(lest = rdlen,reppos = ruppos):null):(lest = rdlen,reppos = ruppos)):null;
        
        return reppos;
    },
    
    checkCanShake: function (idx,type,callback) {
        var rolenode = this._map[idx];
        var linerole = [];
        var result = false;
        if (rolenode) {
            linerole[0] = rolenode;
        }
        
        var DirType = cc.Enum({
           N: 0,
           U: 1,
           D: 2,
           L: 3,
           R: 4,
        });
        
        var retype = rolenode?rolenode.type:type;

        this.GetOneLineRole(idx,type,linerole);
        
        var log = "idx:"+idx+"linerole:";
        for (var index = 0; index < linerole.length; index++) {
            var element = linerole[index];
            log = log + "  " + element.idx;
        }
        
        //cc.log(log);
        
        var offset = 1;
        if (rolenode) {
            offset = 0;
        }
        
        var relinerole = [];
        for (var index = 0; index < linerole.length; index++) {
            var element = linerole[index];
            if (element.isShakeStateRequire()) {
                relinerole.push(element);
            }
        }
        
        if (linerole.length + offset >= this.samenum && retype != 0) {
            result = true;
        }
        
        if (callback) {
            callback(result,relinerole);
        }
        
        return {"result":result,"linerole":relinerole};
        
        // if (rolenode || type) {
        //     var ctnode = rolenode;
        //     if (ctnode|| type) {
        //         var ctype = ctnode?ctnode.type:type;
        //         var backtype = [this.samenum - 1];
        //         var leftnum = 0;
        //         for (var index = 0; index < this.samenum - 1; index++) {
        //             backtype[index] = this._map[idx - index - 1]?
        //             (this._map[idx - index - 1].type):0;
        //             if (backtype[index] != ctype) {
        //                 bBom = false;
        //                 break;
        //             }
        //             leftnum ++;
        //         }
        //         var rightnum = 0
        //         for (var index = 0; index < this.samenum - 1; index++) {
        //             backtype[index] = this._map[idx + index + 1]?
        //             (this._map[idx + index + 1].type):0;
        //             if (backtype[index] != ctype) {
        //                 bBom = false;
        //                 break;
        //             }
        //             rightnum ++;
        //         }
        //         var upnum = 0;
        //         for (var index = 0; index < this.samenum - 1; index++) {
        //             backtype[index] = this._map[idx - this.mapWidth *(index + 1)]?
        //             (this._map[idx - this.mapWidth *(index + 1)].type):0;
        //             if (backtype[index] != ctype) {
        //                 bBom = false;
        //                 break;
        //             }
        //             upnum ++;
        //         }
        //         var downnum = 0;
        //         for (var index = 0; index < this.samenum - 1; index++) {
        //             backtype[index] = this._map[idx + this.mapWidth *(index + 1)]?
        //             (this._map[idx + this.mapWidth *(index + 1)].type):0;
        //             if (backtype[index] != ctype) {
        //                 bBom = false;
        //                 break;
        //             }
        //             downnum ++;
        //         }
        //         if (leftnum + rightnum >= this.samenum-1) {
        //             result = true;
        //         }
        //         if (upnum + downnum >= this.samenum-1) {
        //             result = true;
        //         }
        //     }
        // }
        //cc.log("idx:"+idx+"leftnum:"+leftnum+"rightnum:"+rightnum+"upnum:"+upnum+"downnum:"+downnum)
        // if (callback) {
        //     callback(result,linerole);
        // }
        
        // return result;
    },
    
    
    checkCanDown: function (role) {
        if (!role) {
            return null;
        }
        var cpos = this.getPosByIndex(role.idx);
        var drole = this.getRoleByPos(cc.v2(cpos.x,cpos.y+1));
        if (drole) {
            var ldidx = this.getIndexByPos(cc.v2(cpos.x-1,cpos.y+1));
            var rdidx = this.getIndexByPos(cc.v2(cpos.x+1,cpos.y+1));
            var rrole = this.getRoleByPos(cc.v2(cpos.x+1,cpos.y));
            var lrole = this.getRoleByPos(cc.v2(cpos.x-1,cpos.y));
            if (!this._map[ldidx] && !lrole) {
                var r = Math.ceil(Math.random()*1+0);
                if (r) {
                    //return ldidx;
                }
            }
            if (!this._map[rdidx] && !rrole) {
                var r = Math.ceil(Math.random()*1+0);
                if (!r) {
                   //return rdidx;
                }
            }
        }
        else {
            return this.getIndexByPos(cc.v2(cpos.x,cpos.y+1));
        }

        return null;
    },
    
    
    loadMap: function () {
        var map = this.node.getComponent(cc.TiledLayer);
        map.enabled = false;
        this.mapWidth = this.node.parent.getComponent(cc.TiledMap).getMapSize().width;
        this.mapHeight = this.node.parent.getComponent(cc.TiledMap).getMapSize().height;
        this.tileWidth = this.node.parent.getComponent(cc.TiledMap).getTileSize().width;
        this.tileHeight = this.node.parent.getComponent(cc.TiledMap).getTileSize().height;
        var tiles = map.getTiles();
        var test = 2;
        for (var i in tiles) {
            i = Number(i);
            var bnot = tiles[i];
                // if (test <= 0) {
                //     break;
                // }
                // test --;
                var ppos = this.getPixelPosByPos(this.getPosByIndex(i))
                var pre = null;
                var type = 0;
                if (bnot == 0) {
                    var num = this.pre.length;
                    var canRTimes = 10000;
                    do{
                        canRTimes --;
                        if (canRTimes <= 0) {
                            break;
                        }
                        var r = Math.ceil(Math.random()*(num-1)+1);
                        var roleid = this.pre[r-1];
                        var roleinfo = DataMgr.instance.GetInfoByTalbeNameAndId("role",roleid);
                        type = roleinfo.id;
                    }while(this.checkCanShake(i,type).result);
                    pre = DataMgr.instance.GetPrefabById(roleinfo.prefabid);
                }else{
                    pre = this.stone;
                }
                if (!pre) {
                    continue;
                }
                var nd = cc.instantiate(pre);
                nd.x = ppos.x;
                nd.y = ppos.y;
                nd.parent = this.node;
                var rolenode = nd.getComponent(require("RoleNode"));
                rolenode.type = type;
                this.setRoleInIdx(rolenode,i);
                rolenode.changeState(require("RoleNode").StateType.IDLE);
        }   
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});
