var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// #region globals
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var backgroundColor = 'rgba(117, 104, 175)';
// almost enteriely copied from Three.js implementation
// except every function instead returns a new Vector
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.x = x;
        this.y = y;
    }
    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y);
    };
    Vector.prototype.rotate = function (theta) {
        return new Vector(this.x * Math.cos(theta) - this.y * Math.sin(theta), this.x * Math.sin(theta) - this.x * Math.cos(theta));
    };
    Vector.prototype.distanceTo = function (vec) {
        var dx = this.x - vec.x;
        var dy = this.y - vec.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    Vector.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector.prototype.normalize = function () {
        return this.clone().multiplyScalar(1 / this.length() || 1);
    };
    Vector.prototype.add = function (vec) {
        var r = this.clone();
        r.x += vec.x;
        r.y += vec.y;
        return r;
    };
    Vector.prototype.sub = function (vec) {
        var r = this.clone();
        r.x -= vec.x;
        r.y -= vec.y;
        return r;
    };
    Vector.prototype.multiplyScalar = function (scalar) {
        var r = this.clone();
        r.x *= scalar;
        r.y *= scalar;
        return r;
    };
    Vector.prototype.multiply = function (vec) {
        var r = this.clone();
        r.x *= vec.x;
        r.y *= vec.y;
        return r;
    };
    Vector.prototype.dot = function (vec) {
        return this.x * vec.x + this.y * vec.y;
    };
    return Vector;
}());
var BaseObject = /** @class */ (function () {
    function BaseObject(_a) {
        var position = _a.position, velocity = _a.velocity, color = _a.color, mass = _a.mass;
        this.ctx = ctx;
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.mass = mass;
    }
    return BaseObject;
}());
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(param) {
        var _this = _super.call(this, param) || this;
        _this.radius = param.radius;
        _this.mass = param.mass || param.radius;
        return _this;
    }
    Circle.resolveCollision = function (circle1, circle2, distance) {
        var dR = circle1.radius + circle2.radius;
        var dP = circle1.position.sub(circle2.position);
        var dV = circle1.velocity.sub(circle2.velocity);
        var a = dV.dot(dV);
        var b = dP.dot(dV) * 2;
        var c = dP.dot(dP) - dR * dR;
        var t = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        /* Back them up to the touching point ... */
        circle1.position = circle1.position.add(circle1.velocity.multiplyScalar(t));
        circle2.position = circle2.position.add(circle2.velocity.multiplyScalar(t));
        circle1.t = circle2.t = -t; /* partial time left on this iteration */
    };
    Circle.bounce = function (circle1, circle2) {
        var it = circle1;
        var that = circle2;
        var deltaP = it.position.sub(that.position);
        var deltaV = it.velocity.sub(that.velocity);
        var cf = it.radius + that.radius; /* common factor */
        cf = (2 * deltaV.dot(deltaP)) / (cf * cf * (it.mass + that.mass));
        it.velocity = it.velocity.sub(deltaP.multiplyScalar(cf * that.mass));
        that.velocity = that.velocity.add(deltaP.multiplyScalar(cf * it.mass));
        // move circles back to the touching point
        it.position = it.position.add(it.velocity.multiplyScalar(it.t));
        that.position = that.position.add(that.velocity.multiplyScalar(that.t));
    };
    Circle.prototype.detectCollision = function (it) {
        var distance = this.position.distanceTo(it.position);
        var result = distance < this.radius + it.radius && distance;
        return result;
    };
    Circle.prototype.maybeBounceOfWall = function () {
        if ((this.position.x + this.radius >= ctx.canvas.width &&
            this.velocity.x > 0) ||
            (this.position.x - this.radius <= 0 && this.velocity.x < 0)) {
            this.velocity = this.velocity.multiply(new Vector(-1, 1));
        }
        if ((this.position.y + this.radius >= ctx.canvas.height &&
            this.velocity.y > 0) ||
            (this.position.y - this.radius <= 0 && this.velocity.y < 0)) {
            this.velocity = this.velocity.multiply(new Vector(1, -1));
        }
    };
    Circle.prototype.draw = function () {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        // helpers
        {
            var targetVec = this.position
                .clone()
                .add(this.velocity.clone().multiplyScalar(50));
            this.ctx.moveTo(this.position.x, this.position.y);
            this.ctx.lineTo(targetVec.x, targetVec.y);
            // this.ctx.strokeStyle = 'green'
            // this.ctx.stroke()
        }
        //
        this.ctx.closePath;
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
    };
    return Circle;
}(BaseObject));
var Scene = /** @class */ (function () {
    function Scene(circles) {
        this.items = circles;
    }
    Scene.prototype.startRender = function () {
        var _this = this;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.items.forEach(function (it) {
            var circles = [];
            it.position = it.position.add(it.velocity);
            it.maybeBounceOfWall();
            _this.items.forEach(function (that) {
                if (it === that) {
                    return;
                }
                if (it.detectCollision(that)) {
                    console.log('collision');
                    circles.push([it, that]);
                }
            });
            circles.forEach(function (arr) {
                var it = arr[0];
                var that = arr[1];
                Circle.resolveCollision(it, that);
                Circle.bounce(it, that);
            });
            it.draw();
        });
        window.requestAnimationFrame(function () { return _this.startRender(); });
    };
    return Scene;
}());
var scene = new Scene([
    // new Circle({
    //   color: 'green',
    //   velocity: new Vector(6,0),
    //   position: new Vector(250, 350),
    //   // mass: 1,
    //   radius: 35,
    // }),
    // new Circle({
    //   color: 'white',
    //   velocity: new Vector(-1, 0),
    //   position: new Vector(350, 350),
    //   // mass: 2,
    //   radius: 55,
    // }),
    new Circle({
        color: 'gray',
        velocity: new Vector(-2.5, 0),
        position: new Vector(250, 150),
        // mass: 1,
        radius: 35
    }),
    new Circle({
        color: 'white',
        velocity: new Vector(2, 0),
        position: new Vector(100, 150),
        // mass: 2,
        radius: 55
    }),
    new Circle({
        color: 'red',
        velocity: new Vector(-6, 0),
        position: new Vector(450, 250),
        radius: 35
    }),
    new Circle({
        color: 'green',
        velocity: new Vector(rand(-5, 5), rand(-5, 5)),
        position: new Vector(30, 100),
        radius: rand(5, 20)
    }),
    new Circle({
        color: 'green',
        velocity: new Vector(rand(-5, 5), rand(-5, 5)),
        position: new Vector(150, 100),
        radius: rand(5, 20)
    }),
    new Circle({
        color: 'green',
        velocity: new Vector(rand(-5, 5), rand(-5, 5)),
        position: new Vector(150, 100),
        radius: rand(5, 20)
    }),
    new Circle({
        color: 'green',
        velocity: new Vector(rand(-5, 5), rand(-5, 5)),
        position: new Vector(200, 100),
        radius: rand(5, 20)
    }),
]);
scene.startRender();
function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
