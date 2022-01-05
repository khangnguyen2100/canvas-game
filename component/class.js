import {context, starHandle, changeValue, spawn, spawnStarId,isStartItem1,starSettings } from '../index.js'
class Player {
    constructor(x,y,radius,color) {
        this.x = x,
        this.y = y,
        this.radius = radius
        this.color = color
    }
    draw() {
        context.beginPath()
        context.arc(
            this.x,
            this.y,
            this.radius,
            0,
            2 * Math.PI,
            false
        )
        context.fillStyle = this.color
        context.fill()
        context.beginPath();

    }
    
}
class Projectile {
    constructor(x,y,radius,color,velocity) {
        this.x = x,
        this.y = y, 
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        context.beginPath()
        context.arc(
            this.x,
            this.y,
            this.radius,
            0,
            2 * Math.PI,
            false
        )
        context.fillStyle = this.color
        context.fill()
    }
    update() {
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
class Enemy {
    constructor(x,y,radius,color,velocity) {
        this.x = x,
        this.y = y, 
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        context.beginPath()
        context.arc(
            this.x,
            this.y,
            this.radius,
            0,
            2 * Math.PI,
            false
        )
        context.fillStyle = this.color
        context.fill()
    }
    update() {
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
class Particle {
    constructor(x,y,radius,color,velocity) {
        this.x = x,
        this.y = y, 
        this.radius = radius
        this.color = color
        this.velocity = velocity,
        this.alpha  = 1
    }
    draw() {
        context.save()
        context.globalAlpha = this.alpha
        context.beginPath()
        context.arc(
            this.x,
            this.y,
            this.radius,
            0,
            2 * Math.PI,
            false
        )
        context.fillStyle = this.color
        context.fill()
        context.restore()
    }
    update() {
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha-=0.015
        this.velocity.x *= 0.98
        this.velocity.y *= 0.98

    }
}
class Star {
    constructor (x, y, spikes, radius, innerRadius,velocity,type) {
        this.x = x,
        this.y = y,
        this.spikes = spikes,
        this.radius = radius,
        this.innerRadius = innerRadius,
        this.velocity = velocity
        this.type = type
    }
    draw() {
        var rot = Math.PI / 2 * 3;
        var step = Math.PI / this.spikes;

        context.strokeSyle = "#000";
        context.beginPath();
        context.moveTo(this.x, this.y - this.radius)
        for (let i = 0; i < this.spikes; i++) {
            context.lineTo(this.x + Math.cos(rot) * this.radius, this.y + Math.sin(rot) * this.radius)
            rot += step
            context.lineTo(this.x + Math.cos(rot) * this.innerRadius, this.y + Math.sin(rot) * this.innerRadius)
            rot += step
        }
        context.lineTo(this.x, this.y - this.radius)
        context.closePath();
        context.lineWidth=5;
        // border color
        // context.strokeStyle='#f1c40f';
        // context.stroke();
        // background-color
        context.fillStyle='#f1c40f';
        context.fill();
    }
    update() {
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
    checkType() {
        if(this.type == 'item1') {
            changeValue(isStartItem1,true)
            setTimeout(() => {
                changeValue(isStartItem1,false)
                // stop spawn star
                clearInterval(spawnStarId)
                changeValue(spawnStarId,null)
                spawn.spawnStar()
            }, starSettings.starItem1Time);
        }
        if(this.type == 'item2') {
            starHandle.starItem2()
        }
    }
}

export {Star, Player, Projectile, Enemy, Particle}