// @ts-check

import { Game } from "./index";

it("adds player", () => {
  var game = new Game();
  game.run("add player Foo");
  expect(game.players.find(x => x.name == "Foo")).toBeDefined();
})

it("game responds with player name when added player", () => {
  var game = new Game();
  var response = game.run("add player Foo");
  expect(response).toEqual("players: Foo");
})

it("game responds with player names when added multiple players", () => {
  var game = new Game();
  game.run("add player Foo");
  var response = game.run("add player Bar");
  expect(response).toEqual("players: Foo, Bar");
})

it("cannot add existing player", () => {
  var game = new Game();
  game.run("add player Foo");
  game.run("add player Foo");
  expect(game.players.filter(x => x.name == "Foo")).toHaveLength(1);
})

it("game responds when trying to add existing player", () => {
  var game = new Game();
  game.run("add player Foo");
  var response = game.run("add player Foo");
  expect(response).toEqual("Foo: already existing player");
})

it("player initial space is 0", () => {
  var game = new Game();
  game.run("add player Foo");
  expect(game.players.find(x => x.name == "Foo").space).toEqual(0);
})

it("player moves by sum of his rolls", () => {
  var game = new Game();
  game.run("add player Foo");
  game.run("move Foo 3, 1");
  expect(game.players.find(x => x.name == "Foo").space).toEqual(4);
})

it("game responds when player makes first move", () => {
  var game = new Game();
  game.run("add player Foo");
  var response = game.run("move Foo 3, 1");
  var expected = "Foo rolls 3, 1. Foo moves from Start to 4";
  expect(response).toEqual(expected);
})

it("game responds when player continues moving", () => {
  var game = new Game();
  game.run("add player Foo");
  game.run("move Foo 3, 1");
  var response = game.run("move Foo 1, 3");
  var expected = "Foo rolls 1, 3. Foo moves from 4 to 8";
  expect(response).toEqual(expected);
})

it("game responds when player wins by landing on win space", () => {
  var game = new Game({ winSpace: 13 });
  game.run("add player Foo");
  game.run("move Foo 10, 0");
  var response = game.run("move Foo 1, 2");
  var expected = "Foo rolls 1, 2. Foo moves from 10 to 13. Foo Wins!!";
  expect(response).toEqual(expected);
})

it("player bounces if overthrow", () => {
  var game = new Game({ winSpace: 13 });
  game.run("add player Foo");
  game.run("move Foo 10, 0");
  game.run("move Foo 3, 2");
  expect(game.players.find(x => x.name == "Foo").space).toEqual(11);
})

it("game responds when player bounces", () => {
  var game = new Game({ winSpace: 13 });
  game.run("add player Foo");
  game.run("move Foo 10, 0");
  var response = game.run("move Foo 3, 2");
  var expected = "Foo rolls 3, 2. Foo moves from 10 to 13. Foo bounces! Foo returns to 11";
  expect(response).toEqual(expected);
})

class FakeDiceThrower {
  throw() {
    return 2;
  }
}

it("game throws dice for player", () => {
  var game = new Game({ diceThrower: new FakeDiceThrower() });
  game.run("add player Foo");
  game.run("move Foo");
  expect(game.players.find(x => x.name == "Foo").space).toEqual(4);
})

it("player jumps to space 12 if lands on the bridge (space 6)", () => {
  var game = new Game();
  game.run("add player Foo");
  game.run("move Foo 6, 0");
  expect(game.players.find(x => x.name == "Foo").space).toEqual(12);
})

it("game responds when player gets to the bridge from the Start", () => {
  var game = new Game();
  game.run("add player Foo");
  var response = game.run("move Foo 6, 0");
  var expected = "Foo rolls 6, 0. Foo moves from Start to The Bridge. Foo jumps to 12";
  expect(response).toEqual(expected);
})

it("game responds when player gets to the bridge not from the Start", () => {
  var game = new Game();
  game.run("add player Foo");
  game.run("move Foo 2, 0");
  var response = game.run("move Foo 4, 0");
  var expected = "Foo rolls 4, 0. Foo moves from 2 to The Bridge. Foo jumps to 12";
  expect(response).toEqual(expected);
})

it("player moves again by the sum of previous rolls if he lands on The Goose", () => {
  var game = new Game({ gooseSpaces: [2] });
  game.run("add player Foo");
  game.run("move Foo 1, 1");
  expect(game.players.find(x => x.name == "Foo").space).toEqual(4);
})

it("game responds when player gets to The Goose from The Start", () => {
  var game = new Game({ gooseSpaces: [2] });
  game.run("add player Foo");
  var response = game.run("move Foo 1, 1");
  var expected = "Foo rolls 1, 1. Foo moves from Start to 2, The Goose. Foo moves again and goes to 4";
  expect(response).toMatch(expected);
})

it("game responds when player gets to The Goose not from The Start", () => {
  var game = new Game({ gooseSpaces: [3] });
  game.run("add player Foo");
  game.run("move Foo 1, 0");
  var response = game.run("move Foo 1, 1");
  var expected = "Foo rolls 1, 1. Foo moves from 1 to 3, The Goose. Foo moves again and goes to 5";
  expect(response).toMatch(expected);
})

it("player can chain Goose jumps", () => {
  var game = new Game({ gooseSpaces: [2, 4] });
  game.run("add player Foo");
  game.run("move Foo 1, 1");
  expect(game.players.find(x => x.name == "Foo").space).toEqual(6);
})

it("game responds when player chains Goose jumps from the start", () => {
  var game = new Game({ gooseSpaces: [2, 4] });
  game.run("add player Foo");
  var response = game.run("move Foo 1, 1");
  var expected = "Foo rolls 1, 1. Foo moves from Start to 2, The Goose. Foo moves again and goes to 4, The Goose. Foo moves again and goes to 6";
  expect(response).toMatch(expected);
})

it("game responds when player chains Goose jumps not from the start", () => {
  var game = new Game({ gooseSpaces: [2, 3] });
  game.run("add player Foo");
  game.run("move Foo 0, 1");
  var response = game.run("move Foo 1, 0");
  var expected = "Foo rolls 1, 0. Foo moves from 1 to 2, The Goose. Foo moves again and goes to 3, The Goose. Foo moves again and goes to 4";
  expect(response).toMatch(expected);
})