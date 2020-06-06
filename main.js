"use strict";
// #region globals
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const backgroundColor = 'rgba(117, 104, 175)';
// almost enteriely copied from Three.js implementation
// except every function instead returns a new Vector
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    rotate(theta) {
        return new Vector(this.x * Math.cos(theta) - this.y * Math.sin(theta), this.x * Math.sin(theta) - this.x * Math.cos(theta));
    }
    distanceTo(vec) {
        const dx = this.x - vec.x;
        const dy = this.y - vec.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        return this.clone().multiplyScalar(1 / this.length() || 1);
    }
    add(vec) {
        const r = this.clone();
        r.x += vec.x;
        r.y += vec.y;
        return r;
    }
    sub(vec) {
        const r = this.clone();
        r.x -= vec.x;
        r.y -= vec.y;
        return r;
    }
    multiplyScalar(scalar) {
        const r = this.clone();
        r.x *= scalar;
        r.y *= scalar;
        return r;
    }
    multiply(vec) {
        const r = this.clone();
        r.x *= vec.x;
        r.y *= vec.y;
        return r;
    }
    dot(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
}
class BaseObject {
    constructor({ position, velocity, color, mass }) {
        this.ctx = ctx;
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.mass = mass;
    }
}
class Circle extends BaseObject {
    constructor(param) {
        super(param);
        this.radius = param.radius;
        this.mass = param.mass || param.radius;
    }
    static resolveCollision(circle1, circle2, distance) {
        const sumR = circle1.radius + circle2.radius;
        const dP = circle1.position.sub(circle2.position);
        const dV = circle1.velocity.sub(circle2.velocity);
        const a = dV.dot(dV);
        const b = dP.dot(dV) * 2;
        const c = dP.dot(dP) - sumR * sumR;
        const t = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
        /* Back them up to the touching point ... */
        circle1.position = circle1.position.add(circle1.velocity.multiplyScalar(t));
        circle2.position = circle2.position.add(circle2.velocity.multiplyScalar(t));
        circle1.t = circle2.t = -t; /* partial time left on this iteration */
    }
    static bounce(circle1, circle2) {
        const it = circle1;
        const that = circle2;
        const deltaP = it.position.sub(that.position);
        const deltaV = it.velocity.sub(that.velocity);
        let cf = it.radius + that.radius; /* common factor */
        cf = (2 * deltaV.dot(deltaP)) / (cf * cf * (it.mass + that.mass));
        it.velocity = it.velocity.sub(deltaP.multiplyScalar(cf * that.mass));
        that.velocity = that.velocity.add(deltaP.multiplyScalar(cf * it.mass));
        // move circles back to the touching point
        it.position = it.position.add(it.velocity.multiplyScalar(it.t));
        that.position = that.position.add(that.velocity.multiplyScalar(that.t));
    }
    detectCollision(it) {
        const distance = this.position.distanceTo(it.position);
        const result = distance < this.radius + it.radius && distance;
        return result;
    }
    maybeBounceOfWall() {
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
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        // helpers
        {
            const targetVec = this.position.clone().add(this.velocity.clone());
            const a = this.velocity.normalize().multiplyScalar(this.radius);
            const b = targetVec.add(a);
            this.ctx.moveTo(this.position.x + a.x, this.position.y + a.y);
            this.ctx.lineTo(b.x, b.y);
            // this.ctx.strokeStyle = 'green'
            // this.ctx.stroke()
        }
        //
        this.ctx.closePath();
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
}
class Scene {
    constructor(circles) {
        this.items = circles;
    }
    startRender() {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.items.length - 1; i++) {
            for (let j = i; j < this.items.length; j++) {
                const it = this.items[i];
                const that = this.items[j];
                if (it.detectCollision(that)) {
                    Circle.resolveCollision(it, that);
                    Circle.bounce(it, that);
                }
            }
        }
        this.items.forEach((it) => {
            it.position = it.position.add(it.velocity);
            it.maybeBounceOfWall();
            it.draw();
        });
        window.requestAnimationFrame(() => this.startRender());
    }
}
const scene = new Scene([
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
        position: new Vector(150, 150),
        // mass: 1,
        radius: 35,
    }),
    new Circle({
        color: 'white',
        velocity: new Vector(2, 0),
        position: new Vector(200, 150),
        // mass: 2,
        radius: 55,
    }),
    new Circle({
        color: 'red',
        velocity: new Vector(-6, 0),
        position: new Vector(350, 150),
        radius: 35,
    }),
    new Circle({
        color: 'green',
        velocity: new Vector(~~rand(-5, 15), ~~rand(-5, 15)),
        position: new Vector(80, 300),
        radius: ~~rand(10, 25),
    }),
    new Circle({
        color: 'green',
        velocity: new Vector(~~rand(-5, 15), ~~rand(-5, 15)),
        position: new Vector(150, 100),
        radius: ~~rand(10, 25),
    }),
    new Circle({
        color: 'green',
        velocity: new Vector(~~rand(-5, 15), ~~rand(-5, 15)),
        position: new Vector(200, 200),
        radius: ~~rand(10, 25),
    }),
    new Circle({
        color: 'green',
        velocity: new Vector(~~rand(-5, 15), ~~rand(-15, 15)),
        position: new Vector(300, 200),
        radius: ~~rand(10, 25),
    }),
]);
scene.startRender();
function rand(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//# sourceMappingURL=main.js.map