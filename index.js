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
  constructor(player, rolls, nextSpace, next) {
    this.player = player;
    this.rolls = rolls;
    this.nextSpace = nextSpace;
    this.next = next;
  }
  result() {
    if (this.nextSpace == 63) {
      return {
        response: response(this.player, this.rolls, this.nextSpace),
        space: this.nextSpace
      }
    }

    return this.next?.result();

    function response(player, rolls, nextSpace) {
      var currentSpace = player.space == 0 ? "Start" : player.space;
      return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${currentSpace} to ${nextSpace}. ${player.name} Wins!!`;
    }
  }
}

class GooseResult {
  constructor(player, rolls, nextSpace, gooseSpaces, next) {
    this.player = player;
    this.rolls = rolls;
    this.nextSpace = nextSpace;
    this.gooseSpaces = gooseSpaces;
    this.next = next;
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

    return this.next?.result();
  }
}

class BridgeResult {
  constructor(player, rolls, nextSpace, next) {
    this.player = player;
    this.rolls = rolls;
    this.nextSpace = nextSpace;
    this.next = next;
  }
  result() {
    if (this.nextSpace == 6) {
      var resultSpace = 12;

      return {
        response: response(this.player, this.rolls, resultSpace),
        space: resultSpace
      }
    }

    return this.next?.result();

    function response(player, rolls, nextSpace) {
      var currentSpace = player.space == 0 ? "Start" : player.space;
      return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${currentSpace} to The Bridge. ${player.name} jumps to ${nextSpace}`;
    }
  }
}

class BounceResult {
  constructor(player, rolls, nextSpace, next) {
    this.player = player;
    this.rolls = rolls;
    this.nextSpace = nextSpace;
    this.next = next;
  }
  result() {
    if (this.nextSpace > 63) {
      var resultSpace = 63 - (this.nextSpace - 63);

      return {
        response: response(this.player, this.rolls, resultSpace),
        space: resultSpace
      }
    }

    return this.next?.result();

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
    var response;

    if (arg.includes("add player")) {
      var playerName = getPlayerName(arg, 3);

      const playerExists = this.players.some(x => x.name == playerName);
      if (!playerExists) {
        this.players.push({ name: playerName, space: 0 });
        response = getPlayersString(this.players);
      } else {
        response = `${playerName}: already existing player`;
      }
    } else {
      var rolls  = getRolls(arg, this.diceThrower);
      var player = this.players.find(x => x.name == getPlayerName(arg, 2));
      const nextSpace = player.space + rolls[0] + rolls[1];
      var result =
        new BounceResult(player, rolls, nextSpace,
          new BridgeResult(player, rolls, nextSpace,
            new GooseResult(player, rolls, nextSpace, this.gooseSpaces,
              new WinResult(player, rolls, nextSpace,
                new DefaultResult(player, rolls))))).result();

      player.space = result.space;
      response = result.response;

    }

    return response;
    
    function getPlayersString(players) {
      return `players: ${players.map(x => x.name).join(", ")}`;
    }

    function getPlayerName(arg, position) {
      return arg.split(" ", position)[position - 1];
    }

    function getRolls(arg, diceThrower) {
      var args = arg.split(" ").map(x => x.replace(",", ""));
      var roll1 = args.length == 2 ? diceThrower.throw() : Number(args[2]);
      var roll2 = args.length == 2 ? diceThrower.throw() : Number(args[3]);

      return [roll1, roll2];
    }
  }
}
