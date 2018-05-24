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
    
    
    
            
}
    

