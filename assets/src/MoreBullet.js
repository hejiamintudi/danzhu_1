cc.Class({
    extends: cc.Component,

    properties: {
    },

    // 根据当前的速度来判断是否要停下 然后被消灭
    update: function (dt) {
        // if (this.node.isBacking) {
        //     let sp = cc.v2(hjm._player).sub(this.node);
        //     if (this.node.y <= -500) {
        //         this.node.isBacking = false;
        //         this.node.del();
        //         hjm._main.getComponent("NewGameMain").endRun();
        //         return;
        //     }
        //     let p = this.getUnit(sp);
        //     this.rigidbody.applyForceToCenter(p.mul(5000));

        //     return;
        // }
    	if (!this.node.isShooting) {
    		return;
    	}
    	// let v = this.rigidbody.linearVelocity;
    	// // cc.log(v.x * v.x + v.y * v.y);
    	// if (v.x * v.x + v.y * v.y <= 20000) {
    	// 	this.node.del();
    	// 	this.node.isShooting = false;
    	// 	hjm._main.getComponent("NewGameMain").endRun();
    	// 	// hjm._main.t
    	// }

        let v = this.rigidbody.linearVelocity;
        // cc.log(v.x * v.x + v.y * v.y);
        let vLen = Math.sqrt(v.x * v.x + v.y * v.y);
        if (vLen <= 120) {
            this.node.del();
            this.node.isShooting = false;
            hjm._main.getComponent("NewGameMain").endRun();
            // hjm._main.t
        }

        if (this.rigidbody.linearDamping < 0) { // 正在加速状态
            if (vLen >= this.node.data.power_limit) { // 超过了最大速度
                let maxVLen = this.node.data.power_limit;
                this.rigidbody.linearVelocity = cc.v2(v.x * maxVLen / vLen, v.y * maxVLen / vLen);
                this.rigidbody.linearDamping = 0;
            }
        }
    },

    onEndContact: function (contact, selfCollider, otherCollider) {
        this.node.contactFun(selfCollider, otherCollider);
    },

    onLoad: function () {
    	this.rigidbody = this.node.getComponent(cc.RigidBody);
    	this.atk = 1;
    	this.node.skill = ()=>this.skill();
    },

    // onEnable: function () {
    // 	let collider = this.node.getComponent(cc.PhysicsCircleCollider);
    // 	collider.friction = 0.2; 
    // 	collider.restitution = 0.8;
    // },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        // if (this.node.isBacking) {
        //     if (otherCollider.node.group === "en") {
        //         contact.disabled = true;   
        //     }
        //     if (otherCollider.node.group === "wall") {
        //         contact.disabled = true;   
        //     }
        //     return;
        // }
    	if (!this.node.isShooting) {
    		return;
    	}
    },

    // 获取单位向量
    getUnit: function (p) {
        let len = Math.sqrt(p.x * p.x + p.y * p.y);
        return cc.v2(p.x / len, p.y / len);
    },

    // 
    onCollisionEnter: function (other, self) {
    	if (!this.node.isShooting) {
    		return;
    	}
        // if (other.node.name === "_player") {
        //     let v = this.rigidbody.linearVelocity;
        //     let p = cc.v2(hjm._player).sub(this.node);
        //     v = this.getUnit(v);
        //     p = this.getUnit(p);
        //     cc.log(v.x * p.x + v.y * p.y, v.x, v.y, p.x, p.y);
        //     if (v.x * p.x + v.y * p.y >= 0.5) { // 成功捕捉
        //         this.node.isShooting = false;
        //         this.rigidbody.linearVelocity = cc.v2(0);
        //         tz(this.node).to(0.2, cc.v2(hjm._player))(()=>{
        //             this.node.del();
        //             hjm._main.getComponent("NewGameMain").endRun();
        //         })();
        //     }
        // }
    },

    // 这是点击屏幕触发的技能
    skill: function () {
        // this.node.isBacking = true;
        // this.node.isShooting = false;
        let pool = hjm._bulletPool.smallBullet;
        hjm._main.getComponent("NewGameMain").runPool = pool;
        // let pool = this.node.parent;
        let num = 5;
        let speed = 1200;
        for (let i = 0; i < num; i++) {
            let ang = 2 * Math.PI * i / num;
            let dir = cc.v2(Math.cos(ang), Math.sin(ang));
            let v = dir.mul(speed);
            let bullet = pool.add();
            bullet.data = this.node.data;
            bullet.contactFun = this.node.contactFun;
            bullet.setPosition(this.node);
            bullet.getComponent(cc.RigidBody).linearVelocity = v;
            bullet.isShooting = true;
        }
        this.node.del();
        hjm._main.getComponent("NewGameMain").endRun();

    	// let {x, y} = this.rigidbody.linearVelocity;
    	// let len = Math.sqrt(x * x + y * y);
    	// let v = 2000;
    	// this.rigidbody.linearVelocity = cc.v2(x * v / len, y * v / len);
    	// this.node.getComponent(cc.PhysicsCircleCollider).restitution = 0.3;
    	// this.atk = 5;
    },
});
