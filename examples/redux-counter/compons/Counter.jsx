import React, { Component, PropTypes } from 'react'
import { connect } from '../utils/react-reflow'
import '../models/counter';
import ReactDOM from 'react-dom';


@connect({
  count: 'counter.count'
},{
  incrementIfOdd:'counter.incrementIfOdd',
  incrementAsync:'counter.incrementAsync',
  decrement:'counter.decrement'
})
export default class Counter extends Component {

	static propTypes = {
      count: PropTypes.number.isRequired
	}

	componentWillReceiveProps(props) {
		const el = ReactDOM.findDOMNode(this.refs.btn1);
		console.log('ReactDOM',{el});
	}

  increment__(){
    this.dispatch('counter.increment');
  }

  render() {

    const { count} = this.props;

    const { increment, incrementIfOdd, incrementAsync, decrement} = this;

    return (
      <p>
        Clicked: {count}  times
        {' '}
        <button ref='btn1' onClick={::this.increment__}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
        {' '}
        <button onClick={incrementIfOdd}> incrementIfOdd </button>
        {' '}
        <button onClick={() => incrementAsync()}>Increment async</button>
      </p>
    )
  }
}
