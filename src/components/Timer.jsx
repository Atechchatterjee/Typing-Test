import React, { Component } from "react";

export default class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minutes: 0,
      seconds: 0,
      startTimer: props.startTimer,
    };
  }
  render() {
    const { minutes, seconds } = this.state;
    return (
      <span className="Timer">
        {minutes < 10 ? "0" : ""}
        {minutes}:{seconds < 10 ? "0" : ""}
        {seconds}
      </span>
    );
  }

  componentDidMount() {
    if (this.state.startTimer) {
      this.time = setInterval(
        function () {
          if (this.state.seconds == 59) {
            this.setState({ minutes: this.state.minutes + 1 });
            this.setState({ seconds: 0 });
          } else {
            this.setState({
              seconds: this.state.seconds + 1,
            });
          }
          this.props.callback(this.state.minutes * 60 + this.state.seconds);
        }.bind(this),
        1000
      );
    }
  }
  componentWillUnmount() {
    clearInterval(this.time);
  }
}
