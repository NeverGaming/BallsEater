// 设置画布

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

// 图形构造函数
function shape(x, y, velX, velY,exist) {
  this.x = x;
  this.y = y;
  this.velX = velX;
  this.velY = velY;
  // 新增属性：存在状态
  this.exist = exist;
}


// 实例化小球
function Ball(x, y, velX, velY, exist, color, size) {
  shape.call(this, x, y, velX, velY, exist);  // 继承shape的基本属性

  this.color = color;
  this.size = size;
}

// 绘制小球
Ball.prototype.draw = function() {
  ctx.beginPath();
  ctx.fillStyle = this.color;
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.fill();
}

// 生成随机数的函数

function random(min,max) {
  const num = Math.floor(Math.random() * (max - min)) + min;
  return num;
}

// 生成随机颜色的函数
function randomColor() {
  return ("rgb(" + random(0, 255) + "," + random(0, 255) + "," + random(0, 255) + ")");
} 

function randomColor2() {
  const r = random(0, 255);
  const g = random(0, 255);
  const b = random(0, 255);
  return "rgb(" + r + "," + g + "," + b + ")";
}

// 小球位置的更新
Ball.prototype.update = function() {
  if ((this.x + this.size) >= width) {
    this.velX = -(this.velX);
  } 
  if ((this.x - this.size) <= 0) {
    this.velX = -(this.velX);
  }

  if ((this.y + this.size) >= height) {
    this.velY = -(this.velY);
  }
  if ((this.y - this.size) <= 0) {
    this.velY = -(this.velY);
  }

  this.x += this.velX;
  this.y += this.velY;

  // 检测碰撞
  this.collisionDetect();
}


// 小球被吃掉
Ball.prototype.eaten = function() {
  this.color = 'rgba(0,0,0,0.25)';
  this.velY = 0;
  this.velX = 0;
  Object.freeze(this); // 防止被修改
}

// 存储小球
let balls = [];

while (balls.length < 25) {
  
  let exist = true;// 新增属性
  let size = random(10, 20);
  // 生成小球
  let ball = new Ball(
    // 为避免绘制错误，球的出生点（圆心）应该至少离画布边缘有球半径（size）一倍的距离
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    exist,
    randomColor(),
    size,
  );
  balls.push(ball);
}


// 运动循环
function loop() {
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0,0,width,height);

  for (let i = 0; i < balls.length; i++) {
    balls[i].draw();
    balls[i].update();

    // 每一帧恶魔圈都要存在
    evil.draw();
    evil.checkBounds();
    evil.collisionDetect();
  }

  requestAnimationFrame(loop);
}

// 碰撞检测
// 变色
Ball.prototype.collisionDetect = function () {
  for (let j = 0; j < balls.length; j++) {
    if (this !== balls[j]) {
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      // 计算两个圆心的距离
      const distance = Math.sqrt(dx * dx + dy * dy);
      // 如果两个圆心的距离小于两个圆的半径和，则发生碰撞
      if (distance < this.size + balls[j].size) {
        balls[j].color = this.color = randomColor();
      }
    }
  }
};


// 恶魔圈
function EvilCircle( x, y, velX, velY, exist, color, size) {
  shape.call(this, x, y, velX=20, velY=20, exist=true);

  this.color = color;
  this.size = size;
}

// 绘制恶魔圈
EvilCircle.prototype.draw = function() {
  ctx.beginPath();
  ctx.strokeStyle = this.color; // 绘制圆边框
  ctx.lineWidth = 3; // 设置圆边框宽度
  ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
  ctx.stroke(); // 绘制圆边框
}

// 检测边界,使恶魔圈撞墙微弹
EvilCircle.prototype.checkBounds = function() {
  if ((this.x + this.size) >= width) {
    this.x -= this.size;
  }
  if ((this.x - this.size) <= 0) {
    this.x += this.size;
  }
  if ((this.y + this.size) >= height) {
    this.y -= this.size;
  }
  if ((this.y - this.size) <= 0) {
    this.y += this.size;
  }
}

// 移动恶魔圈
EvilCircle.prototype.setControls = function() {
  window.onkeydown = (e) => {
    switch (e.key) {
      case "a":
        this.x -= this.velX;
        break;
      case "d":
        this.x += this.velX;
        break;
      case "w":
        this.y -= this.velY;
        break;
      case "s":
        this.y += this.velY;
        break;
    }
  };
  
}


let count = balls.length;// 计数器
// 创建一个变量存储段落的引用
var paragaphRef = document.getElementById('counter');
// 更新段落的内容
function updateParagraph() {
  paragaphRef.innerHTML = '还剩 ' + count + ' 个球';
  if (count == 0) {
    paragaphRef.innerHTML = '游戏结束';
  }
}

// 恶魔圈的碰撞检测
EvilCircle.prototype.collisionDetect = function() {

  // 遍历所有的小球
  for (let j = 0; j < balls.length; j++) {
    // 先检测球是否存在
    if (balls[j].exist) {
      const dx = this.x - balls[j].x;
      const dy = this.y - balls[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      // 再检测球是否达到能被恶魔圈碰到的距离
      if (distance < this.size + balls[j].size) {
        balls[j].exist = false;
        // 球被吃掉
        balls[j].eaten();
        count--;
        updateParagraph();
      }
    }
  }
}

// 实例化恶魔圈
let exist = true;
let size = 40;
const evil = new EvilCircle(random(0 + size, width - size),random(0 + size, height - size), 30, 30, true, 'white', size);
evil.setControls();

// 执行
loop();













