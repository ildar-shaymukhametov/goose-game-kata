// @ts-check

class DiceThrower {
  throw() {
    return 4;
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
      var currentSpace = this.players.find(x => x.name == player).space;
      const rollsSum = Number(roll1) + Number(roll2);
      var totalSpace = this.players.find(x => x.name == player).space += rollsSum;
      var newSpace = totalSpace;
      var isBridge = false;
      var isGoose = false;
      var gooseResponse;
      if (newSpace > 63) {
        newSpace = 63 - (newSpace - 63);
      } else if (newSpace == 6) {
        newSpace = 12;
        isBridge = true;
      } else if (this.gooseSpaces.includes(newSpace)) {
        isGoose = true;
        var startingSpace = currentSpace == 0 ? "Start" : currentSpace;
        gooseResponse = `${player} rolls ${roll1}, ${roll2}. Foo moves from ${startingSpace} to ${totalSpace}, The Goose.`;
        while (this.gooseSpaces.includes(newSpace)) {
          newSpace += rollsSum;
          if (this.gooseSpaces.includes(newSpace)) {
            gooseResponse += ` ${player} moves again and goes to ${newSpace}, The Goose.`;
          } else {
            gooseResponse += ` ${player} moves again and goes to ${newSpace}`;
          }
        }
      }
      this.players.find(x => x.name == player).space = newSpace;

      if (currentSpace == 0) {
        if (isBridge) {
          return `${player} rolls ${roll1}, ${roll2}. Foo moves from Start to The Bridge. ${player} jumps to ${newSpace}`;
        } else if (isGoose) {
          return gooseResponse;
        } else {
          return `${player} rolls ${roll1}, ${roll2}. Foo moves from Start to ${newSpace}`;
        }
      }

      if (totalSpace == 63) {
        return `${player} rolls ${roll1}, ${roll2}. Foo moves from ${currentSpace} to ${newSpace}. ${player} Wins!!`;
      } else if (totalSpace > 63) {
        return `${player} rolls ${roll1}, ${roll2}. Foo moves from ${currentSpace} to 63. ${player} bounces! ${player} returns to ${newSpace}`;
      } else {
        if (isBridge) {
          return `${player} rolls ${roll1}, ${roll2}. Foo moves from ${currentSpace} to The Bridge. ${player} jumps to ${newSpace}`;
        } else if (isGoose) {
          return gooseResponse;
        } else {
          return `${player} rolls ${roll1}, ${roll2}. Foo moves from ${currentSpace} to ${newSpace}`;
        }
      }
    }
  }
}
