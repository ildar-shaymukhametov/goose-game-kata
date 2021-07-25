// @ts-check

class DiceThrower {
  throw() {
    return 4;
  }
}

class DefaultResult {
  constructor(player, rolls) {
    this.player = player;
    this.rolls = rolls;
  }
  result() {
    var resultSpace = space(this.player, this.rolls);
    return {
      response: response(this.player, this.rolls, resultSpace),
      space: resultSpace
    }

    function response(player, rolls, resultSpace) {
      var startingSpace = player.space == 0 ? "Start" : player.space;
      return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${startingSpace} to ${resultSpace}`;
    }
    function space(player, rolls) {
      return player.space + rolls[0] + rolls[1];
    }
  }
}

export class Game {
  constructor({
    diceThrower = new DiceThrower(),
    gooseSpaces = [5, 9, 14, 18, 23, 27]
  } = {}) {
    this.players = [];
    this.diceThrower = diceThrower;
    this.gooseSpaces = gooseSpaces;
  }

  run(arg) {
    if (arg.includes("add player")) {
      var player = arg.split(" ")[2];
      if (!this.players.some(x => x.name == player)) {
        this.players.push({ name: player, space: 0 });
        return `players: ${this.players.map(x => x.name).join(", ")}`;
      } else {
        return `${player}: already existing player`;
      }
    } else {
      var args = arg.split(" ").map(x => x.replace(",", ""));
      var player = args[1];
      var roll1;
      var roll2;
      if (args.length == 2) {
        roll1 = this.diceThrower.throw();
        roll2 = this.diceThrower.throw();
      } else {
        roll1 = args[2];
        roll2 = args[3];
      }
      const currentPlayer = this.players.find(x => x.name == player);
      var currentSpace = currentPlayer.space;
      const rollsSum = Number(roll1) + Number(roll2);
      var newSpace = currentPlayer.space + rollsSum;
      var finalSpace;
      var isBridge = false;
      var isGoose = false;
      var isBounce = false;
      var isWin = false;
      var gooseResponse;
      var bridgeResponse;
      var defaultResponse;
      var bounceResponse;
      var winResponse;
      var startingSpace = currentSpace == 0 ? "Start" : currentSpace;
      if (newSpace > 63) {
        isBounce = true;
        finalSpace = 63 - (newSpace - 63);
        bounceResponse = `${player} rolls ${roll1}, ${roll2}. Foo moves from ${startingSpace} to 63. ${player} bounces! ${player} returns to ${finalSpace}`;
      } else if (newSpace == 6) {
        finalSpace = 12;
        isBridge = true;
        bridgeResponse = `${player} rolls ${roll1}, ${roll2}. Foo moves from ${startingSpace} to The Bridge. ${player} jumps to ${finalSpace}`;
      } else if (this.gooseSpaces.includes(newSpace)) {
        isGoose = true;
        finalSpace = newSpace;
        gooseResponse = `${player} rolls ${roll1}, ${roll2}. Foo moves from ${startingSpace} to ${newSpace}, The Goose.`;
        while (this.gooseSpaces.includes(finalSpace)) {
          finalSpace += rollsSum;
          if (this.gooseSpaces.includes(finalSpace)) {
            gooseResponse += ` ${player} moves again and goes to ${finalSpace}, The Goose.`;
          } else {
            gooseResponse += ` ${player} moves again and goes to ${finalSpace}`;
          }
        }
      } else if (newSpace == 63) {
        isWin = true;
        finalSpace = newSpace;
        winResponse = `${player} rolls ${roll1}, ${roll2}. Foo moves from ${startingSpace} to ${finalSpace}. ${player} Wins!!`;
      } else {
        var result = new DefaultResult(currentPlayer, [Number(roll1), Number(roll2)]).result();
        finalSpace = result.space;
        defaultResponse = result.response;
      }
      this.players.find(x => x.name == player).space = finalSpace;


      if (isBounce) {
        return bounceResponse;;
      } else if (isBridge) {
        return bridgeResponse;
      } else if (isGoose) {
        return gooseResponse;
      } else if (isWin) {
        return winResponse;
      } else {
        return defaultResponse;
      }
    }
  }
}
