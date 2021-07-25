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
      var newSpace = this.players.find(x => x.name == player).space += rollsSum;
      var finalSpace = newSpace;
      var isBridge = false;
      var isGoose = false;
      var gooseResponse;
      if (finalSpace > 63) {
        finalSpace = 63 - (finalSpace - 63);
      } else if (finalSpace == 6) {
        finalSpace = 12;
        isBridge = true;
      } else if (this.gooseSpaces.includes(finalSpace)) {
        isGoose = true;
        var startingSpace = currentSpace == 0 ? "Start" : currentSpace;
        gooseResponse = `${player} rolls ${roll1}, ${roll2}. Foo moves from ${startingSpace} to ${newSpace}, The Goose.`;
        while (this.gooseSpaces.includes(finalSpace)) {
          finalSpace += rollsSum;
          if (this.gooseSpaces.includes(finalSpace)) {
            gooseResponse += ` ${player} moves again and goes to ${finalSpace}, The Goose.`;
          } else {
            gooseResponse += ` ${player} moves again and goes to ${finalSpace}`;
          }
        }
      }
      this.players.find(x => x.name == player).space = finalSpace;

      if (currentSpace == 0) {
        if (isBridge) {
          return `${player} rolls ${roll1}, ${roll2}. Foo moves from Start to The Bridge. ${player} jumps to ${finalSpace}`;
        } else if (isGoose) {
          return gooseResponse;
        } else {
          return `${player} rolls ${roll1}, ${roll2}. Foo moves from Start to ${finalSpace}`;
        }
      }

      if (newSpace == 63) {
        return `${player} rolls ${roll1}, ${roll2}. Foo moves from ${currentSpace} to ${finalSpace}. ${player} Wins!!`;
      } else if (newSpace > 63) {
        return `${player} rolls ${roll1}, ${roll2}. Foo moves from ${currentSpace} to 63. ${player} bounces! ${player} returns to ${finalSpace}`;
      } else {
        if (isBridge) {
          return `${player} rolls ${roll1}, ${roll2}. Foo moves from ${currentSpace} to The Bridge. ${player} jumps to ${finalSpace}`;
        } else if (isGoose) {
          return gooseResponse;
        } else {
          return `${player} rolls ${roll1}, ${roll2}. Foo moves from ${currentSpace} to ${finalSpace}`;
        }
      }
    }
  }
}