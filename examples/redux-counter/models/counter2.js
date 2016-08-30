import {extend} from '../utils/react-reflow';



@extend({isolate:'deep'})
export default class counter {

  initState() {
    return {
      count: 0
    }
  }

  increment(){
    console.log(this);
    return {count:this.getState().count+1};
  }

  decrement(){
    return {count:this.getState().count-1};
  }

  incrementIfOdd(){
    if ((this.getState().count + 1) % 2 === 0) {
      this.increment();
    }
  }

  incrementAsync(){
    setTimeout(() => {
      this.dispatch('increment')
    }, 1000)
  }
}

