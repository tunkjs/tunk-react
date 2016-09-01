import {extend, action, isolate} from '../utils/react-reflow';


export default {count: 0};

export function increment() {
    console.log(this);
    return {count: this.getState().count + 1};
}

export function decrement() {
    return {count: this.getState().count - 1};
}

export function incrementIfOdd() {
    if ((this.getState().count + 1) % 2 === 0) {
        this.increment();
    }
}

export function incrementAsync() {
    setTimeout(() => {
        this.dispatch('increment')
    }, 1000)
}


