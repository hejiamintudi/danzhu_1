cc.Class({
    extends: cc.Component,
    properties: {
    },

    onLoad () {
        // this.bulletOriMinX = 290;
        // this.bulletOriY = 390;
        this.minPlayerX = 290;
        this.r = 200;
        this.maxBulletX = 310;
        this.maxBulletY = -400;

        this.runPool = hjm._bulletPool;
        this.initWuqiData();

        this.chooseBullet (hjm._bulletButtonLayer["stone"]);
    },

    // 启动速度        飞行速度        碰撞速度       攻击boss速度      速度上限       BUFF加速   武器直径    攻击boss伤害    攻击防具伤害
    // shot_speed_c   fly_speed_c    elec_c         hit_range_c      power_limit    BUFF_id   zhijng_c    gjboss_c       gjfangju_c
    //                最初的加速度     wall          en                             buff       

    initWuqiData () {
        // pool.isAdding = true; // 当到达速度上
        // data 和 contactfun 都是直接装在 bullet 上的
        let contactFun = function (selfCollider, otherCollider) { // 这个是离开碰撞触发的
            let data = this.data;
            let body = this.getComponent(cc.RigidBody);
            let f = null; // 摩檫力， 大于0 代表减速， 小于 0 代表加速
            let group = otherCollider.node.group;
            if (group === "wall") {
                f = data.elec_c;
            }
            else if (group === "en") {
                f = data.hit_range_c;
            }
            else if (group === "buff") {
                f = data.BUFF_id;
            }

            if (f === null) {
                return cc.error("遇到未知的碰撞类型");
            }

            // 先判定当前的速度是否超过了最大值
            let maxV = this.data.power_limit;
            let v = body.linearVelocity;
            let vLen = Math.sqrt(v.x * v.x + v.y * v.y);
            // this.isAdding = true;
            if (vLen >= maxV) {
                body.linearVelocity = cc.v2(v.x * maxV / vLen, v.y * maxV / vLen);
                if (f < 0) { // 这是加速状态, 必须要停止
                    f = 0;
                    // this.isAdding = false;
                }
            }
            
            body.linearDamping = f;            
        }

        let poolArr = hjm._bulletPool.getChildren();
        for (let i = 0; i < poolArr.length; i++) {
            let pool = poolArr[i];
            let name = pool.name;
            pool.data = dyl.data("wuqi." + name);
            pool.contactFun = contactFun;

        }
    },

    chooseBullet (node) {
        let name = node.name;
        hjm._buttonBg.setPosition(node);
        this.runPool = hjm._bulletPool[name];
    },

    touchOn (p) {
        let button = p.in(...hjm._bulletButtonLayer.getChildren());
        if (button) {
            this.chooseBullet(button);
            return;
        }

        let x = p.x;
        if (x < -this.bulletOriMinX) {
            x = -this.bulletOriMinX
        }
        else if ( x > this.bulletOriMinX) {
            x = this.bulletOriMinX;
        }
        // hjm._player.x = x;
        let bullet = this.runPool.add();
        // bullet

        bullet.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 0);
        bullet.setPosition(x, hjm._player.y + this.r);
        return [cc.v2(p), bullet];
    },

    touchMove (p, startP, bullet) {
        // cc.log("move", bullet);
        let sp = p.sub(hjm._player);
        if (sp.mag() < 7) {
            // bullet.active = false;
        }
        let {x, y} = sp;
        // if ()
        hjm._player.rotation = this.pToAngle(sp) - 90;
        let k = Math.sqrt(this.r * this.r / (x * x + y * y));
        let sx = -x * k;
        let sy = -y * k;
        x = sx + hjm._player.x;
        y = sy + hjm._player.y;
        if (sy < 0) {
            return true;
        }
        if (x < -this.maxBulletX) {
            x = -this.maxBulletX;
            sx = x - hjm._player.x;
            sy = Math.sqrt(this.r * this.r - sx * sx);
            y = sy + hjm._player.y;
        }
        else if (x > this.maxBulletX) {
            x = this.maxBulletX;
            sx = x - hjm._player.x;
            sy = Math.sqrt(this.r * this.r - sx * sx);
            y = sy + hjm._player.y;
        }
        else if (y < this.maxBulletY) {
            y = this.maxBulletY;
            sy = y - hjm._player.y;
            if (sx < 0) {
                sx = -Math.sqrt(this.r * this.r - sy * sy);
            }
            else {
                sx = Math.sqrt(this.r * this.r - sy * sy);
            }
            x = sx + hjm._player.x;
        }
        bullet.setPosition(cc.v2(x, y));
        return [startP, bullet, cc.v2(sx, sy)];
    },

    touchEnd (p, startP, bullet, dir) {
        let moveArr = this.touchMove (p, startP, bullet);
        dir = moveArr[2];
        // bullet.del();
        let sp = p.sub(hjm._player);
        if (sp.mag() < 7 || !dir) {
            bullet.del();
        }
        else {
            this.node.touch = "shoot";
            this.bullet = bullet;
            this.shoot(bullet, dir);
        }
    },

    shootOn () {
        this.node.touch = "stop";
        this.bullet.skill();
    },

    endRun () {
        if (!this.runPool.pool.length) {
            this.node.touch = "touch";
        }
    },

    shoot (bullet, dir) {
        bullet.isShooting = true;
        // bullet.isAdding = true;
        bullet.data = this.runPool.data;
        bullet.contactFun = this.runPool.contactFun;
        bullet.getComponent(cc.RigidBody).linearVelocity = dir.mul(bullet.data.shot_speed_c);
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
    },
});
