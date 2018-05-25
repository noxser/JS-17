'use strict';

class Vector {
    
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    plus(vector) {
        if (vector instanceof Vector) {
            return new Vector(this.x + vector.x, this.y + vector.y);
        }
        throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    times(num) {
      return new Vector(this.x * num, this.y * num);
    }   
}


class Actor {
    constructor(position, size, speed) {
        if (position === undefined) {
            this.pos = new Vector();
        } else if (position instanceof Vector) {
            this.pos = position;
        } else {
            throw new Error("Ошибка в поле position Не являеться объектом класса Vector");
        }
        if (size === undefined) {
            this.size = new Vector(1, 1);
        } else if (size instanceof Vector) {
            this.size = size;
        } else {
            throw new Error("Ошибка в поле speed! Не являеться объектом класса Vector");
        }
        if (speed === undefined) {
            this.speed = new Vector();
        } else if (speed instanceof Vector) {
            this.speed = speed;
        } else {
            throw new Error("Ошибка в поле size! Не являеться объектом класса Vector");
        }
    } 

    get type() {
        return 'actor';
    }

    act() {};

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
          throw new Error('Не является объектом класса Actor');
        } else if (this === obj) {
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
        if (this.grid == undefined) {
            return 0;
        } else {
            return this.grid.length;
        }
        
    }
    get width() {
        if (this.grid == undefined) {
            return 0;
        } else {
            return this.grid[0].length;
        }
    }
    get player() {
        return this.actors.find(obj => obj.type === 'player');
    }
}






























