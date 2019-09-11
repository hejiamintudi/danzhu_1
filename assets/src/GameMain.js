cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad () {
        // this.曾棠 = 0;
        // ai.isWin = false;


        this.initVar();
        this.initRole();
        this.initBuff();
    },

    start () {
        this.node.touch = "stand";
        this.showHero();
    },

    initBuff () {
        let arr = hjm._buffLayer.getChildren();
        for (let i = 0; i < arr.length; i++) {
            let buff = arr[i];
            buff.type = "buff";
        }
    },

    endGame (isWin) {
        this.ballStop();
        hjm._endLab = [true];
        if (isWin) {
            if (!ai.isWin) {
                hjm.levelArr = [...hjm.levelArr, 2];
                ai.isWin = true;
            }
            hjm._endLab.str = "胜 利";
        }
        else {
            hjm._endLab.str = "失 败";   
        }
    },

    initRole () {
        let self = this;
        let copyData = function(role, tab) {
            role.hp = "0" + tab.hp;
            role.oriData = tab;
            role.resetData = function () {
                this.atk = this.oriData.atk;
                this.def = this.oriData.def;
                this.buff = this.oriData.buff;
            }
            if (role.type === "en") {
                role.def = function(oldVale, newValue) {
                    if (role.def < 0) {
                        role.hp += role.def;
                        role.def = 0;
                        if (role.hp <= 0) {
                            // cc.log(role.name, "已经阵亡了");
                            hjm._buffLayer[role.name] = true;
                            role.active = false;
                            if ((--self._enNum) === 0) {
                                self.endGame(true);
                            }
                        }
                    }
                }
            }
            let updateFun = dyl.update();
            let ii = 0;
            let color = role.color;
            let hurtNode = (role.type === "en") ? role : hjm._heroDataLab;
            role.hurtAct = function (v) {
                let t = 0.2;
                this.en = v.mul(10 / v.mag());
                this.spr = cc.color(255, 255, 255);
                let vv = ii++;
                updateFun((dt)=>{
                    t -= dt;
                    if (t >= 0) {
                        return true;
                    }
                    else {
                        this.en = cc.v2(0, 0);
                        this.spr = color;
                        return false;
                    }
                })
                // dyl.update(updateFun);
            }
            role.resetData();
            if (tab.showStr)  {
                role.showStr = tab.showStr;
            }
        }
        let heroTab = {
            hp: 20,
            atk: 1,
            def: 0,
            buff: []
        }
        copyData(hjm._hero, heroTab);
        hjm._hero.atk = function (value) {
            hjm._heroDataLab.atk = value;
        }
        hjm._hero.hp = function (value) {
            hjm._heroDataLab.hp = value;
        }
        hjm._hero.def = function (value) {
            hjm._heroDataLab.def = value;
            let role = hjm._hero;
            if (role.def < 0) {
                role.hp += role.def;
                role.def = 0;
                if (role.hp <= 0) {
                    cc.log(role.name, "已经阵亡了");
                    self.endGame(false);
                }
            }
        }


        let enArr = hjm._enLayer.getChildren();
        let en1Tab = {
            hp: 5,
            atk: 1,
            def: 5,
            showStr: "一个有护甲的小怪而已",
            buff: []
        }
        enArr[0].name = "en1";
        enArr[0].type = "en";
        copyData(enArr[0], en1Tab);
        let en2Tab = {
            hp: 20,
            atk: 3,
            def: 0,
            showStr: "攻击力比较高，有点伤",
            buff: []
        }
        enArr[1].name = "en2";
        enArr[1].type = "en";
        copyData(enArr[1], en2Tab);
    },

    showRoleData (role, showLab) {
        hjm._heroDataLab   = [false];
        hjm._enDataLab     = [false];
        hjm._buffDataLab   = [false];

        showLab.active     =  true;
        showLab.hp         =  role.hp;
        showLab.atk        =  role.atk;
        showLab.def        =  role.def;
        showLab.showStr    =  role.showStr;
    },

    showHero () {
        this.showRoleData(hjm._hero, hjm._heroDataLab);
    },

    showEn (en) {
        this.showRoleData(en, hjm._enDataLab);
        // hjm._enDataLab.en.getComponent(cc.Sprite).spriteFrame = en.en.getComponent(cc.Sprite).spriteFrame;
        hjm._enDataLab.en = en.en; // 复制图片
    },

    showBuff (buff) {

    },

    initVar () {
        // this._moveEndTime = 0;
        this._enNum = 2;
        // hjm._hero.body = hjm._hero.getComponent(cc.RigidBody);
    },

    standOn (p) {
        // if (p.in(hjm._hero)) {
        //     this.showHero();
        //     return;
        // }
        // let en = p.in(...hjm._enLayer.getChildren());
        // if (en) {
        //     this.showEn(en);
        //     return;
        // }
        if (p.in(hjm._skillButtonLayer)) {
            return;
        }

        hjm._moveLab = [true];
        hjm._moveLab.arrow = false;
        hjm._moveLab.spr1 = p;
        hjm._moveLab.spr2 = p;
        return [p];
    },

    standMove (pos, oriP) {
        hjm._moveLab.spr2 = pos;

        let p = pos.sub(oriP);
        if (p.magSqr() < 2) { // 太短了
            hjm._moveLab.arrow = false;
            return [oriP]
        }
        else {
            hjm._moveLab.arrow = true;
            hjm._moveLab.arrow = cc.v2(hjm._hero);
            hjm._moveLab.arrow = [this.pToAngle(p.mul(-1))];
            return [oriP, p];
        }
        return;
    },

    standEnd (pos, oriP, p) {
        hjm._moveLab = [false];
        if (p) {
            this.ballMove(p.mul(-1));
        }
    },

    pToAngle (p) {
        let x = p.x;
        let y = p.y;
        let minNum = 0.001;
        if (-minNum <= x && x <= minNum) {
            if (p.y > 0) {
                return -90;
            }
            else {
                return 90;
            }
        }
        else if (-minNum <= y && y <= minNum) {
            if (p.x > 0) {
                return 0;
            }
            else {
                return 180;
            }
        }

        let tan = y / x;
        let angle = Math.atan(tan) * 180 / Math.PI;
        if (x < 0) {
            angle += 180;
        }
        return -angle;

        // let ang = p.signAngle(cc.v2(1, 0)) * 180 / Math.PI;
        // cc.log(p.x, p.y, ang);
        // return ang;
    },

    ballMove (p) {
        hjm._hero.back = true;
        let len = p.mag();
        p = p.mul(1 / len);
        let speed = 2000;

        this.moveData = hjm._hero.add(p.mul(speed));
        // cc.log("v", p.mul(speed));
        // cc.log("moveData", this.moveData);

        this.node.touch = "move";

        this.showHero();
    },

    // ballMove (p) {
    //     let len = p.mag();
    //     p = p.mul(1 / len);
    //     let speed = 2000;
    //     let body = hjm._hero.body;
    //     body.linearVelocity = p.mul(speed);
    //     cc.log(p.mul(speed))
    //     body.linearDamping = 0;
    //     this._moveEndTime = 3;
    //     this.node.touch = "move";

    //     this.showHero();
    // },

    ballStop () {
        this.node.touch = "stand";
        let roleArr = [hjm._hero, ...hjm._enLayer.getChildren()];
        for (let i = 0; i < roleArr.length; i++) {
            roleArr[i].resetData();
        }
        hjm._hero.back = false;
        this.showHero();
    },

    // ballStop () {
    //     hjm._hero.body.linearVelocity = cc.v2(0, 0);
    //     this._moveEndTime = 0;
    //     this.node.touch = "stand";
    //     let roleArr = [hjm._hero, ...hjm._enLayer.getChildren()];
    //     for (let i = 0; i < roleArr.length; i++) {
    //         roleArr[i].resetData();
    //     }

    //     this.showHero();
    // },

    moveOn (p) {
        this.ballStop();
    },

    // 判断球到box位置的最短时间，false代表不会碰撞
    // 返回的对象，包括 时间，终点，最后的方向
    ballXBox (op, r, v, box) {
        let bp = cc.v2(box); // box 的位置
        // 判断是否远离box
        let p = bp.sub(op);
        if ((p.x * v.x + p.y * v.y) <= 0) {
            return false;
        }

        // 获取过圆心速度的的直线方程
        // v.y (x - op.x) = v.x (y - op.y)
        let a = v.y;
        let b = -v.x;
        let c = v.x * op.y - op.x * v.y; 

        // 判断是否相遇

    },

    onBeginContact: function (box) {
        if (!box) {
            return;
        }
        let type = box.type;

        if (type === "en") {
            let hero = hjm._hero;
            let en = box;
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

    update (dt) {
        if (this.node.touch !== "move") {
            return;
        }
        let data = this.moveData;
        data.t += dt;
        let ball = hjm._hero;
        // cc.log("update", "data.t, data.v.x, data.v.y, data.ox, data.oy");
        // cc.log(data.t, data.v.x, data.v.y, data.ox, data.oy);
        if (data.t >= data.maxT) { // 碰撞了
            ball.setPosition(data.maxT * data.v.x + data.ox, data.maxT * data.v.y + data.oy);
            this.onBeginContact(data.box);
            cc.log("...........");
            cc.log(data.box);
            if (data.box) {
                hjm._hurt.add(cc.v2(ball).add(data.box).mul(0.5));
                cc.log(data.box);
                cc.log(data.box.type);
                if (data.box.type === "en") {
                    cc.log("eeeeeeeeeeee");
                    ball.hurtAct(cc.v2(data.v.mul(-1)));
                    data.box.hurtAct(cc.v2(data.v));
                }
            }
            this.moveData = hjm._hero.add(cc.v2(data.vx, data.vy), data.t - data.maxT);
        }
        else {
            ball.setPosition(data.t * data.v.x + data.ox, data.t * data.v.y + data.oy);
        }
        let angle = this.pToAngle(this.moveData.v.mul(-1));
        ball.tail = [angle];
        let len = data.t * 12;
        if (len > 4) {
            len = 4;
        }
        ball.tail = [len, true];
    },

    // update (dt) {
    //     if (this._moveEndTime <= 0) {
    //         // cc.log(0);
    //         return;
    //     }
    //     let t1 = this._moveEndTime;
    //     this._moveEndTime -= dt;
    //     if (t1 >= 0.5 && this._moveEndTime <= 0.5) { // 开始减速
    //         // cc.log(1);
    //         hjm._hero.body.linearDamping = 50;
    //     }
    //     if (this._moveEndTime <= 0) { // 停止了
    //         // cc.log(2);
    //         // hjm._hero.body.linearVelocity = cc.v2(0, 0);
    //         this.ballStop();
    //         return;
    //     }
    // }

    // update (dt) {},
});
