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
  get nextSpace() {
    return this.player.space + this.rolls[0] + this.rolls[1];
  }
  defaultResponse(nextSpace = this.nextSpace) {
    return `${this.player.name} rolls ${this.rolls[0]}, ${this.rolls[1]}. Foo moves from ${this.currentSpace} to ${nextSpace}`;
  }
}

class DefaultResult extends Result {
  result() {
    return {
      response: this.defaultResponse(),
      space: this.nextSpace
    }
  }
}

class WinResult extends Result {
  constructor(player, rolls, winSpace, next) {
    super(player, rolls);
    this.next = next;
    this.winSpace = winSpace;
  }
  result() {
    if (this.nextSpace != this.winSpace) {
      return this.next?.result();
    }

    return {
      response: `${this.defaultResponse()}. ${this.player.name} Wins!!`,
      space: this.nextSpace
    }
  }
}

class GooseResult extends Result {
  constructor(player, rolls, gooseSpaces, next) {
    super(player, rolls);
    this.gooseSpaces = gooseSpaces;
    this.next = next;
  }
  result() {
    if (!this.gooseSpaces.includes(this.nextSpace)) {
      return this.next?.result();
    }

    var space = this.nextSpace;
    var response = `${this.defaultResponse()}, The Goose.`;

    while (this.gooseSpaces.includes(space)) {
      space += this.rolls[0] + this.rolls[1];
      response += ` ${this.player.name} moves again and goes to ${space}`;

      if (this.gooseSpaces.includes(space)) {
        response += ", The Goose.";
      }
    }

    return {
      response,
      space
    }
  }
}

class BridgeResult extends Result {
  constructor(player, rolls, next) {
    super(player, rolls);
    this.next = next;
  }
  result() {
    if (this.nextSpace != 6) {
      return this.next?.result();
    }

    var space = 12;

    return {
      response: `${this.defaultResponse("The Bridge")}. ${this.player.name} jumps to ${space}`,
      space
    }
  }
}

class BounceResult extends Result {
  constructor(player, rolls, winSpace, next) {
    super(player, rolls);
    this.next = next;
    this.winSpace = winSpace;
  }
  result() {
    if (this.nextSpace <= this.winSpace) {
      return this.next?.result();
    }

    var space = this.winSpace - (this.nextSpace - this.winSpace);

    return {
      response: `${this.defaultResponse(this.winSpace)}. ${this.player.name} bounces! ${this.player.name} returns to ${space}`,
      space
    }
  }
}

class AddPlayerHandler {
  constructor(game, arg, next) {
    this.game = game;
    this.arg = arg;
    this.next = next;
  }
  handle() {
    if (!this.arg.includes("add player")) {
      return this.next?.handle();
    }

    var playerName = this.arg.split(" ")[2];
    var playerExists = this.game.players.some(x => x.name == playerName);
    if (playerExists) {
      return `${playerName}: already existing player`;
    }

    this.game.players.push({ name: playerName, space: 0 });
    return getPlayersString(this.game.players);

    function getPlayersString(players) {
      return `players: ${players.map(x => x.name).join(", ")}`;
    }
  }
}

class MovePlayerHandler {
  constructor(game, arg, next) {
    this.arg = arg;
    this.next = next;
    this.game = game;
  }
  handle() {
    if (!this.arg.includes("move")) {
      return this.next?.handle();
    }

    var playerName = this.arg.split(" ")[1];
    var player = this.game.players.find(x => x.name == playerName);
    var rolls = getRolls(this.arg, this.game.diceThrower);
    var result =
      new BounceResult(player, rolls, this.game.winSpace,
        new BridgeResult(player, rolls,
          new GooseResult(player, rolls, this.game.gooseSpaces,
            new WinResult(player, rolls, this.game.winSpace,
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
    return new AddPlayerHandler(this, arg,
      new MovePlayerHandler(this, arg)).handle();
  }
}

