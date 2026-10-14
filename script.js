let canvas = document.querySelector("canvas")
let c = canvas.getContext("2d")
let body = document.querySelector("body")

let backgroundimg = new Image()
backgroundimg.src = "./sprites/background.png";

let ballimg = new Image()
ballimg.src = "./sprites/ball.png";

let stickimg = new Image()
stickimg.src = "./sprites/stick.png";

let redballimg = new Image()
redballimg.src = "./sprites/redball.png";

let blueballimg = new Image()
blueballimg.src = "./sprites/blueball.png";

let blackballimg = new Image()
blackballimg.src = "./sprites/blackball.png";



let clickState = {
    mouseDown : false,
    mouseUp : false,
}

class Table{
    constructor(){
        this.x = 0
        this.y = 0
    }

    draw(){
        c.drawImage(backgroundimg, this.x, this.y)
    }
}

class Ball {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.w = 46;
        this.sx = 385;
        this.sy = 380;
        this.power = 0;
        this.friction = 0.98;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.isStationary = true; 
    }

    draw() {
        c.drawImage(ballimg, this.x, this.y, this.w, this.w, this.sx, this.sy, this.w, this.w);
    }

    update(angle) {
        this.collisionWithTableSideDetection()
        this.shootAndAngleChange(angle)
        this.holeDetection()
    }

    collisionWithTableSideDetection(){
        if(this.sy >= canvas.height - this.w * 2.15){
            this.sy = canvas.height - this.w * 2.15
            this.vy = -this.vy
        }
        if(this.sy <= this.w){
            this.sy = this.w
            this.vy = -this.vy
        }

        if(this.sx <= this.w * 1.1){
            this.sx = this.w * 1.1
            this.vx = -this.vx
        }

        if(this.sx >= canvas.width - this.w * 2.15){
            this.sx = canvas.width - this.w * 2.15
            this.vx = -this.vx
        }
    }

    shootAndAngleChange(angle){
        if (this.isStationary) {
            this.angle = angle;
        }

        if (clickState.mouseUp && this.isStationary) {
            
            this.vx = this.power * Math.cos(this.angle);
            this.vy = this.power * Math.sin(this.angle);
            this.isStationary = false; 
        }

        if (!this.isStationary) {
            this.sx += this.vx;
            this.sy += this.vy;


            this.vx *= this.friction;
            this.vy *= this.friction;

            this.power *= this.friction;

            if (Math.abs(this.vx) < 0.1 && Math.abs(this.vy) < 0.1) {
                this.vx = 0;
                this.vy = 0;
                this.power = 0;
                this.isStationary = true;
                clickState.mouseUp = false; 
            }
        }

    }

    holeDetection(){
        if((this.sx < 80 && this.sy < 80) || (this.sx < 80 && this.sy > 690) || (710 <this.sx  && this.sx < 760 && this.sy < 50) || 
        (710 <this.sx  && this.sx < 770 && this.sy > 720) || (this.sx > 1370 && this.sy < 90) || (this.sx > 1370 && this.sy > 690)){
            body.style.backgroundColor = "red";
            this.vx = 0
            this.vy = 0
        }

        if(!(this.sx < 80 && this.sy < 80) && !(this.sx < 80 && this.sy > 690) && !(710 <this.sx  && this.sx < 760 && this.sy < 50) && 
        !(710 <this.sx  && this.sx < 770 && this.sy > 720) && !(this.sx > 1370 && this.sy < 90) && !(this.sx > 1370 && this.sy > 690)){
            body.style.backgroundColor = "rgba(0, 0, 0, 0.82)";
        }
    }
}

class Stick {
    constructor() {
        this.x = 0; 
        this.y = 0;
        this.w = 970; 
        this.h = 25;  
        this.sx = 410;
        this.sy = 405;
        this.angle = 0; 
        
    }

    draw() {
        c.save();
        c.translate(this.sx, this.sy);
        c.rotate(this.angle);
        c.drawImage(stickimg, this.x, this.y, this.w, this.h, -this.w  , -this.h / 2.5, this.w, this.h);
        c.restore();
    }

    update(mouseX = 0, mouseY = 0) {
        let dx = mouseX - this.sx; 
        let dy = mouseY - this.sy; 
        this.angle = Math.atan2(dy, dx); 
    }

    positionChange(ballStation, ballSx, ballSy){
        if(ballStation){
            this.sx = ballSx + 22
            this.sy = ballSy + this.h
        }
    }
}

class ColorBall {
    constructor(x, y, w, sx, sy, img, relation) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.sx = sx;
        this.sy = sy;
        this.img = img
        this.relation = relation
        this.vx = 0; 
        this.vy = 0; 
        this.friction = 0.9991; 
        this.angle = 0
    }

    draw() {
        c.drawImage(
            this.img,
            this.x,
            this.y,
            this.w,
            this.w,
            this.sx,
            this.sy,
            this.w / this.relation,
            this.w / this.relation
        );
    }

    update(ballSx, ballSy, ballVx, ballVy, otherBall = 0) {
        this.whiteBallCollisionDetection(ballSx, ballSy, ballVx, ballVy)
        this.collisionWithTableSideDetection()
        this.colorBallsCollisionDetection(otherBall)    
    }

    whiteBallCollisionDetection(ballSx, ballSy, ballVx, ballVy, ){
        let dx = this.sx - ballSx; 
        let dy = this.sy - ballSy; 
        let distance = Math.sqrt(dx * dx + dy * dy);
        let minDistance = 40; 

        if(this.sx < ballSx || this.sy < ballSy ){
            minDistance = 30
        }

        if (distance <= minDistance) {
            if(this.vx < 0.01){
                this.angle = Math.atan2(dy, dx);       
            }
            // Transfer velocity to red ball
            let speed = Math.sqrt(ballVx * ballVx + ballVy * ballVy) * 0.1;
            this.vx = speed * Math.cos(this.angle);
            this.vy = speed * Math.sin(this.angle);
            
        }
        // Apply friction to red ball's motion
        this.sx += this.vx;
        this.sy += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Ensure red ball stops completely if velocity is very low
        if (Math.abs(this.vx) < 0.002) this.vx = 0;
        if (Math.abs(this.vy) < 0.002) this.vy = 0;
    }

    collisionWithTableSideDetection(){
        if(this.sx >= canvas.width - 95){
            this.sx = canvas.width - 95
            this.vx = -this.vx * 0.5
        }

        if(this.sx <= 55){
            this.sx = 55
            this.vx = -this.vx * 0.5
        }

        if(this.sy >= canvas.height - 95){
            this.sy = canvas.height - 95
            this.vy = -this.vy * 0.5

        }

        if(this.sy <= 55){
            this.sy = 55
            this.vy = -this.vy * 0.5
        }
    }

    colorBallsCollisionDetection(otherBall) {
        let dx = this.sx - otherBall.sx; // Distance in x between balls
        let dy = this.sy - otherBall.sy; // Distance in y between balls
        let distance = Math.sqrt(dx * dx + dy * dy);
        let minDistance = 40; 
    
        if (distance <= minDistance) {
            // Normalize the vector between the balls
            let angle = Math.atan2(dy, dx);
            let overlap = minDistance - distance;
    
            // Resolve overlap by adjusting positions
            let adjustX = (overlap / 2) * Math.cos(angle);
            let adjustY = (overlap / 2) * Math.sin(angle);
            this.sx += adjustX;
            this.sy += adjustY;
            otherBall.sx -= adjustX;
            otherBall.sy -= adjustY;
    
            // Calculate initial velocities along the collision normal
            let velocity1 = this.vx * Math.cos(angle) + this.vy * Math.sin(angle);
            let velocity2 = otherBall.vx * Math.cos(angle) + otherBall.vy * Math.sin(angle);
    
            // Exchange velocities (elastic collision)
            let newVelocity1 = velocity2;
            let newVelocity2 = velocity1;
    
            // Update velocities along the collision normal
            this.vx += (newVelocity1 - velocity1) / 1.5 * Math.cos(angle);
            this.vy += (newVelocity1 - velocity1) * Math.sin(angle);
    
            otherBall.vx += (newVelocity2 - velocity2) * Math.cos(angle);
            otherBall.vy += (newVelocity2 - velocity2) * Math.sin(angle);
        }
    
        // Apply friction to this ball
        this.sx += this.vx;
        this.sy += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;
    
        if (Math.abs(this.vx) < 0.001) this.vx = 0;
        if (Math.abs(this.vy) < 0.001) this.vy = 0;
    
        // Apply friction to the other ball
        otherBall.sx += otherBall.vx;
        otherBall.sy += otherBall.vy;
        otherBall.vx *= otherBall.friction;
        otherBall.vy *= otherBall.friction;
    
        if (Math.abs(otherBall.vx) < 0.001) otherBall.vx = 0;
        if (Math.abs(otherBall.vy) < 0.001) otherBall.vy = 0;
    }
}

class Canvas{
    constructor(){
        this.table = new Table()
        this.ball = new Ball()
        this.stick = new Stick()
        this.blackball = new ColorBall(257, 245, 470, 1069, 385, blackballimg, 11)
        this.redball =[
            new ColorBall(0, 0, 520, 1000, 390, redballimg, 14), 
            new ColorBall(0, 0, 520, 1035, 370, redballimg, 14),
            new ColorBall(0, 0, 520, 1072, 430, redballimg, 14),
            new ColorBall(0, 0, 520, 1110, 410, redballimg, 14),
            new ColorBall(0, 0, 520, 1110, 330, redballimg, 14),
            new ColorBall(0, 0, 520, 1143, 350, redballimg, 14),
            new ColorBall(0, 0, 520, 1140, 470, redballimg, 14),
        ]
        
        this.blueball = [
            new ColorBall(100, 300, 1560, 1032, 410, blueballimg, 37), 
            new ColorBall(100, 300, 1560, 1099, 372, blueballimg, 37),
            new ColorBall(100, 300, 1560, 1069, 360, blueballimg, 37),
            new ColorBall(100, 300, 1560, 1102, 450, blueballimg, 37),
            new ColorBall(100, 300, 1560, 1132, 315, blueballimg, 37),
            new ColorBall(100, 300, 1560, 1132, 400, blueballimg, 37),
            new ColorBall(100, 300, 1560, 1132, 435, blueballimg, 37),
        ]
    }

    draw(){
        this.table.draw()
        this.ball.draw()
        this.redball.forEach(e=>{
            e.draw()
        })
        this.blueball.forEach(e=>{
            e.draw()
        })
        this.blackball.draw()
        this.stick.draw()
    }

    update(){
        this.ball.update(this.stick.angle)

        for(let i = 0; i < 1; i++){
            if((this.blackball.sx < 80 && this.blackball.sy < 80) || (this.blackball.sx < 80 && this.blackball.sy > 690) || (710 < this.blackball.sx  && this.blackball.sx < 760 && this.blackball.sy < 50) || 
            (710 <this.blackball.sx  && this.blackball.sx < 770 && this.blackball.sy > 720) || (this.blackball.sx > 1370 && this.blackball.sy < 90) || (this.blackball.sx > 1370 && this.blackball.sy > 690)){
                body.style.backgroundColor = "red";
                this.blackball.vx = 0
                this.blackball.vy = 0
            }
        }




        for (let i = 0; i < this.redball.length; i++) {
            this.redball[i].update(this.ball.sx, this.ball.sy, this.ball.vx, this.ball.vy, this.redball[i]);
        
            if (this.redball[i].sx < 80 && this.redball[i].sy < 80 || (this.redball[i].sx < 80 && this.redball[i].sy > 690) || (710 <this.redball[i].sx  && this.redball[i].sx < 760 && this.redball[i].sy < 50) || 
            (710 < this.redball[i].sx  && this.redball[i].sx < 770 && this.redball[i].sy > 720) || (this.redball[i].sx > 1370 && this.redball[i].sy < 90) || (this.redball[i].sx > 1370 && this.redball[i].sy > 690)) {
                this.redball.splice(i, 1); 
                i--; 
            }    
        }

        for (let i = 0; i < this.blueball.length; i++) {
            this.blueball[i].update(this.ball.sx, this.ball.sy, this.ball.vx, this.ball.vy, this.blueball[i]);
        
            if (this.blueball[i].sx < 80 && this.blueball[i].sy < 80 || (this.blueball[i].sx < 80 && this.blueball[i].sy > 690) || (710 <this.blueball[i].sx  && this.blueball[i].sx < 760 && this.blueball[i].sy < 50) || 
            (710 <this.blueball[i].sx  && this.blueball[i].sx < 770 && this.blueball[i].sy > 720) || (this.blueball[i].sx > 1370 && this.blueball[i].sy < 90) || (this.blueball[i].sx > 1370 && this.blueball[i].sy > 690)) {
                this.blueball.splice(i, 1); 
                i--; 
            }    
        }


        for(let i = 0; i < this.redball.length - 1; i++){
            for(let j = i + 1; j < this.redball.length; j++){
                this.redball[i].update(this.ball.sx, this.ball.sy, this.ball.vx, this.ball.vy, this.redball[j])
            }
        }

        for(let i = 0; i < this.blueball.length - 1; i++){
            for(let j = i + 1; j < this.blueball.length; j++){
                this.blueball[i].update(this.ball.sx, this.ball.sy, this.ball.vx, this.ball.vy, this.blueball[j])
            }
        }

        for(let i = 0; i < this.redball.length; i++){
            this.blueball.forEach(e=>{
                e.update(this.ball.sx, this.ball.sy, this.ball.vx, this.ball.vy, this.redball[i]);
            })
        }

        for(let i = 0; i < this.blueball.length; i++){
            this.redball.forEach(e=>{
                e.update(this.ball.sx, this.ball.sy, this.ball.vx, this.ball.vy, this.blueball[i]);
            })
        }

        for (let i = 0; i < this.blueball.length; i++){
            this.blackball.update(this.ball.sx, this.ball.sy, this.ball.vx, this.ball.vy, this.blueball[i])
        }

        for (let i = 0; i < this.redball.length; i++){
            this.blackball.update(this.ball.sx, this.ball.sy, this.ball.vx, this.ball.vy, this.redball[i])
        }

        this.stick.positionChange(this.ball.isStationary, this.ball.sx, this.ball.sy)
    }
}

backgroundimg.onload = ballimg.onload = stickimg.onload = blueballimg.onload = redballimg.onload = ()=>{
    
    let my_canvas = new Canvas()
    
    function animate(){
        c.clearRect(0, 0, canvas.width, canvas.height)
        my_canvas.update()
        my_canvas.draw()
        if(clickState.mouseDown && !clickState.mouseUp){
            my_canvas.ball.power += 1.2
        }
        requestAnimationFrame(animate)
    }
    animate()

    canvas.addEventListener("mousemove", (e)=>{
        my_canvas.stick.update(e.offsetX, e.offsetY)
    })

    canvas.addEventListener("mousedown", e=>{
        if (e.button == 0){
            clickState.mouseDown = true;
        }
    })

    canvas.addEventListener("mouseup", e=>{
        clickState.mouseUp = true;
        clickState.mouseDown = false;

    }) 
}



