import {extend, action} from '../utils/react-reflow';


@extend
export default class counter {

  //不允许异步，应该保持简单
  constructor(){
    this.dispatch({
      count:0
    });
  }

  @action
  increment(){
    console.log(this);
    return {count:this.state.count+1};
  }

  @action
  decrement(){
    return {count:this.state.count-1};
  }

  @action
  incrementIfOdd(){
    if ((this.state.count + 1) % 2 === 0) {
      this.increment();
    }
  }

  @action
  incrementAsync(){
    setTimeout(() => {
      this.dispatch('increment')
    }, 1000)
  }
}

