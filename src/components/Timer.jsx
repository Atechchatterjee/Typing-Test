import React, { Component } from "react";

export default class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: 1,
      startTimer: props.startTimer,
    };
  }
  render() {
    return <span>{this.state.timer}</span>;
  }

  componentDidMount() {
    if (this.state.startTimer) {
      this.time = setInterval(
        function () {
          this.setState({
            timer: this.state.timer + 1,
          });
        }.bind(this),
        1000
      );
    }
  }
  componentWillUnmount() {
    clearInterval(this.time);
    this.props.callback(this.state.timer);
  }
}
