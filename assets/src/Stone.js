cc.Class({
    extends: cc.Component,

    properties: {
    },

    // 根据当前的速度来判断是否要停下 然后被消灭
    update: function (dt) {
    	if (!this.node.isShooting) {
    		return;
    	}
    	let v = this.rigidbody.linearVelocity;
    	// cc.log(v.x * v.x + v.y * v.y);
    	let vLen = Math.sqrt(v.x * v.x + v.y * v.y);
    	cc.log("v", v.x, v.y, vLen);
    	if (vLen <= 120) {
    		cc.warn("因为速度太少才被消灭", v.x, v.y, vLen);
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
    	if (!this.node.isShooting) {
    		return;
    	}
    	cc.log("onEndContact1", this.rigidbody.linearVelocity, this.rigidbody.linearDamping);
    	this.node.contactFun(selfCollider, otherCollider);
    	cc.log("onEndContact2", this.rigidbody.linearVelocity, this.rigidbody.linearDamping);
    },

    onLoad: function () {
    	this.rigidbody = this.node.getComponent(cc.RigidBody);
    	this.atk = 1;
    	this.node.skill = ()=>this.skill();
    },

    onEnable: function () {
    	let collider = this.node.getComponent(cc.PhysicsCircleCollider);
    	collider.friction = 0.2; 
    	collider.restitution = 0.8;
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
    	if (!this.node.isShooting) {
    		return;
    	}
    	cc.log("onBeginContact", this.rigidbody.linearVelocity);
    },

    onCollisionEnter: function (other, self) {
    	if (!this.node.isShooting) {
    		return;
    	}
    },

    // 这是点击屏幕触发的技能
    skill: function () {
    	let {x, y} = this.rigidbody.linearVelocity;
    	let len = Math.sqrt(x * x + y * y);
    	let v = 2000;
    	this.rigidbody.linearVelocity = cc.v2(x * v / len, y * v / len);
    	this.node.getComponent(cc.PhysicsCircleCollider).restitution = 0.3;
    	this.atk = 5;
    },
});
