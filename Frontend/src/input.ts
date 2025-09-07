class Input{
    presses: Boolean[];

    constructor(){
        let thisClass = this;
        this.presses = Array(256).fill(false);
        document.addEventListener('keydown', function(ev){
            thisClass.presses[ev.keyCode] = true;
            console.log(ev.keyCode);
        });
        document.addEventListener('keyup', function(ev){
            thisClass.presses[ev.keyCode] = false;
            console.log(thisClass.presses);
        });
    }
}

export {Input}