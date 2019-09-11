cc.Class({
    extends: cc.Component,

    properties: {
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        cc.log("物理", selfCollider.node.name, otherCollider.node.name);
    },

    onCollisionEnter: function (other, self) {
    	cc.log("普通", self.node.name, other.node.name);
    }
});
