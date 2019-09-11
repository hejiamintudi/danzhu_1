cc.Class({
    extends: cc.Component,
    properties: {
    },
    onLoad () {},

    // box: w, h
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
            vy: 0
        }

        let vx = v.x;
        let vy = v.y;
        let a = vy;
        let b = -vx;
        let c = vx * op.y - op.x * vy; 
        let ox = op.x;
        let oy = op.y;

        for (var i = boxArr.length - 1; i >= 0; i--) {
            let {x, y, w, h} = boxArr[i]; // w h 已经经过除2处理了
            let sx = x - op.x;
            let sy = y - op.y;
            if ((sx * vx + sy * vy) <= 0) { // 远离情况不考虑
                continue; 
            }

            let dx = 0; // 代表速度的反方向
            let dy = 0;

            let minNum = 0.0001;
            if (vx < -minNum) {
                let checkData = this.checkXLine(x + w, y - h, y + h, a, b, c, ox - r, oy, ox, oy, vx, vy, r);
                if (checkData) {
                    continue;
                }
                dx = 1;
            }
            else if (vx > minNum) {
                let checkData = this.checkXLine(x - w, y - h, y + h, a, b, c, ox + r, oy, ox, oy, vx, vy, r);
                if (checkData) {
                    continue;
                }
                dx = -1;
            }

            if (vy < -minNum) {
                let checkData = this.checkYLine(y + h, x - h, x + h, a, b, c, ox, oy - r, ox, oy, vx, vy, r);
                if (checkData) {
                    continue;
                }
                dy = 1;
            }
            else if (vy > minNum) {
                let checkData = this.checkYLine(y - h, x - h, x + h, a, b, c, ox, oy + r, ox, oy, vx, vy, r);
                if (checkData) {
                    continue;
                }
                dy = -1;
            }

            if (dx === 0) {
                this.checkDot(x - w, dy * h + y, vx, vy, ox, oy, r);
                this.checkDot(x + w, dy * h + y, vx, vy, ox, oy, r);
            }
            else if (dy === 0) {
                this.checkDot(dx * w + x, y - h, vx, vy, ox, oy, r);
                this.checkDot(dx * w + x, y + h, vx, vy, ox, oy, r);
            }
            else {
                this.checkDot(dx * w + x, dy * h + y, vx, vy, ox, oy, r);
                this.checkDot(-dx * w + x, dy * h + y, vx, vy, ox, oy, r);
                this.checkDot(dx * w + x, -dy * h + y, vx, vy, ox, oy, r);
            }
        }

        // checkXLine (x, y1, y2, a, b, c, x0, y0, ox, oy, vx, vy, r) 
        if (vx > minNum) {
            this.checkXLine(right, up, down, a, b, c, ox + r, oy, ox, oy, vx, vy, r);
            // this.checkXLine(right, up);
            // this.checkXLine(right, down);
        }
        else if (vx < -minNum) {
            this.checkXLine(left, up, down, a, b, c, ox - r, oy, ox, oy, vx, vy, r);
            // this.checkXLine(left, up);
            // this.checkXLine(left, down);    
        }

        //checkYLine (y, x1, x2, a, b, c, x0, y0, ox, oy, vx, vy, r)
        if (vy > minNum) {
            this.checkYLine(up, left, right, a, b, c, ox, oy + r, ox, oy, vx, vy, r);
            // this.checkYLine(left, up);
            // this.checkYLine(right, up);
        }
        else if (vy < -minNum) {
            this.checkYLine(down, left, right, a, b, c, ox, oy - r, ox, oy, vx, vy, r);
            // this.checkYLine(left, down);
            // this.checkYLine(right, down);    
        }
    },

    checkDot (x, y, vx, vy, ox, oy, r) {
        let kx = ox - x;
        let ky = oy - y;
        let a = vx * vx + vy * vy;
        let b = 2 * (vx * kx + vy * ky);
        let c = kx * kx + ky * ky - r * r;
        let k = b * b - 4 * a * c;
        if (k < 0) {
            return false;
        }
        let t = (-b - k) * 0.5 / a;
        if (t >= this.minT) {
            return false;
        }
        let collisionData = {
            ox: ox + vx * t,
            oy: oy + vy * t,
            vx: -vx,
            vy: vy
        }
        this.collisionData = collisionData;
        this.minT = t;
        return true;
    },

    // true 可以到达线，false 不能到达线段， 可以试试两个点
    checkXLine (x, y1, y2, a, b, c, x0, y0, ox, oy, vx, vy, r) {
        let k = a * (x - x0) - b * y0;
        if ((k + b * y1) * (k + b * y2) <= 0) { // 碰到线
            let t = (x - x0) / vx;
            if (t >= this.minT) { // 没有比其他的好，所以取消
                return true; 
            }
            let collisionData = {
                ox: ox + vx * t,
                oy: oy + vy * t,
                vx: -vx,
                vy: vy
            }
            this.collisionData = collisionData;
            this.minT = t;
            return true;
        }
        return false;
    },

    // true 成功了  false 到达线，但 t 太大了。 null 两个点还有机会
    checkYLine (y, x1, x2, a, b, c, x0, y0, ox, oy, vx, vy, r) {
        // let k = a * (x - x0) - b * y0;
        let k = b * (y - y0) - a * x0;
        if ((k + a * x1) * (k + a * x2) <= 0) { // 碰到线
            let t = (y - y0) / vy;
            if (t >= this.minT) { // 没有比其他的好，所以取消
                return true; 
            }
            let collisionData = {
                ox: ox + vx * t,
                oy: oy + vy * t,
                vx: vx,
                vy: -vy
            }
            this.collisionData = collisionData;
            this.minT = t;
            return true;
        }
        return false;
    },
});
