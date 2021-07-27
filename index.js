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

class WinResult {
  constructor(player, rolls, nextSpace) {
    this.player = player;
    this.rolls = rolls;
    this.nextSpace = nextSpace;
  }
  result() {
    if (this.nextSpace == 63) {
      return {
        response: response(this.player, this.rolls, this.nextSpace),
        space: this.nextSpace
      }
    }

    function response(player, rolls, nextSpace) {
      var currentSpace = player.space == 0 ? "Start" : player.space;
      return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${currentSpace} to ${nextSpace}. ${player.name} Wins!!`;
    }
  }
}

class GooseResult {
  constructor(player, rolls, nextSpace, gooseSpaces) {
    this.player = player;
    this.rolls = rolls;
    this.nextSpace = nextSpace;
    this.gooseSpaces = gooseSpaces;
  }
  result() {
    if (this.gooseSpaces.includes(this.nextSpace)) {
      var resultSpace = this.nextSpace;
      var currentSpace = this.player.space == 0 ? "Start" : this.player.space;
      var response = `${this.player.name} rolls ${this.rolls[0]}, ${this.rolls[1]}. Foo moves from ${currentSpace} to ${this.nextSpace}, The Goose.`;

      while (this.gooseSpaces.includes(resultSpace)) {
        resultSpace += this.rolls[0] + this.rolls[1];
        if (this.gooseSpaces.includes(resultSpace)) {
          response += ` ${this.player.name} moves again and goes to ${resultSpace}, The Goose.`;
        } else {
          response += ` ${this.player.name} moves again and goes to ${resultSpace}`;
        }
      }

      return {
        response,
        space: resultSpace
      }
    }
  }
}

class BridgeResult {
  constructor(player, rolls, nextSpace) {
    this.player = player;
    this.rolls = rolls;
    this.nextSpace = nextSpace;
  }
  result() {
    if (this.nextSpace == 6) {
      var resultSpace = 12;

      return {
        response: response(this.player, this.rolls, resultSpace),
        space: resultSpace
      }
    }

    function response(player, rolls, nextSpace) {
      var currentSpace = player.space == 0 ? "Start" : player.space;
      return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${currentSpace} to The Bridge. ${player.name} jumps to ${nextSpace}`;
    }
  }
}

class BounceResult {
  constructor(player, rolls, nextSpace) {
    this.player = player;
    this.rolls = rolls;
    this.nextSpace = nextSpace;
  }
  result() {
    if (this.nextSpace > 63) {
      var resultSpace = 63 - (this.nextSpace - 63);

      return {
        response: response(this.player, this.rolls, resultSpace),
        space: resultSpace
      }
    }

    function response(player, rolls, nextSpace) {
      var currentSpace = player.space == 0 ? "Start" : player.space;
      return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${currentSpace} to 63. ${player.name} bounces! ${player.name} returns to ${nextSpace}`;
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
      var result;
      if (newSpace > 63) {
        isBounce = true;
        result = new BounceResult(currentPlayer, [Number(roll1), Number(roll2)], newSpace).result();
        finalSpace = result.space;
        bounceResponse = result.response;
      } else if (newSpace == 6) {
        isBridge = true;
        result = new BridgeResult(currentPlayer, [Number(roll1), Number(roll2)], newSpace).result();
        finalSpace = result.space;
        bridgeResponse = result.response;
      } else if (this.gooseSpaces.includes(newSpace)) {
        isGoose = true;
        result = new GooseResult(currentPlayer, [Number(roll1), Number(roll2)], newSpace, this.gooseSpaces).result();
        finalSpace = result.space;
        gooseResponse = result.response;
      } else if (newSpace == 63) {
        isWin = true;
        result = new WinResult(currentPlayer, [Number(roll1), Number(roll2)], newSpace).result();
        finalSpace = result.space;
        winResponse = result.response;
      } else {
        result = new DefaultResult(currentPlayer, [Number(roll1), Number(roll2)]).result();
        finalSpace = result.space;
        defaultResponse = result.response;
      }

      currentPlayer.space = result.space;

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
