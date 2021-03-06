var DataMgr = require("DataMgr");
var PoolMgr = require("PoolMgr");
var MapLayoutHandle = cc.Class({
    extends: cc.Component,

    properties: {
        
        selectRole: {
            default: null,
            visible: false,
        },
        
        guid: {
            default: 0,
            visible: false,
        },
        
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

        score: {
            default: 0,
            visible: false,
        },

        pause: {
            default: false,
            visible: false,
        },

        stage: {
            default: null,
            visible: false,
        },

        playTime: {
            default: 0,
            visible: false,
        },

        CurrentStageParamInfo: {
            default: null,
            visible: false,
        },

        CurrentStageAllWeight: {
            default: 0,
            visible: false,
        },
        
        info: null,

        _map: [],
        
    },
   

    // use this for initialization
    onLoad: function () {
        this.guid = 0;
        this.loadMap();
    },
    
    GetPosByIndex:  function (idx) {
        var pos = cc.v2(idx%this.mapWidth,Math.floor(idx/this.mapWidth));
        return pos;
    },
    
    GetIndexByPos:  function (pos) {
        return pos.x + pos.y * this.mapWidth;
    },
    
    GetPosByPixelPos:  function (ppos) {
        var widx = Math.floor(ppos.x/this.tileWidth);
        var hidx = this.mapHeight - 1 - Math.floor(ppos.y/this.tileHeight);
        
        return cc.v2(widx,hidx);
    },
    
    
    GetPixelPosByPos:  function (pos) {
        var map = this.node.getComponent(cc.TiledLayer)
        var ppos = map.getPositionAt(pos);
        ppos.x = ppos.x + this.tileWidth/2;
        ppos.y = ppos.y + this.tileHeight/2;
        return ppos;
    },
    
    GetRoleByPos:  function (pos) {
        return this._map[this.GetIndexByPos(pos)];
    },

    GetRoleByIndex:  function (idx) {
        return this._map[idx];
    },
    
    SetRoleInIdx: function (role,idx) {
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
                var ctype = ctnode?ctnode.info.type:type;
                var lefttype = this._map[idx - 1]?this._map[idx - 1].info.type:0;
                var righttype = this._map[idx + 1]?this._map[idx + 1].info.type:0;
                var uptype = this._map[idx - this.mapWidth]?this._map[idx - this.mapWidth].info.type:0;
                var downtype = this._map[idx + this.mapWidth]?this._map[idx + this.mapWidth].info.type:0;
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

    Out: function () {
        this.stage.destroy();
    },

    AddScore: function (score) {
        this.score += score;
    },

    GetMapCenterPPos: function () {
        return cc.v2(this.mapWidth*this.tileWidth/2,this.mapHeight*this.tileHeight/2);
    },

    GetScorePercent: function () {
        var re = 0;
        if (this.CurrentStageParamInfo) {
            var paramlist = DataMgr.instance.GetTalbeByName("stageparam");
            var index = this.CurrentStageParamInfo?this.CurrentStageParamInfo.id:0;
            for (; index < paramlist.length; index++) {
                var element = paramlist[index];
                if (element.stageid == this.info.id) {
                    if (element.type == 1) {
                        re = (this.playTime - this.CurrentStageParamInfo.param)/(element.param - this.CurrentStageParamInfo.param);
                        break;
                    }
                    else if (element.type == 2) {
                        re = (this.score - this.CurrentStageParamInfo.param)/(element.param - this.CurrentStageParamInfo.param);
                        break;
                    }
                    break;
                }
            }      
        }


        return re;
    },

    FindTenWordRole: function (idx) {
        var rolelist = [];
        var pos = this.GetPosByIndex(idx);
        for (var i = 0;i < this.mapWidth;i ++) {
            var role = this.GetRoleByPos(cc.v2(i,pos.y));
            if (role) {
                rolelist[rolelist.length] = role;
            }
        }
        for (var i = 0;i < this.mapHeight;i ++) {
            var role = this.GetRoleByPos(cc.v2(pos.x,i));
            if (role) {
                rolelist[rolelist.length] = role;                
            }
        }

        return rolelist;
    },

    CheckFailed: function () {
        for (var index = 0; index < this._map.length; index++) {
            var role = this._map[index];
            if (!role) {
                return false;
            }
        }
        return true;
    },

    CheckInBorder: function (ppos) {
        var cpos = this.GetPosByPixelPos(ppos);
        var borderRect = new cc.rect(this.info.borderX == -1?0:this.info.borderX, 
        this.info.borderY == -1?0:this.info.borderY, 
        this.info.borderWidth == -1?this.mapWidth:this.info.borderWidth-1, 
        this.info.borderHeight == -1?this.mapHeight:this.info.borderHeight-1);
        return cc.rectContainsPoint(borderRect, cpos);
    },

    GetRoundRoleByIdx: function (idx) {
        var rolelist = [];
        var cpos = this.GetPosByIndex(idx);
        var urole = this.GetRoleByPos(cc.v2(cpos.x,cpos.y-1));
        var drole = this.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
        var lrole = this.GetRoleByPos(cc.v2(cpos.x-1,cpos.y));
        var rrole = this.GetRoleByPos(cc.v2(cpos.x+1,cpos.y));
        var lurole = this.GetRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
        var rurole = this.GetRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
        var ldrole = this.GetRoleByPos(cc.v2(cpos.x-1,cpos.y+1));
        var rdrole = this.GetRoleByPos(cc.v2(cpos.x+1,cpos.y+1));

        urole?rolelist[rolelist.length] = urole:null;
        drole?rolelist[rolelist.length] = drole:null;
        lrole?rolelist[rolelist.length] = lrole:null;
        rrole?rolelist[rolelist.length] = rrole:null;
        lurole?rolelist[rolelist.length] = lurole:null;
        rurole?rolelist[rolelist.length] = rurole:null;
        ldrole?rolelist[rolelist.length] = ldrole:null;
        rdrole?rolelist[rolelist.length] = rdrole:null;    

        return rolelist;    
    },
    
    FindNearestNull: function (ppos,role) {
        var cpos = this.GetPosByPixelPos(ppos);
        var urole = this.GetRoleByPos(cc.v2(cpos.x,cpos.y-1));
        var drole = this.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
        var lrole = this.GetRoleByPos(cc.v2(cpos.x-1,cpos.y));
        var rrole = this.GetRoleByPos(cc.v2(cpos.x+1,cpos.y));
        var lurole = this.GetRoleByPos(cc.v2(cpos.x-1,cpos.y-1));
        var rurole = this.GetRoleByPos(cc.v2(cpos.x+1,cpos.y-1));
        var ldrole = this.GetRoleByPos(cc.v2(cpos.x-1,cpos.y+1));
        var rdrole = this.GetRoleByPos(cc.v2(cpos.x+1,cpos.y+1));
        var ulen,dlen,llen,rlen,lulen,rulen,ldlen,rdlen,lest,reppos;
        if (!urole || urole == role) {
            var uppos = this.GetPixelPosByPos(cc.v2(cpos.x,cpos.y-1));
            if (this.CheckInBorder(uppos)) {
                ulen = uppos.sub(ppos).mag();
            }
            
        }
        if (!drole || drole == role) {
            var dppos = this.GetPixelPosByPos(cc.v2(cpos.x,cpos.y+1));
                        if (this.CheckInBorder(dppos)) {                 dlen = dppos.sub(ppos).mag();             }
        }
        if (!lrole || lrole == role) {
            var lppos = this.GetPixelPosByPos(cc.v2(cpos.x-1,cpos.y));
                        if (this.CheckInBorder(lppos)) {                 llen = lppos.sub(ppos).mag();             }
        }
        if (!rrole || rrole == role) {
            var rppos = this.GetPixelPosByPos(cc.v2(cpos.x+1,cpos.y));
                        if (this.CheckInBorder(rppos)) {                 rlen = rppos.sub(ppos).mag();             }
        }
        if (!lurole || lurole == role) {
            var luppos = this.GetPixelPosByPos(cc.v2(cpos.x-1,cpos.y-1));
                        if (this.CheckInBorder(luppos)) {                 lulen = luppos.sub(ppos).mag();             }
        }
        if (!rurole || rurole == role) {
            var ruppos = this.GetPixelPosByPos(cc.v2(cpos.x+1,cpos.y-1));
                        if (this.CheckInBorder(ruppos)) {                 rulen = ruppos.sub(ppos).mag();             }
        }
        if (!ldrole || ldrole == role) {
            var ldppos = this.GetPixelPosByPos(cc.v2(cpos.x-1,cpos.y+1));
                        if (this.CheckInBorder(ldppos)) {                 ldlen = ldppos.sub(ppos).mag();             }
        }
        if (!rdrole || rdrole == role) {
            var rdppos = this.GetPixelPosByPos(cc.v2(cpos.x+1,cpos.y+1));
                        if (this.CheckInBorder(rdppos)) {                 rdlen = rdppos.sub(ppos).mag();             }
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
    
    CheckCanShake: function (idx,type,callback) {
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
        
        var retype = rolenode?rolenode.info.type:type;

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
            if (element.IsShakeStateRequire()) {
                relinerole.push(element);
            }
        }
        
        var typeinfo = DataMgr.instance.GetInfoByTalbeNameAndId("roletype",retype);
        var bneednum = false
        var mergeroleid = 0;
        var length = typeinfo?typeinfo.mergeNeedNum.length:0;
        for (var i = 0;i < length;i ++) {
            if (typeinfo.mergeNeedNum[i]) {
                if (relinerole.length + offset >= typeinfo.mergeNeedNum[i]) {
                    bneednum = true;
                    mergeroleid = typeinfo.mergeToRole[i];
                }
            }
        }
        
        if (bneednum && retype != 0) {
            result = true;
        }
        
        if (callback) {
            callback(result,relinerole);
        }
        
        return {"result":result,"linerole":relinerole,"mergeroleid":mergeroleid};
    },
    
    
    CheckCanDown: function (role) {
        if (!role) {
            return null;
        }
        var cpos = this.GetPosByIndex(role.idx);
        var drole = this.GetRoleByPos(cc.v2(cpos.x,cpos.y+1));
        if (drole) {
            var ldidx = this.GetIndexByPos(cc.v2(cpos.x-1,cpos.y+1));
            var rdidx = this.GetIndexByPos(cc.v2(cpos.x+1,cpos.y+1));
            var rrole = this.GetRoleByPos(cc.v2(cpos.x+1,cpos.y));
            var lrole = this.GetRoleByPos(cc.v2(cpos.x-1,cpos.y));
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
            return this.GetIndexByPos(cc.v2(cpos.x,cpos.y+1));
        }

        return null;
    },


    CreateRole: function (roleid,idx,state) {
        var roleinfo = DataMgr.instance.GetInfoByTalbeNameAndId("role",roleid);
        if (roleinfo) {
            this.guid ++;
            var ppos = this.GetPixelPosByPos(this.GetPosByIndex(idx));
            // var pre = DataMgr.instance.GetPrefabById(roleinfo.prefabid);
            // if (!pre) {
            //     return;
            // }
            // var nd = cc.instantiate(pre);
            var nd = PoolMgr.instance.GetNodeByPreId(roleinfo.prefabid);
            var rolenode = nd.getComponent(require("RoleNode"));
            
            nd.x = ppos.x;
            nd.y = ppos.y;
            nd.parent = this.node;

            if (rolenode.guid != 0) {
                rolenode.Clear();
                rolenode.onLoad();
            }
            rolenode.guid = this.guid;
            rolenode.InitInfo(roleinfo);
            this.SetRoleInIdx(rolenode,idx);
            rolenode.ChangeState(state);
        }
    },


    RemoveRole: function (role) {
        //role.node.destroy();
        PoolMgr.instance.RemoveNodeByPreId(role.info.prefabid,role.node);
        role._brefresh = false;
        role.ClearBuff();
        var oldrole = this.GetRoleByIndex(role.idx);
        if (oldrole && oldrole.guid == role.guid) {
            this.SetRoleInIdx(null,role.idx);
        }
    },
    
    
    loadMap: function () {
        PoolMgr.instance.InitPre();
        var map = this.node.getComponent(cc.TiledLayer);
        map.enabled = false;
        var mapparent = this.node.parent.getComponent(cc.TiledMap);
        this.stage = mapparent.node.parent;
        this.mapWidth = this.node.parent.getComponent(cc.TiledMap).getMapSize().width;
        this.mapHeight = this.node.parent.getComponent(cc.TiledMap).getMapSize().height;
        this.tileWidth = this.node.parent.getComponent(cc.TiledMap).getTileSize().width;
        this.tileHeight = this.node.parent.getComponent(cc.TiledMap).getTileSize().height;
        var tiles = map.getTiles();
        // var tileset = map.getTileset();
        // var pro = map.getProperties();
        var test = 2;
        for (var i = 0;i < tiles.length;i ++) {
            i = Number(i);
            var bnot = tiles[i];
                // if (test <= 0) {
                //     break;
                // }
                // test --;
                
                var type = 0;
                var roleid = 0;
                var roleinfo = null;
                if (bnot == 0) {
                    var num = this.info.roleid.length;
                    var canRTimes = 10000;
                    do{
                        canRTimes --;
                        if (canRTimes <= 0) {
                            break;
                        }
                        var r = Math.ceil(Math.random()*(num));
                        roleid = this.info.roleid[r-1];
                        roleinfo = DataMgr.instance.GetInfoByTalbeNameAndId("role",roleid);
                        type = roleinfo?roleinfo.type:0;
                    }while(this.CheckCanShake(i,type).result);
                    
                }else{
                    var tilepro = mapparent.getPropertiesForGID(bnot);
                    if (tilepro) {
                        roleid = Number(tilepro.id);
                        roleinfo = DataMgr.instance.GetInfoByTalbeNameAndId("role",roleid);
                    }
                    
                }
                this.CreateRole(roleid,i,require("RoleNode").StateType.IDLE);
        }   
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (!this.pause) {
            var oldtime = this.playTime;
            this.playTime += dt;
            var nowtime = this.playTime;
            
            if (Math.floor(nowtime) - Math.floor(oldtime) >= 1) {
                var bF = this.CheckFailed();
                if (bF) {
                    this.pause = true;
                    require("FailedDlg").Show();
                }
            }
        }
    },

    onDestroy: function () {
        PoolMgr.instance.ClearPool();

        require("BuffMgr").instance.ClearBuff();
    }
});
