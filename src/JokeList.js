import React from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends React.Component {
  static defaultProps = { numJokesToGet: 10 };
  state = { jokes: [] };

  /* fetch jokes from API and put them in state */

  getJokes = async () => {
    let j = [...this.state.jokes];
    let seenJokes = new Set();
    try {
      while (j.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { status, ...jokeObj } = res.data;

        if (!seenJokes.has(jokeObj.id)) {
          seenJokes.add(jokeObj.id);
          j.push({ ...jokeObj, votes: 0 });
        } else {
          console.error("duplicate found!");
        }
      }
      this.setState({ jokes: j });
    } catch (e) {
      console.log(e);
    }
  }
  
  /* get jokes when component renders the first time */
  
  async componentDidMount () {
    await this.getJokes();
  }

  async componentDidUpdate () {
    if (!this.state.jokes.length) await this.getJokes();
  }

  /* empty joke list and then call getJokes */

  generateNewJokes = async () => {
    this.setState({ jokes: [] });
  }

  /* change vote for this id by delta (+1 or -1) */

  vote = (id, delta) => {
    const jokes = this.state.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j));
    this.setState({ jokes });
  }

  /* render: either null or list of sorted jokes. */

  render () {
    const {jokes} = this.state;

    if (jokes.length) {
      let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
    
      return (
        <div className="JokeList">
          <button className="JokeList-getmore" onClick={async () => await this.generateNewJokes()}>
            Get New Jokes
          </button>
    
          {sortedJokes.map(j => (
            <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />
          ))}
        </div>
      );
    }
  
    return null;
  }
}

export default JokeList;