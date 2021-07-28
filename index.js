// @ts-check

class DiceThrower {
  throw() {
    return 4;
  }
}

class Result {
  constructor(player, rolls) {
    this.player = player;
    this.rolls = rolls;
  }
}

class DefaultResult extends Result {
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

class WinResult extends Result {
  constructor(player, rolls, nextSpace, next) {
    super(player, rolls);
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

class GooseResult extends Result {
  constructor(player, rolls, nextSpace, gooseSpaces, next) {
    super(player, rolls);
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

class BridgeResult extends Result {
  constructor(player, rolls, nextSpace, next) {
    super(player, rolls);
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

class BounceResult extends Result {
  constructor(player, rolls, nextSpace, next) {
    super(player, rolls);
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

class AddPlayerHandler {
  constructor(players, playerName) {
    this.players = players;
    this.playerName = playerName;
  }
  handle() {
    var playerExists = this.players.some(x => x.name == this.playerName);
    if (playerExists) {
      return `${this.playerName}: already existing player`;
    }

    this.players.push({ name: this.playerName, space: 0 });
    return getPlayersString(this.players);

    function getPlayersString(players) {
      return `players: ${players.map(x => x.name).join(", ")}`;
    }
  }
}

class MovePlayerHandler {
  constructor(player, diceThrower, gooseSpaces, arg) {
    this.player = player;
    this.arg = arg;
    this.diceThrower = diceThrower;
    this.gooseSpaces = gooseSpaces;
  }
  handle() {
    var rolls = getRolls(this.arg, this.diceThrower);
    const nextSpace = this.player.space + rolls[0] + rolls[1];
    var result =
      new BounceResult(this.player, rolls, nextSpace,
        new BridgeResult(this.player, rolls, nextSpace,
          new GooseResult(this.player, rolls, nextSpace, this.gooseSpaces,
            new WinResult(this.player, rolls, nextSpace,
              new DefaultResult(this.player, rolls))))).result();

    this.player.space = result.space;
    return result.response;

    function getRolls(arg, diceThrower) {
      var args = arg.split(" ").map(x => x.replace(",", ""));
      var roll1 = args.length == 2 ? diceThrower.throw() : Number(args[2]);
      var roll2 = args.length == 2 ? diceThrower.throw() : Number(args[3]);

      return [roll1, roll2];
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
    var playerName = getPlayerName(arg);

    if (arg.includes("add player")) {
      response = new AddPlayerHandler(this.players, playerName).handle();
    } else {
      var player = this.players.find(x => x.name == playerName);
      response = new MovePlayerHandler(player, this.diceThrower, this.gooseSpaces, arg).handle();
    }

    return response;
  }
}

function getPlayerName(arg) {
  var args = arg.split(" ");
  if (arg.includes("add player")) {
    return args[2];
  }
  return args[1];
}
