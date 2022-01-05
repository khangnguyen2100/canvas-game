import {Star, Player, Projectile, Enemy, Particle} from './class.js'

const canvas = document.querySelector("#canvas")
const pointEl = document.querySelector(".point")
const scoreEl = document.querySelector(".score")
const popup = document.querySelector(".popup")
const btn = document.querySelector(".btn")
const levels = document.querySelectorAll(".level-item")

const hitEnemy = new Audio('./soundEffect/hit.wav')
const hitStar = new Audio('./soundEffect/hitStar.wav')

export const context = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

const x = canvas.width / 2
const y = canvas.height / 2

// array contains bullet , enemies
let projectiles = [] ,enemies = [] ,stars = [], particles = []
// UI variable
let isCheck = false,levelLastIndex,point = 0,isStartItem1 = false
export function changeValue(element,value) {
    if(typeof element === 'boolean') {
        isStartItem1 = value
    }
    else {
        spawnStarId = value
    }
}
export {isStartItem1}
// interval,timeOut ID to clear
let spawnEnemiesId = null,spawnStarId = null,anmationId = null
// enemy, projectile settings
let enemySettings = {}, projectileSettings = {},starSettings = {}
export {starSettings}
let timeSpawnOfStar = 10000
// create main player
const player = new Player(x,y,15,'white')

const spawn = {
    spawnEnemies : function() {
        if(!spawnEnemiesId) {
            spawnEnemiesId = setInterval( this.spawnEnemiesHandle, enemySettings.timeEnemy);
        }
    },
    spawnEnemiesHandle : function() {
        // create random radius of enemy 
        let randomRadius = Math.round(Math.random() * (enemySettings.maxRadiusEnemy - enemySettings.minRadiusEnemy) + enemySettings.minRadiusEnemy)
        // random enemy every corner
        let x,y
        // random enemy top and bottom
        if(Math.random() < .5) {
            x = Math.random()*canvas.width
            y = Math.random() < .5 ? 0 - randomRadius : canvas.height + randomRadius
        }
        // random enemy left and right
        else {
            x = Math.random() < .5 ? 0 - randomRadius : canvas.width + randomRadius
            y = Math.random() * canvas.height
        }   
        // get angle of projectile to get velocity
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        // speed of enemy
        const velocity = {
            x : Math.cos(angle)*enemySettings.speedOfEnemy/(randomRadius),
            y : Math.sin(angle)*enemySettings.speedOfEnemy/(randomRadius)
        }
        // random color enemy
        const enemyColor = `hsl( ${Math.random() * 360}, 50%,50%)`
        // render enemies
        enemies.push(new Enemy(x,y,randomRadius,enemyColor,velocity))
    },
    spawnStar : function() {
        if(!spawnStarId) {
            spawnStarId = setInterval(this.spawnStarHandle, 10000);
        }
    },
    spawnStarHandle : function() {
        if(stars.length == 0) {
            // speed of star
            let x,y
            // random start top and bottom
            if(Math.random() < .5) {
                x = Math.random()*canvas.width
                y = Math.random() < .5 ? 0 - 20 : canvas.height + 20
            }
            // random start left and right
            else {
                x = Math.random() < .5 ? 0 - 20 : canvas.width + 20
                y = Math.random() * canvas.height
            }   
            // get angle to create velocity
            const angle = (Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)) + 0.4
            const velocity = {
                x : Math.cos(angle)*3,
                y : Math.sin(angle)*3
            }
            // random 2 item
            let item = Math.random() < .33 ? "item2" : "item1"
            let spikes = item == 'item2' ? 7 : 5
            stars.push(new Star(x,y, spikes,25, 13,velocity,item))
        }
    }
}
export {spawn, spawnStarId}
export const starHandle = {
    starItem1 : function(angle) {
        const bullet1 = new Projectile( x, y, projectileSettings.sizeOfProjectile, projectileSettings.colorOfProjectile,
            {
                x : Math.cos(angle+0.15)*projectileSettings.speedOfProjectile,
                y : Math.sin(angle+0.15)*projectileSettings.speedOfProjectile
            }
        )
        const bullet2 = new Projectile( x, y, projectileSettings.sizeOfProjectile, projectileSettings.colorOfProjectile,
            {
                x : Math.cos(angle-0.15)*projectileSettings.speedOfProjectile,
                y : Math.sin(angle-0.15)*projectileSettings.speedOfProjectile
            }
        )
        projectiles.push(bullet1,bullet2)
    },
    starItem2 : function() {
        clearInterval(spawnEnemiesId)
        spawnEnemiesId = null
        const length = enemies.length
        const temp = [...enemies]

        for (let j = 0; j < length; j++) {
            enemies.shift()
            point+=3
        }
        // create explosion
        for (let j = 0; j < length; j++) {
            for (let i = 0; i < Math.round(temp[j].radius * 2); i++) {
                const random = Math.random() * 3
                particles.push(new Particle(
                    temp[j].x,
                    temp[j].y,
                    random,
                    temp[j].color,
                    {
                        x : (Math.random() - 0.5) * (Math.random() * 12),
                        y : (Math.random() - 0.5) * (Math.random() * 12)
                    }
                ))
            }
        }
        setTimeout(() => {
            spawn.spawnEnemies()
        }, 1000); 
    }
}

const app = {
    projectileHandle : function() {
        projectiles.forEach((projectile,index) => {
            // render projectile
            projectile.draw()
            projectile.update()
            // check if projectile of out screen will delete this
            if (this.checkOutScreen(projectile)) {
                setTimeout(() => {
                    projectiles.splice(index,1)
                }, 0);
            }
        })
    },
    particlesHandle : function() {
        particles.forEach((particle,index) => {
            // render particles and delete if alpha < 0
            if(particle.alpha <= 0) {
                particles.splice(index,1)
            }
            else {
                particle.draw()
                particle.update()
            }
        })
    },
    enemiesHandle : function() {
        enemies.forEach((enemy,enemyIndex) => {
            projectiles.forEach((projectile,projectileIndex) => {
                // enemy get hits
                const distan = Math.hypot(projectile.x - enemy.x,projectile.y - enemy.y)
                if(enemy.radius < enemySettings.minRadiusEnemy) {
                    setTimeout(() => {
                        enemies.splice(enemyIndex,1)
                    }, 0);
                }
                if(distan - enemy.radius - projectile.radius < 1) {
                    if(enemy.radius - enemySettings.minRadiusEnemy > enemySettings.projectilePower) {
                        setTimeout(() => {
                            gsap.to(enemy,{
                                radius : enemy.radius - enemySettings.projectilePower,
                                duration: 0.1,
                            })
                            projectiles.splice(projectileIndex,1)
                            point++
                        }, 0);
                    }
                    else {
                        setTimeout(() => {
                            enemies.splice(enemyIndex,1)
                            projectiles.splice(projectileIndex,1)
                            point+=3
                        }, 0);
                    }
                    // create explosions
                    for (let i = 0; i < Math.round(enemy.radius  * 1); i++) {
                        const random = Math.random() * 3
                        particles.push(new Particle(
                            projectile.x,
                            projectile.y,
                            random,
                            enemy.color,
                            {
                                x : (Math.random() - 0.5) * (Math.random() * 10),
                                y : (Math.random() - 0.5) * (Math.random() * 10)
                            }
                        ))
                    }
                    // create audio when enemy gets hit
                    hitEnemy.play()
                }
            })
            // check player gets hit
            const distan = Math.hypot(player.x - enemy.x,player.y - enemy.y)
            if(distan - enemy.radius - player.radius < .01) {
                // create explosion
                for (let i = 0; i < player.radius/2.5; i++) {
                    const random = Math.random() * 4
                    particles.push(new Particle(
                        x,
                        y,
                        random,
                        player.color,
                        {
                            x : (Math.random() - 0.5) * (Math.random() * 7),
                            y : (Math.random() - 0.5) * (Math.random() * 7)
                        }
                    ))
                }
                setTimeout(() => {
                    // set localStorage point  
                    if(point > localStorage.getItem('point') || localStorage.getItem('point') == 'null') {
                        localStorage.setItem('score', point);
                    }

                    clearInterval(spawnEnemiesId)
                    spawnEnemiesId = null
                    clearInterval(spawnStarId)
                    spawnStarId = null

                    localStorage.setItem('point', point);
                    cancelAnimationFrame(anmationId)
                    popup.classList.add("see")
                    scoreEl.innerText = `Your hightest score : ${localStorage.getItem('score')}`
                }, 500);
            }
        })
    },
    starsHandle : function() {
        projectiles.forEach((projectile,projectileIndex) => {
            stars.forEach((star,i) => {
                // star get hit
                const distan = Math.hypot(projectile.x - star.x,projectile.y - star.y)
                
                if(distan - projectile.radius - star.radius < 1 ) {
                    setTimeout(() => {
                        projectiles.splice(projectileIndex,1)
                        stars.splice(i,1)
                    }, 0);

                    clearInterval(spawnStarId)
                    spawnStarId = null

                    star.checkType()
                    spawn.spawnStar()

                    hitStar.play()
                }
                if(this.checkOutScreen(star)) {
                    setTimeout(() => {
                        stars.splice(i,1)
                         
                        clearInterval(spawnStarId)
                        spawnStarId = null

                        spawn.spawnStar()

                    }, 0);
                }
            })
        })
    },
    mouseClickHandle : function(e) {
        if(!e.target.classList.contains("btn")) {
            const mouseX = e.clientX
            const mouseY = e.clientY
            const angle = Math.atan2(mouseY - y, mouseX - x)
        
            const bullet = new Projectile(x,y,projectileSettings.sizeOfProjectile,projectileSettings.colorOfProjectile,
                {
                    x : Math.cos(angle)*projectileSettings.speedOfProjectile,
                    y : Math.sin(angle)*projectileSettings.speedOfProjectile
                }
            )
            projectiles.push(bullet)
            if(isStartItem1) {
               starHandle.starItem1(angle)
            }
        }
    },
    checkOutScreen : function(el) {
        return (
            el.x + el.radius < 0 || 
            el.y + el.radius < 0 ||
            el.x - el.radius > canvas.width||
            el.y - el.radius > canvas.height
        )
    },
    animate : function() {
        anmationId = requestAnimationFrame(app.animate)

        // render your point
        pointEl.innerText = `Your point : ${point}`
        player.draw()

        // set background and fade effect
        context.fillStyle = 'rgba(0,0,0,0.1)'
        context.fillRect(0 , 0 , canvas.width , canvas.height)

        // render list of projectile and remove if it out of screen
        app.projectileHandle()

        // render list of enemy
        enemies.forEach(enemy => {
            enemy.draw()
            enemy.update()
        })
        // render stars
        if(stars.length > 0) {
            stars.forEach((star,i) => {
                star.draw()
                star.update()
            })
        }
        // render list of particles
        app.particlesHandle()

        // check enemy get hits
        app.enemiesHandle()

        // check star get hit or out of screen
        app.starsHandle()
    },
}
window.addEventListener('click',(e) => {
    app.mouseClickHandle(e)
})
btn.addEventListener("click" , () => {
    if(isCheck) {
        // reset and start game
        popup.classList.remove("see")
        point = 0
        projectiles = []
        enemies = []
        particles = []
        spawn.spawnEnemies()
        app.animate()
        spawn.spawnStar()
        isCheck = false

        if(levelLastIndex !== undefined) {
            levels[levelLastIndex].classList.remove('active')
        }
    }
    else {
        alert("Please choose level to start!")
    }
})
levels.forEach((level,i) => {
    level.addEventListener("click" ,() => {
        if(levelLastIndex !== undefined) {
            levels[levelLastIndex].classList.remove('active')
        }
        level.classList.add('active')
        
        levelLastIndex = i
        isCheck = true
        if(i == 0) {
            enemySettings = {
                maxRadiusEnemy : 60,
                minRadiusEnemy : 20,
                timeEnemy : 800, 
                speedOfEnemy : 22,
                projectilePower : 20
            }
            projectileSettings = {
                speedOfProjectile : 7,
                sizeOfProjectile : 10,
                colorOfProjectile : '#00d8d6'
            },
            starSettings = {
                starItem1Time : 4000,
            }
        }
        if(i == 1) {
            enemySettings = {
                maxRadiusEnemy : 80,
                minRadiusEnemy : 20,
                timeEnemy : 650,
                speedOfEnemy : 25,
                projectilePower : 20
            }
            projectileSettings = {
                speedOfProjectile : 8,
                sizeOfProjectile : 8,
                colorOfProjectile : '#4bcffa'
            },
            starSettings = {
                starItem1Time : 6000,
            }
        }
        if(i == 2) {
            enemySettings = {
                maxRadiusEnemy : 100,
                minRadiusEnemy : 25,
                timeEnemy : 500,
                speedOfEnemy :28,
                projectilePower : 20
            }
            projectileSettings = {
                speedOfProjectile : 9,
                sizeOfProjectile : 6,
                colorOfProjectile : '#0fbcf9'
            },
            starSettings = {
                starItem1Time : 7000,
            }
        }
    })
})