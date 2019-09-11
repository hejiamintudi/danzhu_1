cc.Class({
    extends: cc.Component,

    properties: {
    },

    // 这是一个临时改变数值调整数据的类
    // _testButtonLayer // button都放在下面
    // _dataBarLab // 这是放 数据调整的，  min max dot bar
    // r 是比率 最终的数据要
    // _testButtonTag
    start () {
    	this.barLen = hjm._dataBarLab.bar.width;
    	this.setButton(hjm._testButtonLayer.getChildByName("shot_speed_c"));
    },

    setButton (button) {
    	let name = button.name;
    	hjm._testButtonTag.setPosition(button);
    	this.setData(name);
    },

    touchOn (p) {
    	let button = p.in(...hjm._testButtonLayer.getChildren());
    	if (button) {
    		this.setButton(button);
    		return;
    	}
    	if (p.in(hjm._dataBarLab.dot)) {
    		cc.log("on", hjm._dataBarLab.dot.x, hjm._dataBarLab.dot.x - p.x, p.x);
    		return [hjm._dataBarLab.dot.x - p.x];
    	}
    },

    touchMove (p, sx) {
    	hjm._dataBarLab.dot.x = p.x + sx;
    	cc.log("move", hjm._dataBarLab.dot.x, sx, p.x);
    	let rr = hjm._dataBarLab.dot.x / this.barLen;
    	let {min, max, r, name} = this.data;
    	let value = ((max - min) * rr + min) / r;
    	// cc.log("value", value);
    	this.setValue(value, true );
    	return true;
    },

     // 启动速度        飞行速度        碰撞速度       攻击boss速度      速度上限       BUFF加速   武器直径    攻击boss伤害    攻击防具伤害
    // shot_speed_c   fly_speed_c    elec_c         hit_range_c      power_limit    BUFF_id   zhijng_c    gjboss_c       gjfangju_c
    //                最初的加速度     wall          en                             buff       
    setValue (value, isNotSetDotX) {
    	let {min, max, r, name} = this.data;
    	let num = Math.floor(value * r);
    	if (!isNotSetDotX) {
    		hjm._dataBarLab.dot.x = this.barLen * (num - min) / (max - min);
    	}
    	hjm._dataBarLab.num = num;
    	hjm._dataBarLab.min = min;
    	hjm._dataBarLab.max = max;
    	hjm._main.getComponent("NewGameMain").runPool.data[name] = value;
    },

    setData (name) {
    	let node = hjm._main.getComponent("NewGameMain").runPool;
    	let data = this.getInitData(name);
    	data.name = name;
    	this.data = data;
    	cc.log(name, node.data[name]);
    	this.setValue(node.data[name]);
    },

    getInitData (name) {
    	if (name === "shot_speed_c") {
    		return {
    			min: 0,
    			max: 3000,
    			r: 167,
    			value: 0
    		}
    	}
    	else if (name === "fly_speed_c" || name === "elec_c" || name === "hit_range_c") {
    		return {
    			min: -10,
    			max: 10,
    			r: -10,
    			value: 0
    		}
    	} 
    	else if (name === "power_limit") {
    		return {
    			min: 0,
    			max: 3000,
    			r: 1,
    			value: 0
    		}
    	}
    },
});
