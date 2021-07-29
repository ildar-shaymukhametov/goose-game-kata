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
  get currentSpace() {
    return this.player.space == 0 ? "Start" : this.player.space;
  }
}

class DefaultResult extends Result {
  result() {
    var resultSpace = space(this.player, this.rolls);
    return {
      response: response(this.player, this.rolls, resultSpace, this.currentSpace),
      space: resultSpace
    }

    function response(player, rolls, resultSpace, currentSpace) {
      var currentSpace = player.space == 0 ? "Start" : player.space;
      return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${currentSpace} to ${resultSpace}`;
    }
    function space(player, rolls) {
      return player.space + rolls[0] + rolls[1];
    }
  }
}

class WinResult extends Result {
  constructor(player, rolls, nextSpace, winSpace, next) {
    super(player, rolls);
    this.nextSpace = nextSpace;
    this.next = next;
    this.winSpace = winSpace;
  }
  result() {
    if (this.nextSpace == this.winSpace) {
      return {
        response: response(this.player, this.rolls, this.nextSpace, this.currentSpace),
        space: this.nextSpace
      }
    }

    return this.next?.result();

    function response(player, rolls, nextSpace, currentSpace) {
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
      var response = `${this.player.name} rolls ${this.rolls[0]}, ${this.rolls[1]}. Foo moves from ${this.currentSpace} to ${this.nextSpace}, The Goose.`;

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
        response: response(this.player, this.rolls, resultSpace, this.currentSpace),
        space: resultSpace
      }
    }

    return this.next?.result();

    function response(player, rolls, nextSpace, currentSpace) {
      return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${currentSpace} to The Bridge. ${player.name} jumps to ${nextSpace}`;
    }
  }
}

class BounceResult extends Result {
  constructor(player, rolls, nextSpace, winSpace, next) {
    super(player, rolls);
    this.nextSpace = nextSpace;
    this.next = next;
    this.winSpace = winSpace;
  }
  result() {
    if (this.nextSpace > this.winSpace) {
      var resultSpace = this.winSpace - (this.nextSpace - this.winSpace);

      return {
        response: response(this.player, this.rolls, resultSpace, this.winSpace, this.currentSpace),
        space: resultSpace
      }
    }

    return this.next?.result();

    function response(player, rolls, nextSpace, winSpace, currentSpace) {
      return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${currentSpace} to ${winSpace}. ${player.name} bounces! ${player.name} returns to ${nextSpace}`;
    }
  }
}

class AddPlayerHandler {
  constructor(game, arg, playerName, next) {
    this.game = game;
    this.playerName = playerName;
    this.arg = arg;
    this.next = next;
  }
  handle() {
    if (!this.arg.includes("add player")) {
      return this.next?.handle();
    }

    var playerExists = this.game.players.some(x => x.name == this.playerName);
    if (playerExists) {
      return `${this.playerName}: already existing player`;
    }

    this.game.players.push({ name: this.playerName, space: 0 });
    return getPlayersString(this.game.players);

    function getPlayersString(players) {
      return `players: ${players.map(x => x.name).join(", ")}`;
    }
  }
}

class MovePlayerHandler {
  constructor(game, arg, playerName, next) {
    this.arg = arg;
    this.next = next;
    this.game = game;
    this.playerName = playerName;
  }
  handle() {
    if (!this.arg.includes("move")) {
      return this.next?.handle();
    }

    var player = this.game.players.find(x => x.name == this.playerName);
    var rolls = getRolls(this.arg, this.game.diceThrower);
    const nextSpace = player.space + rolls[0] + rolls[1];
    var result =
      new BounceResult(player, rolls, nextSpace, this.game.winSpace,
        new BridgeResult(player, rolls, nextSpace,
          new GooseResult(player, rolls, nextSpace, this.game.gooseSpaces,
            new WinResult(player, rolls, nextSpace, this.game.winSpace,
              new DefaultResult(player, rolls))))).result();

    player.space = result.space;
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
    gooseSpaces = [5, 9, 14, 18, 23, 27],
    winSpace = 63
  } = {}) {
    this.players = [];
    this.diceThrower = diceThrower;
    this.gooseSpaces = gooseSpaces;
    this.winSpace = winSpace;
  }

  run(arg) {
    var playerName = getPlayerName(arg);
    return new AddPlayerHandler(this, arg, playerName,
      new MovePlayerHandler(this, arg, playerName)).handle();

    function getPlayerName(arg) {
      var args = arg.split(" ");
      if (arg.includes("add player")) {
        return args[2];
      }
      return args[1];
    }
  }
}

