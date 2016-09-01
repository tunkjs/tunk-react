import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom';
import { connect } from '../utils/react-reflow'

@connect
export default class Btn extends Component {

  decrement(){
    this.dispatch('counter.decrement');
  }

  render() {
    return (
        <button onClick={this.decrement.bind(this)}>-</button>
    )
  }
}
