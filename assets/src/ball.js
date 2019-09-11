// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    onLoad () {
        let r = 0.5 * this.node.width;

        let arr = [...hjm._enLayer.getChildren(), ...hjm._buffLayer.getChildren()];
        // arr = [];
        dyl.arr(arr, function (id, node) {
            node.w = node.width * 0.5;
            node.h = node.height * 0.5;
        })
        this.boxArr = arr;

        this.node.add = (v, t)=>{
            // cc.log("........................");
            // cc.log("add", "nodeX, nodeY, vx, vy");
            // cc.log(this.node.x, this.node.y, v.x, v.y);
            this.getCollisionData(cc.v2(this.node), r, v, arr);
            this.collisionData.maxT = this.minT;
            this.collisionData.t = t || 0;
            this.collisionData.v = v;
            return this.collisionData;
        }
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        // let type = otherCollider.node.type;
        let type = otherCollider.type;
        // otherCollider = 

        if (type === "en") {
            let hero = hjm._hero;
            let en = otherCollider;
            hero.def -= en.atk;
            en.def -= hero.atk;
            hjm._hpPool.add(cc.v2(en), -hero.atk);
            hjm._hpPool.add(cc.v2(-480, -890), -en.atk);
        }
        else if (type === "buff") {
            // cc.log("buff");
            hjm._hero.atk++;
        }
    },

    getCollisionData (op, r, v, boxArr) {
        let up = 960;
        let down = -810;
        let left = -540;
        let right = 540;


        this.minT = 100000;
        this.collisionData = {
            ox: 0, // 
            oy: 0,  // 
            vx: 0,
            vy: 0,
            box: null
        }

        let vx = v.x;
        let vy = v.y;
        let a = vy;
        let b = -vx;
        let c = vx * op.y - op.x * vy; 
        let ox = op.x;
        let oy = op.y;

        let minNum = 0.0001;
        for (var i = boxArr.length - 1; i >= 0; i--) {
            if (!boxArr[i].active) {
                continue;
            }
            let {x, y, w, h} = boxArr[i]; // w h 已经经过除2处理了
            let sx = x - op.x;
            let sy = y - op.y;
            if ((sx * vx + sy * vy) <= 0) { // 远离情况不考虑
                continue; 
            } 

            let dx = 0; // 代表速度的反方向
            let dy = 0;

            if (vx < -minNum) {
                let checkData = this.checkXLine(x + w, y - h, y + h, a, b, c, ox - r, oy, ox, oy, vx, vy, r, boxArr[i]);
                if (checkData) {
                    continue;
                }
                dx = 1;
            }
            else if (vx > minNum) {
                let checkData = this.checkXLine(x - w, y - h, y + h, a, b, c, ox + r, oy, ox, oy, vx, vy, r, boxArr[i]);
                if (checkData) {
                    continue;
                }
                dx = -1;
            }

            if (vy < -minNum) {
                let checkData = this.checkYLine(y + h, x - w, x + w, a, b, c, ox, oy - r, ox, oy, vx, vy, r, boxArr[i]);
                if (checkData) {
                    continue;
                }
                dy = 1;
            }
            else if (vy > minNum) {
                let checkData = this.checkYLine(y - h, x - w, x + w, a, b, c, ox, oy + r, ox, oy, vx, vy, r, boxArr[i]);
                if (checkData) {
                    continue;
                }
                dy = -1;
            }

            if (dx === 0) {
                this.checkDot(x - w, dy * h + y, vx, vy, ox, oy, r, boxArr[i]);
                this.checkDot(x + w, dy * h + y, vx, vy, ox, oy, r, boxArr[i]);
            }
            else if (dy === 0) {
                this.checkDot(dx * w + x, y - h, vx, vy, ox, oy, r, boxArr[i]);
                this.checkDot(dx * w + x, y + h, vx, vy, ox, oy, r, boxArr[i]);
            }
            else {
                this.checkDot(dx * w + x, dy * h + y, vx, vy, ox, oy, r, boxArr[i]);
                this.checkDot(-dx * w + x, dy * h + y, vx, vy, ox, oy, r, boxArr[i]);
                this.checkDot(dx * w + x, -dy * h + y, vx, vy, ox, oy, r, boxArr[i]);
            }
        }

        // checkXLine (x, y1, y2, a, b, c, x0, y0, ox, oy, vx, vy, r) 
        if (vx > minNum) {
            this.checkXLine(right, up, down, a, b, c, ox + r, oy, ox, oy, vx, vy, r, null);
            // this.checkXLine(right, up);
            // this.checkXLine(right, down);
        }
        else if (vx < -minNum) {
            this.checkXLine(left, up, down, a, b, c, ox - r, oy, ox, oy, vx, vy, r, null);
            // this.checkXLine(left, up);
            // this.checkXLine(left, down);    
        }

        //checkYLine (y, x1, x2, a, b, c, x0, y0, ox, oy, vx, vy, r)
        if (vy > minNum) {
            this.checkYLine(up, left, right, a, b, c, ox, oy + r, ox, oy, vx, vy, r, null);
            // this.checkYLine(left, up);
            // this.checkYLine(right, up);
        }
        else if (vy < -minNum) {
            this.checkYLine(down, left, right, a, b, c, ox, oy - r, ox, oy, vx, vy, r, null);
            // this.checkYLine(left, down);
            // this.checkYLine(right, down);    
        }
    },

    checkDot (x, y, vx, vy, ox, oy, r, box) {
        // cc.log("checkDot", "x, y, vx, vy, ox, oy, r");
        let kx = ox - x;
        let ky = oy - y;
        let a = vx * vx + vy * vy;
        let b = 2 * (vx * kx + vy * ky);
        let c = kx * kx + ky * ky - r * r;
        let k = b * b - 4 * a * c;
        if (k <= 0) {
            return false;
        }
        k = Math.sqrt(k);
        let t = (-b - k) * 0.5 / a;
        if (t >= this.minT) {
            return false;
        }

        let px = x - (ox + vx * t);
        let py = y - (oy + vy * t);
        let tmp = Math.sqrt(px * px + py * py);
        px = px / tmp;
        py = py / tmp;
        let len = px * vx + py * vy;
        px = -2 * px * len;
        py = -2 * py * len;

        let collisionData = {
            ox: ox,
            oy: oy,
            vx: vx + px,
            vy: vy + py,
            box: box
        }
        // cc.log("dot", x, y, collisionData);
        this.collisionData = collisionData;
        this.minT = t;
        return true;
    },

    // true 可以到达线，false 不能到达线段， 可以试试两个点
    checkXLine (x, y1, y2, a, b, c, x0, y0, ox, oy, vx, vy, r, box) {
        // cc.log("checkXLine", "x, y1, y2, a, b, c, x0, y0, ox, oy, vx, vy, r");
        // cc.log(x, y1, y2, a, b, c, x0, y0, ox, oy, vx, vy, r);
        let k = a * (x - x0) - b * y0;
        if ((k + b * y1) * (k + b * y2) <= 0) { // 碰到线
            let t = (x - x0) / vx;
            if (t >= this.minT) { // 没有比其他的好，所以取消
                return true; 
            }
            let collisionData = {
                ox: ox,
                oy: oy,
                vx: -vx,
                vy: vy,
                box: box
            }
            // cc.log("x", x, collisionData);
            this.collisionData = collisionData;
            this.minT = t;
            return true;
        }
        return false;
    },

    // true 成功了  false 到达线，但 t 太大了。 null 两个点还有机会
    checkYLine (y, x1, x2, a, b, c, x0, y0, ox, oy, vx, vy, r, box) {
        // cc.log("checkYLine", "y, x1, x2, a, b, c, x0, y0, ox, oy, vx, vy, r");
        // let k = a * (x - x0) - b * y0;
        let k = b * (y - y0) - a * x0;
        if ((k + a * x1) * (k + a * x2) <= 0) { // 碰到线
            let t = (y - y0) / vy;
            if (t >= this.minT) { // 没有比其他的好，所以取消
                return true; 
            }
            let collisionData = {
                ox: ox,
                oy: oy,
                vx: vx,
                vy: -vy,
                box: box
            }
            // cc.log("y", y, collisionData);
            this.collisionData = collisionData;
            this.minT = t;
            return true;
        }
        return false;
    },
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    // start () {

    // },

    // update (dt) {},
});
