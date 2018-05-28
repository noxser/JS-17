'use strict';

class Vector {
    
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    plus(vector) {
        if (vector instanceof Vector) {
            return new Vector(this.x + vector.x, this.y + vector.y)};
        throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    times(num) {
      return new Vector(this.x * num, this.y * num)};
}


class Actor {

    constructor(position, size, speed) {
        if (position === undefined) {
            this.pos = new Vector();
        } else if (position instanceof Vector) {
            this.pos = position;
        } else {
            throw new Error("Ошибка в поле position Не являеться объектом класса Vector")};
        if (size === undefined) {
            this.size = new Vector(1, 1);
        } else if (size instanceof Vector) {
            this.size = size;
        } else {
            throw new Error("Ошибка в поле speed! Не являеться объектом класса Vector")};
        if (speed === undefined) {
            this.speed = new Vector();
        } else if (speed instanceof Vector) {
            this.speed = speed;
        } else {
            throw new Error("Ошибка в поле size! Не являеться объектом класса Vector")};
    } 

    act() {};

    get type() {
        return 'actor';
    }

    get left() {
      return this.pos.x;
    }

    get right() {
        return this.pos.x + this.size.x;
    }

    get top() {
      return this.pos.y;
    }

    get bottom() {
      return this.pos.y + this.size.y;
    }

    isIntersect(obj) {
        if (!(obj instanceof Actor)) {
            throw new Error('Не является объектом класса Actor')
        };
        if (this === obj) {
          return false;
        } else {
          return (obj.left < this.right && obj.right > this.left) && (obj.top < this.bottom && obj.bottom > this.top);
        }
    }
}


class Level {
    constructor(grid, actors) {
        this.grid = grid;
        this.actors = actors;
        this.status = null;
        this.finishDelay = 1;
    }
    
    get height() {
        if (this.grid === undefined) {return 0};
        return this.grid.length;        
    }
    
    get width() {
        if (this.grid === undefined) {return 0};
        let max = 0;
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i].length > max) max = this.grid[i].length};
        return max;
    }
    
    get player() {
        return this.actors.find(obj => obj.type === 'player');
    }
    
    isFinished() {
        if (this.status !== null && this.finishDelay < 0) {
            return true;      
        } else if (this.status == null && this.finishDelay > 0) {
            return false; 
        }             
        return false;         
    }
    
    actorAt(actor) {
        if (!(actor instanceof Actor)) {
            throw new Error("Ошибка переданный объект не класса Actor");
        } else if (this.actors == undefined) {
            return undefined;
        } else if (this.actors.length == 1) {
            return undefined;
        } else {
            let act = this.actors.filter(item => actor.isIntersect(item));
            if (act) {
                return act[0];
            } else {
                return undefined;   
            }
        }
    }

    obstacleAt(position, size) {
        if (!(position instanceof Vector) || !(size instanceof Vector)) {
            throw new Error("Ошибка переданный объект не класса Vector");
        }
        
        const Left = Math.floor(position.x);
        const Top = Math.floor(position.y);
        const Bottom = Math.ceil(position.y+size.y)
        const Right = Math.ceil(position.x+size.x)
                        
        if (Left < 0 ||  Right > this.width || Top < 0) {return 'wall';} 
        if (Bottom > this.height) {return 'lava';} 
                
        for (let y = Top; y < Bottom; y++) {
            for (let x = Left; x < Right; x++) {
                if (this.grid[y][x] === undefined) continue;
                if (this.grid[y][x] === "lava") return "lava";
                if (this.grid[y][x] === "wall") return "wall";
            }
        }
    }

    removeActor(actor) {
        if (this.actors.includes(actor)) {
            this.actors.splice(this.actors.indexOf(actor),1);
        }
    }

    noMoreActors(type) {
        return (this.actors === undefined || !(this.actors.find(obj => obj.type === type))) ? true : false;
    }

    playerTouched(type, actor) {
        if (type === 'lava' || type === 'fireball') {this.status = 'lost'};
        if (type === 'coin') {
            if (!this.noMoreActors(type)) {this.removeActor(actor)};
            if (this.noMoreActors('coin')) {this.status = 'won'};
        }
    }

}


class LevelParser {

    constructor(symbolDict) {
        this.symbolDict = symbolDict;
    }

    actorFromSymbol(sym) {
        if (sym === undefined) return undefined;
        return this.symbolDict[sym];
    }        
    

    obstacleFromSymbol(sym) {
        if (sym === 'x') {return 'wall'};
        if (sym === '!') {return 'lava'};
    } 

    createGrid(plan) {
        let grid = []; 
        while (grid.length < plan.length) {
          grid.push([])};
        for (let y = 0; y < plan.length; y++) {
          for (let x = 0; x < plan[y].length; x++) {
            grid[y][x] = this.obstacleFromSymbol(plan[y][x])
          }
        }
        return grid;
    }

    createActors(plan) {
        if (plan.length === 0 || this.symbolDict === undefined) {return []};
        let actors = [], actor, sym, actorClass; 
        for (let y = 0; y < plan.length; y++) {
          for (let x = 0; x < plan[y].length; x++) {
            sym = plan [y][x];
            actorClass = this.actorFromSymbol(sym);
            if (typeof(actorClass) === 'function') {
                actor = new actorClass(new Vector(x, y));
                if (actor instanceof Actor) actors.push(actor);
            }
          }
        }
        return actors;
    }

    parse(plan) {
        return new Level(this.createGrid(plan), this.createActors(plan));
    }
}


class Fireball extends Actor {

    constructor(pos = new Vector, speed = new Vector) {
        super();
        this.pos = pos;
        this.speed = speed;
        this.size = new Vector(1,1);
    }
    
    get type() {
        return 'fireball';
    }

    getNextPosition (time = 1) {
        return (new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time))
    }

    handleObstacle () {
        this.speed = new Vector(-(this.speed.x), -(this.speed.y));
    }

    act (time, level) {
        let nextpos = this.getNextPosition(time)
        if (level.obstacleAt(nextpos, this.size) === undefined) {
            this.pos = nextpos
        } else {
            this.handleObstacle();
        }
    }
}


class HorizontalFireball extends Fireball {

    constructor(pos) {
        super();
        this.pos = pos;
        this.speed = new Vector(2,0);
    }

}


class  VerticalFireball extends Fireball {

    constructor(pos) {
        super();
        this.pos = pos;
        this.speed = new Vector(0,2);
    }

}


class  FireRain extends Fireball {

    constructor(pos) {
        super();
        this.pos = pos;
        this.speed = new Vector(0,3);
        this.startPos = pos;
    }
   
    handleObstacle () {
        this.speed;
        this.pos = this.startPos;
    }
}


class Coin extends Actor {

    constructor(pos = new Vector()) {
        super();
        this.pos =  new Vector(pos.x + 0.2, pos.y + 0.1);
        this.startPos = new Vector(pos.x + 0.2, pos.y + 0.1);
        this.size = new Vector(0.6, 0.6);
        this.speed = new Vector(0, 3);
        this.spring = Math.floor(Math.random() * (2*Math.PI + 1));
        this.springSpeed = 8;
        this.springDist = 0.07;        
    }

    get type () {
        return 'coin';
    }

    updateSpring (time = 1) {
        this.spring = this.spring + this.springSpeed * time;
    }

    getSpringVector () {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition (time = 1) {
        this.updateSpring(time);
        return new Vector(this.startPos.x, this.startPos.y + this.getSpringVector(time).y);
    }

    act (time = 1) {
        this.pos = this.getNextPosition(time);
    }
}


class Player extends Actor {
    constructor(pos = new Vector()) {
        super();
        this.pos =  new Vector(pos.x, pos.y - 0.5);  
        this.size = new Vector(0.8, 1.5);
        this.speed = new Vector(0, 0);
    }

    get type () {
        return 'player';
    }
}


const schema = [
    'v       |',
    '         ',
    '    =    ',
    '       o ',
    '     !xxx',
    ' @o      ',
    'xxx!     ',
    '         '
  ];

  const actorDict = {
    '@': Player,
    '=': HorizontalFireball,
    'o': Coin,
    '|': VerticalFireball, 
    'v': FireRain
}

  const parser = new LevelParser(actorDict);
  const level = parser.parse(schema);
  runLevel(level, DOMDisplay)
    .then(status => console.log(`Игрок ${status}`));

