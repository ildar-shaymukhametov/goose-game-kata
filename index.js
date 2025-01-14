// @ts-check

class DiceThrower {
  throw() {
    return 4;
  }
}

class Result {
  nextSpace(player, rolls) {
    return player.space + rolls[0] + rolls[1];
  }

  baseResult(player, rolls, space) {
    var currentSpace = player.space == 0 ? "Start" : player.space;
    return `${player.name} rolls ${rolls[0]}, ${rolls[1]}. Foo moves from ${currentSpace} to ${space}`;
  }
}

class DefaultResult extends Result {
  result(player, rolls) {
    var space = this.nextSpace(player, rolls);
    return {
      response: this.baseResult(player, rolls, space),
      space
    }
  }
}

class WinResult extends Result {
  result(player, rolls) {
    var space = this.nextSpace(player, rolls);
    return {
      response: `${this.baseResult(player, rolls, space)}. ${player.name} Wins!!`,
      space
    }
  }
}

class GooseResult extends Result {
  constructor(game) {
    super();
    this.game = game;
  }
  result(player, rolls) {
    var space = this.nextSpace(player, rolls);
    var response = `${this.baseResult(player, rolls, space)}, The Goose.`;

    while (this.game.gooseSpaces.includes(space)) {
      space += rolls[0] + rolls[1];
      response += ` ${player.name} moves again and goes to ${space}`;

      if (this.game.gooseSpaces.includes(space)) {
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
  result(player, rolls) {
    var space = 12;

    return {
      response: `${this.baseResult(player, rolls, "The Bridge")}. ${player.name} jumps to ${space}`,
      space
    }
  }
}

class BounceResult extends Result {
  constructor(game) {
    super();
    this.game = game;
  }
  result(player, rolls) {
    var space = this.game.winSpace - (this.nextSpace(player, rolls) - this.game.winSpace);

    return {
      response: `${this.baseResult(player, rolls, this.game.winSpace)}. ${player.name} bounces! ${player.name} returns to ${space}`,
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

    var player = this.game.players.find(x => x.name == getPlayerName(this.arg));
    var rolls = getRolls(this.arg, this.game.diceThrower);
    var result = getHandler(getNextSpace(player, rolls), this.game).result(player, rolls);

    player.space = result.space;
    return result.response;

    function getRolls(arg, diceThrower) {
      var args = arg.split(" ").map(x => x.replace(",", ""));
      var roll1 = args.length == 2 ? diceThrower.throw() : Number(args[2]);
      var roll2 = args.length == 2 ? diceThrower.throw() : Number(args[3]);

      return [roll1, roll2];
    }
    
    function getNextSpace(player, rolls) {
      return player.space + rolls[0] + rolls[1];
    }

    function getPlayerName(arg) {
      return arg.split(" ")[1];
    }

    function getHandler(nextSpace, game) {
      if (nextSpace > game.winSpace) {
        return new BounceResult(game)
      } else if (nextSpace == 6) {
        return new BridgeResult();
      } else if (game.gooseSpaces.includes(nextSpace)) {
        return new GooseResult(game);
      } else if (nextSpace == game.winSpace) {
        return new WinResult();
      } else {
        return new DefaultResult();
      }
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

