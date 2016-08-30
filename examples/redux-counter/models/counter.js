import flows from '../utils/react-flows';

flows.model('counter',{

  default:{
    count: 0,
  },

  increment:function(opt){
    console.log(this);
    return {count:this.getState().count+1};
  },

  decrement:function(){
    return {count:this.getState().count-1};
  },

  incrementIfOdd:function(){
    if ((this.getState().count + 1) % 2 === 0) {
      this.dispatch('increment')
    }
  },

  incrementAsync:function(){
    setTimeout(() => {
      this.dispatch('increment')
    }, 1000)
  },

});