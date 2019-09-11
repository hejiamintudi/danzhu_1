cc.Class({
    extends: cc.Component,
    properties: {
    },
    onLoad () {
        ai.isWin = false;
    },

    buttonAdd () {
        hjm._buttonTop = [cc.v2(hjm._buttonLayer.buttonAdd)];
        this.node.touch = "add";
    },

    buttonSub () {
        hjm._buttonTop = [cc.v2(hjm._buttonLayer.buttonSub)];
        this.node.touch = "sub";
    },

    buttonMove () {
        hjm._buttonTop = [cc.v2(hjm._buttonLayer.buttonMove)];
        this.node.touch = "move";
    },

    buttonFlag () {
        hjm._buttonTop = [cc.v2(hjm._buttonLayer.buttonFlag)];
        this.node.touch = "flag";
    },

    buttonPlay () {
        hjm._buttonTop = [cc.v2(hjm._buttonLayer.buttonPlay)];
        this.node.touch = "play";
    },

    addOn (p) {
        let node = hjm._yDotPool.add();
        p.x = Math.floor(p.x);
        p.y = Math.floor(p.y);
        node.setPosition(p);
        let dataArr = this.dataArr;
        let data = {
            node: node,
            type: 0,
            pos: cc.v2(p),
            levelId: null // 跳转到第几个关卡
        }   
        dataArr.push(data);
    },

    getDataId (p) {
        let arr = [...this.dataArr];
        dyl.arr(arr, function (id, node) {
            if (node.pos) {
                return [node.node];
            }
        })
        let node = p.in(...arr);
        if (!node) {
            return null;
        }
        return dyl.get(arr, node);
    },

    subOn (p) {
        let id = this.getDataId(p);
        if (id === null) {
            return;
        }
        this.dataArr[id].node.del();
        dyl.set(this.dataArr, id, 1);
    },

    flagOn (p) {
        let id = this.getDataId(p);
        if (id === null) {
            return;
        }
        let data = this.dataArr[id];
        if (data.type === 0) { // 小黄点变小红点
            cc.log("变红")
            let node = hjm._rDotPool.add();
            data.node.del();
            data.node = node;
            node.setPosition(data.pos);
            data.type = 1;
        }
        else {
            cc.log("变黄")
            let node = hjm._yDotPool.add();
            data.node.del();
            data.node = node;
            node.setPosition(data.pos);
            data.type = 0;    
        }
    },

    moveOn (p) {
        let id = this.getDataId(p);
        if (id === null) {
            return;
        }
        return [this.dataArr[id]];
    },

    moveMove (p, data) {
        p.x = Math.floor(p.x);
        p.y = Math.floor(p.y);
        data.node.setPosition(p);
        data.pos = p;
        return [data];
    },

    playOn (p) {
        let id = this.getDataId(p);
        if (id === null) {
            return;
        }
        let data = this.dataArr[id];
        if (data.levelId !== null) {
            cc.director.loadScene("play");
        }
    },

    start () {
        this.dataArr = [];
        this.initData([0,-179,321,0,-190,380,1,-146,-350,0,-104,-347,0,-78,-338,1,-42,-321,0,6,-291,0,22,-249,0,-30,-214,0,-65,-170,1,-53,-142,0,13,-95,0,13,-11,1,-67,50,0,-96,83,0,-96,133,0,-91,139,0,-45,176,0,-12,202,1,26,228,0,-186,325]);

        this.initLevel();

        this.node.touch = "play";
        dyl.button(this, hjm._buttonLayer);

        // this.node.ss = this.showData;
        // this.node.zz = (arr)=>this.initData(arr);
        cc.hh = this;
    },

    initLevel () {
        let arr = hjm.levelArr;
        let dataId = 0;
        for (let i = 0; i < arr.length; i++) {
            let num = arr[i];
            if (!num) {
                break;
            }
            for (let j = dataId; j < this.dataArr.length; j++) {
                let data = this.dataArr[j];
                if (data.type === 1) {
                    dataId = j + 1;
                    data.node.num = num;
                    data.levelId = i;
                    break;
                }
            }
        }
        for (let i = dataId; i < this.dataArr.length; i++) {
            let data = this.dataArr[i];
            if (data.type === 1) {
                data.node.num = 0;
                data.levelId = 0;
                break;
            }
        }
    },

    //  用来描绘地图的
    initData (arr) {
        for (let i = 0; i < arr.length; i += 3) {
            let data = {};
            data.type = arr[i];

            let x = arr[i + 1];
            let y = arr[i + 2];
            let pos = cc.v2(x, y);
            data.pos = pos;
            data.levelId = null;

            if (data.type === 0) {
                let node = hjm._yDotPool.add();
                node.setPosition(pos);
                data.node = node;
            }
            else {
                let node = hjm._rDotPool.add();
                node.setPosition(pos);
                data.node = node;
            }
            this.dataArr.push(data);
        }
    },

    showData () {
        let arr = [];
        for (let i = 0; i < this.dataArr.length; i++) {
            let data = this.dataArr[i];
            arr.push(data.type, data.pos.x, data.pos.y);
        }
        cc.log("[" + String(arr) + "]");
    },

    // update (dt) {},
});
